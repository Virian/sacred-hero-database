use serde_json::{Map, Value};
use std::path::Path;
use tauri::Manager;
use tokio::fs;
use tokio::sync::Mutex;

#[cfg(test)]
mod tests;

#[derive(Default)]
pub struct SettingsState {
    settings: Mutex<Option<Result<Value, String>>>,
}

pub async fn initialize_settings(
    app: &tauri::AppHandle,
    state: &SettingsState,
) -> Result<(), String> {
    let settings = match settings_path(app) {
        Ok(path) => {
            if let Some(config_dir) = path.parent() {
                if let Err(error) = fs::create_dir_all(config_dir).await {
                    Err(error.to_string())
                } else {
                    load_settings(&path).await
                }
            } else {
                Err("The settings directory could not be determined.".to_string())
            }
        }
        Err(error) => Err(error),
    };
    let initialization_result = settings.as_ref().map(|_| ()).map_err(Clone::clone);

    *state.settings.lock().await = Some(settings);

    initialization_result
}

pub async fn get_settings(state: &SettingsState) -> Result<Value, String> {
    let settings = state.settings.lock().await;

    match settings.as_ref() {
        Some(Ok(settings)) => Ok(settings.clone()),
        Some(Err(error)) => Err(error.clone()),
        None => Err("Settings have not been initialized.".to_string()),
    }
}

pub async fn update_settings(
    app: &tauri::AppHandle,
    state: &SettingsState,
    game_installation_path: String,
    active_character_slots: u32,
) -> Result<(), String> {
    let mut cached_settings = state.settings.lock().await;
    let settings = match cached_settings.as_ref() {
        Some(Ok(settings)) => settings.clone(),
        Some(Err(error)) => return Err(error.clone()),
        None => return Err("Settings have not been initialized.".to_string()),
    };

    let updated_settings =
        update_settings_value(settings, game_installation_path, active_character_slots)?;

    let contents =
        serde_json::to_string_pretty(&updated_settings).map_err(|error| error.to_string())?;
    let settings_path = settings_path(app)?;
    fs::write(settings_path, contents)
        .await
        .map_err(|error| error.to_string())?;

    *cached_settings = Some(Ok(updated_settings));

    Ok(())
}

async fn load_settings(settings_path: &Path) -> Result<Value, String> {
    let settings: Value = match fs::read_to_string(settings_path).await {
        Ok(contents) => serde_json::from_str(&contents).map_err(|error| error.to_string())?,
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => Value::Object(Map::new()),
        Err(error) => return Err(error.to_string()),
    };

    let mut settings = apply_defaults(settings)?;
    let settings_object = settings
        .as_object_mut()
        .expect("apply_defaults returns an object");

    #[cfg(windows)]
    {
        let should_detect_game_path = settings_object
            .get("triedDetectingGamePath")
            .and_then(Value::as_bool)
            == Some(false)
            && (settings_object.get("gameInstallationPath").is_none()
                || matches!(
                    settings_object.get("gameInstallationPath"),
                    Some(Value::String(path)) if path.is_empty()
                ));

        if should_detect_game_path {
            if let Some(game_installation_path) = detect_game_installation_path().await {
                settings_object.insert(
                    "gameInstallationPath".to_string(),
                    Value::String(game_installation_path),
                );
            }
        }
    }

    settings_object.insert("triedDetectingGamePath".to_string(), Value::Bool(true));

    let contents = serde_json::to_string_pretty(&settings).map_err(|error| error.to_string())?;
    fs::write(settings_path, contents)
        .await
        .map_err(|error| error.to_string())?;

    Ok(settings)
}

fn apply_defaults(mut settings: Value) -> Result<Value, String> {
    let settings_object = settings
        .as_object_mut()
        .ok_or_else(|| "settings.json must contain a JSON object.".to_string())?;

    settings_object
        .entry("gameInstallationPath")
        .or_insert_with(|| Value::String(String::new()));
    settings_object
        .entry("activeCharacterSlots")
        .or_insert_with(|| Value::from(8));
    settings_object
        .entry("triedDetectingGamePath")
        .or_insert_with(|| Value::Bool(false));

    Ok(settings)
}

fn update_settings_value(
    mut settings: Value,
    game_installation_path: String,
    active_character_slots: u32,
) -> Result<Value, String> {
    let settings_object = settings
        .as_object_mut()
        .ok_or_else(|| "settings.json must contain a JSON object.".to_string())?;

    settings_object.insert(
        "gameInstallationPath".to_string(),
        Value::String(game_installation_path),
    );
    settings_object.insert(
        "activeCharacterSlots".to_string(),
        Value::from(active_character_slots),
    );

    Ok(settings)
}

fn settings_path(app: &tauri::AppHandle) -> Result<std::path::PathBuf, String> {
    Ok(app
        .path()
        .app_config_dir()
        .map_err(|error| error.to_string())?
        .join("settings.json"))
}

#[cfg(windows)]
async fn detect_game_installation_path() -> Option<String> {
    tokio::task::spawn_blocking(|| {
        use winreg::enums::HKEY_CURRENT_USER;
        use winreg::RegKey;

        let current_user = RegKey::predef(HKEY_CURRENT_USER);
        let sacred_key = current_user
            .open_subkey("Software\\Ascaron Entertainment\\Sacred")
            .ok()?;

        sacred_key.get_value("InstallLocation").ok()
    })
    .await
    .ok()
    .flatten()
}

use serde_json::{Map, Value};
use tokio::fs;
use tokio::sync::Mutex;

#[derive(Default)]
pub struct SettingsState {
    settings: Mutex<Option<Result<Value, String>>>,
}

pub async fn initialize_settings(state: &SettingsState) -> Result<(), String> {
    let settings = load_settings().await;
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

async fn load_settings() -> Result<Value, String> {
    let executable_path = std::env::current_exe().map_err(|error| error.to_string())?;
    let executable_directory = executable_path
        .parent()
        .ok_or_else(|| "The executable directory could not be determined.".to_string())?;
    let settings_path = executable_directory.join("settings.json");

    let mut settings: Value = match fs::read_to_string(&settings_path).await {
        Ok(contents) => serde_json::from_str(&contents).map_err(|error| error.to_string())?,
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => Value::Object(Map::new()),
        Err(error) => return Err(error.to_string()),
    };

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

    let should_detect_game_path = settings_object
        .get("triedDetectingGamePath")
        .and_then(Value::as_bool)
        == Some(false)
        && (matches!(settings_object.get("gameInstallationPath"), None)
            || matches!(
                settings_object.get("gameInstallationPath"),
                Some(Value::String(path)) if path.is_empty()
            ));

    #[cfg(windows)]
    if should_detect_game_path {
        if let Some(game_installation_path) = detect_game_installation_path().await {
            settings_object.insert(
                "gameInstallationPath".to_string(),
                Value::String(game_installation_path),
            );
        }
    }

    settings_object.insert("triedDetectingGamePath".to_string(), Value::Bool(true));

    let contents = serde_json::to_string_pretty(&settings).map_err(|error| error.to_string())?;
    fs::write(&settings_path, contents)
        .await
        .map_err(|error| error.to_string())?;

    Ok(settings)
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

use crate::{app_settings, character_repository, imports, save_reader};
use serde::Serialize;
use serde_json::Value;
use std::path::PathBuf;
use tauri::{AppHandle, Manager};

#[derive(Serialize)]
pub struct ActiveCharacter {
    pub slot: u32,
    pub character: Option<save_reader::CharacterInfo>,
}

#[derive(Serialize)]
pub struct CharacterVersionWithLatest {
    #[serde(flatten)]
    pub version: character_repository::CharacterVersionDetails,
    pub is_latest: bool,
}

pub async fn get_active_characters(
    state: &app_settings::SettingsState,
) -> Result<Vec<ActiveCharacter>, String> {
    let settings = app_settings::get_settings(state).await?;
    let game_installation_path = settings
        .get("gameInstallationPath")
        .and_then(Value::as_str)
        .ok_or_else(|| "gameInstallationPath must be a string.".to_string())?;
    let active_character_slots = settings
        .get("activeCharacterSlots")
        .and_then(Value::as_u64)
        .and_then(|slots| u32::try_from(slots).ok())
        .ok_or_else(|| "activeCharacterSlots must be an integer.".to_string())?;

    let save_directory = PathBuf::from(game_installation_path).join("save");
    let characters = (0..active_character_slots)
        .map(|file_index| {
            let path = save_directory.join(format!("Hero{file_index:02}.pax"));
            ActiveCharacter {
                slot: file_index + 1,
                character: save_reader::read_underworld_character(path).ok(),
            }
        })
        .collect();

    Ok(characters)
}

pub async fn get_all_characters(
    pool: &sqlx::SqlitePool,
) -> Result<Vec<character_repository::CharacterWithLatestVersion>, String> {
    character_repository::get_all_characters(pool)
        .await
        .map_err(|error| format!("Could not get characters: {error}"))
}

pub async fn get_all_characters_count(pool: &sqlx::SqlitePool) -> Result<u32, String> {
    character_repository::get_all_characters(pool)
        .await
        .map_err(|error| format!("Could not get characters: {error}"))
        .and_then(|characters| {
            u32::try_from(characters.len()).map_err(|_| "Too many characters.".to_string())
        })
}

pub async fn get_character_by_id(
    pool: &sqlx::SqlitePool,
    character_id: String,
) -> Result<Option<character_repository::Character>, String> {
    character_repository::get_character_by_id(pool, &character_id)
        .await
        .map_err(|error| format!("Could not get character by id: {error}"))
}

pub async fn delete_character(
    app: &AppHandle,
    pool: &sqlx::SqlitePool,
    character_id: String,
) -> Result<(), String> {
    let mut transaction = pool
        .begin()
        .await
        .map_err(|error| format!("Could not start character deletion: {error}"))?;
    let affected_rows = character_repository::delete_character(&mut transaction, &character_id)
        .await
        .map_err(|error| format!("Could not delete character: {error}"))?;

    if affected_rows == 0 {
        return Err(format!("Character {character_id} was not found."));
    }

    let saves_directory = app
        .path()
        .app_data_dir()
        .map_err(|error| format!("Could not locate app data directory: {error}"))?
        .join("saves")
        .join(&character_id);

    match tokio::fs::remove_dir_all(&saves_directory).await {
        Ok(()) => {}
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => {}
        Err(error) => {
            transaction
                .rollback()
                .await
                .map_err(|rollback_error| {
                    format!("Could not remove character save files: {error}; could not roll back database deletion: {rollback_error}")
                })?;
            return Err(format!("Could not remove character save files: {error}"));
        }
    }

    transaction
        .commit()
        .await
        .map_err(|error| format!("Could not commit character deletion: {error}"))?;

    Ok(())
}

pub async fn get_character_versions(
    pool: &sqlx::SqlitePool,
    character_id: String,
) -> Result<Vec<CharacterVersionWithLatest>, String> {
    let rows = character_repository::get_character_versions(pool, &character_id)
        .await
        .map_err(|error| format!("Could not get character versions: {error}"))?;

    Ok(rows
        .into_iter()
        .enumerate()
        .map(|(index, row)| CharacterVersionWithLatest {
            version: row,
            is_latest: index == 0,
        })
        .collect())
}

pub async fn delete_character_version(
    app: &AppHandle,
    pool: &sqlx::SqlitePool,
    character_version_id: String,
) -> Result<(), String> {
    let character_version =
        character_repository::get_character_version_by_id(pool, &character_version_id)
            .await
            .map_err(|error| format!("Could not find parent character: {error}"))?
            .ok_or_else(|| format!("Character version {character_version_id} was not found."))?;

    let mut transaction = pool
        .begin()
        .await
        .map_err(|error| format!("Could not start character version deletion: {error}"))?;
    let affected_rows =
        character_repository::delete_character_version(&mut transaction, &character_version_id)
            .await
            .map_err(|error| format!("Could not delete character version: {error}"))?;

    if affected_rows == 0 {
        return Err(format!(
            "Character version {character_version_id} was not found."
        ));
    }

    let has_remaining_versions = character_repository::count_character_versions(
        &mut transaction,
        &character_version.character_id,
    )
    .await
    .map_err(|error| format!("Could not count remaining character versions: {error}"))?
        > 0;

    if !has_remaining_versions {
        let affected_rows = character_repository::delete_character(
            &mut transaction,
            &character_version.character_id,
        )
        .await
        .map_err(|error| format!("Could not delete parent character: {error}"))?;

        if affected_rows == 0 {
            return Err(format!(
                "Parent character {} was not found.",
                character_version.character_id
            ));
        }
    }

    let saves_directory = app
        .path()
        .app_data_dir()
        .map_err(|error| format!("Could not locate app data directory: {error}"))?
        .join("saves")
        .join(character_version.character_id);

    let cleanup_result = if has_remaining_versions {
        tokio::fs::remove_file(saves_directory.join(format!("{character_version_id}.pax"))).await
    } else {
        tokio::fs::remove_dir_all(&saves_directory).await
    };

    match cleanup_result {
        Ok(()) => {}
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => {}
        Err(error) => {
            let cleanup_target = if has_remaining_versions {
                "character version save file"
            } else {
                "character save directory"
            };
            transaction
                .rollback()
                .await
                .map_err(|rollback_error| {
                    format!("Could not remove {cleanup_target}: {error}; could not roll back database deletion: {rollback_error}")
                })?;
            return Err(format!("Could not remove {cleanup_target}: {error}"));
        }
    }

    transaction
        .commit()
        .await
        .map_err(|error| format!("Could not commit character version deletion: {error}"))?;

    Ok(())
}

pub async fn backup(
    app: &AppHandle,
    pool: &sqlx::SqlitePool,
    state: &app_settings::SettingsState,
    slot_number: u32,
) -> Result<imports::ImportResult, String> {
    let settings = app_settings::get_settings(state).await?;

    let character_file_index = slot_number
        .checked_sub(1)
        .ok_or_else(|| "Slot number must be at least 1.".to_string())?;

    let game_installation_path = settings
        .get("gameInstallationPath")
        .and_then(Value::as_str)
        .ok_or_else(|| "gameInstallationPath must be a string.".to_string())?;
    let character_save_path = PathBuf::from(game_installation_path)
        .join("save")
        .join(format!("Hero{character_file_index:02}.pax"))
        .to_string_lossy()
        .into_owned();

    // backup is nothing else but importing from game saves directory
    let import_results = imports::import_characters(app, pool, vec![character_save_path]).await?;

    import_results
        .into_iter()
        .next()
        .ok_or_else(|| "No character to back up.".to_string())
}

pub async fn remove_from_slot(
    state: &app_settings::SettingsState,
    slot_number: u32,
) -> Result<(), String> {
    let settings = app_settings::get_settings(state).await?;

    let character_file_index = slot_number
        .checked_sub(1)
        .ok_or_else(|| "Slot number must be at least 1.".to_string())?;

    let game_installation_path = settings
        .get("gameInstallationPath")
        .and_then(Value::as_str)
        .ok_or_else(|| "gameInstallationPath must be a string.".to_string())?;
    let character_save_path = PathBuf::from(game_installation_path)
        .join("save")
        .join(format!("Hero{character_file_index:02}.pax"));

    match tokio::fs::remove_file(character_save_path).await {
        Ok(()) => {}
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => {}
        Err(error) => {
            return Err(format!(
                "Could not remove character from slot {slot_number}: {error}"
            ))
        }
    }

    Ok(())
}

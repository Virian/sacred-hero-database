use crate::{app_settings, character_repository, save_reader};
use serde::Serialize;
use serde_json::Value;
use std::path::PathBuf;

#[derive(Serialize)]
pub struct ActiveCharacter {
    pub slot: u32,
    pub character: Option<save_reader::CharacterInfo>,
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

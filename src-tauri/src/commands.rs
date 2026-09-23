use crate::app_settings;
use crate::character_repository;
use crate::characters;
use crate::imports;
use serde_json::Value;

#[tauri::command]
pub async fn get_settings(
    state: tauri::State<'_, app_settings::SettingsState>,
) -> Result<Value, String> {
    app_settings::get_settings(&state).await
}

#[tauri::command]
pub async fn update_settings(
    app: tauri::AppHandle,
    state: tauri::State<'_, app_settings::SettingsState>,
    game_installation_path: String,
    active_character_slots: u32,
) -> Result<(), String> {
    app_settings::update_settings(&app, &state, game_installation_path, active_character_slots)
        .await
}

#[tauri::command]
pub async fn get_active_characters(
    state: tauri::State<'_, app_settings::SettingsState>,
) -> Result<Vec<characters::ActiveCharacter>, String> {
    characters::get_active_characters(&state).await
}

#[tauri::command]
pub async fn get_all_characters(
    pool: tauri::State<'_, sqlx::SqlitePool>,
) -> Result<Vec<character_repository::CharacterWithLatestVersion>, String> {
    characters::get_all_characters(&pool).await
}

#[tauri::command]
pub async fn import_characters(
    app: tauri::AppHandle,
    pool: tauri::State<'_, sqlx::SqlitePool>,
    file_paths: Vec<String>,
) -> Result<Vec<imports::ImportResult>, String> {
    imports::import_characters(&app, &pool, file_paths).await
}

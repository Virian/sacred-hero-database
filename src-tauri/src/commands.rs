use crate::app_settings;
use crate::characters;
use serde_json::Value;

#[tauri::command]
pub async fn get_settings(
    state: tauri::State<'_, app_settings::SettingsState>,
) -> Result<Value, String> {
    app_settings::get_settings(&state).await
}

#[tauri::command]
pub async fn update_settings(
    state: tauri::State<'_, app_settings::SettingsState>,
    game_installation_path: String,
    active_character_slots: u32,
) -> Result<(), String> {
    app_settings::update_settings(&state, game_installation_path, active_character_slots).await
}

#[tauri::command]
pub async fn get_active_characters(
    state: tauri::State<'_, app_settings::SettingsState>,
) -> Result<Vec<characters::ActiveCharacter>, String> {
    characters::get_active_characters(&state).await
}

use crate::app_settings;
use serde_json::Value;

#[tauri::command]
pub async fn get_settings(
    state: tauri::State<'_, app_settings::SettingsState>,
) -> Result<Value, String> {
    app_settings::get_settings(&state).await
}

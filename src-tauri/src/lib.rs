mod app_settings;
mod characters;
mod commands;
mod save_reader;

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .manage(app_settings::SettingsState::default())
        .setup(|app| {
            let settings_state = app.state::<app_settings::SettingsState>();

            if let Err(error) =
                tauri::async_runtime::block_on(app_settings::initialize_settings(&settings_state))
            {
                eprintln!("Failed to initialize settings: {error}");
            }

            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            commands::get_settings,
            commands::update_settings,
            commands::get_active_characters
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

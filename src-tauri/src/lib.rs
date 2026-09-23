mod app_settings;
mod character_repository;
mod characters;
mod commands;
mod database;
mod imports;
mod save_reader;

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_process::init())
        .manage(app_settings::SettingsState::default())
        .setup(|app| {
            let database = tauri::async_runtime::block_on(database::initialize(app.handle()))
                .expect("failed to initialize database");
            app.manage(database);

            let settings_state = app.state::<app_settings::SettingsState>();

            if let Err(error) = tauri::async_runtime::block_on(app_settings::initialize_settings(
                app.handle(),
                &settings_state,
            )) {
                eprintln!("Failed to initialize settings: {error}");
            }

            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            commands::get_settings,
            commands::update_settings,
            commands::get_active_characters,
            commands::get_all_characters,
            commands::import_characters
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

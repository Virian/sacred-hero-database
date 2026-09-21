mod app_settings;
mod characters;
mod commands;
mod save_reader;

use tauri::Manager;
use tauri_plugin_sql::{Migration, MigrationKind};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let migrations = vec![Migration {
        version: 1,
        description: "create_initial_tables",
        sql: include_str!("../migrations/0000_init.sql"),
        kind: MigrationKind::Up,
    }];

    tauri::Builder::default()
        .plugin(
            tauri_plugin_sql::Builder::new()
                .add_migrations("sqlite:database.sqlite", migrations)
                .build(),
        )
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_process::init())
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

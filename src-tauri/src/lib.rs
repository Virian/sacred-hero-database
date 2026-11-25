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
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(
            tauri_plugin_log::Builder::new()
                .clear_targets()
                .targets([
                    tauri_plugin_log::Target::new(tauri_plugin_log::TargetKind::LogDir {
                        file_name: None,
                    })
                    .filter(|metadata| metadata.level() <= tauri_plugin_log::log::Level::Info),
                    tauri_plugin_log::Target::new(tauri_plugin_log::TargetKind::Stdout)
                        .filter(|metadata| metadata.target() != "sqlx::query"),
                ])
                .level(tauri_plugin_log::log::LevelFilter::Trace)
                .max_file_size(5_000_000)
                .rotation_strategy(tauri_plugin_log::RotationStrategy::KeepSome(4))
                .build(),
        )
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_process::init())
        .manage(app_settings::SettingsState::default())
        .setup(|app| {
            tauri_plugin_log::log::info!("Application starting up");

            let database = tauri::async_runtime::block_on(database::initialize(app.handle()))
                .map_err(|error| {
                    tauri_plugin_log::log::error!("Failed to initialize database: {error}");
                    std::io::Error::other(error)
                })?;
            app.manage(database);

            let settings_state = app.state::<app_settings::SettingsState>();

            if let Err(error) = tauri::async_runtime::block_on(app_settings::initialize_settings(
                app.handle(),
                &settings_state,
            )) {
                tauri_plugin_log::log::error!("Failed to initialize settings: {error}");
            }

            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            commands::get_settings,
            commands::update_settings,
            commands::get_active_characters,
            commands::get_all_characters,
            commands::get_all_characters_count,
            commands::get_character_by_id,
            commands::delete_character,
            commands::get_character_versions,
            commands::delete_character_version,
            commands::backup,
            commands::assign_to_slot,
            commands::remove_from_slot,
            commands::import_characters
        ])
        .run(tauri::generate_context!())
        .unwrap_or_else(|error| {
            tauri_plugin_log::log::error!("Error while running Tauri application: {error}");
            panic!("error while running tauri application: {error}");
        });
}

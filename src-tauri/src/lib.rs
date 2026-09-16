mod app_settings;
mod characters;
mod commands;
mod save_reader;

use tauri::Manager;

#[tauri::command]
fn read_save_file(path: &str) -> () {
    match save_reader::read_underworld_character(path) {
        Ok(hero) => {
            println!("Name     : {}", hero.name);
            println!("Class    : {}", hero.class);
            println!("Level    : {}", hero.level);
            println!("Hardcore : {}", hero.hardcore);
            println!("Revivals : {}", hero.revivals);
            println!("Survival : {}", hero.survival_bonus);
            println!("Play Time: {}", hero.play_time.as_secs());
            println!("Modified : {:?}", hero.modified);
        }
        Err(e) => {
            eprintln!("Error reading hero data: {}", e);
        }
    }
}

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
            read_save_file,
            commands::get_settings,
            commands::update_settings,
            commands::get_active_characters
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

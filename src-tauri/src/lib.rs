mod reader;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn read_save_file(path: &str) -> () {
    match reader::read_underworld_character(path) {
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
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, read_save_file])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

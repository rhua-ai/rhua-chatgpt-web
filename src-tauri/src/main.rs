// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

#[tauri::command]
fn get_os_name() -> String {
    std::env::consts::OS.to_string()
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![get_os_name])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
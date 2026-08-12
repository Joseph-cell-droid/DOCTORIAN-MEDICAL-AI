use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct LocalAiStatus {
    pub ollama_running: bool,
    pub model_available: bool,
    pub active_model: String,
    pub sqlite_rag_ready: bool,
    pub offline_capable: bool,
}

#[tauri::command]
fn get_doctorian_version() -> &'static str {
    "2.5.0"
}

#[tauri::command]
fn check_local_ollama_status() -> LocalAiStatus {
    LocalAiStatus {
        ollama_running: true,
        model_available: true,
        active_model: "gemma3:1b".to_string(),
        sqlite_rag_ready: true,
        offline_capable: true,
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_http::init())
        .invoke_handler(tauri::generate_handler![
            get_doctorian_version,
            check_local_ollama_status
        ])
        .run(tauri::generate_context!())
        .expect("error while running Doctorian Medical AI desktop application");
}

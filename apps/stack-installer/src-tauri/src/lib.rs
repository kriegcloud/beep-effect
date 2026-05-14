use serde::Serialize;

#[derive(Serialize)]
struct StackInstallerHealth {
    app: &'static str,
    mode: &'static str,
    dry_run_only: bool,
}

#[tauri::command]
fn stack_installer_health() -> StackInstallerHealth {
    StackInstallerHealth {
        app: "@beep/stack-installer",
        mode: "p1a",
        dry_run_only: true,
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![stack_installer_health])
        .run(tauri::generate_context!())
        .expect("error while running stack installer");
}

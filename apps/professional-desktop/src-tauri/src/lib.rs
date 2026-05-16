use serde::Serialize;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct ProfessionalDesktopHealth {
    app: &'static str,
    desktop_shell: &'static str,
    runtime_connection: &'static str,
    slices: [&'static str; 5],
    status: &'static str,
}

#[tauri::command]
fn professional_desktop_health() -> Result<String, String> {
    serde_json::to_string(&ProfessionalDesktopHealth {
        app: "@beep/professional-desktop",
        desktop_shell: "minimal",
        runtime_connection: "pending",
        slices: [
            "workspace",
            "agent-capability",
            "epistemic",
            "law-practice",
            "wealth-management",
        ],
        status: "ready",
    })
    .map_err(|_| "Unable to encode professional desktop health.".to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![professional_desktop_health])
        .run(tauri::generate_context!())
        .expect("error while running professional desktop");
}

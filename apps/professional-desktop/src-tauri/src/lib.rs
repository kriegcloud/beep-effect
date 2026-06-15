use serde::Serialize;
use tauri::{Manager, RunEvent};
use tauri_plugin_shell::process::CommandChild;
use tauri_plugin_shell::ShellExt;

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
fn professional_desktop_health() -> ProfessionalDesktopHealth {
    ProfessionalDesktopHealth {
        app: "@beep/professional-desktop",
        desktop_shell: "minimal",
        runtime_connection: "pending",
        slices: [
            "workspace",
            "agents",
            "epistemic",
            "law-practice",
            "wealth-management",
        ],
        status: "ready",
    }
}

/// The bundled rpc sidecar process, killed when the app exits.
struct Sidecar(std::sync::Mutex<Option<CommandChild>>);

/// Packaged secrets story: prefer an exported AI_ANTHROPIC_API_KEY, fall back
/// to asking the 1Password CLI for the same secret reference `op run` resolves
/// in dev. Without either, the sidecar boots fine but assistant turns fail
/// until a key is provided.
fn anthropic_key() -> Option<String> {
    std::env::var("AI_ANTHROPIC_API_KEY").ok().or_else(|| {
        std::process::Command::new("op")
            .args([
                "read",
                "op://BEEP_SECRETS/BEEP_SECRETS/AI_ANTHROPIC_API_KEY",
            ])
            .output()
            .ok()
            .filter(|out| out.status.success())
            .map(|out| String::from_utf8_lossy(&out.stdout).trim().to_string())
    })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![professional_desktop_health])
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            // dev runs the sidecar separately (`bun run dev:sidecar`, fixture
            // kernel); the packaged app owns the bundled binary's lifecycle.
            if !cfg!(debug_assertions) {
                let data_dir = app.path().app_data_dir()?;
                std::fs::create_dir_all(&data_dir)?;
                // CHAT_DB_PATH is a directory PGlite persists into (see the
                // sidecar's ChatDbConfig), not a single file.
                let mut command = app
                    .shell()
                    .sidecar("sidecar")?
                    .env(
                        "CHAT_DB_PATH",
                        data_dir.join("chat-db").to_string_lossy().to_string(),
                    )
                    .env("CHAT_AGENT", "anthropic");
                if let Some(key) = anthropic_key() {
                    command = command.env("AI_ANTHROPIC_API_KEY", key);
                }
                let (_events, child) = command.spawn()?;
                app.manage(Sidecar(std::sync::Mutex::new(Some(child))));
            }
            Ok(())
        })
        .build(tauri::generate_context!())
        .expect("error while building professional desktop")
        .run(|app, event| {
            if let RunEvent::Exit = event {
                if let Some(sidecar) = app.try_state::<Sidecar>() {
                    if let Some(child) = sidecar.0.lock().unwrap().take() {
                        let _ = child.kill();
                    }
                }
            }
        });
}

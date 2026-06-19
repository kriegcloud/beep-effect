use serde::Serialize;
use tauri::{AppHandle, Emitter, Manager, RunEvent};
use tauri_plugin_shell::process::{CommandChild, CommandEvent};
use tauri_plugin_shell::ShellExt;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct ProfessionalDesktopHealth {
    app: &'static str,
    desktop_shell: &'static str,
    runtime_connection: &'static str,
    slices: [&'static str; 4],
    status: &'static str,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct SidecarTransport {
    ipc: bool,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct SidecarClosed {
    code: Option<i32>,
    kind: &'static str,
    message: Option<String>,
    signal: Option<i32>,
}

#[tauri::command]
fn professional_desktop_health() -> ProfessionalDesktopHealth {
    ProfessionalDesktopHealth {
        app: "@beep/professional-desktop",
        desktop_shell: "minimal",
        runtime_connection: "pending",
        slices: ["workspace", "agents", "epistemic", "law-practice"],
        status: "ready",
    }
}

#[tauri::command]
fn sidecar_transport() -> SidecarTransport {
    SidecarTransport {
        ipc: ipc_transport(),
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

/// Whether the webview talks to the sidecar over Tauri IPC (a stdio bridge)
/// rather than the default loopback HTTP transport. Mirrors the sidecar's own
/// `CHAT_TRANSPORT` switch (see `server/main.ts`); anything other than `ipc`
/// keeps the HTTP transport.
fn ipc_transport() -> bool {
    std::env::var("CHAT_TRANSPORT")
        .map(|value| value == "ipc")
        .unwrap_or(false)
}

/// Pump the bundled sidecar's stdout to the webview over the `sidecar://rx`
/// event channel. Each stdout chunk is the next slice of the ndjson rpc stream;
/// the webview's ndjson decoder reassembles frames, so chunks are forwarded
/// verbatim (decoded with UTF-8 replacement, which ndjson accepts). The sidecar keeps its
/// logs on stderr in ipc mode, so they never pollute this frame stream.
fn bridge_sidecar_stdio(app: &AppHandle, mut events: tauri::async_runtime::Receiver<CommandEvent>) {
    let handle = app.clone();
    tauri::async_runtime::spawn(async move {
        while let Some(event) = events.recv().await {
            match event {
                CommandEvent::Stdout(bytes) => {
                    let frame = String::from_utf8_lossy(&bytes).into_owned();
                    let _ = handle.emit("sidecar://rx", frame);
                }
                CommandEvent::Stderr(bytes) => {
                    log::info!("sidecar: {}", String::from_utf8_lossy(&bytes).trim_end());
                }
                CommandEvent::Error(err) => {
                    log::error!("sidecar error: {err}");
                    let _ = handle.emit(
                        "sidecar://closed",
                        SidecarClosed {
                            code: None,
                            kind: "error",
                            message: Some(err),
                            signal: None,
                        },
                    );
                }
                CommandEvent::Terminated(payload) => {
                    log::warn!(
                        "sidecar terminated: code={:?} signal={:?}",
                        payload.code,
                        payload.signal
                    );
                    let _ = handle.emit(
                        "sidecar://closed",
                        SidecarClosed {
                            code: payload.code,
                            kind: "terminated",
                            message: None,
                            signal: payload.signal,
                        },
                    );
                }
                _ => {}
            }
        }
    });
}

/// Write one outbound ndjson rpc frame from the webview to the sidecar's stdin.
/// The frame already carries the ndjson serialization framing, so it is written
/// verbatim. `async` so Tauri runs it off the UI thread — `CommandChild::write`
/// blocks on a full stdin pipe, which must never stall the webview.
#[tauri::command]
async fn sidecar_send(state: tauri::State<'_, Sidecar>, frame: String) -> Result<(), String> {
    let mut guard = state.0.lock().map_err(|err| err.to_string())?;
    match guard.as_mut() {
        Some(child) => child.write(frame.as_bytes()).map_err(|err| err.to_string()),
        None => Err("sidecar is not running".to_string()),
    }
}

/// Ask the configured update server whether a newer version is available.
/// Returns the available version when there is one, `None` otherwise. Download
/// and install are intentionally left to a follow-up; this is the check half of
/// the updater scaffold.
async fn run_update_check(app: &AppHandle) -> Result<Option<String>, String> {
    use tauri_plugin_updater::UpdaterExt;
    let updater = app.updater().map_err(|err| err.to_string())?;
    match updater.check().await {
        Ok(Some(update)) => Ok(Some(update.version)),
        Ok(None) => Ok(None),
        Err(err) => Err(err.to_string()),
    }
}

/// Frontend-callable update check (see [`run_update_check`]).
#[tauri::command]
async fn check_for_update(app: AppHandle) -> Result<Option<String>, String> {
    run_update_check(&app).await
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            professional_desktop_health,
            sidecar_transport,
            sidecar_send,
            check_for_update
        ])
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            let ipc = ipc_transport();

            // HTTP transport (default): dev runs the sidecar separately
            // (`bun run dev:sidecar`, fixture kernel); only the packaged app owns
            // the bundled binary. IPC transport: Rust always owns the sidecar so
            // it can bridge the child's stdio to the webview — in dev and packaged
            // alike (dev requires `bun run build:sidecar` first so the externalBin
            // exists).
            if ipc || !cfg!(debug_assertions) {
                let mut command = app.shell().sidecar("sidecar")?;

                if cfg!(debug_assertions) {
                    // Dev + ipc: keyless fixture kernel; the sidecar falls back to
                    // its repo-local PGlite dir when CHAT_DB_PATH is unset.
                    command = command.env("CHAT_AGENT", "fixture");
                } else {
                    let data_dir = app.path().app_data_dir()?;
                    std::fs::create_dir_all(&data_dir)?;
                    // CHAT_DB_PATH is a directory PGlite persists into (see the
                    // sidecar's ChatDbConfig), not a single file.
                    command = command
                        .env(
                            "CHAT_DB_PATH",
                            data_dir.join("chat-db").to_string_lossy().to_string(),
                        )
                        .env("CHAT_AGENT", "anthropic");
                    if let Some(key) = anthropic_key() {
                        command = command.env("AI_ANTHROPIC_API_KEY", key);
                    }
                }

                if ipc {
                    command = command.env("CHAT_TRANSPORT", "ipc");
                }

                let (events, child) = command.spawn()?;
                if ipc {
                    bridge_sidecar_stdio(app.handle(), events);
                }
                app.manage(Sidecar(std::sync::Mutex::new(Some(child))));
            }

            // Best-effort update check on launch (packaged only); logs the result.
            // Surfacing/installing updates in the UI is a follow-up.
            if !cfg!(debug_assertions) {
                let handle = app.handle().clone();
                tauri::async_runtime::spawn(async move {
                    match run_update_check(&handle).await {
                        Ok(Some(version)) => log::info!("update available: {version}"),
                        Ok(None) => log::info!("no update available"),
                        Err(err) => log::warn!("update check failed: {err}"),
                    }
                });
            }

            Ok(())
        })
        .build(tauri::generate_context!())
        .expect("error while building professional desktop")
        .run(|app, event| {
            if let RunEvent::Exit = event {
                if let Some(sidecar) = app.try_state::<Sidecar>() {
                    // Don't panic on a poisoned lock during shutdown — recover the
                    // guard so the child is still killed and never leaked.
                    let mut guard = sidecar.0.lock().unwrap_or_else(|err| err.into_inner());
                    if let Some(child) = guard.take() {
                        let _ = child.kill();
                    }
                }
            }
        });
}

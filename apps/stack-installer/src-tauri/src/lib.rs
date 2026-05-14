use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::process::Command;

#[derive(Serialize)]
struct StackInstallerHealth {
    app: &'static str,
    mode: &'static str,
    dry_run_only: bool,
}

#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
struct P1ManualProofRequest {
    discord_bot_token_reference: String,
    discord_channel_display_name: String,
    discord_channel_id: String,
    discord_guild_id: String,
    operator_label: String,
    target_platform: String,
    test_message_content: String,
}

#[tauri::command]
fn stack_installer_health() -> StackInstallerHealth {
    StackInstallerHealth {
        app: "@beep/stack-installer",
        mode: "p1",
        dry_run_only: false,
    }
}

#[tauri::command]
fn run_p1_manual_proof(request: P1ManualProofRequest) -> Result<String, String> {
    let manifest_dir = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    let app_dir = manifest_dir
        .parent()
        .ok_or_else(|| "Unable to resolve Stack Installer app directory.".to_string())?;
    let request_json = serde_json::to_string(&request)
        .map_err(|_| "Unable to encode P1 proof request.".to_string())?;
    let output = Command::new("bun")
        .current_dir(app_dir)
        .args(["run", "p1:proof", "--", "--request-json", &request_json])
        .output()
        .map_err(|_| "Unable to launch the app-local P1 proof harness.".to_string())?;

    if output.status.success() {
        return String::from_utf8(output.stdout)
            .map_err(|_| "P1 proof harness returned non-UTF-8 output.".to_string());
    }

    let stderr = String::from_utf8(output.stderr)
        .unwrap_or_else(|_| "P1 proof harness failed with non-UTF-8 stderr.".to_string());
    Err(stderr)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![stack_installer_health, run_p1_manual_proof])
        .run(tauri::generate_context!())
        .expect("error while running stack installer");
}

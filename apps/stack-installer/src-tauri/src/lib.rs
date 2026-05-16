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

#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
struct BunRuntimeRepairRequest {
    approved: bool,
}

#[tauri::command]
fn stack_installer_health() -> StackInstallerHealth {
    StackInstallerHealth {
        app: "@beep/stack-installer",
        mode: "p1",
        dry_run_only: true,
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
        .args(["run", "p1:proof", "--", "--app-local", "--request-json", &request_json])
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

fn run_stack_installer_script(args: &[&str], launch_error: &str) -> Result<String, String> {
    let manifest_dir = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    let app_dir = manifest_dir
        .parent()
        .ok_or_else(|| "Unable to resolve Stack Installer app directory.".to_string())?;
    let output = Command::new("bun")
        .current_dir(app_dir)
        .args(args)
        .output()
        .map_err(|_| launch_error.to_string())?;

    if output.status.success() {
        return String::from_utf8(output.stdout)
            .map_err(|_| "Stack Installer workflow returned non-UTF-8 output.".to_string());
    }

    let stderr =
        String::from_utf8(output.stderr).unwrap_or_else(|_| "Stack Installer workflow failed with non-UTF-8 stderr.".to_string());
    Err(stderr)
}

#[tauri::command]
fn inspect_bun_runtime() -> Result<String, String> {
    run_stack_installer_script(
        &["run", "p1d:bun-runtime", "--", "--mode", "inspect"],
        "Unable to launch the Bun runtime inspection workflow.",
    )
}

#[tauri::command]
fn repair_bun_runtime(request: BunRuntimeRepairRequest) -> Result<String, String> {
    if !request.approved {
        return Err("Explicit user approval is required before mutating the Bun runtime.".to_string());
    }

    run_stack_installer_script(
        &["run", "p1d:bun-runtime", "--", "--mode", "repair"],
        "Unable to launch the Bun runtime repair workflow.",
    )
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            stack_installer_health,
            run_p1_manual_proof,
            inspect_bun_runtime,
            repair_bun_runtime
        ])
        .run(tauri::generate_context!())
        .expect("error while running stack installer");
}

use std::{
  collections::VecDeque,
  fs,
  path::{Path, PathBuf},
  sync::{Arc, Mutex},
  time::Duration,
};

use reqwest::Client;
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager, State};
use tauri_plugin_dialog::{DialogExt, FilePath};
use tauri_plugin_shell::{
  process::{CommandChild, CommandEvent},
  ShellExt,
};
use tokio::sync::oneshot;
use uuid::Uuid;

const DEV_SIDECAR_ENTRYPOINT: &str = "packages/runtime/server/src/main.ts";
const PACKAGED_SIDECAR_NAME: &str = "repo-memory-sidecar";
const SIDECAR_START_TIMEOUT: Duration = Duration::from_secs(10);
const HEALTH_POLL_INTERVAL: Duration = Duration::from_millis(200);
const STDERR_TAIL_LIMIT: usize = 24;

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
enum ManagedSidecarStatus {
  Stopped,
  Starting,
  Healthy,
  Failed,
}

impl ManagedSidecarStatus {
  fn as_str(self) -> &'static str {
    match self {
      Self::Stopped => "stopped",
      Self::Starting => "starting",
      Self::Healthy => "healthy",
      Self::Failed => "failed",
    }
  }
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
enum ManagedSidecarMode {
  DevBun,
  Packaged,
}

impl ManagedSidecarMode {
  fn as_str(self) -> &'static str {
    match self {
      Self::DevBun => "managed-dev-bun",
      Self::Packaged => "managed-packaged",
    }
  }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct SidecarBootstrapPayload {
  session_id: String,
  host: String,
  port: u16,
  base_url: String,
  pid: u32,
  version: String,
  status: String,
  started_at: i64,
}

#[derive(Clone, Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct BootstrapStdoutLine {
  #[serde(rename = "type")]
  record_type: String,
  session_id: String,
  host: String,
  port: u16,
  base_url: String,
  pid: u32,
  version: String,
  status: String,
  started_at: i64,
}

impl BootstrapStdoutLine {
  fn into_payload(self) -> Option<SidecarBootstrapPayload> {
    (self.record_type == "bootstrap").then_some(SidecarBootstrapPayload {
      session_id: self.session_id,
      host: self.host,
      port: self.port,
      base_url: self.base_url,
      pid: self.pid,
      version: self.version,
      status: self.status,
      started_at: self.started_at,
    })
  }
}

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct ManagedSidecarStatePayload {
  status: String,
  mode: String,
  #[serde(skip_serializing_if = "Option::is_none")]
  bootstrap: Option<SidecarBootstrapPayload>,
  #[serde(skip_serializing_if = "Option::is_none")]
  error_message: Option<String>,
  stderr_tail: Vec<String>,
}

struct ManagedSidecarInner {
  child: Option<CommandChild>,
  status: ManagedSidecarStatus,
  mode: ManagedSidecarMode,
  bootstrap: Option<SidecarBootstrapPayload>,
  error_message: Option<String>,
  stderr_tail: VecDeque<String>,
  expected_shutdown: bool,
}

impl Default for ManagedSidecarInner {
  fn default() -> Self {
    Self {
      child: None,
      status: ManagedSidecarStatus::Stopped,
      mode: ManagedSidecarMode::DevBun,
      bootstrap: None,
      error_message: None,
      stderr_tail: VecDeque::new(),
      expected_shutdown: false,
    }
  }
}

impl ManagedSidecarInner {
  fn snapshot(&self) -> ManagedSidecarStatePayload {
    ManagedSidecarStatePayload {
      status: self.status.as_str().to_string(),
      mode: self.mode.as_str().to_string(),
      bootstrap: self.bootstrap.clone(),
      error_message: self.error_message.clone(),
      stderr_tail: self.stderr_tail.iter().cloned().collect(),
    }
  }

  fn push_stderr(&mut self, line: String) {
    if line.is_empty() {
      return;
    }

    if self.stderr_tail.len() >= STDERR_TAIL_LIMIT {
      self.stderr_tail.pop_front();
    }

    self.stderr_tail.push_back(line);
  }

  fn reset_for_launch(&mut self, mode: ManagedSidecarMode) {
    self.status = ManagedSidecarStatus::Starting;
    self.mode = mode;
    self.bootstrap = None;
    self.error_message = None;
    self.stderr_tail.clear();
    self.expected_shutdown = false;
  }
}

struct ManagedSidecarState {
  inner: Arc<Mutex<ManagedSidecarInner>>,
}

impl Default for ManagedSidecarState {
  fn default() -> Self {
    Self {
      inner: Arc::new(Mutex::new(ManagedSidecarInner::default())),
    }
  }
}

struct LaunchPlan {
  mode: ManagedSidecarMode,
  host: String,
  port: u16,
  session_id: String,
  app_data_dir: PathBuf,
  version: String,
}

impl LaunchPlan {
  fn new(app: &AppHandle) -> Result<Self, String> {
    let app_data_dir = managed_app_data_dir(app)?;
    let mode = if cfg!(debug_assertions) && repo_root().join(DEV_SIDECAR_ENTRYPOINT).exists() {
      ManagedSidecarMode::DevBun
    } else {
      ManagedSidecarMode::Packaged
    };

    Ok(Self {
      mode,
      host: "127.0.0.1".to_string(),
      port: allocate_local_port()?,
      session_id: Uuid::new_v4().to_string(),
      app_data_dir,
      version: app.package_info().version.to_string(),
    })
  }
}

fn repo_root() -> PathBuf {
  Path::new(env!("CARGO_MANIFEST_DIR"))
    .ancestors()
    .nth(3)
    .map(Path::to_path_buf)
    .unwrap_or_else(|| PathBuf::from("."))
}

fn managed_app_data_dir(app: &AppHandle) -> Result<PathBuf, String> {
  let app_data_dir = app
    .path()
    .app_data_dir()
    .map_err(|error| format!("Failed to resolve the app data directory: {error}"))?
    .join("repo-memory");

  fs::create_dir_all(&app_data_dir)
    .map_err(|error| format!("Failed to create the managed sidecar app data directory: {error}"))?;

  Ok(app_data_dir)
}

fn allocate_local_port() -> Result<u16, String> {
  let listener = std::net::TcpListener::bind("127.0.0.1:0")
    .map_err(|error| format!("Failed to allocate a localhost port for the managed sidecar: {error}"))?;
  let port = listener
    .local_addr()
    .map_err(|error| format!("Failed to read the allocated localhost port: {error}"))?
    .port();

  drop(listener);
  Ok(port)
}

fn sidecar_env(plan: &LaunchPlan) -> Vec<(&'static str, String)> {
  vec![
    ("BEEP_REPO_MEMORY_HOST", plan.host.clone()),
    ("BEEP_REPO_MEMORY_PORT", plan.port.to_string()),
    ("BEEP_REPO_MEMORY_SESSION_ID", plan.session_id.clone()),
    (
      "BEEP_REPO_MEMORY_APP_DATA_DIR",
      plan.app_data_dir.to_string_lossy().into_owned(),
    ),
    ("BEEP_REPO_MEMORY_VERSION", plan.version.clone()),
    ("BEEP_REPO_MEMORY_OTLP_ENABLED", "false".to_string()),
    ("BEEP_REPO_MEMORY_DEVTOOLS_ENABLED", "false".to_string()),
  ]
}

fn spawn_sidecar(
  app: &AppHandle,
  plan: &LaunchPlan,
) -> Result<
  (
    tauri::async_runtime::Receiver<CommandEvent>,
    CommandChild,
  ),
  String,
> {
  let envs = sidecar_env(plan);

  let command = match plan.mode {
    ManagedSidecarMode::DevBun => {
      let mut command = app.shell().command("bun");
      command = command.args(["run", DEV_SIDECAR_ENTRYPOINT]);
      command = command.current_dir(repo_root());
      command.envs(envs)
    }
    ManagedSidecarMode::Packaged => {
      let mut command = app
        .shell()
        .sidecar(PACKAGED_SIDECAR_NAME)
        .map_err(|error| format!("Failed to resolve the packaged sidecar binary: {error}"))?;
      command = command.current_dir(plan.app_data_dir.clone());
      command.envs(envs)
    }
  };

  command
    .spawn()
    .map_err(|error| format!("Failed to spawn the managed sidecar process: {error}"))
}

fn update_failure(state: &ManagedSidecarState, message: String) {
  if let Ok(mut inner) = state.inner.lock() {
    inner.status = ManagedSidecarStatus::Failed;
    inner.error_message = Some(message);
    inner.bootstrap = None;
  }
}

fn start_event_pump(
  state: &ManagedSidecarState,
  mut receiver: tauri::async_runtime::Receiver<CommandEvent>,
  bootstrap_sender: oneshot::Sender<SidecarBootstrapPayload>,
) {
  let state = state.inner.clone();

  tauri::async_runtime::spawn(async move {
    let mut bootstrap_sender = Some(bootstrap_sender);

    while let Some(event) = receiver.recv().await {
      match event {
        CommandEvent::Stdout(line) => {
          let text = String::from_utf8_lossy(&line).trim().to_string();

          if text.is_empty() {
            continue;
          }

          if let Ok(parsed) = serde_json::from_str::<BootstrapStdoutLine>(&text) {
            if let Some(payload) = parsed.into_payload() {
              if let Some(sender) = bootstrap_sender.take() {
                let _ = sender.send(payload.clone());
              }

              if let Ok(mut inner) = state.lock() {
                inner.bootstrap = Some(payload);
              }
            }
          }
        }
        CommandEvent::Stderr(line) => {
          if let Ok(mut inner) = state.lock() {
            inner.push_stderr(String::from_utf8_lossy(&line).trim().to_string());
          }
        }
        CommandEvent::Terminated(payload) => {
          if let Ok(mut inner) = state.lock() {
            inner.child = None;

            if inner.expected_shutdown {
              inner.expected_shutdown = false;
              inner.status = ManagedSidecarStatus::Stopped;
              inner.bootstrap = None;
              inner.error_message = None;
            } else {
              inner.status = ManagedSidecarStatus::Failed;
              inner.bootstrap = None;
              inner.error_message = Some(format!(
                "Managed sidecar exited unexpectedly with code {:?} and signal {:?}.",
                payload.code, payload.signal
              ));
            }
          }
        }
        _ => {}
      }
    }
  });
}

async fn wait_for_healthy(bootstrap: &SidecarBootstrapPayload) -> Result<SidecarBootstrapPayload, String> {
  let client = Client::builder()
    .timeout(Duration::from_secs(2))
    .build()
    .map_err(|error| format!("Failed to create the sidecar health-check client: {error}"))?;
  let url = format!("{}/api/v0/health", bootstrap.base_url);

  let started = tokio::time::Instant::now();

  while started.elapsed() < SIDECAR_START_TIMEOUT {
    match client.get(&url).send().await {
      Ok(response) => {
        if !response.status().is_success() {
          tokio::time::sleep(HEALTH_POLL_INTERVAL).await;
          continue;
        }

        let payload = response
          .json::<SidecarBootstrapPayload>()
          .await
          .map_err(|error| format!("Failed to decode the managed sidecar health payload: {error}"))?;

        if payload.session_id != bootstrap.session_id {
          return Err("Managed sidecar bootstrap session id did not match the healthy control-plane response.".into());
        }

        if payload.port != bootstrap.port {
          return Err("Managed sidecar bootstrap port did not match the healthy control-plane response.".into());
        }

        return Ok(payload);
      }
      Err(_) => tokio::time::sleep(HEALTH_POLL_INTERVAL).await,
    }
  }

  Err(format!("Timed out waiting for the managed sidecar health endpoint at {url}."))
}

fn take_child(state: &ManagedSidecarState, expected_shutdown: bool) -> Option<CommandChild> {
  state.inner.lock().ok().and_then(|mut inner| {
    inner.expected_shutdown = expected_shutdown;

    if expected_shutdown {
      inner.status = ManagedSidecarStatus::Stopped;
      inner.bootstrap = None;
      inner.error_message = None;
    }

    inner.child.take()
  })
}

async fn stop_sidecar_inner(state: &ManagedSidecarState) -> Result<(), String> {
  if let Some(child) = take_child(state, true) {
    child
      .kill()
      .map_err(|error| format!("Failed to stop the managed sidecar process: {error}"))?;
  }

  Ok(())
}

#[tauri::command]
async fn start_sidecar(app: AppHandle, state: State<'_, ManagedSidecarState>) -> Result<SidecarBootstrapPayload, String> {
  if let Ok(inner) = state.inner.lock() {
    if inner.status == ManagedSidecarStatus::Healthy {
      if let Some(bootstrap) = inner.bootstrap.clone() {
        return Ok(bootstrap);
      }
    }
  }

  stop_sidecar_inner(&state).await?;

  let plan = LaunchPlan::new(&app)?;
  let (receiver, child) = spawn_sidecar(&app, &plan)?;
  let (bootstrap_sender, bootstrap_receiver) = oneshot::channel();

  {
    let mut inner = state
      .inner
      .lock()
      .map_err(|_| "The managed sidecar state mutex was poisoned.".to_string())?;
    inner.reset_for_launch(plan.mode);
    inner.child = Some(child);
  }

  start_event_pump(&state, receiver, bootstrap_sender);

  let bootstrap = tokio::time::timeout(SIDECAR_START_TIMEOUT, bootstrap_receiver)
    .await
    .map_err(|_| "Timed out waiting for the managed sidecar bootstrap stdout line.".to_string())?
    .map_err(|_| "The managed sidecar bootstrap stream ended before it produced a bootstrap line.".to_string())?;

  if bootstrap.session_id != plan.session_id {
    update_failure(&state, "Managed sidecar bootstrap session id did not match the requested session id.".into());
    if let Some(child) = take_child(&state, false) {
      let _ = child.kill();
    }
    return Err("Managed sidecar bootstrap session id mismatch.".into());
  }

  if bootstrap.port != plan.port {
    update_failure(&state, "Managed sidecar bootstrap port did not match the requested port.".into());
    if let Some(child) = take_child(&state, false) {
      let _ = child.kill();
    }
    return Err("Managed sidecar bootstrap port mismatch.".into());
  }

  let healthy_bootstrap = match wait_for_healthy(&bootstrap).await {
    Ok(payload) => payload,
    Err(message) => {
      update_failure(&state, message.clone());
      if let Some(child) = take_child(&state, false) {
        let _ = child.kill();
      }
      return Err(message);
    }
  };

  {
    let mut inner = state
      .inner
      .lock()
      .map_err(|_| "The managed sidecar state mutex was poisoned.".to_string())?;
    inner.status = ManagedSidecarStatus::Healthy;
    inner.bootstrap = Some(healthy_bootstrap.clone());
    inner.error_message = None;
  }

  Ok(healthy_bootstrap)
}

#[tauri::command]
async fn stop_sidecar(state: State<'_, ManagedSidecarState>) -> Result<(), String> {
  stop_sidecar_inner(&state).await
}

#[tauri::command]
async fn get_sidecar_state(state: State<'_, ManagedSidecarState>) -> Result<ManagedSidecarStatePayload, String> {
  let inner = state
    .inner
    .lock()
    .map_err(|_| "The managed sidecar state mutex was poisoned.".to_string())?;

  Ok(inner.snapshot())
}

#[tauri::command]
async fn pick_repo_directory(app: AppHandle) -> Result<Option<String>, String> {
  let picked = app.dialog().file().blocking_pick_folder();

  let path = match picked {
    None => None,
    Some(FilePath::Path(path)) => Some(path.to_string_lossy().into_owned()),
    Some(FilePath::Url(url)) => url.to_file_path().ok().map(|path| path.to_string_lossy().into_owned()),
  };

  Ok(path)
}

pub fn run() {
  tauri::Builder::default()
    .manage(ManagedSidecarState::default())
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_shell::init())
    .invoke_handler(tauri::generate_handler![
      start_sidecar,
      stop_sidecar,
      get_sidecar_state,
      pick_repo_directory
    ])
    .run(tauri::generate_context!())
    .expect("error while running Beep Desktop");
}

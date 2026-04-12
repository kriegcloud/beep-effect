use std::{
  collections::VecDeque,
  fs,
  path::{Path, PathBuf},
  sync::{Arc, Mutex},
  time::{Duration, SystemTime, UNIX_EPOCH},
};

use reqwest::{Client, Method};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use tauri::{AppHandle, Emitter, Manager, State};
use tauri_plugin_dialog::{DialogExt, FilePath};
use tauri_plugin_shell::{
  process::{CommandChild, CommandEvent},
  ShellExt,
};
use tokio::sync::oneshot;
use uuid::Uuid;

const DEV_SIDECAR_ENTRYPOINT: &str = "packages/VT2/src/main.ts";
const DEV_SIDECAR_HOSTNAME: &str = "v2t-sidecar";
const PACKAGED_SIDECAR_NAME: &str = "v2t-sidecar";
const SIDECAR_START_TIMEOUT: Duration = Duration::from_secs(10);
const SIDECAR_PROBE_TIMEOUT: Duration = Duration::from_secs(1);
const HEALTH_POLL_INTERVAL: Duration = Duration::from_millis(200);
const STDERR_TAIL_LIMIT: usize = 24;
const CAPTURE_STOP_TIMEOUT: Duration = Duration::from_secs(5);
const CAPTURE_AUDIO_EXTENSION: &str = "wav";
const CAPTURE_AUDIO_CHANNELS: &str = "1";
const CAPTURE_AUDIO_SAMPLE_RATE_HZ: &str = "16000";
const CAPTURE_AUDIO_CODEC: &str = "pcm_s16le";
const CAPTURE_AUDIO_MIN_BYTES: u64 = 128;
const SIDECAR_STATE_EVENT: &str = "v2t://sidecar-state-changed";
const CAPTURE_STATE_EVENT: &str = "v2t://capture-state-changed";

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
  DevPortless,
  Packaged,
}

impl ManagedSidecarMode {
  fn as_str(self) -> &'static str {
    match self {
      Self::DevPortless => "managed-dev-portless",
      Self::Packaged => "managed-packaged",
    }
  }
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
enum ManagedCaptureStatus {
  Idle,
  Capturing,
  Recoverable,
}

impl ManagedCaptureStatus {
  fn as_str(self) -> &'static str {
    match self {
      Self::Idle => "idle",
      Self::Capturing => "capturing",
      Self::Recoverable => "recoverable",
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

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct ManagedCaptureStatePayload {
  status: String,
  #[serde(skip_serializing_if = "Option::is_none")]
  active_session_id: Option<String>,
  #[serde(skip_serializing_if = "Option::is_none")]
  active_capture_id: Option<String>,
  #[serde(skip_serializing_if = "Option::is_none")]
  draft_path: Option<String>,
  #[serde(skip_serializing_if = "Option::is_none")]
  started_at: Option<i64>,
  #[serde(skip_serializing_if = "Option::is_none")]
  recovery_session_id: Option<String>,
  #[serde(skip_serializing_if = "Option::is_none")]
  recovery_candidate_id: Option<String>,
  #[serde(skip_serializing_if = "Option::is_none")]
  error_message: Option<String>,
}

#[derive(Clone, Debug)]
struct ActiveCaptureDraft {
  session_id: String,
  capture_id: String,
  draft_path: PathBuf,
  started_at: i64,
}

#[derive(Debug)]
struct ManagedCaptureInner {
  status: ManagedCaptureStatus,
  active_draft: Option<ActiveCaptureDraft>,
  recorder: Option<CommandChild>,
  recorder_expected_shutdown: bool,
  recorder_stderr_tail: VecDeque<String>,
  recovery_session_id: Option<String>,
  recovery_candidate_id: Option<String>,
  error_message: Option<String>,
}

impl Default for ManagedCaptureInner {
  fn default() -> Self {
    Self {
      status: ManagedCaptureStatus::Idle,
      active_draft: None,
      recorder: None,
      recorder_expected_shutdown: false,
      recorder_stderr_tail: VecDeque::new(),
      recovery_session_id: None,
      recovery_candidate_id: None,
      error_message: None,
    }
  }
}

impl ManagedCaptureInner {
  fn snapshot(&self) -> ManagedCaptureStatePayload {
    ManagedCaptureStatePayload {
      status: self.status.as_str().to_string(),
      active_session_id: self.active_draft.as_ref().map(|draft| draft.session_id.clone()),
      active_capture_id: self.active_draft.as_ref().map(|draft| draft.capture_id.clone()),
      draft_path: self
        .active_draft
        .as_ref()
        .map(|draft| draft.draft_path.to_string_lossy().into_owned()),
      started_at: self.active_draft.as_ref().map(|draft| draft.started_at),
      recovery_session_id: self.recovery_session_id.clone(),
      recovery_candidate_id: self.recovery_candidate_id.clone(),
      error_message: self.error_message.clone(),
    }
  }

  fn push_recorder_stderr(&mut self, line: String) {
    if line.is_empty() {
      return;
    }

    if self.recorder_stderr_tail.len() >= STDERR_TAIL_LIMIT {
      self.recorder_stderr_tail.pop_front();
    }

    self.recorder_stderr_tail.push_back(line);
  }

  fn recorder_stderr_summary(&self) -> Option<String> {
    (!self.recorder_stderr_tail.is_empty()).then(|| self.recorder_stderr_tail.iter().cloned().collect::<Vec<_>>().join(" | "))
  }

  fn set_capturing(&mut self, draft: ActiveCaptureDraft, recorder: CommandChild) {
    self.status = ManagedCaptureStatus::Capturing;
    self.active_draft = Some(draft);
    self.recorder = Some(recorder);
    self.recorder_expected_shutdown = false;
    self.recorder_stderr_tail.clear();
    self.recovery_session_id = None;
    self.recovery_candidate_id = None;
    self.error_message = None;
  }

  fn set_recoverable(&mut self, session_id: String, candidate_id: String) {
    self.status = ManagedCaptureStatus::Recoverable;
    self.active_draft = None;
    self.recorder = None;
    self.recorder_expected_shutdown = false;
    self.recorder_stderr_tail.clear();
    self.recovery_session_id = Some(session_id);
    self.recovery_candidate_id = Some(candidate_id);
    self.error_message = None;
  }

  fn set_idle(&mut self) {
    self.status = ManagedCaptureStatus::Idle;
    self.active_draft = None;
    self.recorder = None;
    self.recorder_expected_shutdown = false;
    self.recorder_stderr_tail.clear();
    self.recovery_session_id = None;
    self.recovery_candidate_id = None;
    self.error_message = None;
  }
}

struct ManagedCaptureState {
  inner: Arc<Mutex<ManagedCaptureInner>>,
}

impl Default for ManagedCaptureState {
  fn default() -> Self {
    Self {
      inner: Arc::new(Mutex::new(ManagedCaptureInner::default())),
    }
  }
}

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct CompleteCaptureRequestPayload {
  duration_ms: u64,
  artifact_path: String,
  interrupted: bool,
  #[serde(skip_serializing_if = "Option::is_none")]
  interruption_reason: Option<String>,
}

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct ResolveRecoveryCandidateRequestPayload {
  disposition: String,
}

#[derive(Clone, Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct SessionResourcePayload {
  recovery_candidates: Vec<RecoveryCandidatePayload>,
}

#[derive(Clone, Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct RecoveryCandidatePayload {
  id: String,
  disposition: String,
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
      mode: ManagedSidecarMode::DevPortless,
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
  port: Option<u16>,
  session_id: String,
  app_data_dir: PathBuf,
  version: String,
}

impl LaunchPlan {
  fn new(app: &AppHandle) -> Result<Self, String> {
    let app_data_dir = managed_app_data_dir(app)?;
    let mode = if cfg!(debug_assertions) && repo_root().join(DEV_SIDECAR_ENTRYPOINT).exists() {
      ManagedSidecarMode::DevPortless
    } else {
      ManagedSidecarMode::Packaged
    };

    Ok(Self {
      mode,
      host: "127.0.0.1".to_string(),
      port: match mode {
        ManagedSidecarMode::DevPortless => None,
        ManagedSidecarMode::Packaged => Some(allocate_local_port()?),
      },
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
    .join("v2t");

  fs::create_dir_all(&app_data_dir)
    .map_err(|error| format!("Failed to create the managed sidecar app data directory: {error}"))?;

  Ok(app_data_dir)
}

fn unix_timestamp_millis() -> Result<i64, String> {
  let elapsed = SystemTime::now()
    .duration_since(UNIX_EPOCH)
    .map_err(|error| format!("Failed to read the system clock for capture timing: {error}"))?;

  i64::try_from(elapsed.as_millis())
    .map_err(|_| "The current system time exceeded the supported capture timestamp range.".to_string())
}

fn active_sidecar_bootstrap(state: &ManagedSidecarState) -> Result<SidecarBootstrapPayload, String> {
  let inner = state
    .inner
    .lock()
    .map_err(|_| "The managed sidecar state mutex was poisoned.".to_string())?;

  if inner.status != ManagedSidecarStatus::Healthy {
    return Err("The managed sidecar must be healthy before V2T capture commands can run.".into());
  }

  inner
    .bootstrap
    .clone()
    .ok_or_else(|| "The managed sidecar health payload is missing a bootstrap record.".to_string())
}

fn sidecar_state_snapshot(state: &ManagedSidecarState) -> Result<ManagedSidecarStatePayload, String> {
  let inner = state
    .inner
    .lock()
    .map_err(|_| "The managed sidecar state mutex was poisoned.".to_string())?;

  Ok(inner.snapshot())
}

fn emit_sidecar_state(app: &AppHandle, state: &ManagedSidecarState) -> Result<ManagedSidecarStatePayload, String> {
  let payload = sidecar_state_snapshot(state)?;

  app
    .emit(SIDECAR_STATE_EVENT, payload.clone())
    .map_err(|error| format!("Failed to emit the V2T sidecar state event: {error}"))?;

  Ok(payload)
}

fn capture_artifact_path(app: &AppHandle, session_id: &str, capture_id: &str) -> Result<PathBuf, String> {
  let capture_dir = managed_app_data_dir(app)?.join("captures").join(session_id);

  fs::create_dir_all(&capture_dir)
    .map_err(|error| format!("Failed to create the capture artifact directory: {error}"))?;

  Ok(capture_dir.join(format!("{capture_id}.{CAPTURE_AUDIO_EXTENSION}")))
}

fn spawn_capture_recorder(
  app: &AppHandle,
  artifact_path: &Path,
) -> Result<(tauri::async_runtime::Receiver<CommandEvent>, CommandChild), String> {
  let artifact_path_string = artifact_path.to_string_lossy().into_owned();

  #[cfg(target_os = "linux")]
  {
    let mut command = app.shell().command("ffmpeg");
    command = command.args([
      "-hide_banner",
      "-loglevel",
      "error",
      "-y",
      "-f",
      "pulse",
      "-i",
      "default",
      "-ac",
      CAPTURE_AUDIO_CHANNELS,
      "-ar",
      CAPTURE_AUDIO_SAMPLE_RATE_HZ,
      "-c:a",
      CAPTURE_AUDIO_CODEC,
      &artifact_path_string,
    ]);

    if let Some(parent) = artifact_path.parent() {
      command = command.current_dir(parent);
    }

    return command
      .spawn()
      .map_err(|error| format!("Failed to start microphone capture via ffmpeg: {error}"));
  }

  #[cfg(not(target_os = "linux"))]
  {
    let _ = app;
    let _ = artifact_path_string;
    Err("Native microphone capture is currently implemented only for Linux desktop sessions.".to_string())
  }
}

fn take_capture_recorder(state: &ManagedCaptureState, expected_shutdown: bool) -> Option<CommandChild> {
  state.inner.lock().ok().and_then(|mut inner| {
    inner.recorder_expected_shutdown = expected_shutdown;
    inner.recorder.take()
  })
}

fn request_capture_recorder_shutdown(state: &ManagedCaptureState) -> Result<bool, String> {
  let mut inner = state
    .inner
    .lock()
    .map_err(|_| "The managed capture state mutex was poisoned.".to_string())?;

  inner.recorder_expected_shutdown = true;

  let Some(recorder) = inner.recorder.as_mut() else {
    inner.recorder_expected_shutdown = false;
    return Ok(false);
  };

  recorder
    .write(b"q\n")
    .map_err(|error| {
      inner.recorder_expected_shutdown = false;
      format!("Failed to stop microphone capture cleanly: {error}")
    })?;

  Ok(true)
}

async fn wait_for_capture_recorder_shutdown(state: &ManagedCaptureState) -> Result<(), String> {
  let started = tokio::time::Instant::now();

  while started.elapsed() < CAPTURE_STOP_TIMEOUT {
    let should_return = {
      let inner = state
        .inner
        .lock()
        .map_err(|_| "The managed capture state mutex was poisoned.".to_string())?;

      !inner.recorder_expected_shutdown
    };

    if should_return {
      return Ok(());
    }

    tokio::time::sleep(HEALTH_POLL_INTERVAL).await;
  }

  Err("Timed out waiting for the microphone capture process to stop.".to_string())
}

fn stop_capture_recorder_immediately(state: &ManagedCaptureState) -> Result<(), String> {
  if let Some(recorder) = take_capture_recorder(state, true) {
    recorder
      .kill()
      .map_err(|error| format!("Failed to stop the microphone capture process: {error}"))?;
  }

  Ok(())
}

fn ensure_capture_artifact_ready(path: &Path) -> Result<(), String> {
  let metadata =
    fs::metadata(path).map_err(|error| format!("Failed to inspect the recorded capture artifact at {}: {error}", path.display()))?;

  if !metadata.is_file() {
    return Err(format!(
      "The recorded capture artifact at {} was not a file.",
      path.display()
    ));
  }

  if metadata.len() < CAPTURE_AUDIO_MIN_BYTES {
    return Err(format!(
      "The recorded capture artifact at {} was unexpectedly small ({} bytes).",
      path.display(),
      metadata.len()
    ));
  }

  Ok(())
}

async fn recorded_duration_millis(app: &AppHandle, artifact_path: &Path, fallback_duration_ms: u64) -> u64 {
  let artifact_path_string = artifact_path.to_string_lossy().into_owned();
  let output = match app
    .shell()
    .command("ffprobe")
    .args([
      "-v",
      "error",
      "-show_entries",
      "format=duration",
      "-of",
      "default=nw=1:nk=1",
      &artifact_path_string,
    ])
    .output()
    .await
  {
    Ok(output) if output.status.success() => output,
    _ => return fallback_duration_ms,
  };

  let parsed_duration = String::from_utf8_lossy(&output.stdout)
    .trim()
    .parse::<f64>()
    .ok()
    .and_then(|seconds| (seconds.is_finite() && seconds >= 0.0).then_some(seconds));

  parsed_duration
    .map(|seconds| (seconds * 1000.0).round() as u64)
    .unwrap_or(fallback_duration_ms)
}

fn start_capture_recorder_event_pump(
  app: &AppHandle,
  state: &ManagedCaptureState,
  mut receiver: tauri::async_runtime::Receiver<CommandEvent>,
) {
  let app = app.clone();
  let state = state.inner.clone();

  tauri::async_runtime::spawn(async move {
    while let Some(event) = receiver.recv().await {
      match event {
        CommandEvent::Stderr(line) => {
          if let Ok(mut inner) = state.lock() {
            inner.push_recorder_stderr(String::from_utf8_lossy(&line).trim().to_string());
          }
        }
        CommandEvent::Error(message) => {
          if let Ok(mut inner) = state.lock() {
            inner.push_recorder_stderr(message);
          }
        }
        CommandEvent::Terminated(payload) => {
          let snapshot = {
            let mut inner = match state.lock() {
              Ok(inner) => inner,
              Err(_) => continue,
            };

            inner.recorder = None;

            if inner.recorder_expected_shutdown {
              inner.recorder_expected_shutdown = false;
              None
            } else if inner.status == ManagedCaptureStatus::Capturing {
              let stderr_summary = inner.recorder_stderr_summary();
              let stderr_suffix = stderr_summary
                .map(|summary| format!(" Recent recorder stderr: {summary}"))
                .unwrap_or_default();

              inner.error_message = Some(format!(
                "The microphone capture process exited unexpectedly with code {:?} and signal {:?}.{}",
                payload.code, payload.signal, stderr_suffix
              ));

              Some(inner.snapshot())
            } else {
              None
            }
          };

          if let Some(payload) = snapshot {
            let _ = app.emit(CAPTURE_STATE_EVENT, payload);
          }
        }
        _ => {}
      }
    }
  });
}

fn capture_state_snapshot(state: &ManagedCaptureState) -> Result<ManagedCaptureStatePayload, String> {
  let inner = state
    .inner
    .lock()
    .map_err(|_| "The managed capture state mutex was poisoned.".to_string())?;

  Ok(inner.snapshot())
}

fn emit_capture_state(app: &AppHandle, state: &ManagedCaptureState) -> Result<ManagedCaptureStatePayload, String> {
  let payload = capture_state_snapshot(state)?;

  app
    .emit(CAPTURE_STATE_EVENT, payload.clone())
    .map_err(|error| format!("Failed to emit the V2T capture state event: {error}"))?;

  Ok(payload)
}

fn set_capture_error(
  app: &AppHandle,
  state: &ManagedCaptureState,
  message: String,
) -> Result<ManagedCaptureStatePayload, String> {
  {
    let mut inner = state
      .inner
      .lock()
      .map_err(|_| "The managed capture state mutex was poisoned.".to_string())?;
    inner.error_message = Some(message);
  }

  emit_capture_state(app, state)
}

async fn sidecar_post<Req: Serialize, Res: for<'de> Deserialize<'de>>(
  bootstrap: &SidecarBootstrapPayload,
  path: &str,
  payload: &Req,
) -> Result<Res, String> {
  let client = Client::builder()
    .timeout(Duration::from_secs(5))
    .build()
    .map_err(|error| format!("Failed to create the V2T sidecar mutation client: {error}"))?;
  let url = format!("{}/api/v0{path}", bootstrap.base_url);
  let response = client
    .post(&url)
    .json(payload)
    .send()
    .await
    .map_err(|error| format!("Failed to call the V2T sidecar at {url}: {error}"))?;

  if !response.status().is_success() {
    let status = response.status();
    let body = response
      .text()
      .await
      .unwrap_or_else(|_| "Unable to read sidecar error body.".to_string());

    return Err(format!("The V2T sidecar returned {status} for {path}: {body}"));
  }

  response
    .json::<Res>()
    .await
    .map_err(|error| format!("Failed to decode the V2T sidecar response for {path}: {error}"))
}

async fn sidecar_post_empty<Res: for<'de> Deserialize<'de>>(
  bootstrap: &SidecarBootstrapPayload,
  path: &str,
) -> Result<Res, String> {
  let client = Client::builder()
    .timeout(Duration::from_secs(5))
    .build()
    .map_err(|error| format!("Failed to create the V2T sidecar mutation client: {error}"))?;
  let url = format!("{}/api/v0{path}", bootstrap.base_url);
  let response = client
    .post(&url)
    .send()
    .await
    .map_err(|error| format!("Failed to call the V2T sidecar at {url}: {error}"))?;

  if !response.status().is_success() {
    let status = response.status();
    let body = response
      .text()
      .await
      .unwrap_or_else(|_| "Unable to read sidecar error body.".to_string());

    return Err(format!("The V2T sidecar returned {status} for {path}: {body}"));
  }

  response
    .json::<Res>()
    .await
    .map_err(|error| format!("Failed to decode the V2T sidecar response for {path}: {error}"))
}

async fn sidecar_json_request(
  method: Method,
  bootstrap: &SidecarBootstrapPayload,
  path: &str,
  payload: Option<&Value>,
) -> Result<Value, String> {
  let client = Client::builder()
    .timeout(Duration::from_secs(5))
    .build()
    .map_err(|error| format!("Failed to create the V2T sidecar JSON client: {error}"))?;
  let url = format!("{}/api/v0{path}", bootstrap.base_url);
  let request = client.request(method.clone(), &url);
  let request = match payload {
    Some(payload) => request.json(payload),
    None => request,
  };
  let response = request
    .send()
    .await
    .map_err(|error| format!("Failed to call the V2T sidecar at {url}: {error}"))?;

  if !response.status().is_success() {
    let status = response.status();
    let body = response
      .text()
      .await
      .unwrap_or_else(|_| "Unable to read sidecar error body.".to_string());

    return Err(format!("The V2T sidecar returned {status} for {} {path}: {body}", method.as_str()));
  }

  response
    .json::<Value>()
    .await
    .map_err(|error| format!("Failed to decode the V2T sidecar response for {} {path}: {error}", method.as_str()))
}

fn pending_candidate_id(resource: &SessionResourcePayload) -> Option<String> {
  resource
    .recovery_candidates
    .iter()
    .find(|candidate| candidate.disposition == "pending")
    .map(|candidate| candidate.id.clone())
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
  let mut envs = vec![
    ("BEEP_VT2_HOST", plan.host.clone()),
    ("BEEP_VT2_SESSION_ID", plan.session_id.clone()),
    ("BEEP_VT2_APP_DATA_DIR", plan.app_data_dir.to_string_lossy().into_owned()),
    ("BEEP_VT2_VERSION", plan.version.clone()),
    ("BEEP_VT2_OTLP_ENABLED", "false".to_string()),
    ("BEEP_VT2_DEVTOOLS_ENABLED", "false".to_string()),
    ("BEEP_EDITOR_HOST", plan.host.clone()),
    ("BEEP_EDITOR_SESSION_ID", plan.session_id.clone()),
    ("BEEP_EDITOR_APP_DATA_DIR", plan.app_data_dir.to_string_lossy().into_owned()),
    ("BEEP_EDITOR_VERSION", plan.version.clone()),
    ("BEEP_EDITOR_OTLP_ENABLED", "false".to_string()),
    ("BEEP_EDITOR_DEVTOOLS_ENABLED", "false".to_string()),
  ];

  if let Some(port) = plan.port {
    envs.push(("BEEP_VT2_PORT", port.to_string()));
    envs.push(("BEEP_EDITOR_PORT", port.to_string()));
  }

  if plan.mode == ManagedSidecarMode::DevPortless {
    envs.push(("PORTLESS_HTTPS", "1".to_string()));
  }

  envs
}

fn spawn_sidecar(
  app: &AppHandle,
  plan: &LaunchPlan,
) -> Result<(tauri::async_runtime::Receiver<CommandEvent>, CommandChild), String> {
  let envs = sidecar_env(plan);

  let command = match plan.mode {
    ManagedSidecarMode::DevPortless => {
      let mut command = app.shell().command("portless");
      command = command.args([DEV_SIDECAR_HOSTNAME, "bun", "run", DEV_SIDECAR_ENTRYPOINT]);
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
  app: &AppHandle,
  state: &ManagedSidecarState,
  mut receiver: tauri::async_runtime::Receiver<CommandEvent>,
  bootstrap_sender: oneshot::Sender<SidecarBootstrapPayload>,
) {
  let app = app.clone();
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
          let snapshot = if let Ok(mut inner) = state.lock() {
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

            Some(inner.snapshot())
          } else {
            None
          };

          if let Some(payload) = snapshot {
            let _ = app.emit(SIDECAR_STATE_EVENT, payload);
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

        return validate_healthy_bootstrap(bootstrap, payload);
      }
      Err(_) => tokio::time::sleep(HEALTH_POLL_INTERVAL).await,
    }
  }

  Err(format!("Timed out waiting for the managed sidecar health endpoint at {url}."))
}

fn validate_healthy_bootstrap(
  expected: &SidecarBootstrapPayload,
  payload: SidecarBootstrapPayload,
) -> Result<SidecarBootstrapPayload, String> {
  if payload.session_id != expected.session_id {
    return Err("Managed sidecar bootstrap session id did not match the healthy control-plane response.".into());
  }

  if payload.port != expected.port {
    return Err("Managed sidecar bootstrap port did not match the healthy control-plane response.".into());
  }

  Ok(payload)
}

async fn probe_healthy(bootstrap: &SidecarBootstrapPayload) -> Result<SidecarBootstrapPayload, String> {
  let client = Client::builder()
    .timeout(SIDECAR_PROBE_TIMEOUT)
    .build()
    .map_err(|error| format!("Failed to create the sidecar health-probe client: {error}"))?;
  let url = format!("{}/api/v0/health", bootstrap.base_url);
  let response = client
    .get(&url)
    .send()
    .await
    .map_err(|error| format!("Managed sidecar health probe failed for {url}: {error}"))?;

  if !response.status().is_success() {
    return Err(format!(
      "Managed sidecar health probe returned {} for {url}.",
      response.status()
    ));
  }

  let payload = response
    .json::<SidecarBootstrapPayload>()
    .await
    .map_err(|error| format!("Failed to decode the managed sidecar health-probe payload: {error}"))?;

  validate_healthy_bootstrap(bootstrap, payload)
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
    let _ = child.kill();
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

  let _ = emit_sidecar_state(&app, &state);
  start_event_pump(&app, &state, receiver, bootstrap_sender);

  let bootstrap = tokio::time::timeout(SIDECAR_START_TIMEOUT, bootstrap_receiver)
    .await
    .map_err(|_| "Timed out waiting for the managed sidecar bootstrap stdout line.".to_string())?
    .map_err(|_| "The managed sidecar bootstrap stream ended before it produced a bootstrap line.".to_string())?;

  if bootstrap.session_id != plan.session_id {
    update_failure(&state, "Managed sidecar bootstrap session id did not match the requested session id.".into());
    if let Some(child) = take_child(&state, false) {
      let _ = child.kill();
    }
    let _ = emit_sidecar_state(&app, &state);
    return Err("Managed sidecar bootstrap session id mismatch.".into());
  }

  if let Some(port) = plan.port {
    if bootstrap.port != port {
      update_failure(&state, "Managed sidecar bootstrap port did not match the requested port.".into());
      if let Some(child) = take_child(&state, false) {
        let _ = child.kill();
      }
      let _ = emit_sidecar_state(&app, &state);
      return Err("Managed sidecar bootstrap port mismatch.".into());
    }
  }

  let healthy_bootstrap = match wait_for_healthy(&bootstrap).await {
    Ok(payload) => payload,
    Err(message) => {
      update_failure(&state, message.clone());
      if let Some(child) = take_child(&state, false) {
        let _ = child.kill();
      }
      let _ = emit_sidecar_state(&app, &state);
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

  let _ = emit_sidecar_state(&app, &state);
  Ok(healthy_bootstrap)
}

#[tauri::command]
async fn stop_sidecar(
  app: AppHandle,
  state: State<'_, ManagedSidecarState>,
  capture_state: State<'_, ManagedCaptureState>,
) -> Result<(), String> {
  {
    let inner = capture_state
      .inner
      .lock()
      .map_err(|_| "The managed capture state mutex was poisoned.".to_string())?;

    if inner.status == ManagedCaptureStatus::Capturing {
      return Err("Stop or interrupt the active microphone capture before stopping the V2T sidecar.".into());
    }
  }

  stop_sidecar_inner(&state).await?;
  let _ = emit_sidecar_state(&app, &state);
  Ok(())
}

#[tauri::command]
async fn probe_sidecar(
  app: AppHandle,
  state: State<'_, ManagedSidecarState>,
) -> Result<ManagedSidecarStatePayload, String> {
  let bootstrap = {
    let inner = state
      .inner
      .lock()
      .map_err(|_| "The managed sidecar state mutex was poisoned.".to_string())?;

    if inner.status != ManagedSidecarStatus::Healthy {
      return Ok(inner.snapshot());
    }

    inner
      .bootstrap
      .clone()
      .ok_or_else(|| "The managed sidecar health payload is missing a bootstrap record.".to_string())?
  };

  match probe_healthy(&bootstrap).await {
    Ok(healthy_bootstrap) => {
      let mut inner = state
        .inner
        .lock()
        .map_err(|_| "The managed sidecar state mutex was poisoned.".to_string())?;
      inner.status = ManagedSidecarStatus::Healthy;
      inner.bootstrap = Some(healthy_bootstrap);
      inner.error_message = None;
    }
    Err(message) => {
      if let Some(child) = take_child(&state, false) {
        let _ = child.kill();
      }

      update_failure(&state, message);
    }
  }

  emit_sidecar_state(&app, &state)?;
  sidecar_state_snapshot(&state)
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
async fn get_capture_state(state: State<'_, ManagedCaptureState>) -> Result<ManagedCaptureStatePayload, String> {
  capture_state_snapshot(&state)
}

#[tauri::command]
async fn get_workspace_snapshot(sidecar_state: State<'_, ManagedSidecarState>) -> Result<Value, String> {
  let bootstrap = active_sidecar_bootstrap(&sidecar_state)?;

  sidecar_json_request(Method::GET, &bootstrap, "/workspace", None).await
}

#[tauri::command]
async fn get_session_resource(
  sidecar_state: State<'_, ManagedSidecarState>,
  session_id: String,
) -> Result<Value, String> {
  let bootstrap = active_sidecar_bootstrap(&sidecar_state)?;
  let path = format!("/sessions/{session_id}");

  sidecar_json_request(Method::GET, &bootstrap, &path, None).await
}

#[tauri::command]
async fn create_session_resource(
  sidecar_state: State<'_, ManagedSidecarState>,
  payload: Value,
) -> Result<Value, String> {
  let bootstrap = active_sidecar_bootstrap(&sidecar_state)?;

  sidecar_json_request(Method::POST, &bootstrap, "/sessions", Some(&payload)).await
}

#[tauri::command]
async fn save_preferences(
  sidecar_state: State<'_, ManagedSidecarState>,
  payload: Value,
) -> Result<Value, String> {
  let bootstrap = active_sidecar_bootstrap(&sidecar_state)?;

  sidecar_json_request(Method::PUT, &bootstrap, "/preferences", Some(&payload)).await
}

#[tauri::command]
async fn run_session_composition(
  sidecar_state: State<'_, ManagedSidecarState>,
  session_id: String,
  payload: Value,
) -> Result<Value, String> {
  let bootstrap = active_sidecar_bootstrap(&sidecar_state)?;
  let path = format!("/sessions/{session_id}/composition/run");

  sidecar_json_request(Method::POST, &bootstrap, &path, Some(&payload)).await
}

#[tauri::command]
async fn start_capture(
  app: AppHandle,
  sidecar_state: State<'_, ManagedSidecarState>,
  capture_state: State<'_, ManagedCaptureState>,
  session_id: String,
) -> Result<ManagedCaptureStatePayload, String> {
  {
    let inner = capture_state
      .inner
      .lock()
      .map_err(|_| "The managed capture state mutex was poisoned.".to_string())?;

    if inner.status != ManagedCaptureStatus::Idle {
      return Err("Finish or resolve the current native capture flow before starting another one.".into());
    }
  }

  let bootstrap = active_sidecar_bootstrap(&sidecar_state)?;
  let capture_id = Uuid::new_v4().to_string();
  let artifact_path = capture_artifact_path(&app, &session_id, &capture_id)?;
  let (receiver, recorder) = spawn_capture_recorder(&app, &artifact_path)?;
  let draft = ActiveCaptureDraft {
    session_id: session_id.clone(),
    capture_id: capture_id.clone(),
    draft_path: artifact_path,
    started_at: unix_timestamp_millis()?,
  };

  {
    let mut inner = capture_state
      .inner
      .lock()
      .map_err(|_| "The managed capture state mutex was poisoned.".to_string())?;
    inner.set_capturing(draft, recorder);
  }

  start_capture_recorder_event_pump(&app, &capture_state, receiver);

  let sidecar_path = format!("/sessions/{session_id}/capture/start");

  if let Err(error) = sidecar_post_empty::<SessionResourcePayload>(&bootstrap, &sidecar_path).await {
    let _ = stop_capture_recorder_immediately(&capture_state);

    if let Ok(mut inner) = capture_state.inner.lock() {
      inner.set_idle();
      inner.error_message = Some(error.clone());
    }

    let _ = emit_capture_state(&app, &capture_state);
    return Err(error);
  }

  emit_capture_state(&app, &capture_state)
}

#[tauri::command]
async fn stop_capture(
  app: AppHandle,
  sidecar_state: State<'_, ManagedSidecarState>,
  capture_state: State<'_, ManagedCaptureState>,
  session_id: String,
) -> Result<ManagedCaptureStatePayload, String> {
  let draft = {
    let inner = capture_state
      .inner
      .lock()
      .map_err(|_| "The managed capture state mutex was poisoned.".to_string())?;

    match inner.active_draft.clone() {
      Some(draft) if draft.session_id == session_id => draft,
      Some(_) => return Err("The active native capture belongs to a different session.".into()),
      None => return Err("There is no active native capture to stop.".into()),
    }
  };

  let bootstrap = active_sidecar_bootstrap(&sidecar_state)?;
  let fallback_duration_ms = unix_timestamp_millis()?.saturating_sub(draft.started_at) as u64;

  match request_capture_recorder_shutdown(&capture_state) {
    Ok(true) => {
      if let Err(error) = wait_for_capture_recorder_shutdown(&capture_state).await {
        let _ = set_capture_error(&app, &capture_state, error.clone());
        return Err(error);
      }
    }
    Ok(false) => {}
    Err(error) => {
      let _ = set_capture_error(&app, &capture_state, error.clone());
      return Err(error);
    }
  }

  if let Err(error) = ensure_capture_artifact_ready(&draft.draft_path) {
    let _ = set_capture_error(&app, &capture_state, error.clone());
    return Err(error);
  }

  let duration_ms = recorded_duration_millis(&app, &draft.draft_path, fallback_duration_ms).await;

  let sidecar_path = format!("/sessions/{session_id}/capture/complete");
  let payload = CompleteCaptureRequestPayload {
    duration_ms,
    artifact_path: draft.draft_path.to_string_lossy().into_owned(),
    interrupted: false,
    interruption_reason: None,
  };

  if let Err(error) = sidecar_post::<_, SessionResourcePayload>(&bootstrap, &sidecar_path, &payload).await {
    let _ = set_capture_error(&app, &capture_state, error.clone());
    return Err(error);
  }

  {
    let mut inner = capture_state
      .inner
      .lock()
      .map_err(|_| "The managed capture state mutex was poisoned.".to_string())?;
    inner.set_idle();
  }

  emit_capture_state(&app, &capture_state)
}

#[tauri::command]
async fn interrupt_capture(
  app: AppHandle,
  sidecar_state: State<'_, ManagedSidecarState>,
  capture_state: State<'_, ManagedCaptureState>,
  session_id: String,
) -> Result<ManagedCaptureStatePayload, String> {
  let draft = {
    let inner = capture_state
      .inner
      .lock()
      .map_err(|_| "The managed capture state mutex was poisoned.".to_string())?;

    match inner.active_draft.clone() {
      Some(draft) if draft.session_id == session_id => draft,
      Some(_) => return Err("The active native capture belongs to a different session.".into()),
      None => return Err("There is no active native capture to interrupt.".into()),
    }
  };

  let bootstrap = active_sidecar_bootstrap(&sidecar_state)?;
  let fallback_duration_ms = unix_timestamp_millis()?.saturating_sub(draft.started_at) as u64;

  match request_capture_recorder_shutdown(&capture_state) {
    Ok(true) => {
      if let Err(error) = wait_for_capture_recorder_shutdown(&capture_state).await {
        let _ = set_capture_error(&app, &capture_state, error.clone());
        return Err(error);
      }
    }
    Ok(false) => {}
    Err(error) => {
      let _ = set_capture_error(&app, &capture_state, error.clone());
      return Err(error);
    }
  }

  if let Err(error) = ensure_capture_artifact_ready(&draft.draft_path) {
    let _ = set_capture_error(&app, &capture_state, error.clone());
    return Err(error);
  }

  let duration_ms = recorded_duration_millis(&app, &draft.draft_path, fallback_duration_ms).await;

  let sidecar_path = format!("/sessions/{session_id}/capture/complete");
  let payload = CompleteCaptureRequestPayload {
    duration_ms,
    artifact_path: draft.draft_path.to_string_lossy().into_owned(),
    interrupted: true,
    interruption_reason: Some("Microphone capture was interrupted from the V2T shell.".to_string()),
  };

  let resource = match sidecar_post::<_, SessionResourcePayload>(&bootstrap, &sidecar_path, &payload).await {
    Ok(resource) => resource,
    Err(error) => {
      let _ = set_capture_error(&app, &capture_state, error.clone());
      return Err(error);
    }
  };

  let candidate_id = pending_candidate_id(&resource).ok_or_else(|| {
    "The V2T sidecar did not return a pending recovery candidate after the interruption.".to_string()
  })?;

  {
    let mut inner = capture_state
      .inner
      .lock()
      .map_err(|_| "The managed capture state mutex was poisoned.".to_string())?;
    inner.set_recoverable(session_id, candidate_id);
  }

  emit_capture_state(&app, &capture_state)
}

async fn resolve_capture_candidate(
  app: &AppHandle,
  sidecar_state: &ManagedSidecarState,
  capture_state: &ManagedCaptureState,
  session_id: String,
  candidate_id: String,
  disposition: &str,
) -> Result<ManagedCaptureStatePayload, String> {
  let bootstrap = active_sidecar_bootstrap(sidecar_state)?;
  let sidecar_path = format!("/sessions/{session_id}/recovery/{candidate_id}");
  let payload = ResolveRecoveryCandidateRequestPayload {
    disposition: disposition.to_string(),
  };

  if let Err(error) = sidecar_post::<_, SessionResourcePayload>(&bootstrap, &sidecar_path, &payload).await {
    let _ = set_capture_error(app, capture_state, error.clone());
    return Err(error);
  }

  {
    let mut inner = capture_state
      .inner
      .lock()
      .map_err(|_| "The managed capture state mutex was poisoned.".to_string())?;
    inner.set_idle();
  }

  emit_capture_state(app, capture_state)
}

#[tauri::command]
async fn recover_capture_candidate(
  app: AppHandle,
  sidecar_state: State<'_, ManagedSidecarState>,
  capture_state: State<'_, ManagedCaptureState>,
  session_id: String,
  candidate_id: String,
) -> Result<ManagedCaptureStatePayload, String> {
  resolve_capture_candidate(
    &app,
    &sidecar_state,
    &capture_state,
    session_id,
    candidate_id,
    "recover",
  )
  .await
}

#[tauri::command]
async fn discard_capture_candidate(
  app: AppHandle,
  sidecar_state: State<'_, ManagedSidecarState>,
  capture_state: State<'_, ManagedCaptureState>,
  session_id: String,
  candidate_id: String,
) -> Result<ManagedCaptureStatePayload, String> {
  resolve_capture_candidate(
    &app,
    &sidecar_state,
    &capture_state,
    session_id,
    candidate_id,
    "discard",
  )
  .await
}

#[tauri::command]
async fn pick_workspace_directory(app: AppHandle) -> Result<Option<String>, String> {
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
    .manage(ManagedCaptureState::default())
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_shell::init())
    .invoke_handler(tauri::generate_handler![
      start_sidecar,
      stop_sidecar,
      probe_sidecar,
      get_sidecar_state,
      get_capture_state,
      get_workspace_snapshot,
      get_session_resource,
      create_session_resource,
      save_preferences,
      run_session_composition,
      start_capture,
      stop_capture,
      interrupt_capture,
      recover_capture_candidate,
      discard_capture_candidate,
      pick_workspace_directory
    ])
    .run(tauri::generate_context!())
    .expect("error while running V2T");
}

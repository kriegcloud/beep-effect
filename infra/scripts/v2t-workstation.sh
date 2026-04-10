#!/usr/bin/env bash
set -euo pipefail

ACTION="${1:-}"

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)"
REPO_ROOT="${V2T_REPO_ROOT:-$ROOT_DIR}"
TARGET_USER="${V2T_TARGET_USER:-${USER:-}}"
QWEN_MODEL_ID="${V2T_QWEN_MODEL_ID:-Qwen/Qwen2-Audio-7B-Instruct}"
QWEN_TRUST_REMOTE_CODE="${V2T_QWEN_TRUST_REMOTE_CODE:-false}"
QWEN_HOST="${V2T_QWEN_HOST:-127.0.0.1}"
QWEN_PORT="${V2T_QWEN_PORT:-8011}"
GRAPHITI_ENABLED="${V2T_GRAPHITI_ENABLED:-true}"
GRAPHITI_MODEL_NAME="${V2T_GRAPHITI_MODEL_NAME:-gpt-4o-mini}"
QWEN_SERVICE_NAME="${V2T_QWEN_SERVICE_NAME:-beep-v2t-qwen.service}"
GRAPHITI_PROXY_SERVICE_NAME="${V2T_GRAPHITI_PROXY_SERVICE_NAME:-beep-graphiti-proxy.service}"
QWEN_SERVER_SCRIPT="${REPO_ROOT}/infra/scripts/qwen_audio_server.py"

if [[ -z "$ACTION" ]]; then
  printf 'usage: %s <preflight|install-system|install-graphiti|uninstall-graphiti|install-qwen|uninstall-qwen|build-app|uninstall-app>\n' "$0" >&2
  exit 1
fi

if [[ -z "$TARGET_USER" ]]; then
  printf '[v2t-workstation] unable to resolve target user\n' >&2
  exit 1
fi

TARGET_UID="$(id -u "$TARGET_USER")"
TARGET_HOME="$(getent passwd "$TARGET_USER" | cut -d: -f6)"
TARGET_RUNTIME_DIR="/run/user/${TARGET_UID}"
TARGET_SYSTEMD_DIR="${TARGET_HOME}/.config/systemd/user"
TARGET_STATE_HOME="${TARGET_HOME}/.local/state/beep/v2t-workstation"
GRAPHITI_STATE_DIR="${V2T_GRAPHITI_STATE_DIR:-${TARGET_HOME}/.local/share/beep/v2t-workstation/graphiti}"
QWEN_STATE_DIR="${V2T_QWEN_STATE_DIR:-${TARGET_HOME}/.local/share/beep/v2t-workstation/qwen}"
QWEN_VENV_DIR="${QWEN_STATE_DIR}/venv"
QWEN_CACHE_DIR="${QWEN_STATE_DIR}/hf-cache"
QWEN_ENV_FILE="${QWEN_STATE_DIR}/qwen.env"
QWEN_SERVICE_FILE="${TARGET_SYSTEMD_DIR}/${QWEN_SERVICE_NAME}"
GRAPHITI_COMPOSE_FILE="${GRAPHITI_STATE_DIR}/compose.yml"
GRAPHITI_ENV_FILE="${GRAPHITI_STATE_DIR}/graphiti.env"
PACKAGE_STATE_FILE="${TARGET_STATE_HOME}/installed-package-name"

log() {
  printf '[v2t-workstation] %s\n' "$1"
}

die() {
  printf '[v2t-workstation] %s\n' "$1" >&2
  exit 1
}

require_command() {
  command -v "$1" >/dev/null 2>&1 || die "missing required command: $1"
}

resolve_docker_compose_package() {
  if apt-cache show docker-compose-plugin >/dev/null 2>&1; then
    printf 'docker-compose-plugin\n'
    return 0
  fi

  if apt-cache show docker-compose-v2 >/dev/null 2>&1; then
    printf 'docker-compose-v2\n'
    return 0
  fi

  die "unable to resolve a supported Docker Compose plugin package for this distro"
}

run_as_target_user() {
  sudo -n -u "$TARGET_USER" env \
    HOME="$TARGET_HOME" \
    USER="$TARGET_USER" \
    LOGNAME="$TARGET_USER" \
    XDG_RUNTIME_DIR="$TARGET_RUNTIME_DIR" \
    DBUS_SESSION_BUS_ADDRESS="unix:path=${TARGET_RUNTIME_DIR}/bus" \
    PATH="${TARGET_HOME}/.cargo/bin:${TARGET_HOME}/.bun/bin:/usr/local/bin:/usr/bin:/bin" \
    "$@"
}

run_as_target_user_shell() {
  run_as_target_user bash -lc "$1"
}

ensure_supported_os() {
  if [[ ! -f /etc/os-release ]]; then
    die "missing /etc/os-release; only Debian and Ubuntu are supported"
  fi

  if ! grep -Eq '^(ID|ID_LIKE)=.*(debian|ubuntu)' /etc/os-release; then
    die "unsupported operating system; this installer currently targets Debian or Ubuntu"
  fi
}

ensure_repo_surface() {
  [[ -d "${REPO_ROOT}/apps/V2T" ]] || die "missing apps/V2T under ${REPO_ROOT}"
  [[ -d "${REPO_ROOT}/packages/VT2" ]] || die "missing packages/VT2 under ${REPO_ROOT}"
  [[ -f "${REPO_ROOT}/bun.lock" ]] || die "missing bun.lock under ${REPO_ROOT}"
  [[ -f "$QWEN_SERVER_SCRIPT" ]] || die "missing Qwen server script at ${QWEN_SERVER_SCRIPT}"
}

ensure_target_runtime_dir() {
  [[ -d "$TARGET_RUNTIME_DIR" ]] || die "missing ${TARGET_RUNTIME_DIR}; log in as ${TARGET_USER} before running the installer"
}

ensure_sudo_access() {
  sudo -n true >/dev/null 2>&1 || die "passwordless sudo is required for non-interactive installation"
}

ensure_systemd_user() {
  run_as_target_user systemctl --user list-units --all >/dev/null
}

ensure_nvidia_driver() {
  require_command nvidia-smi
  nvidia-smi >/dev/null
}

preflight() {
  ensure_supported_os
  ensure_repo_surface
  ensure_target_runtime_dir
  ensure_sudo_access
  ensure_systemd_user
  ensure_nvidia_driver
  log "preflight checks passed"
}

install_system() {
  preflight
  require_command curl
  require_command getent
  require_command apt-cache

  local docker_compose_package

  sudo -n apt-get update
  docker_compose_package="$(resolve_docker_compose_package)"
  sudo -n apt-get install -y --no-install-recommends \
    build-essential \
    ca-certificates \
    curl \
    "$docker_compose_package" \
    docker.io \
    ffmpeg \
    file \
    git \
    libasound2-dev \
    libayatana-appindicator3-dev \
    libgtk-3-dev \
    librsvg2-dev \
    libsndfile1 \
    libssl-dev \
    libwebkit2gtk-4.1-dev \
    libxdo-dev \
    nodejs \
    npm \
    patchelf \
    pkg-config \
    python3-dev \
    python3-pip \
    python3-venv \
    sqlite3 \
    wget \
    xdg-utils

  if ! run_as_target_user bash -lc 'command -v bun >/dev/null 2>&1'; then
    log "installing bun for ${TARGET_USER}"
    run_as_target_user bash -lc 'curl -fsSL https://bun.sh/install | bash'
  fi

  if ! run_as_target_user bash -lc 'command -v rustup >/dev/null 2>&1 && command -v cargo >/dev/null 2>&1'; then
    log "installing rustup for ${TARGET_USER}"
    run_as_target_user bash -lc 'curl https://sh.rustup.rs -sSf | sh -s -- -y'
  fi

  if ! command -v portless >/dev/null 2>&1; then
    log "installing portless globally"
    sudo -n npm install -g portless
  fi

  sudo -n systemctl enable --now docker

  run_as_target_user bash -lc 'bun --version >/dev/null'
  run_as_target_user bash -lc 'source "$HOME/.cargo/env" >/dev/null 2>&1 || true; cargo --version >/dev/null'
  docker compose version >/dev/null
  log "system dependencies installed"
}

write_graphiti_compose() {
  run_as_target_user mkdir -p "$GRAPHITI_STATE_DIR"
  run_as_target_user mkdir -p "${GRAPHITI_STATE_DIR}/falkordb-data"

  run_as_target_user bash -lc "umask 077 && cat > '${GRAPHITI_ENV_FILE}' <<EOF
GRAPHITI_OPENAI_API_KEY=${V2T_GRAPHITI_OPENAI_API_KEY:-}
EOF"

  run_as_target_user bash -lc "cat > '${GRAPHITI_COMPOSE_FILE}' <<'EOF'
services:
  falkordb:
    image: falkordb/falkordb:latest
    container_name: graphiti-mcp-falkordb-1
    ports:
      - '127.0.0.1:6379:6379'
      - '127.0.0.1:3001:3000'
    volumes:
      - ./falkordb-data:/var/lib/falkordb/data
    environment:
      FALKORDB_ARGS: THREAD_COUNT 4 CACHE_SIZE 50
      REDIS_ARGS: --appendonly yes --appendfsync everysec --maxmemory 4gb --maxmemory-policy allkeys-lru
    healthcheck:
      test: ['CMD', 'redis-cli', 'ping']
      interval: 30s
      timeout: 10s
      retries: 3
    restart: unless-stopped

  graphiti:
    image: zepai/knowledge-graph-mcp:standalone
    container_name: graphiti-mcp-graphiti-mcp-1
    depends_on:
      falkordb:
        condition: service_healthy
    ports:
      - '127.0.0.1:8000:8000'
    environment:
      OPENAI_API_KEY: \${GRAPHITI_OPENAI_API_KEY}
      MODEL_NAME: ${GRAPHITI_MODEL_NAME}
      FALKORDB_URI: redis://falkordb:6379
      FALKORDB_DATABASE: beep_knowledge
      GRAPHITI_GROUP_ID: beep-dev
      SEMAPHORE_LIMIT: 10
      MCP_SERVER_HOST: 0.0.0.0
      GRAPHITI_TELEMETRY_ENABLED: 'false'
    healthcheck:
      test: ['CMD-SHELL', 'curl -f http://localhost:8000/health || exit 1']
      interval: 10s
      timeout: 5s
      start_period: 15s
      retries: 3
    restart: unless-stopped
EOF"
}

wait_for_container_health() {
  local container_name="$1"
  local deadline
  deadline=$(( $(date +%s) + 180 ))

  while [[ $(date +%s) -le $deadline ]]; do
    local status
    status="$(sudo -n docker inspect --format '{{.State.Health.Status}}' "$container_name" 2>/dev/null || true)"

    if [[ "$status" == "healthy" ]]; then
      return 0
    fi

    sleep 2
  done

  die "timed out waiting for ${container_name} to become healthy"
}

install_graphiti() {
  if [[ "$GRAPHITI_ENABLED" != "true" ]]; then
    log "graphiti provisioning disabled"
    return 0
  fi

  if [[ -z "${V2T_GRAPHITI_OPENAI_API_KEY:-}" ]]; then
    die "graphiti is enabled but V2T_GRAPHITI_OPENAI_API_KEY was not provided"
  fi

  write_graphiti_compose

  sudo -n docker compose \
    --project-name graphiti-mcp \
    --env-file "$GRAPHITI_ENV_FILE" \
    -f "$GRAPHITI_COMPOSE_FILE" \
    up -d --remove-orphans

  wait_for_container_health graphiti-mcp-falkordb-1
  wait_for_container_health graphiti-mcp-graphiti-mcp-1

  run_as_target_user bash -lc "cd '${REPO_ROOT}' && GRAPHITI_PROXY_SERVICE_NAME='${GRAPHITI_PROXY_SERVICE_NAME}' bash scripts/graphiti-proxy-service-install.sh"

  log "graphiti stack and proxy service are ready"
}

uninstall_graphiti() {
  run_as_target_user bash -lc "systemctl --user disable --now '${GRAPHITI_PROXY_SERVICE_NAME}' >/dev/null 2>&1 || true"
  run_as_target_user bash -lc "rm -f '${TARGET_SYSTEMD_DIR}/${GRAPHITI_PROXY_SERVICE_NAME}' && systemctl --user daemon-reload >/dev/null 2>&1 || true"

  if [[ -f "$GRAPHITI_COMPOSE_FILE" ]]; then
    sudo -n docker compose --project-name graphiti-mcp -f "$GRAPHITI_COMPOSE_FILE" down --remove-orphans --volumes >/dev/null 2>&1 || true
  fi

  run_as_target_user rm -rf "$GRAPHITI_STATE_DIR"
  log "graphiti-managed assets removed"
}

write_qwen_service_files() {
  run_as_target_user mkdir -p "$QWEN_STATE_DIR" "$QWEN_CACHE_DIR" "$TARGET_SYSTEMD_DIR" "$TARGET_STATE_HOME"

  run_as_target_user bash -lc "umask 077 && cat > '${QWEN_ENV_FILE}' <<EOF
QWEN_SERVICE_MODEL_ID=${QWEN_MODEL_ID}
QWEN_SERVICE_TRUST_REMOTE_CODE=${QWEN_TRUST_REMOTE_CODE}
QWEN_SERVICE_HOST=${QWEN_HOST}
QWEN_SERVICE_PORT=${QWEN_PORT}
QWEN_SERVICE_CACHE_DIR=${QWEN_CACHE_DIR}
HF_HOME=${QWEN_CACHE_DIR}
TRANSFORMERS_CACHE=${QWEN_CACHE_DIR}
PYTHONUNBUFFERED=1
HUGGING_FACE_HUB_TOKEN=${V2T_HUGGING_FACE_HUB_TOKEN:-}
EOF"

  run_as_target_user bash -lc "cat > '${QWEN_SERVICE_FILE}' <<EOF
[Unit]
Description=beep V2T local Qwen audio service
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
WorkingDirectory=${REPO_ROOT}
EnvironmentFile=${QWEN_ENV_FILE}
ExecStart=${QWEN_VENV_DIR}/bin/python ${QWEN_SERVER_SCRIPT}
Restart=always
RestartSec=5
StandardOutput=append:${TARGET_STATE_HOME}/qwen.log
StandardError=append:${TARGET_STATE_HOME}/qwen.err.log

[Install]
WantedBy=default.target
EOF"
}

wait_for_qwen_health() {
  local deadline
  deadline=$(( $(date +%s) + 180 ))

  while [[ $(date +%s) -le $deadline ]]; do
    if curl -fsS "http://${QWEN_HOST}:${QWEN_PORT}/healthz" >/dev/null 2>&1; then
      return 0
    fi

    sleep 2
  done

  die "timed out waiting for the Qwen health endpoint to become ready"
}

install_qwen() {
  run_as_target_user mkdir -p "$QWEN_STATE_DIR" "$QWEN_CACHE_DIR"

  if [[ ! -x "${QWEN_VENV_DIR}/bin/python" ]]; then
    run_as_target_user python3 -m venv "$QWEN_VENV_DIR"
  fi

  run_as_target_user "${QWEN_VENV_DIR}/bin/pip" install --upgrade pip setuptools wheel
  run_as_target_user "${QWEN_VENV_DIR}/bin/pip" install --upgrade \
    accelerate \
    fastapi \
    huggingface_hub \
    librosa \
    safetensors \
    sentencepiece \
    soundfile \
    torch \
    torchaudio \
    "uvicorn[standard]"
  run_as_target_user "${QWEN_VENV_DIR}/bin/pip" install --upgrade git+https://github.com/huggingface/transformers

  run_as_target_user env \
    HUGGING_FACE_HUB_TOKEN="${V2T_HUGGING_FACE_HUB_TOKEN:-}" \
    HF_HOME="$QWEN_CACHE_DIR" \
    TRANSFORMERS_CACHE="$QWEN_CACHE_DIR" \
    QWEN_SERVICE_MODEL_ID="$QWEN_MODEL_ID" \
    QWEN_SERVICE_CACHE_DIR="$QWEN_CACHE_DIR" \
    QWEN_SERVICE_TRUST_REMOTE_CODE="$QWEN_TRUST_REMOTE_CODE" \
    "${QWEN_VENV_DIR}/bin/python" "$QWEN_SERVER_SCRIPT" --download-only

  write_qwen_service_files

  run_as_target_user systemctl --user daemon-reload
  run_as_target_user systemctl --user enable "$QWEN_SERVICE_NAME"

  if run_as_target_user systemctl --user is-active --quiet "$QWEN_SERVICE_NAME"; then
    run_as_target_user systemctl --user restart "$QWEN_SERVICE_NAME"
  else
    run_as_target_user systemctl --user start "$QWEN_SERVICE_NAME"
  fi

  wait_for_qwen_health
  log "qwen service is ready at http://${QWEN_HOST}:${QWEN_PORT}"
}

uninstall_qwen() {
  run_as_target_user bash -lc "systemctl --user disable --now '${QWEN_SERVICE_NAME}' >/dev/null 2>&1 || true"
  run_as_target_user bash -lc "rm -f '${QWEN_SERVICE_FILE}' && systemctl --user daemon-reload >/dev/null 2>&1 || true"
  run_as_target_user rm -rf "$QWEN_STATE_DIR"
  log "qwen-managed assets removed"
}

build_app() {
  run_as_target_user bash -lc "cd '${REPO_ROOT}' && bun install --frozen-lockfile 1>&2"
  run_as_target_user bash -lc "cd '${REPO_ROOT}' && { source \"\$HOME/.cargo/env\" >/dev/null 2>&1 || true; } && bun run --cwd apps/V2T build:native 1>&2"

  local deb_path
  deb_path="$(find "${REPO_ROOT}/apps/V2T/src-tauri/target/release/bundle/deb" -maxdepth 1 -type f -name '*.deb' | sort | tail -n 1)"

  [[ -n "$deb_path" ]] || die "unable to locate the built V2T Debian package"

  local package_name
  package_name="$(dpkg-deb -f "$deb_path" Package)"

  sudo -n apt-get install -y "$deb_path"
  run_as_target_user mkdir -p "$TARGET_STATE_HOME"
  run_as_target_user bash -lc "umask 077 && printf '%s\n' '${package_name}' > '${PACKAGE_STATE_FILE}'"
  printf '%s\n' "$package_name"
}

read_installed_package_name() {
  if run_as_target_user test -f "$PACKAGE_STATE_FILE"; then
    run_as_target_user cat "$PACKAGE_STATE_FILE"
    return 0
  fi

  local deb_path
  deb_path="$(find "${REPO_ROOT}/apps/V2T/src-tauri/target/release/bundle/deb" -maxdepth 1 -type f -name '*.deb' | sort | tail -n 1)"

  if [[ -n "$deb_path" ]]; then
    dpkg-deb -f "$deb_path" Package
    return 0
  fi

  if dpkg -s beep-v2t >/dev/null 2>&1; then
    printf 'beep-v2t\n'
    return 0
  fi

  if dpkg -s v2t >/dev/null 2>&1; then
    printf 'v2t\n'
    return 0
  fi

  return 1
}

uninstall_app() {
  local package_name
  package_name="$(read_installed_package_name || true)"

  if [[ -n "$package_name" ]] && dpkg -s "$package_name" >/dev/null 2>&1; then
    sudo -n apt-get remove -y "$package_name" >/dev/null
  fi

  run_as_target_user rm -f "$PACKAGE_STATE_FILE"
  log "v2t package removed if it was installed"
}

case "$ACTION" in
  preflight)
    preflight
    ;;
  install-system)
    install_system
    ;;
  install-graphiti)
    install_graphiti
    ;;
  uninstall-graphiti)
    uninstall_graphiti
    ;;
  install-qwen)
    install_qwen
    ;;
  uninstall-qwen)
    uninstall_qwen
    ;;
  build-app)
    build_app
    ;;
  uninstall-app)
    uninstall_app
    ;;
  *)
    die "unknown action: ${ACTION}"
    ;;
esac

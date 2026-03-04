#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
SERVICE_NAME="${GRAPHITI_PROXY_SERVICE_NAME:-beep-graphiti-proxy.service}"
SYSTEMD_USER_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/systemd/user"
SERVICE_FILE="${SYSTEMD_USER_DIR}/${SERVICE_NAME}"
STATE_DIR="${XDG_STATE_HOME:-$HOME/.local/state}/beep"

log() {
  printf '[graphiti-proxy:service] %s\n' "$1"
}

if ! command -v bun >/dev/null 2>&1; then
  log "Missing required command: bun"
  exit 1
fi

if ! command -v systemctl >/dev/null 2>&1; then
  log "Missing required command: systemctl"
  exit 1
fi

BUN_BIN="$(command -v bun)"

mkdir -p "$SYSTEMD_USER_DIR" "$STATE_DIR"

cat >"$SERVICE_FILE" <<EOF
[Unit]
Description=beep Graphiti MCP queue proxy
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
WorkingDirectory=${ROOT_DIR}
ExecStart=${BUN_BIN} run beep graphiti proxy
Restart=always
RestartSec=2
Environment=PATH=/usr/local/bin:/usr/bin:/bin:${HOME}/.bun/bin
Environment=GRAPHITI_PROXY_HOST=127.0.0.1
Environment=GRAPHITI_PROXY_PORT=8123
Environment=GRAPHITI_PROXY_UPSTREAM=http://127.0.0.1:8000/mcp
StandardOutput=append:${STATE_DIR}/graphiti-proxy.log
StandardError=append:${STATE_DIR}/graphiti-proxy.err.log

[Install]
WantedBy=default.target
EOF

log "Wrote user unit: ${SERVICE_FILE}"

systemctl --user daemon-reload
systemctl --user enable --now "$SERVICE_NAME"
if ! systemctl --user is-active --quiet "$SERVICE_NAME"; then
  systemctl --user --no-pager --full status "$SERVICE_NAME" | sed -n '1,60p'
  journalctl --user -u "$SERVICE_NAME" -n 80 --no-pager
  log "Service failed to become active."
  exit 1
fi

systemctl --user --no-pager --full status "$SERVICE_NAME" | sed -n '1,30p'

log "Service enabled and started."

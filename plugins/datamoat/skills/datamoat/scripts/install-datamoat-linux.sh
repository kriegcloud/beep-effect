#!/usr/bin/env bash
# Install the latest DataMoat on Linux from source, then start pre-setup
# no-screen protection.
# Exit codes: 0 = installed and protecting, 3 = installed (finish on desktop),
#             4 = use the official site.
set -u

OFFICIAL_SITE="https://datamoat.org"
REPO_URL="https://github.com/max-ng/datamoat.git"
SRC_DIR="${DATAMOAT_SRC_DIR:-$HOME/.datamoat-src}"

gentle_site_exit() {
  echo ""
  echo "Use the guided setup from the official DataMoat site."
  echo "Please visit ${OFFICIAL_SITE} for the short Linux instructions."
  exit 4
}

if [ "$(uname -s)" != "Linux" ]; then
  echo "This quick installer is for Linux. macOS and Windows have their own one-step paths."
  gentle_site_exit
fi

command -v git >/dev/null 2>&1 || { echo "DataMoat setup would like git on this machine first (e.g. apt install git)."; gentle_site_exit; }
command -v node >/dev/null 2>&1 || { echo "DataMoat setup would like Node.js 18+ on this machine first (https://nodejs.org)."; gentle_site_exit; }

NODE_MAJOR="$(node -e 'process.stdout.write(process.version.slice(1).split(".")[0])' 2>/dev/null || echo 0)"
if [ "${NODE_MAJOR:-0}" -lt 18 ]; then
  echo "DataMoat setup would like Node.js 18 or newer (this machine has v${NODE_MAJOR})."
  gentle_site_exit
fi

echo "Getting the latest DataMoat..."
if [ -d "$SRC_DIR/.git" ]; then
  git -C "$SRC_DIR" pull --ff-only >/dev/null 2>&1 || true
else
  git clone --depth 1 "$REPO_URL" "$SRC_DIR" >/dev/null 2>&1 || gentle_site_exit
fi

cd "$SRC_DIR" || gentle_site_exit

echo "Installing DataMoat and starting background protection (no screen needed)..."
if ! DATAMOAT_INSTALL_SOURCE=skill DATAMOAT_UPDATE_SOURCE=skill bash install.sh --remote-no-screen; then
  gentle_site_exit
fi

BOOTSTRAP_FILE="${HOME}/.datamoat/state/bootstrap-capture.json"
HEALTH_FILE="${HOME}/.datamoat/state/health.json"
BOOTSTRAP_DIR="${HOME}/.datamoat/bootstrap-capture"

bootstrap_file_count() {
  if [ ! -d "$BOOTSTRAP_DIR" ]; then
    echo 0
    return
  fi
  find "$BOOTSTRAP_DIR" -type f 2>/dev/null | wc -l | tr -d ' '
}

for _ in $(seq 1 30); do
  if [ -f "$BOOTSTRAP_FILE" ] && [ -f "$HEALTH_FILE" ] \
    && grep -q '"bootstrapCapture":[[:space:]]*true' "$HEALTH_FILE"; then
    FILE_COUNT=0
    for _ in $(seq 1 10); do
      FILE_COUNT="$(bootstrap_file_count)"
      [ "${FILE_COUNT:-0}" -gt 0 ] && break
      sleep 1
    done
    echo ""
    echo "DataMoat is installed and already protecting this machine."
    if [ "${FILE_COUNT:-0}" -gt 0 ]; then
      echo "It has already encrypted $FILE_COUNT local conversation file(s) in"
      echo "the no-screen background capture."
    else
      echo "No-screen capture is running."
    fi
    echo "It is watching your local ChatGPT, Claude, Codex, Cursor, DeepSeek,"
    echo "Qwen, and OpenClaw conversation records in the background."
    echo ""
    echo "One small step is saved for you: open DataMoat on this desktop"
    echo "(type \`datamoat\`) to set your password and recovery kit in the local app."
    echo "For your security, that part never happens inside a chat."
    exit 0
  fi
  sleep 1
done

echo ""
echo "DataMoat is installed. To begin protection, type \`datamoat\` on this desktop once."
echo "For your security, password and recovery setup happen in the local app, not in chat."
exit 3

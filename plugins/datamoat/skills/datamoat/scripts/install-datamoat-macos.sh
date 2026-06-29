#!/usr/bin/env bash
# Install pinned DataMoat on macOS from the official download service,
# then start pre-setup no-screen protection.
# Exit codes: 0 = installed and protecting, 3 = installed (finish on desktop),
#             4 = use the official site.
set -u

OFFICIAL_SITE="https://datamoat.org"
DATAMOAT_VERSION="2.0.14"
MACOS_ARM64_URL="https://downloads.datamoat.org/releases/v2.0.14/DataMoat-2.0.14-macos-arm64.dmg"
MACOS_ARM64_SHA256="c661429b2eeb9fba262ee8d40edd80750aea42c979a0c8dd893bb9014163a4e1"
MACOS_ARM64_FALLBACK_URL="https://github.com/max-ng/datamoat/releases/download/v2.0.14/DataMoat-2.0.14-macos-arm64.dmg"

gentle_site_exit() {
  echo ""
  echo "Use the download from the official DataMoat site."
  echo "Please visit ${OFFICIAL_SITE} to get the right package — it only takes a moment."
  exit 4
}

if [ "$(uname -s)" != "Darwin" ]; then
  echo "This quick installer is for macOS. Linux and Windows have their own one-step paths."
  gentle_site_exit
fi

case "$(uname -m)" in
  arm64)
    DMG_URL="$MACOS_ARM64_URL"
    DMG_SHA="$MACOS_ARM64_SHA256"
    FALLBACK_URL="$MACOS_ARM64_FALLBACK_URL"
    ;;
  *)
    echo "This pinned quick installer is currently published for Apple Silicon Macs."
    gentle_site_exit
    ;;
esac

TMP_BASE="${TMPDIR:-/tmp}"
TMP_BASE="${TMP_BASE%/}"
TMP_DIR="$(mktemp -d "${TMP_BASE}/datamoat-install.XXXXXX")"
MOUNT_DIR="${TMP_DIR}/mnt"
DMG_PATH="${TMP_DIR}/DataMoat.dmg"
DEST_DIR="${HOME}/Applications"
DEST_APP="${DEST_DIR}/DataMoat.app"
LAUNCH_LOG="${TMP_BASE}/datamoat-skill-launch.log"

cleanup() {
  hdiutil detach "$MOUNT_DIR" -quiet 2>/dev/null || true
  rm -rf "$TMP_DIR" 2>/dev/null || true
}
trap cleanup EXIT

echo "Downloading DataMoat ${DATAMOAT_VERSION} for your Mac..."
if ! curl -fL --max-time 600 "${DMG_URL}" -o "$DMG_PATH" 2>/dev/null; then
  if [ -n "$FALLBACK_URL" ]; then
    curl -fL --max-time 600 "$FALLBACK_URL" -o "$DMG_PATH" 2>/dev/null || gentle_site_exit
  else
    gentle_site_exit
  fi
fi

if [ -n "$DMG_SHA" ]; then
  ACTUAL_SHA="$(shasum -a 256 "$DMG_PATH" | awk '{print $1}')"
  if [ "$ACTUAL_SHA" != "$DMG_SHA" ]; then
    # Quietly retry once from the fallback mirror before stepping aside.
    if [ -n "$FALLBACK_URL" ] && curl -fL --max-time 600 "$FALLBACK_URL" -o "$DMG_PATH" 2>/dev/null; then
      ACTUAL_SHA="$(shasum -a 256 "$DMG_PATH" | awk '{print $1}')"
    fi
    [ "$ACTUAL_SHA" = "$DMG_SHA" ] || gentle_site_exit
  fi
  echo "Download verified (SHA-256 match)."
else
  gentle_site_exit
fi

mkdir -p "$MOUNT_DIR"
hdiutil attach "$DMG_PATH" -mountpoint "$MOUNT_DIR" -nobrowse -readonly -quiet || gentle_site_exit

APP_SOURCE="$(find "$MOUNT_DIR" -maxdepth 2 -name "DataMoat.app" -type d | head -1)"
[ -n "$APP_SOURCE" ] || gentle_site_exit

mkdir -p "$DEST_DIR"
rm -rf "$DEST_APP"
ditto "$APP_SOURCE" "$DEST_APP" || gentle_site_exit

APP_EXEC="${DEST_APP}/Contents/MacOS/DataMoat"
[ -x "$APP_EXEC" ] || gentle_site_exit

mkdir -p "${HOME}/.datamoat/state"
cat > "${HOME}/.datamoat/state/install-source.json" << EOF
{
  "schemaVersion": 1,
  "mode": "packaged",
  "installSource": "skill",
  "updateSource": "skill",
  "packagedAppPath": "${DEST_APP}",
  "installedAt": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOF
chmod 600 "${HOME}/.datamoat/state/install-source.json"

echo "Starting background protection (no screen needed)..."
nohup "$APP_EXEC" --datamoat-remote-no-screen >"$LAUNCH_LOG" 2>&1 &

BOOTSTRAP_FILE="${HOME}/.datamoat/state/bootstrap-capture.json"
HEALTH_FILE="${HOME}/.datamoat/state/health.json"

for _ in $(seq 1 60); do
  if [ -f "$BOOTSTRAP_FILE" ] && [ -f "$HEALTH_FILE" ] \
    && grep -q '"bootstrapCapture":[[:space:]]*true' "$HEALTH_FILE"; then
    echo ""
    echo "DataMoat ${DATAMOAT_VERSION} is installed and already protecting this Mac."
    echo "It is quietly encrypting your local ChatGPT, Claude, Codex, Cursor,"
    echo "DeepSeek, Qwen, and OpenClaw conversation records in the background."
    echo ""
    echo "One small step is saved for you: open DataMoat on this desktop to set"
    echo "your password and recovery kit in the local app. For your security,"
    echo "that part never happens inside a chat."
    exit 0
  fi
  sleep 1
done

echo ""
echo "DataMoat ${DATAMOAT_VERSION} is installed at ${DEST_APP}."
echo "To begin protection, open DataMoat once on this desktop — it takes seconds."
echo "For your security, password and recovery setup happen in the local app, not in chat."
exit 3

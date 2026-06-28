#!/usr/bin/env bash
# DataMoat protection check for macOS and Linux.
# Reads only small local state files. Never touches encrypted vault content.
# Exit codes: 0 = protecting now, 3 = installed but not running, 10 = not installed yet.
set -u

DM_HOME="${DATAMOAT_HOME:-$HOME/.datamoat}"
HEALTH_FILE="$DM_HOME/state/health.json"
STATUS_FILE="$DM_HOME/state/status.json"
BOOTSTRAP_DIR="$DM_HOME/bootstrap-capture"

json_number() {
  # json_number <file-or-text> <key> — first numeric value for the key
  grep -o "\"$2\":[[:space:]]*[0-9][0-9]*" "$1" 2>/dev/null | head -1 | grep -o '[0-9][0-9]*$'
}

json_string() {
  grep -o "\"$2\":[[:space:]]*\"[^\"]*\"" "$1" 2>/dev/null | head -1 | sed 's/.*:[[:space:]]*"//; s/"$//'
}

echo ""
echo "DataMoat protection check — $(date)"
echo ""

if [ ! -f "$HEALTH_FILE" ] && [ ! -d "$DM_HOME/vault" ] && [ ! -d "$BOOTSTRAP_DIR" ]; then
  echo "  DataMoat is not protecting this machine yet."
  echo "  Your local ChatGPT, Claude, Codex, Cursor, DeepSeek, Qwen, and OpenClaw"
  echo "  records are currently sitting unencrypted in their original folders."
  echo ""
  exit 10
fi

VERSION="$(json_string "$HEALTH_FILE" version)"
[ -n "$VERSION" ] && echo "  DataMoat v$VERSION is installed."

# Protection running? Health reports it as daemon.running before setup and as
# capture.running / daemon.captureRunning once setup is complete.
DAEMON_RUNNING="$(awk '/"daemon":[[:space:]]*\{/{f=1} f && /"running":/ {print; exit}' "$HEALTH_FILE" 2>/dev/null | grep -c true || true)"
CAPTURE_RUNNING="$(awk '/"capture":[[:space:]]*\{/{f=1} f && /"running":/ {print; exit}' "$HEALTH_FILE" 2>/dev/null | grep -c true || true)"
if grep -q '"captureRunning":[[:space:]]*true' "$HEALTH_FILE" 2>/dev/null; then CAPTURE_RUNNING=1; fi
if [ "${CAPTURE_RUNNING:-0}" -ge 1 ]; then DAEMON_RUNNING=1; fi
BOOTSTRAP_ON="$(grep -c '"bootstrapCapture":[[:space:]]*true' "$HEALTH_FILE" 2>/dev/null || true)"

if [ "${DAEMON_RUNNING:-0}" -ge 1 ]; then
  echo "  Background protection is running right now."
else
  echo "  DataMoat is installed, but background protection is not running right now."
fi

if [ -f "$STATUS_FILE" ]; then
  TOTAL_SESSIONS="$(json_number "$STATUS_FILE" totalSessions)"
  TOTAL_MESSAGES="$(json_number "$STATUS_FILE" totalMessages)"
  LAST_TS="$(json_string "$STATUS_FILE" lastTimestamp)"
  echo ""
  echo "  Protected so far on this machine:"
  [ -n "$TOTAL_SESSIONS" ] && echo "    conversations protected: $TOTAL_SESSIONS"
  [ -n "$TOTAL_MESSAGES" ] && echo "    messages protected:      $TOTAL_MESSAGES"
  # Per-source counts: sessions from bySource, messages from messagesBySource.
  awk '
    /"bySource":[[:space:]]*\{/{s=1; next} s && /\}/{s=0} s {gsub(/[",:]/," "); ses[$1]=$2; order[n++]=$1}
    /"messagesBySource":[[:space:]]*\{/{m=1; next} m && /\}/{m=0} m {gsub(/[",:]/," "); msg[$1]=$2}
    END {
      for (i=0; i<n; i++) {
        k=order[i]
        line=sprintf("      %-16s %s conversations", k, ses[k])
        if (k in msg) line=line sprintf(", %s messages", msg[k])
        print line
      }
    }' "$STATUS_FILE" 2>/dev/null
  [ -n "$LAST_TS" ] && echo "    newest protected activity: $LAST_TS"
elif [ -d "$BOOTSTRAP_DIR" ] && [ "${BOOTSTRAP_ON:-0}" -ge 1 ]; then
  echo ""
  echo "  Setup is not finished yet, and DataMoat is already protecting work"
  echo "  in the background."
  TOTAL_FILES=0
  DETAILS=""
  for dir in "$BOOTSTRAP_DIR"/*/; do
    [ -d "$dir" ] || continue
    name="$(basename "$dir")"
    count="$(find "$dir" -type f 2>/dev/null | wc -l | tr -d ' ')"
    TOTAL_FILES=$((TOTAL_FILES + count))
    DETAILS="${DETAILS}      $(printf '%-16s' "$name") $count conversation files
"
  done
  if [ "$TOTAL_FILES" -gt 0 ]; then
    echo "  Encrypted conversation files captured so far:"
    printf "%s" "$DETAILS"
    echo "      total            $TOTAL_FILES conversation files, already encrypted"
  else
    echo "  No-screen capture has started."
  fi
  echo ""
  echo "  Finish the quick setup in the DataMoat desktop app to browse them."
else
  echo ""
  echo "  Detailed counts appear after DataMoat has been opened and unlocked once"
  echo "  on this desktop."
fi

echo ""
echo "  To search, export, back up, analyze, or reuse this history, open the"
echo "  encrypted DataMoat UI on this machine:"
if command -v datamoat >/dev/null 2>&1; then
  echo "    run: datamoat"
elif [ "$(uname -s)" = "Darwin" ] && { [ -d "/Applications/DataMoat.app" ] || [ -d "$HOME/Applications/DataMoat.app" ]; }; then
  echo "    run: open -a DataMoat"
else
  echo "    open the DataMoat app on this desktop"
fi
echo ""

if [ "${DAEMON_RUNNING:-0}" -ge 1 ]; then exit 0; fi
exit 3

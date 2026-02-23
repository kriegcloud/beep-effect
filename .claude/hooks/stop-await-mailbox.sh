#!/usr/bin/env bash

###############################################################################
# Stop Hook - Await Mailbox Messages
#
# This bash wrapper ensures the TypeScript implementation runs correctly with
# proper environment setup and error handling using Bun runtime.
#
# Waits for incoming mailbox messages if COLLABORATION mode is enabled.
# Only runs when COLLABORATION=true environment variable is set.
#
# Exit codes:
#   0 - Success (messages received or no collaboration mode)
#   1 - Internal error (non-fatal)
###############################################################################

set -euo pipefail

# Determine the hooks directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# If CLAUDE_PROJECT_DIR is set, use it; otherwise derive from script location
if [ -n "${CLAUDE_PROJECT_DIR:-}" ]; then
  HOOKS_DIR="${CLAUDE_PROJECT_DIR}/.claude/hooks"
else
  HOOKS_DIR="${SCRIPT_DIR}"
fi

# Read all input
INPUT=$(cat)

# Extract session_id from input
SESSION_ID=$(echo "$INPUT" | jq -r '.session_id // "unknown"')

# Check mailboxes.json for special flags and session registration
MAILBOXES_FILE=".claude/coordination/mailboxes.json"

# Initialize mailboxes.json if it doesn't exist
if [ ! -f "$MAILBOXES_FILE" ]; then
  echo "{}" > "$MAILBOXES_FILE"
fi

# Check for __enable_next__ flag
ENABLE_FLAG=$(jq -r 'has("__enable_next__")' "$MAILBOXES_FILE")
if [ "$ENABLE_FLAG" = "true" ]; then
  # Add this session and remove flag
  jq --arg sid "$SESSION_ID" \
    'del(.__enable_next__) | if has($sid) then . else . + {($sid): []} end' \
    "$MAILBOXES_FILE" > "$MAILBOXES_FILE.tmp" && \
    mv "$MAILBOXES_FILE.tmp" "$MAILBOXES_FILE"
fi

# Check for __disable_next__ flag
DISABLE_FLAG=$(jq -r 'has("__disable_next__")' "$MAILBOXES_FILE")
if [ "$DISABLE_FLAG" = "true" ]; then
  # Remove this session and remove flag
  jq --arg sid "$SESSION_ID" 'del(.__disable_next__) | del(.[$sid])' \
    "$MAILBOXES_FILE" > "$MAILBOXES_FILE.tmp" && \
    mv "$MAILBOXES_FILE.tmp" "$MAILBOXES_FILE"
  exit 0
fi

# Check if session exists in mailboxes.json
SESSION_EXISTS=$(jq --arg sid "$SESSION_ID" 'has($sid)' "$MAILBOXES_FILE")

if [ "$SESSION_EXISTS" != "true" ]; then
  exit 0
fi

# Stay in project root - Path module from Effect Platform uses cwd automatically
# DO NOT cd to HOOKS_DIR as it breaks relative path resolution

# Export session_id as environment variable for TypeScript to read
export SESSION_ID="$SESSION_ID"

# Run the TypeScript implementation with Bun directly (NOT in subshell)
# This allows the hook to properly block and wait for messages
# TypeScript will read SESSION_ID from environment using Config module
bun run "${HOOKS_DIR}/stop-await-mailbox.ts" 2>&1
EXIT_CODE=$?

exit $EXIT_CODE

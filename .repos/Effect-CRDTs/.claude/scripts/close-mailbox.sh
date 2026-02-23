#!/usr/bin/env bash
#
# Close mailbox(es) by deleting mailbox files
# Usage: close-mailbox.sh [all|agent-name]
#   all: delete all mailboxes
#   agent-name: delete specific mailbox

set -euo pipefail

MAILBOXES_DIR=".claude/coordination/mailboxes"
ARG="${1:-all}"

# Ensure mailboxes directory exists
mkdir -p "$MAILBOXES_DIR"

if [ "$ARG" = "all" ]; then
  # Delete all mailbox files
  COUNT=$(find "$MAILBOXES_DIR" -name "*.json" -type f | wc -l | tr -d ' ')

  if [ "$COUNT" -eq 0 ]; then
    echo "No mailboxes to close"
    exit 0
  fi

  rm -f "$MAILBOXES_DIR"/*.json
  echo "Closed $COUNT mailbox(es)"
else
  # Delete specific mailbox
  MAILBOX_FILE="$MAILBOXES_DIR/${ARG}.json"

  if [ ! -f "$MAILBOX_FILE" ]; then
    echo "Mailbox not found: $ARG"
    exit 1
  fi

  rm -f "$MAILBOX_FILE"
  echo "Closed mailbox: $ARG"
fi

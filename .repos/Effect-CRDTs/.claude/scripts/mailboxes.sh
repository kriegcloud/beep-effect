#!/usr/bin/env bash

MAILBOX_DIR=".claude/coordination/mailboxes"

if [ ! -d "$MAILBOX_DIR" ]; then
  echo "No mailboxes found."
  exit 0
fi

# Count mailbox files with non-empty content
MAILBOX_FILES=("$MAILBOX_DIR"/*.json)
if [ ! -e "${MAILBOX_FILES[0]}" ]; then
  echo "No pending mailbox requests."
  exit 0
fi

echo "=== Agent Mailboxes ==="
echo ""

TOTAL=0
for file in "$MAILBOX_DIR"/*.json; do
  [ -f "$file" ] || continue

  AGENT_NAME=$(basename "$file" .json)
  COUNT=$(jq 'length' "$file")

  if [ "$COUNT" -gt 0 ]; then
    TOTAL=$((TOTAL + 1))
    echo "Agent: $AGENT_NAME"
    echo "  Pending requests: $COUNT"
    jq -r '.[] | "    - From: \(.from)\n      Message: \"\(.message)\"\n      Time: \(.timestamp)"' "$file"
    echo ""
  fi
done

if [ "$TOTAL" -eq 0 ]; then
  echo "No pending mailbox requests."
else
  echo "Total agents with pending messages: $TOTAL"
fi

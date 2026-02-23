#!/usr/bin/env bash

###############################################################################
# Await Mailbox - Block and wait for incoming messages
#
# Usage: await-mailbox.sh <agent-name>
#
# Registers the agent with the given name and blocks until a message arrives.
###############################################################################

set -euo pipefail

# Check for agent name parameter
if [ $# -lt 1 ]; then
  echo "❌ Error: Agent name required"
  echo "Usage: /await-mailbox \"Agent-Name\""
  exit 1
fi

AGENT_NAME="$1"
MAILBOX_DIR=".claude/coordination/mailboxes"
MAILBOX_FILE="$MAILBOX_DIR/$AGENT_NAME.json"

# Initialize mailbox directory if it doesn't exist
mkdir -p "$MAILBOX_DIR"

# Initialize agent's mailbox if it doesn't exist
if [ ! -f "$MAILBOX_FILE" ]; then
  echo "[]" > "$MAILBOX_FILE"
fi

echo "✅ Registered as agent: $AGENT_NAME"
echo "🔔 Waiting for messages..."
echo ""

# Export for TypeScript to read via Config.string("AGENT_NAME")
export AGENT_NAME

# Run the TypeScript implementation - blocks until message received
exec bun run .claude/hooks/stop-await-mailbox.ts

#!/bin/bash
#
# SessionStart Hook - Agent Initialization Wrapper
#
# This bash script wraps the Effect TypeScript implementation
# and is called by Claude when a new session starts.
#

set -e  # Exit on error

# Capture input and change to hooks directory
INPUT=$(cat)
cd "$CLAUDE_PROJECT_DIR/.claude/hooks/agent-init"

# Execute the TypeScript implementation using Bun, passing the captured input
OUTPUT=$(echo "$INPUT" | bun run index.ts 2>&1)
EXIT_CODE=$?
echo "$OUTPUT"
exit $EXIT_CODE

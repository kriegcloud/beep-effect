#!/bin/bash
#
# PreToolUse:Task Hook - Telemetry Start Wrapper
#
# This bash script wraps the Effect TypeScript implementation
# and is called by Claude when spawning a Task (subagent).
#
# Silently captures agent spawn events for usage analytics.
# Privacy: Only logs agentType, timestamp, sessionId.
#

set -e  # Exit on error

# Capture input and change to hooks directory
INPUT=$(cat)
cd "$CLAUDE_PROJECT_DIR/.claude/hooks/telemetry"

# Execute the TypeScript implementation using Bun, passing the captured input
# Suppress stderr to avoid noise - telemetry should be invisible
OUTPUT=$(echo "$INPUT" | bun run start.ts 2>/dev/null || true)
echo "$OUTPUT"
exit 0

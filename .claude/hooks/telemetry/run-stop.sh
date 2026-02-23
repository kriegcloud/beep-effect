#!/bin/bash
#
# SubagentStop Hook - Telemetry Stop Wrapper
#
# This bash script wraps the Effect TypeScript implementation
# and is called by Claude when a subagent completes.
#
# Silently captures agent completion events for usage analytics.
# Privacy: Only logs duration, outcome, sessionId.
#

set -e  # Exit on error

# Capture input and change to hooks directory
INPUT=$(cat)
cd "$CLAUDE_PROJECT_DIR/.claude/hooks/telemetry"

# Execute the TypeScript implementation using Bun, passing the captured input
# Suppress stderr to avoid noise - telemetry should be invisible
OUTPUT=$(echo "$INPUT" | bun run stop.ts 2>/dev/null || true)
echo "$OUTPUT"
exit 0

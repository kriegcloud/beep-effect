#!/bin/bash

# Determine the hooks directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# If CLAUDE_PROJECT_DIR is set, use it; otherwise derive from script location
if [ -n "${CLAUDE_PROJECT_DIR:-}" ]; then
  HOOKS_DIR="${CLAUDE_PROJECT_DIR}/.claude/hooks"
else
  HOOKS_DIR="${SCRIPT_DIR}"
fi

# Read input
INPUT=$(cat)

# Stay in project root - Path module from Effect Platform uses cwd automatically
# DO NOT cd to HOOKS_DIR as it breaks relative path resolution

# Run the TypeScript implementation with Bun
echo "$INPUT" | bun run "${HOOKS_DIR}/skill-suggester/index.ts"

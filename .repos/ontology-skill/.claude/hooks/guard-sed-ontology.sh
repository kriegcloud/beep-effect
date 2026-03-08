#!/usr/bin/env bash
# Claude Code PreToolUse hook: block sed/awk/perl edits to ontology files.
# This enforces Safety Rule #1: never hand-edit .owl or .ttl files.

set -euo pipefail

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

if [[ -z "$COMMAND" ]]; then
  exit 0
fi

# Check if command uses text manipulation tools targeting ontology files
if echo "$COMMAND" | grep -qE '(sed|awk|perl\s+-[pe])' && \
   echo "$COMMAND" | grep -qE '\.(ttl|owl|rdf|ofn|owx)'; then
  jq -n '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: "Safety Rule #1: Never hand-edit ontology files (.ttl, .owl). Use ROBOT, oaklib (runoak apply), or Python libraries instead. See skills/_shared/tool-decision-tree.md for the right tool."
    }
  }'
  exit 0
fi

exit 0

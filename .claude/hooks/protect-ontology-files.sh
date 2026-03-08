#!/usr/bin/env bash
# Claude Code PreToolUse hook: warn when directly editing ontology files.
# Fires on Edit and Write tool calls targeting .ttl/.owl/.rdf files.
# Returns a warning (not a block) so bootstrapping new ontologies still works.

set -euo pipefail

INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Only check Edit and Write tools
if [[ -z "$FILE_PATH" ]]; then
  exit 0
fi

# Check if the file is an ontology serialization format
if [[ "$FILE_PATH" =~ \.(ttl|owl|rdf|xml)$ ]]; then
  # If it's under ontologies/, warn about using programmatic tools
  if [[ "$FILE_PATH" =~ ontologies/ ]]; then
    jq -n '{
      hookSpecificOutput: {
        additionalContext: "REMINDER: Ontology files should be modified via ROBOT, oaklib (runoak), or Python libraries — not direct file edits. If you are bootstrapping a new ontology header, this is acceptable. Otherwise, use the programmatic tools from the tool-decision-tree."
      }
    }'
    exit 0
  fi
fi

exit 0

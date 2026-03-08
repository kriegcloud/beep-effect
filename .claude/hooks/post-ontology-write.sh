#!/usr/bin/env bash
# Claude Code PostToolUse hook: validate Turtle syntax after writes.
# If Claude writes a .ttl file, immediately check it parses correctly.

set -euo pipefail

INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

if [[ -z "$FILE_PATH" ]]; then
  exit 0
fi

# Only validate .ttl files
if [[ "$FILE_PATH" =~ \.ttl$ ]] && [[ -f "$FILE_PATH" ]]; then
  # Quick rdflib parse check
  RESULT=$(uv run python -c "
from rdflib import Graph
try:
    Graph().parse('$FILE_PATH', format='turtle')
    print('OK')
except Exception as e:
    print(f'FAIL: {e}')
" 2>&1)

  if [[ "$RESULT" == FAIL* ]]; then
    jq -n --arg reason "Turtle syntax error in $FILE_PATH: $RESULT. Please fix the syntax." '{
      decision: "block",
      reason: $reason
    }'
    exit 0
  fi
fi

exit 0

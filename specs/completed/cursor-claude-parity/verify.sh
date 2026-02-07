#!/usr/bin/env bash
# cursor-claude-parity smoke test
# Run from repo root: bash specs/cursor-claude-parity/verify.sh
# Or from this directory: bash verify.sh (script will chdir to repo root)

set -e

SCRIPT_DIR="${BASH_SOURCE[0]%/*}"
# Resolve to repo root (parent of specs/)
ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
if [[ ! -f "$ROOT/package.json" ]]; then
  echo "Could not find repo root (package.json). Run from repo root: bash specs/cursor-claude-parity/verify.sh"
  exit 1
fi
cd "$ROOT"

echo "=== 1. Rules sync (S5) ==="
bun run repo-cli sync-cursor-rules

echo ""
echo "=== 2. .cursor structure ==="
RULES_COUNT=$(find .cursor/rules -name "*.mdc" 2>/dev/null | wc -l)
if [[ "$RULES_COUNT" -lt 5 ]]; then
  echo "FAIL: expected at least 5 .mdc rules in .cursor/rules, got $RULES_COUNT"
  exit 1
fi
echo "OK: .cursor/rules has $RULES_COUNT .mdc files"

if [[ ! -f .cursor/README.md ]]; then
  echo "FAIL: .cursor/README.md missing"
  exit 1
fi
echo "OK: .cursor/README.md present"

echo ""
echo "=== 3. Edit→verify workflow (S2) ==="
bun run check --filter=@beep/testkit
echo "OK: filtered check passed"

echo ""
echo "=== cursor-claude-parity smoke test passed ==="

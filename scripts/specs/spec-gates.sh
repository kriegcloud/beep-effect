#!/usr/bin/env bash
set -euo pipefail

mode="${1:-}"
spec_dir="${2:-specs/pending/todox-wealth-mgmt-knowledge-mvp}"

usage() {
  cat <<'USAGE'
Usage:
  scripts/specs/spec-gates.sh check [spec_dir]

Examples:
  scripts/specs/spec-gates.sh check specs/pending/todox-wealth-mgmt-knowledge-mvp
USAGE
}

fail() {
  echo "FAIL: $1" >&2
  exit 1
}

require_rg() {
  if ! command -v rg >/dev/null 2>&1; then
    fail "ripgrep (rg) is required for gate verification"
  fi
}

case "$mode" in
  check)
    ;;
  ""|-h|--help|help)
    usage
    exit 0
    ;;
  *)
    usage
    exit 2
    ;;
esac

require_rg

pr_breakdown="${spec_dir}/outputs/P1_PR_BREAKDOWN.md"
if [[ ! -f "$pr_breakdown" ]]; then
  fail "missing PR breakdown file: ${pr_breakdown}"
fi

# Gate invariants: keep these checks grep-friendly and shell-safe.
checks=(
  'TodoX calls only `apps/server` for Gmail/OAuth actions.'
  'Evidence.List returns `documentVersionId` for every evidence row.'
  'Relation evidence never requires `relation.extractionId -> extraction.documentId`'
  '`/knowledge` UI is blocked on persisted evidence-backed meeting prep (no transient-only bullets).'
  '## PR2A:'
  '## PR2B:'
  '## PR2C:'
  '## PR3:'
  '## PR5:'
  '## PR4:'
)

for needle in "${checks[@]}"; do
  if ! rg -q --fixed-strings "$needle" "$pr_breakdown"; then
    fail "required gate text missing from ${pr_breakdown}: ${needle}"
  fi
done

if ! rg -q --fixed-strings -- '- [PASS/FAIL]' "$pr_breakdown"; then
  fail "expected atomic gate style '- [PASS/FAIL] ...' in ${pr_breakdown}"
fi

echo "PASS: spec gates verified for ${spec_dir}"

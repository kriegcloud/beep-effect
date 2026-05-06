#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"

usage() {
  cat <<'USAGE'
Usage:
  bun run codex:quality-review-fix-loop -- "<initiative summary>"
  bash scripts/codex-quality-review-fix-loop.sh "<initiative summary>"

Runs Codex non-interactively with the repo-local $quality-review-fix-loop skill.

The initiative summary is optional. When omitted, Codex is instructed to infer
the closure target from the current branch, git status, and changed surface.

The script does not force sandbox, approval, push, or PR behavior. Your Codex
configuration and the skill's own commit/publish policy remain authoritative.
USAGE
}

case "${1:-}" in
  -h | --help)
    usage
    exit 0
    ;;
esac

INITIATIVE_SUMMARY="${*:-Infer the initiative being closed from the current branch, git status, and changed surface.}"

cd "$ROOT_DIR"

codex exec --cd "$ROOT_DIR" - <<PROMPT
Use \$quality-review-fix-loop.

Initiative summary:
${INITIATIVE_SUMMARY}

Start by inspecting the current git state and changed surface. Follow the
repo-local skill exactly. Do not push, open a PR, reply to GitHub review
threads, or publish anything unless the user explicitly requested that in the
initiative summary.
PROMPT

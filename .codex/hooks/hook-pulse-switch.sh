#!/usr/bin/env bash
# Codex delegates this shared hook to its canonical implementation.
set -euo pipefail
hook_root=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../../.claude/hooks" && pwd -P)
exec bash "$hook_root/hook-pulse-switch.sh" "$@"

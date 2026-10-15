#!/usr/bin/env bash
# SessionStart: print the live session-ledger rows for this repository so a
# resuming session sees where its siblings stopped, then the hot Palantiri
# parcels `beep session open` last staged. Reads the JSON Lines file
# `beep session note` appends to and the staged `hot.json`; never runs the
# CLI, never blocks, never writes.
set -u
command -v jq >/dev/null 2>&1 || exit 0
# The hot parcels file `beep session open` stages (owner-only) under the
# Palantiri state directory: account headroom, lane reds and host pressure,
# one line each with its freshness, as of the time it was written.
print_hot_parcels() {
  hot="${BEEP_PALANTIRI_STATE_ROOT:-${XDG_STATE_HOME:-$HOME/.local/state}/beep/palantiri}/hot.json"
  [ -s "$hot" ] || return 0
  jq -r '
    select(.schemaVersion == "palantiri-hot/v1")
    | "[palantiri] hot parcels as of \(.writtenAt) (bun run beep session open to refresh):",
      (.lines[] | "- \(.parcel): \(.text)")
  ' "$hot" 2>/dev/null || true
}
trap print_hot_parcels EXIT
repo_root="${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel 2>/dev/null || pwd)}"
origin="$(git -C "$repo_root" config --get remote.origin.url 2>/dev/null || true)"
case "$origin" in
  *github.com[:/]*) ;;
  *) exit 0 ;;
esac
slug="$(printf '%s' "$origin" | sed -E 's#^.*github\.com[:/]##; s#\.git$##; s#/+$##' | tr '[:upper:]' '[:lower:]')"
owner="${slug%%/*}"
name="${slug#*/}"
root="${BEEP_SESSION_STATE_ROOT:-${XDG_STATE_HOME:-$HOME/.local/state}/beep/sessions}"
file="$root/github.com__${owner}__${name}.jsonl"
[ -s "$file" ] || exit 0
# One jq pass over the whole file: each line is parsed on its own with
# `fromjson?`, so a torn or corrupt line drops only itself, and a long
# uncompacted ledger still costs one process.
jq -r -R -s '
  [split("\n")[] | select(length > 0) | (fromjson? // empty) | select(type == "object")]
  | group_by(.checkout)
  | map(max_by(.recordedAt))
  | map(select(.state != "done"))
  | sort_by(.recordedAt) | reverse | .[:12]
  | if length == 0 then empty else
      "[session-ledger] \(length) live session(s) for this repository (bun run beep session open):",
      (.[] | "- \(.state) \(.lane) (\(.branch)\(if .pr then ", PR #\(.pr)" else "" end)) \(.recordedAt): \(.next)")
    end
' "$file" 2>/dev/null || true
exit 0

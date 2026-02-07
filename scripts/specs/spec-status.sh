#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SPECS_DIR="$ROOT_DIR/specs"

print_usage() {
  cat <<USAGE
Usage:
  scripts/specs/spec-status.sh check
  scripts/specs/spec-status.sh move <spec-name> <pending|completed|archived>
USAGE
}

is_protected_name() {
  case "$1" in
    _guide|agents|pending|completed|archived) return 0 ;;
    *) return 1 ;;
  esac
}

status_marker_needs_move() {
  local readme="$1"

  # Only scan top section to avoid matching unrelated status tables.
  local head_content
  head_content="$(sed -n '1,80p' "$readme")"

  # ARCHIVED marker always requires leaving pending.
  if printf '%s\n' "$head_content" | rg -qi '^\*\*status\*\*:\s*archived|^\*\*status:\s*archived|^##\s*status:\s*archived'; then
    return 0
  fi

  # COMPLETE marker requires leaving pending, except phase-complete variants.
  if printf '%s\n' "$head_content" | rg -qi '^\*\*status\*\*:.*\bcomplete(d)?\b|^\*\*status:.*\bcomplete(d)?\b|^##\s*status:\s*\bcomplete(d)?\b'; then
    if printf '%s\n' "$head_content" | rg -qi 'phase\s*[-0-9]*\s*complete'; then
      return 1
    fi
    return 0
  fi

  return 1
}

check_pending() {
  local pending_dir="$SPECS_DIR/pending"
  local failures=0

  if [ ! -d "$pending_dir" ]; then
    echo "Missing directory: $pending_dir"
    return 1
  fi

  for spec_dir in "$pending_dir"/*; do
    [ -d "$spec_dir" ] || continue
    local spec_name
    spec_name="$(basename "$spec_dir")"
    local readme="$spec_dir/README.md"

    [ -f "$readme" ] || continue

    if status_marker_needs_move "$readme"; then
      failures=$((failures + 1))
      echo "Spec appears completed/archived but is still pending: $spec_name"
      echo "  Move with: bun run spec:move -- $spec_name completed"
    fi
  done

  if [ "$failures" -gt 0 ]; then
    echo
    echo "Spec status check failed: $failures spec(s) should be moved out of specs/pending/."
    return 1
  fi

  echo "Spec status check passed."
}

move_spec() {
  local spec_name="$1"
  local target_status="$2"

  if is_protected_name "$spec_name"; then
    echo "Cannot move protected path: $spec_name"
    return 1
  fi

  case "$target_status" in
    pending|completed|archived) ;;
    *)
      echo "Invalid status: $target_status"
      print_usage
      return 1
      ;;
  esac

  local source=""
  local candidate
  for candidate in \
    "$SPECS_DIR/pending/$spec_name" \
    "$SPECS_DIR/completed/$spec_name" \
    "$SPECS_DIR/archived/$spec_name" \
    "$SPECS_DIR/$spec_name"; do
    if [ -d "$candidate" ]; then
      source="$candidate"
      break
    fi
  done

  if [ -z "$source" ]; then
    echo "Spec not found: $spec_name"
    return 1
  fi

  local destination="$SPECS_DIR/$target_status/$spec_name"
  mkdir -p "$SPECS_DIR/$target_status"

  if [ "$source" = "$destination" ]; then
    echo "No-op: $spec_name is already in $target_status."
    return 0
  fi

  if [ -e "$destination" ]; then
    echo "Destination already exists: $destination"
    return 1
  fi

  mv "$source" "$destination"
  echo "Moved $spec_name -> specs/$target_status/$spec_name"
}

main() {
  local cmd="${1:-}"
  case "$cmd" in
    check)
      check_pending
      ;;
    move)
      if [ "$#" -ne 3 ]; then
        print_usage
        return 1
      fi
      move_spec "$2" "$3"
      ;;
    *)
      print_usage
      return 1
      ;;
  esac
}

main "$@"

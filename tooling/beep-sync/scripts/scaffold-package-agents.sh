#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../../.." >/dev/null 2>&1 && pwd)"
cd "$ROOT_DIR"

WRITE=false
if [[ "${1:-}" == "--write" ]]; then
  WRITE=true
fi

candidates=(apps/* packages/* packages/*/* tooling/* scratchpad)
packages=()

for candidate in "${candidates[@]}"; do
  if [[ -d "$candidate" && -f "$candidate/package.json" ]]; then
    packages+=("$candidate")
  fi
done

IFS=$'\n' read -r -d '' -a sorted_packages < <(printf '%s\n' "${packages[@]}" | sort -u && printf '\0')

missing=()
for pkg in "${sorted_packages[@]}"; do
  if [[ ! -f "$pkg/AGENTS.md" ]]; then
    missing+=("$pkg")
  fi
done

if [[ ${#missing[@]} -eq 0 ]]; then
  printf '%s\n' "[beep-sync scaffold] all workspace packages already have AGENTS.md"
  exit 0
fi

printf '%s\n' "[beep-sync scaffold] missing AGENTS.md files: ${#missing[@]}"

if [[ "$WRITE" != true ]]; then
  printf '%s\n' "[beep-sync scaffold] dry-run mode (pass --write to create files)"
  for pkg in "${missing[@]}"; do
    printf '  - would create %s/AGENTS.md\n' "$pkg"
  done
  exit 0
fi

for pkg in "${missing[@]}"; do
  cat > "$pkg/AGENTS.md" <<FILE
# AGENTS Instructions

- Follow repository root AGENTS instructions first.
- Keep package changes scoped and tested.
- Treat this file as generated baseline until beep-sync package overlays are implemented.
FILE
  printf '  - created %s/AGENTS.md\n' "$pkg"
done

printf '%s\n' "[beep-sync scaffold] scaffold complete"

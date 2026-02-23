#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../../.." >/dev/null 2>&1 && pwd)"
cd "$ROOT_DIR"

candidates=(apps/* packages/* packages/*/* tooling/* scratchpad)
packages=()

for candidate in "${candidates[@]}"; do
  if [[ -d "$candidate" && -f "$candidate/package.json" ]]; then
    packages+=("$candidate")
  fi
done

if [[ ${#packages[@]} -eq 0 ]]; then
  printf '%s\n' "[beep-sync scaffold] no workspace packages detected"
  exit 0
fi

IFS=$'\n' read -r -d '' -a sorted_packages < <(printf '%s\n' "${packages[@]}" | sort -u && printf '\0')

missing=()
for pkg in "${sorted_packages[@]}"; do
  if [[ ! -f "$pkg/AGENTS.md" ]]; then
    missing+=("$pkg")
  fi
done

printf '%s\n' "[beep-sync scaffold] workspace packages: ${#sorted_packages[@]}"
printf '%s\n' "[beep-sync scaffold] packages with AGENTS.md: $(( ${#sorted_packages[@]} - ${#missing[@]} ))"
printf '%s\n' "[beep-sync scaffold] packages missing AGENTS.md: ${#missing[@]}"

if [[ ${#missing[@]} -gt 0 ]]; then
  printf '%s\n' "[beep-sync scaffold] missing list:"
  for pkg in "${missing[@]}"; do
    printf '  - %s\n' "$pkg"
  done
fi

if [[ "${1:-}" == "--strict" && ${#missing[@]} -gt 0 ]]; then
  exit 2
fi

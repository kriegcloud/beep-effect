#!/usr/bin/env bash

set -euo pipefail

mapfile -t ignored_ids < <(
  grep -E '^id = "' osv-scanner.toml | sed -E 's/^id = "(.*)"/\1/'
)

args=(audit --audit-level=high)

for id in "${ignored_ids[@]}"; do
  args+=("--ignore=$id")
done

exec bun "${args[@]}"

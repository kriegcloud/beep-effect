#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." >/dev/null 2>&1 && pwd)"

required_paths=(
  "$ROOT_DIR/fixtures/poc-01/valid/config.yaml"
  "$ROOT_DIR/fixtures/poc-01/invalid/config.yaml"
  "$ROOT_DIR/fixtures/poc-02/mcp-codex.yaml"
  "$ROOT_DIR/fixtures/poc-02/mcp-cursor.yaml"
  "$ROOT_DIR/fixtures/poc-02/mcp-windsurf.yaml"
  "$ROOT_DIR/fixtures/poc-03/jetbrains-bundle.yaml"
  "$ROOT_DIR/fixtures/poc-03/jetbrains-native.yaml"
  "$ROOT_DIR/fixtures/poc-04/managed.yaml"
  "$ROOT_DIR/fixtures/poc-05/secrets-required.yaml"
  "$ROOT_DIR/fixtures/poc-05/secrets-required-sa.yaml"
  "$ROOT_DIR/fixtures/poc-05/secrets-missing.yaml"
  "$ROOT_DIR/fixtures/poc-05/secrets-optional.yaml"
  "$ROOT_DIR/fixtures/poc-06/config.yaml"
)

for path in "${required_paths[@]}"; do
  if [[ ! -e "$path" ]]; then
    printf '%s\n' "[beep-sync] missing fixture path: $path" >&2
    exit 2
  fi
done

printf '%s\n' "[beep-sync] test:fixtures passed"

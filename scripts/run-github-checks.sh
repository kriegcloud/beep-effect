#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

MODE="${1:-pre-push}"
if [ "$#" -gt 0 ]; then
  shift
fi

log() {
  printf '[github-checks] %s\n' "$1"
}

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    printf '[github-checks] missing required command: %s\n' "$1" >&2
    exit 1
  fi
}

run_with_local_env() {
  if command -v op >/dev/null 2>&1 && [ -f .env ]; then
    if op whoami >/dev/null 2>&1; then
      op run --env-file=.env -- "$@"
      return
    fi

    if [ "${RUN_WITH_LOCAL_ENV_WARNED:-0}" = "0" ]; then
      log "local env: op is installed but not signed in; running without injected env"
      RUN_WITH_LOCAL_ENV_WARNED=1
    fi
  fi

  "$@"
}

ensure_origin_main() {
  log "refreshing origin/main"
  if [ "$(git rev-parse --is-shallow-repository)" = "true" ]; then
    log "repository is shallow; fetching full history"
    git fetch origin --quiet --unshallow
  fi
  git fetch origin main:refs/remotes/origin/main --quiet
}

run_changeset_status() {
  if [ "${GITHUB_EVENT_NAME:-}" = "push" ] && [ "${GITHUB_REF_NAME:-}" = "main" ]; then
    log "quality: skipped changeset status on main push"
    return
  fi

  if [ "$(git branch --show-current)" = "main" ]; then
    log "quality: skipped changeset status on main"
    return
  fi

  log "quality: changeset status"
  bunx changeset status --since=origin/main
}

run_quality() {
  require_command typos

  log "quality: build"
  run_with_local_env bun run build:ci

  log "quality: type check"
  bun run check:all

  log "quality: lint"
  bun run lint

  log "quality: docgen"
  bun run docgen

  log "quality: test"
  bun run test

  log "quality: syncpack"
  bunx syncpack lint

  log "quality: audit"
  bun run audit:high:ci

  run_changeset_status
}

run_secret_scan() {
  require_command gitleaks

  local merge_base
  merge_base="$(git merge-base origin/main HEAD)"

  log "secrets: gitleaks"
  gitleaks git \
    --no-banner \
    --redact \
    --config .gitleaks.toml \
    --gitleaks-ignore-path .gitleaksignore \
    --log-opts "${merge_base}..HEAD" \
    .
}

run_security_scan() {
  require_command docker

  log "security: osv scan"
  docker run --rm \
    -v "$ROOT_DIR:/github/workspace" \
    -w /github/workspace \
    ghcr.io/google/osv-scanner-action:v2.3.3 \
    --lockfile=bun.lock \
    --config=osv-scanner.toml
}

run_sast_scan() {
  require_command docker

  local -a tracked_files=()
  local -a semgrep_files=()
  mapfile -t tracked_files < <(
    git diff --name-only --diff-filter=ACMR origin/main...HEAD -- '*.ts' '*.tsx' '*.js' '*.jsx' '*.mjs' '*.cjs'
  )

  for file in "${tracked_files[@]}"; do
    case "$file" in
      .repos/*)
        continue
        ;;
    esac

    if [ -f "$file" ] && [ ! -L "$file" ]; then
      semgrep_files+=("$file")
    fi
  done

  if [ "${#semgrep_files[@]}" -eq 0 ]; then
    log "sast: skipped, no tracked JavaScript or TypeScript files"
    return
  fi

  log "sast: semgrep"
  docker run --rm \
    -e SEMGREP_SEND_METRICS=off \
    -v "$ROOT_DIR:/src" \
    -w /src \
    semgrep/semgrep \
    semgrep scan \
    --config p/typescript \
    --config p/javascript \
    --config p/security-audit \
    --config p/secrets \
    --timeout 20 \
    "${semgrep_files[@]}"
}

run_nix_checks() {
  require_command nix

  log "nix: flake check"
  nix --option warn-dirty false flake check --all-systems

  log "nix: dev shell"
  nix --option warn-dirty false develop --command echo "Dev shell OK"
}

run_pre_push() {
  ensure_origin_main
  run_quality
  run_secret_scan
  run_security_scan
  run_sast_scan
  run_nix_checks
}

case "$MODE" in
  quality)
    ensure_origin_main
    run_quality
    ;;
  secrets)
    ensure_origin_main
    run_secret_scan
    ;;
  security)
    run_security_scan
    ;;
  sast)
    ensure_origin_main
    run_sast_scan
    ;;
  nix)
    run_nix_checks
    ;;
  pre-push)
    run_pre_push
    ;;
  *)
    printf 'usage: %s [quality|secrets|security|sast|nix|pre-push]\n' "$0" >&2
    exit 1
    ;;
esac

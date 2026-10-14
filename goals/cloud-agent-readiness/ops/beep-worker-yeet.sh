#!/usr/bin/env bash
# Submit and observe worker Yeet jobs from a user-owned, resource-bounded scope.
set -euo pipefail
unset SSH_AUTH_SOCK
export PATH="$HOME/.local/bin:$HOME/.bun/bin:$PATH"
export NVM_DIR="$HOME/.nvm"
if [[ -s "$NVM_DIR/nvm.sh" ]]; then
  source "$NVM_DIR/nvm.sh" --no-use
  nvm use default >/dev/null
fi
runtime_uid="$(id -u)"
export XDG_RUNTIME_DIR="${XDG_RUNTIME_DIR:-/run/user/$runtime_uid}"
export DBUS_SESSION_BUS_ADDRESS="${DBUS_SESSION_BUS_ADDRESS:-unix:path=$XDG_RUNTIME_DIR/bus}"
if ! systemctl --user cat agent-runs.slice >/dev/null 2>&1; then
  printf '%s\n' 'worker Yeet: user manager or agent-runs.slice unavailable.' >&2
  exit 69
fi
root="$(git rev-parse --show-toplevel)"
entrypoint="$root/packages/tooling/tool/cli/src/bin.ts"
if [[ ! -f "$entrypoint" ]]; then
  printf '%s\n' 'worker Yeet: run from a beep-effect checkout with its CLI source.' >&2
  exit 78
fi
exec systemd-run --user --scope --quiet --collect \
  "--unit=beep-worker-yeet-$$" --slice=agent-runs.slice \
  env -u SSH_AUTH_SOCK bun run "$entrypoint" -- yeet "$@"

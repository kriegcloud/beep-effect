# Bounded remote jobs

## Before launch

Use the ordinary host wrapper. Confirm `hostname`, `id`, checkout ownership,
`git status --short --branch`, the remote URL (redact credential-bearing URLs),
and existing task/job records. Inspect process metadata without full arguments.
Check available memory/disk space and active jobs. Do not print credentials or
the full shell/user-manager environment.

For a host admitted to this shared slice, inspect it without changing it:

```sh
systemctl --user show agent-runs.slice \
  -p LoadState -p ActiveState -p MemoryHigh -p MemoryMax -p MemorySwapMax \
  -p CPUQuotaPerSecUSec -p TasksMax -p ControlGroup
systemctl --user list-units 'dev-agent-*' --all --no-pager
```

Require `LoadState=loaded` and the profile's expected limits. An inactive slice
may activate with its first job; a missing user bus/slice or conflicting limits
is a blocker. On tbk-worker also require the guest and its host guard to remain
healthy through the admitted observation route. Do not forward an admin agent
merely to perform that check from the development account.

## Launch

Prefer the checkout's existing durable job interface. For Beep quality work,
use `beep-worker-yeet` and the Yeet skill's detached-job workflow; keep its job
ID. Do not launch a second quality job while one is already running.

For an authorized Codex task, this is a template to adapt **inside the worker**.
Resolve the absolute checkout and executable paths first. Use a unique unit
name and a brief containing no secrets. The example per-job limits must fit
inside the host's already-admitted aggregate budget.

```sh
systemd-run --user --unit=dev-agent-TASK-ID --service-type=exec \
  --slice=agent-runs.slice --working-directory=/absolute/task/worktree \
  --property=RuntimeMaxSec=3600 --property=TimeoutStopSec=30 \
  --property=KillMode=control-group --property=UMask=0077 \
  --property=MemoryHigh=5G --property=MemoryMax=6G \
  --property=MemorySwapMax=0 --property=CPUQuota=200% --property=TasksMax=512 \
  --property='UnsetEnvironment=SSH_AUTH_SOCK SSH_AGENT_PID OP_SERVICE_ACCOUNT_TOKEN OP_CONNECT_TOKEN OP_CONNECT_HOST' \
  /absolute/path/to/codex exec --model gpt-6.1-sol \
  -c 'model_reasoning_effort="medium"' \
  'The authorized, bounded task; acceptance checks; no publishing unless requested.'
```

Do not change approval/sandbox settings to bypass a permission failure. A unit
starting successfully proves launch, not task completion. Check the child's
environment for forbidden variable **names only**; user managers can retain
older values even when the SSH shell has none. If any other `OP_*` credential
variable is present, stop the owned job and fix its launch environment before
continuing. Do not remove these inheritance controls to make a tool pass.
They prevent ambient credential variables and forwarded administrative sockets;
they do not block a job running as the worker from reading its credential store
or resolving any shared-vault item through `op`. The full-vault scope in D40
applies to these jobs. Per-task use restrictions are instructions, not enforced
secret isolation. A narrower technical grant requires a different vault scope
or execution identity; do not claim that the example unit supplies one.

## Observe and recover

```sh
systemctl --user show dev-agent-TASK-ID.service \
  -p ActiveState -p SubState -p Result -p ExecMainStatus \
  -p MemoryPeak -p CPUUsageNSec
journalctl --user -u dev-agent-TASK-ID.service --no-pager -n 60
```

Read only the relevant job's output and redact before publishing. Some agents
can emit sensitive content despite a safe prompt; never paste entire logs into
a public issue. Retain the exact job ID, checkout/HEAD, start/end, exit result,
acceptance-check results and resource failures in a private receipt. Publish
only sanitized conclusions in the repository.

If SSH drops, reconnect and inspect the same unit. If it reached a runtime or
memory limit, inspect partial edits and completed checks before retrying. Do
not increase the admitted ceiling automatically. A missing unit after reboot
does not prove success; inspect durable files and receipts.

Stop only your named unit with `systemctl --user stop`. After retaining its
receipt, use the repository's normal worktree/job cleanup. Do not use broad
process kills, remove another task's checkout, delete credentials or clear a
tbk protective-stop latch as job cleanup.

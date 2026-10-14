# Detached-job recovery repair — 2026-10-14

The prior live proof exposed a dead runner whose loaded failed unit kept its
record running after the finalizer was starved. Recovery now handles both an
absent unit and a decoded loaded terminal observation. It requires failed/failed
or inactive/dead state, zero main/control PIDs, no remaining cgroup tasks (or
no cgroup), a dead recorded identity and no conflicting invocation ID.

Recovery preserves observed systemd result, exit code/status and invocation.
An exit-zero unit without a recorded proof outcome remains terminated; it never
becomes a fabricated green verdict. Publication uses the existing locked,
idempotent finalization/inbox path. Active, stopping, ambiguous, malformed,
occupied and mismatched-invocation observations refuse recovery.

The worker launcher routes job/status/inbox/proof-report observations into a
separate control slice with a 1 GiB hard ceiling, 64 MiB swap ceiling, one CPU
and 128 tasks. Proof workload budgets are unchanged. This prevents observation
from sharing the pressure ceiling it is meant to inspect. The original finalizer
still runs in its proof unit; terminal recovery no longer depends on that
finalizer completing. It must never race an active finalizer.

101 proof-job tests pass, including 13 new recovery/guard regressions.
Package quick lint/type verification passes. A real-worker controlled manager
fixture will qualify failed-loaded recovery without running heavy gates or
creating a PR. This fixture deliberately times out a sleep workload and its
sleep finalizer; it tests recovery, not repository quality.

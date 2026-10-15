# Readiness PR closure follow-up

Date: 2026-10-15 (America/Chicago). Branch: `feat/linux-agent-readiness`.
PR: [#1750](https://github.com/beep-effect/beep-effect/pull/1750).

## Current-main integration

Adopted canonical main `44dbfa70ff` through a merge, preserving published
history. Resolved the managed-agent test's layer ordering using main's ordering.
Regenerated the observability catalog and its standard table through
`beep observability catalog --write`, rather than selecting stale generated
counts from either side. Frozen installation upgraded the local Effect runtime
to 4.0.4; pre-install test failures involving `randomUUIDv4` do not qualify the
installed source.

The old published head `aca20e45c2` had three failed heavy checks. Its drawing
JSON-policy violations and inline-schema compilation findings were inherited
from main; main's #1792 and #1798 repairs are now integrated. Coverage findings
were in BoxContentMigration and Tika, outside this readiness change. Fresh hosted
checks must determine their current status; no coverage floor is lowered and
old hosted results are not carried forward as new-head proof.

## Review fixes

- A missing cheap-gate concurrency setting still selects four jobs. Explicit
  values 1–4 select their requested width. Any present invalid value, including
  an empty string, warns on stderr and selects one job. The fresh environment
  provider preserves empty strings so the safe fallback cannot become four
  through generic config normalization. Pre-push remains serial.
- `ops/agent-runs-worker.slice` explicitly states its installation destination:
  `~/.config/systemd/user/agent-runs.slice`. Copy it under that unit name,
  reload the user manager, and verify that detached proofs use the installed
  slice. MemoryHigh, MemoryMax, swap, CPU and task limits are unchanged.

Tests exercise absent, all four valid, and malformed values (including `01`,
`serial` and an empty value), warning behavior and the independent serial
pre-push tier. The slice change is documentation only.

## Local validation

After the final source change, the focused five-file Vitest run passed all
393 tests (quality tasks, managed-agent runtime, CI governance, CI lane and
schema-first parity). `beep quality test-tsgo` exited zero while checking
373 test files. Biome reported no findings on the two edited TypeScript files,
and the regenerated observability catalog passed its independent check.
Expected TS2589 fixture output in quality-task tests is not a failing build.
These checks precede the normal publication gates and do not replace hosted CI.

## Worker preservation

Fresh canonical YubiKey SSH confirmed beep-worker at `aca20e45c2` with the same
seven tracked overlays plus untracked `.grok/config.toml`. A private verified
backup was written before synchronization:
`~/.cache/beep/readiness/pr1750/worker-before-20261015-closure/` on the worker.
The archive was reopened and all eight payload hashes checked. The worker's
separate main checkout remained at `b43a4098bbdc345f897c87f84f58953cb7fd4825`.

Publication, synchronization and hosted checks are separate verification steps.
No merge is authorized by this follow-up; other fleet hosts and remaining
provider/authentication gaps retain their existing qualification boundaries.

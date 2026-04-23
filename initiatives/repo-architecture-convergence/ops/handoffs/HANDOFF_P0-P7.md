# P0-P7 Cross-Phase Handoff

## Initiative Objective

Converge the live `beep-effect` repo onto `standards/ARCHITECTURE.md` and the
repo-law surfaces through landed repo changes plus proof. Narrative packet
completion is never enough.

## Shared Operating Rules

1. `standards/ARCHITECTURE.md`, `standards/architecture/*`,
   `standards/effect-laws-v1.md`, `standards/effect-first-development.md`,
   `SPEC.md`, and `PLAN.md` are binding in that order.
2. The authoritative ledger paths are
   `ops/compatibility-ledger.md` and
   `ops/architecture-amendment-register.md`.
3. Every phase owns an evidence pack, a review loop, manifest updates, and any
   extra durable artifacts assigned to that phase.
4. Graphiti bootstrap and writeback must be recorded for every phase when the
   environment exposes Graphiti, or explicitly skipped when unavailable.
5. Any required command failure, stale evidence, unowned consumer/importer, or
   ungoverned temporary exception blocks closure.
6. Later phases close only on landed repo changes plus proof. They do not
   author future-work packets in place of execution.
7. P7 is verification and closeout only. Any implementation defect found there
   reopens the owning earlier phase.

## Phase Order And Dependencies

1. `P0` - Baseline Census, Routing Canon, and Compliance Baseline
2. `P1` - Program Controls, Ledgers, and Gate Templates
3. `P2` - Enablement and Wiring Cutover
4. `P3` - Shared-Kernel and Non-Slice Extraction
5. `P4` - `repo-memory` Migration and Validation
6. `P5` - `editor` Migration and Validation
7. `P6` - Remaining Operational, App, and Agent Cutovers Plus Compatibility
   Deletion
8. `P7` - Final Architecture and Repo-Law Verification

## Shared Command Stack

- Graphiti bootstrap: `bun run graphiti:proxy:ensure`
- Config sync: `bun run config-sync:check`
- Type and compile checks: `bun run check`
- Lint and allowlist integrity: `bun run lint`
- Tests: `bun run test`
- JSDoc and docgen: `bun run docgen`
- Repo audit: `bun run audit:full`

## Shared Search-Audit Families

- legacy topology references
- consumer/importer counts before and after the batch
- hard-coded app and script entrypoints
- canonical subpath and export usage
- compatibility aliases and temporary shims
- touched package metadata for family and kind compliance

## Durable Artifact Ownership

- `P0`: `history/outputs/p0-consumer-importer-census.md`
- `P1`: `ops/compatibility-ledger.md`
- `P1`: `ops/architecture-amendment-register.md`
- `P7`: `history/outputs/p7-architecture-compliance-matrix.md`
- `P7`: `history/outputs/p7-repo-law-compliance-matrix.md`

## Blocker Rule

Use the blocker taxonomy ids in
[../prompt-assets/blocker-protocol.md](../prompt-assets/blocker-protocol.md).
If any blocking condition remains open, the phase stays out of `completed` and
the blocker must appear in the review loop, evidence pack, and manifest.

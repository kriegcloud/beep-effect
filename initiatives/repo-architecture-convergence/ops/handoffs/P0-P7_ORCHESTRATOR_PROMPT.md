# P0-P7 Combined Orchestrator Prompt

Follow the exact worker-read order and source-of-truth order from
[../../README.md](../../README.md), [../../SPEC.md](../../SPEC.md), and
[../manifest.json](../manifest.json). This prompt adds no new authority and
must not be loaded ahead of that contract.

## Startup

1. Satisfy the exact root worker-read contract first, then read the active
   phase's `inputs`, `requiredCommandIds`, `requiredSearchAuditIds`, and
   `blockerIds` from [../manifest.json](../manifest.json).
2. Read `../manifest.json` to identify the active phase, dependency graph,
   artifact bundle, gate stack, and blocker state.
3. Run `bun run graphiti:proxy:ensure` when Graphiti is available, or record a
   skipped reason.
4. Read the matching handoff in this directory and the phase inputs named in
   the manifest.
5. Preserve authoritative ledger paths and use the blocker taxonomy ids.

## Required Duties

- Land the repo changes owned by the phase.
- Update the phase evidence pack and every phase-owned durable artifact.
- Maintain the phase review loop under `history/reviews/`.
- Run the required command gates and record the active phase's
  `requiredSearchAuditIds` from the manifest. At the current manifest version,
  every phase record lists all seven catalog families.
- Record Graphiti bootstrap and writeback status.
- Update `ops/manifest.json` for artifact status, review-loop state, evidence,
  blockers, and `nextAction`.

## Completion Standard

The phase is complete only when landed repo changes are present, the artifact
bundle is current, commands and search audits are replayable, the review loop
clears the work, and the manifest records the same state.

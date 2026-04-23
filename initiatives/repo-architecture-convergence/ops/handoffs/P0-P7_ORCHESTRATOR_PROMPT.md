# P0-P7 Combined Orchestrator Prompt

Use [../prompts/agent-prompts.md](../prompts/agent-prompts.md) as the shared
instruction layer and load every asset in
[../prompt-assets/README.md](../prompt-assets/README.md) before editing.

## Startup

1. Read `../manifest.json` to identify the active phase, dependency graph,
   artifact bundle, gate stack, and blocker state.
2. Run `bun run graphiti:proxy:ensure` when Graphiti is available, or record a
   skipped reason.
3. Read the matching handoff in this directory.
4. Read the phase inputs named in the manifest and handoff.
5. Preserve authoritative ledger paths and use the blocker taxonomy ids.

## Required Duties

- Land the repo changes owned by the phase.
- Update the phase evidence pack and every phase-owned durable artifact.
- Maintain the phase review loop under `history/reviews/`.
- Run the required command gates and exact search audits.
- Record Graphiti bootstrap and writeback status.
- Update `ops/manifest.json` for artifact status, review-loop state, evidence,
  blockers, and `nextAction`.

## Completion Standard

The phase is complete only when landed repo changes are present, the artifact
bundle is current, commands and search audits are replayable, the review loop
clears the work, and the manifest records the same state.

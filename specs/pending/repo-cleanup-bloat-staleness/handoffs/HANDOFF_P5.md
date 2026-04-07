# Handoff P5 — Final Validation And Knowledge Closeout

## Goal

Prove the repo is clean, verified, and ready for a user-approved push without leaving stale repo knowledge behind.

## Required Inputs

- `../README.md`
- `../outputs/manifest.json`
- `../outputs/cleanup-checklist.md`
- all prior phase outputs
- `../prompts/FINAL_VALIDATOR_PROMPT.md`

## Required Output

- `../outputs/p5-final-closeout.md`

## Required Decisions

- final command set
- residual risk statement
- final historical-reference notes
- push readiness summary

## Required Command Set

- `bun run lint`
- `bun run check`
- `bun run test`
- `bun run check:full` if any prior phase changed root TS wiring
- `bun run trustgraph:sync-curated`

## Exit Gate

P5 closes only when final verification is explicit, `trustgraph:sync-curated` is recorded, and the repo is ready for review and optional push confirmation.

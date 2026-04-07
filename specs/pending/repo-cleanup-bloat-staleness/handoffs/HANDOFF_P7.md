# Handoff P7 — Reuse Tool Implementation And Tooling-Stack Pilot

## Goal

Implement the `beep reuse` tooling defined in P6, prove it against the tooling pilot scope, and leave future agent-loop execution as a follow-on rather than silently widening into automatic code edits.

## Required Inputs

- `../README.md`
- `../outputs/manifest.json`
- `../outputs/cleanup-checklist.md`
- `../outputs/p6-reuse-discovery-design-and-contract.md`
- the repo code under `tooling/cli` and `tooling/repo-utils`

## Required Output

- `../outputs/p7-reuse-tool-implementation-and-pilot.md`

## Required Command Set

- `bunx turbo run check --filter=@beep/repo-utils --filter=@beep/repo-cli`
- `bunx turbo run test --filter=@beep/repo-utils --filter=@beep/repo-cli`
- `bun run beep reuse partitions --scope tooling/cli --json`
- `bun run beep reuse inventory --scope tooling/cli --json`
- `bun run beep reuse find --file tooling/cli/src/commands/Docgen/index.ts --query json --json`
- `bun run beep reuse packet --candidate-id <candidate-id> --scope tooling/cli --json`
- `bun run beep reuse codex-smoke --json`

## Required Decisions

- the minimum viable pilot scope
- whether the command emits enough structured data for future subagent execution
- any residual risks around performance, determinism, or future RAG hooks

## Exit Gate

P7 closes only when the reuse commands exist, the tooling pilot is evidenced, targeted checks and tests are green, and the output clearly states that full autonomous execution remains out of scope for this version.

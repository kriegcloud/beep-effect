# Orchestrator Prompt: Phase 4 (create-slice Reuse Extraction)

You are implementing **Phase 4** of `specs/pending/repo-tooling`.

## Objective

Make `create-package` core modules reusable for a new `.repos/beep-effect` `create-slice` implementation, with a zero-manual package-creation baseline.

## Read First

1. `specs/pending/repo-tooling/README.md`
2. `specs/pending/repo-tooling/outputs/create-slice-reuse-gap-analysis.md`
3. `specs/pending/repo-tooling/handoffs/HANDOFF_P4.md`

## Required Deliverables

1. Extract service boundaries for template rendering and generation planning.
2. Refactor handler to orchestrate services instead of embedding all logic.
3. Add config updater orchestration entry points suitable for multi-package slice flows.
4. Define and scaffold AST integration contract expected by create-slice.
5. Add tests for service contracts, idempotency, and `packages/common` generation path.
6. Run full verification gate:
   - `bun run build`
   - `bun run check`
   - `bun run test`
   - `bun run lint`

## Done Criteria

- No manual edits required after generating `@beep/types` and `@beep/utils` into `packages/common`.
- Verification gate passes.
- Reflection log updated with Phase 4 learnings.

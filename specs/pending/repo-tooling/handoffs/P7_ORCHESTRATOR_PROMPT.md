# Orchestrator Prompt: Phase 7 (Remaining Issue Resolution & Gate Closure)

You are implementing **Phase 7** of `specs/pending/repo-tooling`.

## Objective

Resolve all residual acceptance gaps from Phase 6 (`SC-01`, `SC-03`, `SC-17`) and produce updated evidence that repo-tooling is gate-green and signoff-ready.

## Read First

1. `specs/pending/repo-tooling/README.md`
2. `specs/pending/repo-tooling/handoffs/HANDOFF_P7.md`
3. `specs/pending/repo-tooling/outputs/phase-6-spec-validation-report.md`
4. `specs/pending/repo-tooling/REFLECTION_LOG.md`

## Required Deliverables

1. Resolve `SC-01` and `SC-03` using a single explicit approach:
   - implementation alignment, or
   - spec alignment for intentional non-template outputs.
2. Fix lint failures blocking `SC-17`, including:
   - explicit `any` diagnostics in `tooling/cli/test/create-package.test.ts`
   - Biome format/import diagnostics reported in Phase 6 for `tooling/codebase-search/test/*`.
3. Re-run full verification gate:
   - `bun run build`
   - `bun run check`
   - `bun run test`
   - `bun run lint`
4. Produce `specs/pending/repo-tooling/outputs/phase-7-remaining-issues-resolution.md` with:
   - issue-by-issue remediation summary
   - before/after criterion status
   - command outputs summary
5. Update `specs/pending/repo-tooling/REFLECTION_LOG.md` with Phase 7 learnings.

## Done Criteria

- Remaining failing criteria from Phase 6 are all marked pass with evidence.
- Full verification gate is green.
- Remediation report is complete and explicit about decisions taken.

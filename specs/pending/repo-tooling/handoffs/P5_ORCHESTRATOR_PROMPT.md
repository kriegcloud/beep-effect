# Orchestrator Prompt: Phase 5 (CLI Hardening & Issue Remediation)

You are implementing **Phase 5** of `specs/pending/repo-tooling`.

## Objective

Fix all known `tooling/cli` implementation defects and coverage gaps so the spec can proceed to final validation with no manual patching.

## Read First

1. `specs/pending/repo-tooling/README.md`
2. `specs/pending/repo-tooling/handoffs/HANDOFF_P5.md`
3. `specs/pending/repo-tooling/REFLECTION_LOG.md`

## Required Deliverables

1. Fix `create-package` dist template availability and runtime resolution.
2. Fix `topo-sort` output formatting so package names are printed cleanly.
3. Add missing tests:
   - `tsconfig-sync` unmatched filter error path
   - `tsconfig-sync` cycle detection error path
   - `codegen` empty-module branch
4. Align touched code with project Effect-first collection/date conventions.
5. Run full verification gate:
   - `bun run build`
   - `bun run check`
   - `bun run test`
   - `bun run lint`
6. Update reflection log with Phase 5 learnings and root causes.

## Done Criteria

- Dist `create-package` path works with templates present.
- `topo-sort` no longer emits numeric index suffixes.
- New tests lock in missing failure/edge branches.
- Verification gate passes.
- Reflection log updated with Phase 5 details.

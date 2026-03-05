# Phase 7 Handoff: Remaining Issue Resolution & Gate Closure

**Date**: 2026-02-20  
**Status**: Ready for Phase 7 implementation (post Phase 6)

## Why Phase 7 Exists

Phase 6 validation produced explicit acceptance evidence and identified the remaining closure gaps preventing final signoff:

1. `SC-01` failed: not all generated outputs are template-driven.
2. `SC-03` failed: `.hbs` inventory does not map 1:1 to all generated outputs.
3. `SC-17` failed: full verification gate not green (`bun run lint` failure).

These must be resolved before a final comprehensive review can certify repo-tooling as complete.

## Phase 7 Objective

Resolve all residual acceptance gaps from Phase 6, restore a fully green verification gate, and produce updated evidence that all success criteria now pass.

## Required Work Items

1. Resolve template strictness criteria (`SC-01`, `SC-03`) with one explicit strategy:
   - **Implementation alignment path**: convert remaining non-template outputs to a template-compliant model, or
   - **Spec alignment path**: update criteria wording to explicitly allow intentional non-template outputs (`package.json` schema encoding, `.gitkeep` static markers, symlink operations).
   - Record rationale and chosen path in output artifact.
2. Fix lint gate failures (`SC-17`) and ensure `bun run lint` is green:
   - Remove explicit `any` violations in `tooling/cli/test/create-package.test.ts`.
   - Resolve Biome formatting/import diagnostics across currently failing files (including `tooling/codebase-search/test/*` files flagged in Phase 6 run).
3. Re-run and capture full verification gate:
   - `bun run build`
   - `bun run check`
   - `bun run test`
   - `bun run lint`
4. Update acceptance evidence:
   - Refresh or supersede Phase 6 matrix with final Pass/Fail status after remediation.
   - Produce `specs/completed/repo-tooling/outputs/phase-7-remaining-issues-resolution.md`.
5. Update `specs/completed/repo-tooling/REFLECTION_LOG.md` with closure learnings and prevention patterns.

## Suggested File Targets

- `specs/completed/repo-tooling/README.md`
- `specs/completed/repo-tooling/outputs/phase-6-spec-validation-report.md`
- `specs/completed/repo-tooling/outputs/phase-7-remaining-issues-resolution.md`
- `specs/completed/repo-tooling/REFLECTION_LOG.md`
- `tooling/cli/test/create-package.test.ts`
- `tooling/codebase-search/test/` (files flagged by lint diagnostics)
- Any create-package implementation/template files needed by the selected `SC-01`/`SC-03` resolution path

## Validation Commands

```bash
bun run build
bun run check
bun run test
bun run lint
```

Optional targeted checks:

```bash
bunx vitest run tooling/cli/test/create-package.test.ts tooling/cli/test/create-package-services.test.ts
bun tooling/cli/src/bin.ts tsconfig-sync --check
```

## Done Criteria

- `SC-01`, `SC-03`, and `SC-17` are resolved and marked pass with evidence.
- Full verification gate is green.
- Updated remediation artifact is committed under `specs/completed/repo-tooling/outputs/`.
- Reflection log contains concrete closure learnings.

# TypeScript Native Preview Port (tsgo)

## Status

- **Status**: `pending`
- **Scope**: Repo-wide (all workspaces)
- **Type**: Tooling migration / compiler swap
- **Complexity Score**: **50** (High)
- **Branch**: `native-preview-experiment`
- **Orchestrator**: Codex agent (OpenAI)
- **Estimated Duration**: 4 phases across 4-6 sessions

## Complexity Calculation

```
Phase Count:       4 phases       x 2 = 8
Agent Diversity:   3 agents       x 3 = 9
Cross-Package:     5 (repo-wide)  x 4 = 20
External Deps:     1 (tsgo)       x 3 = 3
Uncertainty:       4 (high)       x 5 = 20
Research Required: 3 (moderate)   x 2 = 6
----------------------------------------------
Total Score:                          50 -> High Complexity
```

**Recommendation**: Full orchestration structure with MASTER_ORCHESTRATION.md, per-task checkpoints, and strict go/no-go gates between phases.

---

## Problem Statement

This repo currently relies on the JavaScript/Node TypeScript toolchain (`typescript` + `tsc`) for:

- Build emits (`tsc -b tsconfig.build.json`) across 50+ referenced projects
- Type-checking (`tsc -b tsconfig.json`) via `bun run check`
- Watch mode (`tsc -b tsconfig.build.json --watch`) for development

We want to evaluate and migrate to the TypeScript native compiler preview (`@typescript/native-preview`, CLI: `tsgo`) -- a Go-based rewrite of the TypeScript compiler (Project Corsa / TypeScript 7) -- to achieve 7-10x faster build and check times while keeping the monorepo green.

---

## Technology Context

| Property | Current | Target |
|----------|---------|--------|
| **Compiler** | `typescript` ^5.9.3 (`tsc`) | `@typescript/native-preview` 7.0.0-dev.* (`tsgo`) |
| **Speed** | Baseline | 7-10x faster on full builds |
| **Target** | ES2024 | ES2024 (within tsgo supported range) |
| **Module** | ESNext | ESNext (supported) |
| **Module Resolution** | bundler | bundler (supported) |
| **Build Strategy** | Project references + composite | Same (tsgo supports `--build` mode) |
| **Linter** | Biome | Biome (no TS API dependency, fully compatible) |
| **Runtime** | Bun 1.3.x | Bun 1.3.x (unchanged) |

### tsgo Feature Status (February 2026)

| Feature | Status | Risk to This Project |
|---------|--------|---------------------|
| Type checking | ~99.6% parity with tsc | MEDIUM -- Effect uses advanced type-level programming |
| `--noEmit` | Supported | LOW |
| `--project` / `-p` | Supported | LOW |
| `--build` mode | Supported | LOW |
| `--incremental` | Supported | LOW |
| Project references | Supported | LOW |
| Declaration emit | Partial -- common cases work | HIGH -- project needs declarations for cross-package resolution |
| JavaScript emit | Not fully ported | HIGH -- build pipeline emits JS |
| Downlevel emit | Only back to es2021 | LOW -- project targets ES2024 |
| Decorator emit | Not supported | MEDIUM -- `experimentalDecorators` is enabled |
| Watch mode | File monitoring works, no incremental recheck | LOW -- not required for acceptance |
| Language service (LSP) | Auto-imports, find-all-refs, rename working | LOW -- not required for acceptance |

---

## Goals

1. `bun run build` passes after the port.
2. `bun run check` passes after the port.
3. `bun run lint:fix` passes after the port.
4. `bun run lint` passes after the port.
5. `bun run test` passes after the port.
6. The native preview compiler is actually used (no accidental fallback to old `tsc`).

## Non-Goals

- Rewriting application/source code away from TypeScript.
- Starting dev servers (`bun run dev`, `bun run services:up`) without explicit confirmation.
- Opportunistic refactors unrelated to the compiler swap.
- Upgrading Next.js, React, Effect, or other dependencies as a side effect.

---

## Risk Matrix

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Effect type-checking hits 0.4% discrepancy | MEDIUM | HIGH | Test leaf packages first; catalog exact errors; fall back to hybrid |
| Declaration emit fails on complex types | HIGH | HIGH | If build mode fails, use tsgo only for `check` and keep tsc for `build` (hybrid) |
| JS emit not ready for production build | HIGH | HIGH | Hybrid path: tsgo for check, tsc for build-esm |
| `emitDecoratorMetadata` not supported | MEDIUM | MEDIUM | Audit decorator usage; may need to disable or refactor |
| `ts-morph` in tooling/cli breaks | CERTAIN | LOW | ts-morph is runtime-only tooling; keep `typescript` package for it |
| `effect-language-service patch` fails | MEDIUM | LOW | Keep `typescript` installed; patch targets tsserver, not tsgo |
| `rewriteRelativeImportExtensions` unsupported | MEDIUM | HIGH | Test early; this is a newer tsc flag that tsgo may not support |
| `erasableSyntaxOnly` unsupported | MEDIUM | MEDIUM | Test early; fallback is to remove the flag |
| Composite project references edge cases | LOW | MEDIUM | Test with `tsgo -b` on full project graph early |
| 100+ path aliases cause resolution issues | LOW | MEDIUM | Test on leaf package first; path aliases are resolved by tsconfig |

---

## Current Constraints (Repo-Specific)

- **50+ project references** in `tsconfig.build.json` using composite mode.
- **Build emits JS + declarations** into `build/` folders via `tsc -b tsconfig.build.json`.
- **`tooling/cli`** uses `ts-morph` (runtime dependency on TypeScript JS API -- cannot use tsgo).
- **Root `prepare` script** runs `effect-language-service patch` (assumes `typescript` is installed for tsserver patching).
- **Non-standard flags**: `rewriteRelativeImportExtensions`, `erasableSyntaxOnly`, `emitDecoratorMetadata`, `experimentalDecorators` -- all need tsgo compatibility verification.
- **Standard pattern per package**: `check` = `tsc -b tsconfig.json`, `build-esm` = `tsc -b tsconfig.build.json`.

These constraints mean "strict replacement" (removing `typescript` entirely) is almost certainly blocked by ts-morph and effect-language-service. This spec treats the **hybrid path** (tsgo for build/check, keep `typescript` for JS API consumers) as the likely outcome.

---

## Scope

**In scope:**
- Add/pin `@typescript/native-preview` as a devDependency.
- Update all scripts that invoke `tsc` so CI-critical tasks run `tsgo` instead.
- Resolve incompatibilities (tsconfig flags, emit differences) with minimal behavior drift.
- If strict replacement is possible: remove `typescript` as a dependency across the workspace.
- If strict replacement is not possible: document why, and produce a hybrid outcome (tsgo for build/check; keep `typescript` only for JS API consumers).

**Out of scope (unless required to keep the repo green):**
- Changing product/runtime logic.
- Upgrading Next.js/React/Effect as a side effect.

---

## Phases

| Phase | Name | Purpose | Est. Duration |
|-------|------|---------|---------------|
| P0 | Research (Pre-seeded) | External research on tsgo capabilities | Complete |
| P1 | Discovery | Inventory all tsc/typescript usage; test tsgo on leaf package | 1 session |
| P2 | Planning | Decide strict vs hybrid; create detailed migration plan | 1 session |
| P3 | Implementation | Execute migration, package by package | 2-3 sessions |
| P4 | Validation | Run full verification suite; produce final report | 1 session |

---

## Decision Framework: Strict vs Hybrid

```
                    Can tsgo emit JS + declarations?
                           /              \
                         YES               NO
                          |                 |
              Can tsgo handle ALL            |
              tsconfig flags?             HYBRID PATH
                 /          \           (tsgo for check,
               YES          NO           tsc for build)
                |            |
          STRICT PATH    Can flags be
       (remove typescript)  removed/changed?
                           /        \
                         YES        NO
                          |          |
                    STRICT PATH   HYBRID PATH
```

---

## Verification (Acceptance Gate)

From repo root on branch `native-preview-experiment`:

```bash
bun run build
bun run check
bun run lint:fix
bun run lint
bun run test
```

All five must pass. Additionally, verify tsgo is the actual compiler being invoked (not tsc).

## Definition of Done

- All verification commands pass on `native-preview-experiment` branch.
- The repo uses `tsgo` for build/check in a deterministic, reviewable way.
- A decision is recorded in `outputs/`:
  - **Strict**: `typescript` removed from the workspace (and no test/tooling needs it).
  - **Hybrid (likely)**: `typescript` remains only where required for tooling/runtime API consumers, and `tsgo` is the compiler for build/check.

---

## Deliverables

| File | Purpose |
|------|---------|
| `outputs/P0_RESEARCH_SUMMARY.md` | External research findings (pre-seeded) |
| `outputs/P1_DISCOVERY_REPORT.md` | Codebase inventory of tsc/typescript usage |
| `outputs/P2_MIGRATION_PLAN.md` | Concrete migration plan with go/no-go gates |
| `outputs/P4_VALIDATION_REPORT.md` | Final validation evidence |
| `handoffs/P1_ORCHESTRATOR_PROMPT.md` | Copy-paste prompt for P1 |
| `handoffs/P2_ORCHESTRATOR_PROMPT.md` | Copy-paste prompt for P2 |
| `handoffs/P3_ORCHESTRATOR_PROMPT.md` | Copy-paste prompt for P3 |
| `handoffs/P4_ORCHESTRATOR_PROMPT.md` | Copy-paste prompt for P4 |
| `MASTER_ORCHESTRATION.md` | Complete orchestration guide |
| `REFLECTION_LOG.md` | Cumulative learnings |

---

## Key References

| Document | Path |
|----------|------|
| Master Orchestration | `specs/pending/typescript-native-preview-port/MASTER_ORCHESTRATION.md` |
| Research Summary | `specs/pending/typescript-native-preview-port/outputs/P0_RESEARCH_SUMMARY.md` |
| Root tsconfig | `tsconfig.base.jsonc` |
| Build tsconfig | `tsconfig.build.json` |
| Check tsconfig | `tsconfig.json` |
| Slice tsconfigs | `tsconfig.slices/*.json` |
| Root package.json | `package.json` |
| Turbo config | `turbo.json` |
| ts-morph usage | `tooling/cli/src/commands/create-slice/utils/ts-morph.ts` |

# Knowledge Server Test Shared Fixtures Dedup

> Deduplicate repeated mocks, test-layer builders, and fixture factories across `@beep/knowledge-server` unit tests by extracting reusable modules into `packages/knowledge/server/test/_shared`.

## Purpose

Reduce maintenance cost and drift in knowledge server unit tests by centralizing shared test construction patterns.

## Current State (Bootstrapped)

**Already Exists:**
- [x] Broad test coverage in `packages/knowledge/server/test`
- [x] Existing shared helper module at `packages/knowledge/server/test/_shared/TestLayers.ts`
- [x] Existing domain-local shared helper at `packages/knowledge/server/test/EntityResolution/_shared/TestLayers.ts`

**Observed Duplication (examples):**
- [x] Repeated ad-hoc `TestLayer` assembly (`Layer.mergeAll`, `Layer.provide`, `Layer.provideMerge`) across GraphRAG, Rdf, Sparql, Workflow, adapters
- [x] Repeated graph fixture factories (`createTestEntity`, `createMockEntity`, `createTestRelation`, `createMockRelation`) across GraphRAG tests
- [x] Repeated mock-service patterns (`createMockSparqlService`, `createMockReasonerService`, HTTP/auth mocks)

**This spec extends with:**
- [ ] Test-internal shared module structure in `packages/knowledge/server/test/_shared/*`
- [ ] Shared fixture/layer factory APIs with stable naming
- [ ] Migration plan moving call sites from local duplicates to shared modules
- [ ] Guardrails to prevent re-introducing duplication

## Problem Statement

`@beep/knowledge-server` tests currently use a mix of local helper functions and one-off layer wiring. Similar logic appears in multiple files with slight variations. This creates three concrete risks:

1. Behavior drift: two tests that should share semantics silently diverge.
2. Slow edits: changing one mock contract requires multi-file manual updates.
3. Review overhead: readers repeatedly parse helper boilerplate instead of test intent.

## Scope

### In Scope

- Unit test directories under `packages/knowledge/server/test`
- Shared helper extraction into `packages/knowledge/server/test/_shared`
- Refactors of existing tests to consume shared helpers
- Test-only documentation for helper usage and ownership

### Out of Scope

- Production runtime code under `packages/knowledge/server/src`
- E2E/integration architecture redesign
- Semantic changes to assertions unrelated to deduplication

## Complexity Classification

Score uses `specs/_guide/README.md` formula:

- Phase count: 4 x 2 = 8
- Agent diversity: 4 x 3 = 12
- Cross-package: 0 x 4 = 0
- External dependencies: 0 x 3 = 0
- Uncertainty: 2 x 5 = 10
- Research required: 2 x 2 = 4

**Total: 34 -> Medium complexity**

This spec intentionally includes orchestration docs (`MASTER_ORCHESTRATION.md`, `AGENT_PROMPTS.md`) because migration spans many test files and benefits from explicit delegation boundaries.

## Goals

- Establish canonical shared test helper modules in `packages/knowledge/server/test/_shared`.
- Remove duplicated layer/mocking helper logic from test files where behavior is equivalent.
- Preserve current test semantics and coverage.
- Introduce lightweight policy so new tests prefer `_shared` helpers.

## Non-Goals

- Force all helper logic into one mega utility file.
- Rewrite every test to identical style.
- Change public server APIs.

## Deliverables

- Updated `_shared` module set under `packages/knowledge/server/test/_shared`
- Migrated test files with duplicate helpers removed
- Phase artifacts under `specs/pending/knowledge-server-test-shared-fixtures-dedup/outputs`
- Reflection entries capturing what refactor patterns worked
- Handoff and orchestrator prompt files for multi-session continuation

## Success Criteria

**Already Complete (Bootstrapped):**
- [x] Existing test suite structure and baseline helpers exist

**Phase Deliverables:**
- [ ] At least 3 duplication families extracted into `_shared` modules
- [ ] Existing tests continue to pass for touched areas
- [ ] No new direct cross-slice imports introduced
- [ ] New helpers have clear naming and minimal API surface
- [ ] `REFLECTION_LOG.md` updated after each phase

## Phase Overview

| Phase | Objective | Primary Agents | Output |
|---|---|---|---|
| P1 | Discovery + duplication inventory | codebase-researcher | `outputs/codebase-context.md` |
| P2 | Design + migration plan | code-reviewer, architecture-pattern-enforcer | `outputs/evaluation.md`, `outputs/remediation-plan.md` |
| P3 | Implementation + migration | effect-code-writer, test-writer | code changes + updated tests |
| P4 | Stabilization + anti-regression guardrails | code-reviewer, doc-writer | `outputs/verification-report.md` |

## Key References

- `packages/knowledge/server/test/_shared/TestLayers.ts`
- `packages/knowledge/server/test/EntityResolution/_shared/TestLayers.ts`
- `packages/knowledge/server/test/GraphRAG/CitationValidator.test.ts`
- `packages/knowledge/server/test/GraphRAG/ContextFormatter.test.ts`
- `packages/knowledge/server/test/GraphRAG/PromptTemplates.test.ts`
- `packages/knowledge/server/test/Rdf/integration.test.ts`
- `packages/knowledge/server/test/Rdf/benchmark.test.ts`
- `packages/knowledge/server/test/Sparql/SparqlGenerator.test.ts`
- `packages/knowledge/server/test/adapters/GmailExtractionAdapter.test.ts`

## Usage

- Start from `QUICK_START.md` for immediate execution.
- Use `handoffs/P1_ORCHESTRATOR_PROMPT.md` to launch the next implementation session.
- Keep `HANDOFF_P[N].md` and `P[N]_ORCHESTRATOR_PROMPT.md` paired at each phase boundary.

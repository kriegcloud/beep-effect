# HANDOFF_P2: Knowledge Server Test Shared Fixtures Dedup

## Phase Context

This handoff starts **Phase 2 (Evaluation + Design)** for deduplicating shared test mocks/layers in `@beep/knowledge-server` tests.

## Current Status

| Item | Status |
|---|---|
| Spec scaffold | Complete |
| Phase 1 duplication inventory | Complete |
| Shared module design | Not started |
| Migration sequence | Not started |
| Code edits | Not started |

## Inputs to Read First

- `specs/completed/knowledge-server-test-shared-fixtures-dedup/outputs/codebase-context.md`
- `specs/completed/knowledge-server-test-shared-fixtures-dedup/README.md`
- `specs/completed/knowledge-server-test-shared-fixtures-dedup/MASTER_ORCHESTRATION.md`

## Objective for This Phase

Convert the Phase 1 inventory into concrete extraction design + migration sequencing:
- shared module boundaries
- helper API contracts
- rollout order minimizing behavior drift

## Phase 1 Findings to Carry Forward

- Family A: GraphRAG fixture factories and fixed IDs duplicated across multiple `GraphRAG/*.test.ts` files.
- Family B: `withTextLanguageModel`/`buildTextResponse` duplicated and overlaps existing `test/_shared/TestLayers.ts`.
- Family C: repeated layer composition recipes (notably RDF `TestLayer` recipe, also Sparql/Workflow patterns).
- Family D: service/harness mock builders duplicated in GraphRAG, Workflow, and Gmail adapter tests.
- Non-dedup exceptions were identified for benchmark-specific and scenario-story fixtures.

## Required Outputs

Create:

- `specs/completed/knowledge-server-test-shared-fixtures-dedup/outputs/evaluation.md`
- `specs/completed/knowledge-server-test-shared-fixtures-dedup/outputs/remediation-plan.md`

## Required Sections (minimum)

For `outputs/evaluation.md`:
1. Proposed shared module boundaries
2. Helper API contracts (signatures + defaults)
3. Merge-vs-keep-local decisions per family
4. Risk analysis and semantic-equivalence checks

For `outputs/remediation-plan.md`:
1. Ordered migration batches (low -> high risk)
2. File-level rollout list
3. Verification steps per batch
4. Backout strategy for each medium/high risk batch

## Constraints

- Design-focused phase; avoid broad implementation edits.
- Keep all shared helpers under `packages/knowledge/server/test/_shared`.
- Preserve Effect patterns, strict typing, and current test semantics.

## Completion Checklist

- [ ] `outputs/evaluation.md` filled with actionable module/API design
- [ ] `outputs/remediation-plan.md` defines concrete migration sequence
- [ ] Low/medium/high risk batches are explicit with file references
- [ ] Intentional non-dedup exceptions are preserved (not regressed)
- [ ] `REFLECTION_LOG.md` updated with Phase 2 entry when complete

## Next Handoff Artifacts

When Phase 2 ends, generate both:

- `handoffs/HANDOFF_P3.md`
- `handoffs/P3_ORCHESTRATOR_PROMPT.md`

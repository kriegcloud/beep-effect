# HANDOFF_P4: Knowledge Server Test Shared Fixtures Dedup

## Phase Context

This handoff starts **Phase 4 (Stabilization + Anti-regression Guardrails)** for deduplicating shared test mocks/layers in `@beep/knowledge-server` tests.

Phase 3 implementation and migrations are largely complete, but Phase 3 verification is currently blocked by unexpected production-code drift in `packages/knowledge/server/src/**` that is unrelated to this spec.

## Current Status

| Item | Status |
|---|---|
| Shared helper modules under `packages/knowledge/server/test/_shared/**` | Implemented |
| Test migrations (batches 1-7 from remediation plan) | Implemented |
| Targeted test runs for touched areas | Reported green during Phase 3 |
| `bun run lint` | Reported green during Phase 3 |
| `bun run check` | **Blocked** (unexpected prod-code changes and new untracked files) |
| Phase 4 verification report | Not started |
| Anti-regression guardrails | Not started |

## Phase 3 Outputs (What Exists)

Shared helpers (test-only):
- `packages/knowledge/server/test/_shared/TestLayers.ts`
- `packages/knowledge/server/test/_shared/LayerBuilders.ts`
- `packages/knowledge/server/test/_shared/GraphFixtures.ts`
- `packages/knowledge/server/test/_shared/ServiceMocks.ts`

Migrated tests (per `outputs/remediation-plan.md` batch order):
- GraphRAG: `AnswerSchemas`, `CitationParser`, `CitationValidator`, `ConfidenceScorer`, `ContextFormatter`, `GroundedAnswerGenerator`, `PromptTemplates`
- RDF: `integration`, `benchmark`
- Sparql: `SparqlGenerator`
- Workflow: `ExtractionWorkflow`, `BatchOrchestratorEngineParity`
- Adapter: `GmailExtractionAdapter`

Phase reflection is recorded in:
- `specs/completed/knowledge-server-test-shared-fixtures-dedup/REFLECTION_LOG.md` (Entry 4)

## Critical Blocker (Must Resolve First)

`bun run check` is currently prevented by unexpected production code modifications and new untracked files:

Tracked files modified (unexpected for this spec):
- `packages/knowledge/server/src/Service/index.ts`
- `packages/knowledge/server/src/Extraction/ExtractionPipeline.ts`
- `packages/knowledge/server/src/EntityResolution/IncrementalClustererLive.ts`

Untracked new production files:
- `packages/knowledge/server/src/Service/ContentEnrichmentAgent.ts`
- `packages/knowledge/server/src/Service/DocumentClassifier.ts`
- `packages/knowledge/server/src/Service/WikidataClient.ts`
- `packages/knowledge/server/src/Service/CrossBatchEntityResolver.ts`
- `packages/knowledge/server/src/Service/ReconciliationService.ts`

These are outside Phase 3 scope. The preferred stabilization path is:
1. Revert the tracked diffs in `packages/knowledge/server/src/**` back to HEAD.
2. Remove (or move out of compilation) the untracked `src/Service/*.ts` files.
3. Re-run verification gates.

If these production changes are actually intended, treat them as a separate change-set:
- Make the minimal TypeScript fixes needed for `exactOptionalPropertyTypes` and effect typing.
- Ensure they are properly layered/wired (or explicitly optional) and committed separately from the test dedup work.

## Phase 4 Objectives

1. Unblock `bun run check` without introducing new scope creep.
2. Run full verification gates and record what was run:
   - `bun run check`
   - `bun run lint`
   - `bun run test` (at least knowledge-server touched tests; ideally full suite)
3. Produce `outputs/verification-report.md` mapping:
   - each `_shared` export to call sites that adopted it
   - preserved intentional non-dedup exceptions (confirm still local)
4. Add lightweight anti-regression guardrails:
   - short guidance in `outputs/verification-report.md` or a small doc note in spec outputs
   - optional: a quick checklist for reviewers and future test additions (do not enforce with new tooling unless needed)

## Preserved Non-Dedup Exceptions (Must Remain)

Do not dedup these unless a new explicit written justification is added:
- Gmail narrative payload fixtures in `packages/knowledge/server/test/adapters/GmailExtractionAdapter.test.ts`
- Benchmark/perf helpers in `packages/knowledge/server/test/Rdf/benchmark.test.ts`
- `sparqlServiceLayer` in `packages/knowledge/server/test/Sparql/SparqlService.test.ts`
- `createInferenceResultWithRelation` in `packages/knowledge/server/test/GraphRAG/CitationValidator.test.ts`

## Suggested Execution Order (Phase 4)

1. Resolve the `bun run check` blocker (revert/delete unintended production files first).
2. Run `bun run check` and `bun run lint` at repo root.
3. Run tests:
   - minimum: `bun run test` filtered to `packages/knowledge/server/test/**` if supported
   - otherwise: `bun run test` and confirm no regressions in touched test files
4. Generate `specs/completed/knowledge-server-test-shared-fixtures-dedup/outputs/verification-report.md`.
5. If anything regresses in medium/high-risk areas, use the rollback guidance in `outputs/remediation-plan.md` and keep changes incremental.


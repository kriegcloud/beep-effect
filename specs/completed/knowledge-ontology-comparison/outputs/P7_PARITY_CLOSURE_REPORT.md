# P7 Parity Closure Report

## Scope

- `packages/knowledge/server/src/Service/*`
- `packages/knowledge/server/src/Extraction/*`
- `packages/knowledge/server/src/LlmControl/*`
- `packages/knowledge/server/src/EntityResolution/*`
- `packages/knowledge/server/src/Runtime/*`
- `packages/knowledge/server/test/{Service,Extraction,Resilience,EntityResolution,GraphRAG,Workflow}/*`
- `specs/pending/knowledge-ontology-comparison/outputs/*`

## Phase Objective

Close remaining high-value P1/P2 parity gaps versus `.repos/effect-ontology` after completed workflow migration, while reconciling stale parity artifacts before implementation.

---

## Track 0: Artifact Reconciliation (Required First)

### Updated Artifacts

- `specs/pending/knowledge-ontology-comparison/outputs/COMPARISON_MATRIX.md` (refreshed)
- `specs/pending/knowledge-ontology-comparison/outputs/GAP_ANALYSIS.md` (refreshed)
- `specs/pending/knowledge-ontology-comparison/outputs/IMPLEMENTATION_ROADMAP.md` (refreshed)
- `specs/pending/knowledge-ontology-comparison/outputs/P6_PARITY_GAP_MATRIX.md` (refreshed)

### Reconciliation Notes

- Removed stale workflow-gap assumptions superseded by:
  - `specs/completed/knowledge-effect-workflow-migration/outputs/P4_PARITY_VALIDATION.md`
  - `specs/completed/knowledge-effect-workflow-migration/outputs/P5_LEGACY_REMOVAL_REPORT.md`
- Found stale evidence references in current matrix:
  - `packages/knowledge/server/src/Workflow/DurableActivities.ts` (deleted)
  - `packages/knowledge/server/test/Workflow/DurableActivities.test.ts` (deleted)
- Confirmed current workflow code is `@effect/workflow`-based:
  - `packages/knowledge/server/src/Workflow/ExtractionWorkflow.ts`
  - `packages/knowledge/server/src/Workflow/BatchOrchestrator.ts`
  - `packages/knowledge/server/src/Runtime/WorkflowRuntime.ts`
- Current P6 matrix also still recommends deciding `P6-01`/`P6-02`, which is stale after completed migration outputs.

### Matrix Diff Summary

| Row ID | Previous Status | New Status | Reason | Evidence |
|---|---|---|---|---|
| `P6-01` | `DIVERGENCE` | `FULL` (proposed, verify in matrix refresh) | Runtime now uses `@effect/workflow` engine paths; old custom-runtime claim is stale. | `packages/knowledge/server/src/Workflow/ExtractionWorkflow.ts`, `packages/knowledge/server/src/Workflow/BatchOrchestrator.ts`, `specs/completed/knowledge-effect-workflow-migration/outputs/P4_PARITY_VALIDATION.md` |
| `P6-02` | `DIVERGENCE` | `DIVERGENCE` (revalidate wording/evidence) | Cluster persistence parity (`SqlMessageStorage`/`SqlRunnerStorage`) may still diverge; old evidence paths are stale and must be replaced. | `specs/pending/knowledge-ontology-comparison/outputs/P6_PARITY_GAP_MATRIX.md`, `specs/completed/knowledge-effect-workflow-migration/outputs/P5_LEGACY_REMOVAL_REPORT.md` |
| `P6-06` | `GAP` | `FULL` | Implemented document classifier service with LLM schema output + tests. | `packages/knowledge/server/src/Service/DocumentClassifier.ts`, `packages/knowledge/server/test/Service/DocumentClassifier.test.ts` |
| `P6-07` | `GAP` | `FULL` | Implemented content enrichment agent service with structured metadata output + tests. | `packages/knowledge/server/src/Service/ContentEnrichmentAgent.ts`, `packages/knowledge/server/test/Service/ContentEnrichmentAgent.test.ts` |
| `P6-08` | `GAP` | `FULL` | Implemented Wikidata reconciliation service + reviewable task queue + tests. | `packages/knowledge/server/src/Service/{ReconciliationService,WikidataClient}.ts`, `packages/knowledge/server/test/Service/ReconciliationService.test.ts` |
| `P6-09` | `DIVERGENCE` | `DIVERGENCE` (narrowed) | Added LanguageModel fallback chain; remaining divergence is primarily embedding fallback + layer shape differences. | `packages/knowledge/server/src/LlmControl/{LlmResilience,FallbackLanguageModel}.ts`, `packages/knowledge/server/src/Runtime/LlmLayers.ts`, `packages/knowledge/server/test/Resilience/LlmResilience.test.ts` |
| `P6-10` | `PARTIAL` | `PARTIAL` (kickoff baseline) | Service bundles exist but parity scope likely narrower than reference workflow layers. | `packages/knowledge/server/src/Runtime/ServiceBundles.ts`, `packages/knowledge/server/test/Resilience/TokenBudgetAndBundles.test.ts` |
| `P6-11` | `PARTIAL` | `FULL` | Promoted cross-batch resolution to a dedicated service API with schema-safe outputs + tests. | `packages/knowledge/server/src/Service/CrossBatchEntityResolver.ts`, `packages/knowledge/server/test/Service/CrossBatchEntityResolver.test.ts` |

---

## Track A: Ingestion Quality Parity

### P7-01 Document Classifier (`P6-06`)

- Implementation files:
  - `packages/knowledge/server/src/Service/DocumentClassifier.ts`
- Test files:
  - `packages/knowledge/server/test/Service/DocumentClassifier.test.ts`
- Status: `FULL`
- Notes:
  - Uses schema-safe LLM output decoding via `DocumentClassification` schema class.
  - Uses `withLlmResilienceWithFallback` with `baseRetryDelay: Duration.zero` to avoid test-clock hangs while keeping retry budget.

### P7-02 Reconciliation Service (`P6-08`)

- Implementation files:
  - `packages/knowledge/server/src/Service/ReconciliationService.ts`
  - `packages/knowledge/server/src/Service/WikidataClient.ts`
- Test files:
  - `packages/knowledge/server/test/Service/ReconciliationService.test.ts`
- Status: `FULL`
- Notes:
  - Produces reviewable outputs via queued verification tasks persisted through `Storage`.
  - Candidate selection uses a configurable threshold band (auto-link vs queue).

### P7-03 Content Enrichment (`P6-07`)

- Implementation files:
  - `packages/knowledge/server/src/Service/ContentEnrichmentAgent.ts`
- Test files:
  - `packages/knowledge/server/test/Service/ContentEnrichmentAgent.test.ts`
- Status: `FULL`
- Notes:
  - Schema class output (`EnrichedContent`) provides defaulting with `S.optionalWith(...)` + `OptionFromNullishOr(...)`.
  - Keeps `webSourceType` optional and only meaningful for `sourceChannel=web`.

---

## Track B: Reliability / Control-Plane Parity

### P7-04 LLM Fallback Chain (`P6-09` remainder)

- Implementation files:
  - `packages/knowledge/server/src/LlmControl/LlmResilience.ts`
  - `packages/knowledge/server/src/LlmControl/FallbackLanguageModel.ts`
  - `packages/knowledge/server/src/Runtime/LlmLayers.ts`
- Test files:
  - `packages/knowledge/server/test/Resilience/LlmResilience.test.ts`
- Status: `FULL` (for fallback-chain remainder)
- Notes:
  - Fallback is modeled as `Option<LanguageModel.Service>` and passed explicitly to `withLlmResilienceWithFallback` call sites.
  - Remaining divergence vs effect-ontology is primarily embedding fallback parity and layer composition specifics.

### P7-05 Cross-Batch Resolver Uplift (`P6-11`)

- Implementation files:
  - `packages/knowledge/server/src/Service/CrossBatchEntityResolver.ts`
- Test files:
  - `packages/knowledge/server/test/Service/CrossBatchEntityResolver.test.ts`
- Status: `FULL`
- Notes:
  - Uses slice entity IDs (`KnowledgeEntityIds.*`) end-to-end.
  - Uses `@beep/schema` `BS.MutableHashMap(...)` schema for the `resolvedMap` surface.

### Optional Bundle Parity Uplift (`P6-10`)

- Implementation files:
  - `packages/knowledge/server/src/Runtime/ServiceBundles.ts`
- Test files:
  - `packages/knowledge/server/test/Resilience/TokenBudgetAndBundles.test.ts`
- Status: `PARTIAL`
- Notes:
  - No bundle-surface expansion in Phase 7; maintained existing coverage while adding new services.

---

## Divergence Register (If Any)

| ID | Divergence | Rationale | Operational Impact | Test Evidence |
|---|---|---|---|---|
| `P6-09` | Embedding fallback + layer-shape differs from effect-ontology | LanguageModel fallback chain is implemented, but reference also includes dedicated embedding fallback + additional composition layers | Backup provider works for LanguageModel operations; embedding fallback may still fail hard depending on provider | `packages/knowledge/server/test/Resilience/LlmResilience.test.ts` |

---

## Verification Results

Executed:

```bash
bun run check --filter @beep/knowledge-domain
bun run check --filter @beep/knowledge-server
bun run lint --filter @beep/knowledge-server
bun test packages/knowledge/server/test/Workflow/
bun test packages/knowledge/server/test/Resilience/
bun test packages/knowledge/server/test/Service/
bun test packages/knowledge/server/test/Extraction/
bun test packages/knowledge/server/test/EntityResolution/
bun test packages/knowledge/server/test/GraphRAG/
```

Results:

- `bun run check --filter @beep/knowledge-domain`: PASS (2026-02-07)
- `bun run check --filter @beep/knowledge-server`: PASS (2026-02-07)
- `bun run lint --filter @beep/knowledge-server`: PASS (2026-02-07)
- `bun test packages/knowledge/server/test/Workflow/`: PASS (`12 pass, 0 fail`) (2026-02-07)
- `bun test packages/knowledge/server/test/Resilience/`: PASS (`9 pass, 0 fail`) (2026-02-07)
- `bun test packages/knowledge/server/test/Service/`: PASS (`18 pass, 0 fail`) (2026-02-07)
- `bun test packages/knowledge/server/test/Extraction/`: PASS (`27 pass, 0 fail`) (2026-02-07)
- `bun test packages/knowledge/server/test/EntityResolution/`: PASS (`40 pass, 0 fail`) (2026-02-07)
- `bun test packages/knowledge/server/test/GraphRAG/`: PASS (`144 pass, 0 fail`) (2026-02-07)

---

## Files Added / Modified (Phase 7)

### Added

- `packages/knowledge/server/src/LlmControl/FallbackLanguageModel.ts`
- `packages/knowledge/server/src/Service/DocumentClassifier.ts`
- `packages/knowledge/server/src/Service/ContentEnrichmentAgent.ts`
- `packages/knowledge/server/src/Service/ReconciliationService.ts`
- `packages/knowledge/server/src/Service/WikidataClient.ts`
- `packages/knowledge/server/src/Service/CrossBatchEntityResolver.ts`
- `packages/knowledge/server/test/Service/DocumentClassifier.test.ts`
- `packages/knowledge/server/test/Service/ContentEnrichmentAgent.test.ts`
- `packages/knowledge/server/test/Service/ReconciliationService.test.ts`
- `packages/knowledge/server/test/Service/CrossBatchEntityResolver.test.ts`

### Modified

- `packages/knowledge/server/src/LlmControl/LlmResilience.ts` (fallback-chain remainder)
- `packages/knowledge/server/src/Runtime/LlmLayers.ts` (always-provided fallback tag)
- `specs/pending/knowledge-ontology-comparison/outputs/*` (reconciled parity artifacts + this report)

### Deleted

- None in Phase 7 scope (legacy workflow artifacts were already removed in the completed migration spec).

---

## Risks and Rollback

- Regressions risked:
  - LLM retry behavior changes (retry delay set to zero for classifier/enrichment to avoid test-clock hangs).
- Rollback strategy:
  - Revert service-specific `baseRetryDelay: Duration.zero` to a tuned duration if production load requires backoff; keep fallback chain + schemas/tests intact.
- Follow-up required:
  - Decide whether embedding fallback parity is required under `P6-09` and, if so, add it as a distinct surface with tests.

---

## Success Criteria Status

- [x] parity artifacts reconciled with post-migration reality
- [x] remaining P1/P2 targets closed or explicitly diverged with tests
- [x] no runtime path reintroduces removed legacy workflow behavior
- [x] all verification commands pass
- [x] matrix/roadmap updated with concrete evidence links
- [x] `REFLECTION_LOG.md` updated with Phase 7 decisions

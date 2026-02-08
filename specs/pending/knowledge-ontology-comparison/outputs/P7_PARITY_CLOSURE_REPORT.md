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
- `specs/pending/knowledge-ontology-comparison/outputs/CONTEXT_DOCUMENT.md` (summary updated to mark old gap numbering as historical; points to canonical parity matrix)
- `specs/pending/knowledge-ontology-comparison/outputs/GAP_ANALYSIS.md` (refreshed)
- `specs/pending/knowledge-ontology-comparison/outputs/IMPLEMENTATION_ROADMAP.md` (refreshed)
- `specs/pending/knowledge-ontology-comparison/outputs/P6_PARITY_GAP_MATRIX.md` (refreshed)

### Reconciliation Notes

- Removed stale workflow-gap assumptions superseded by:
  - `specs/completed/knowledge-effect-workflow-migration/outputs/P4_PARITY_VALIDATION.md`
  - `specs/completed/knowledge-effect-workflow-migration/outputs/P5_LEGACY_REMOVAL_REPORT.md`
- Found stale evidence references in pre-refresh matrices:
  - `packages/knowledge/server/src/Workflow/DurableActivities.ts` (deleted)
  - `packages/knowledge/server/test/Workflow/DurableActivities.test.ts` (deleted)
- Confirmed current workflow code is `@effect/workflow`-based:
  - `packages/knowledge/server/src/Workflow/ExtractionWorkflow.ts`
  - `packages/knowledge/server/src/Workflow/BatchOrchestrator.ts`
  - `packages/knowledge/server/src/Runtime/WorkflowRuntime.ts`
- Older matrices treated `P6-01` engine adoption as undecided. Current Phase 7 reconciliation marks `P6-01` as `FULL` and isolates `P6-02` as the remaining persistence divergence.

### Matrix Diff Summary

| Row ID | Previous Status | New Status | Reason | Evidence |
|---|---|---|---|---|
| `P6-01` | `DIVERGENCE` | `FULL` | Runtime now uses `@effect/workflow` engine paths; old custom-runtime claim is stale. | `packages/knowledge/server/src/Workflow/ExtractionWorkflow.ts`, `packages/knowledge/server/src/Workflow/BatchOrchestrator.ts`, `specs/completed/knowledge-effect-workflow-migration/outputs/P4_PARITY_VALIDATION.md` |
| `P6-02` | `DIVERGENCE` | `DIVERGENCE` (revalidate wording/evidence) | Cluster persistence parity (`SqlMessageStorage`/`SqlRunnerStorage`) may still diverge; old evidence paths are stale and must be replaced. | `specs/pending/knowledge-ontology-comparison/outputs/P6_PARITY_GAP_MATRIX.md`, `specs/completed/knowledge-effect-workflow-migration/outputs/P5_LEGACY_REMOVAL_REPORT.md` |
| `P6-06` | `GAP` | `FULL` | Implemented document classifier service with LLM schema output + tests. | `packages/knowledge/server/src/Service/DocumentClassifier.ts`, `packages/knowledge/server/test/Service/DocumentClassifier.test.ts` |
| `P6-07` | `GAP` | `FULL` | Implemented content enrichment agent service with structured metadata output + tests. | `packages/knowledge/server/src/Service/ContentEnrichmentAgent.ts`, `packages/knowledge/server/test/Service/ContentEnrichmentAgent.test.ts` |
| `P6-08` | `GAP` | `FULL` | Implemented Wikidata reconciliation service + reviewable task queue + tests. | `packages/knowledge/server/src/Service/{ReconciliationService,WikidataClient}.ts`, `packages/knowledge/server/test/Service/ReconciliationService.test.ts` |
| `P6-09` | `DIVERGENCE` | `FULL` | Added provider fallback chains for both LanguageModel and EmbeddingModel with resilience wrappers + tests. | `packages/knowledge/server/src/LlmControl/{LlmResilience,FallbackLanguageModel}.ts`, `packages/knowledge/server/src/Embedding/{EmbeddingResilience,FallbackEmbeddingModel}.ts`, `packages/knowledge/server/test/Resilience/{LlmResilience,EmbeddingFallback}.test.ts` |
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

### P7-04 LLM Fallback Chain (`P6-09`)

- Implementation files:
  - `packages/knowledge/server/src/LlmControl/LlmResilience.ts`
  - `packages/knowledge/server/src/LlmControl/FallbackLanguageModel.ts`
  - `packages/knowledge/server/src/Embedding/EmbeddingResilience.ts`
  - `packages/knowledge/server/src/Embedding/FallbackEmbeddingModel.ts`
- Test files:
  - `packages/knowledge/server/test/Resilience/LlmResilience.test.ts`
  - `packages/knowledge/server/test/Resilience/EmbeddingFallback.test.ts`
- Status: `FULL`
- Notes:
  - Provider fallback is explicit at the call sites (no hidden global fallback), keeping dependency wiring reviewable.
  - Resilience wrappers cover retry + timeout + circuit feedback behavior consistently across both LanguageModel and EmbeddingModel.

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
| `P6-02` | Cluster workflow persistence differs from effect-ontology | Single-node durable SQL engine is implemented, but multi-runner/sharded persistence semantics remain intentionally out of scope | Production deployments needing multi-runner workflow sharding must either extend persistence or accept single-node semantics | `packages/knowledge/server/test/Workflow/WorkflowPersistence.singleNodeSemantics.test.ts` |
| `P6-04` | Storage service differs from effect-ontology | Memory/local/sql backends + generation preconditions are implemented; cloud object stores + signed URL surfaces are intentionally deferred | No signed URL flows / cloud object-store interoperability unless implemented later | `packages/knowledge/server/test/Service/Storage.test.ts`, `packages/knowledge/server/test/Service/StorageLocal.test.ts`, `packages/knowledge/server/test/Service/StorageSql.test.ts` |

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

- `bun run check --filter @beep/knowledge-domain`: PASS (2026-02-08)
- `bun run check --filter @beep/knowledge-server`: PASS (2026-02-08)
- `bun run lint --filter @beep/knowledge-server`: PASS (2026-02-08)
- `bun test packages/knowledge/server/test/Workflow/`: PASS (`16 pass, 0 fail`) (2026-02-08)
- `bun test packages/knowledge/server/test/Resilience/`: PASS (`14 pass, 0 fail`) (2026-02-08)
- `bun test packages/knowledge/server/test/Service/`: PASS (`35 pass, 0 fail`) (2026-02-08)
- `bun test packages/knowledge/server/test/Extraction/`: PASS (`28 pass, 0 fail`) (2026-02-08)
- `bun test packages/knowledge/server/test/EntityResolution/`: PASS (`40 pass, 0 fail`) (2026-02-08)
- `bun test packages/knowledge/server/test/GraphRAG/`: PASS (`144 pass, 0 fail`) (2026-02-08)

---

## Files Added / Modified (Phase 7)

### Added

- `packages/knowledge/server/src/Embedding/EmbeddingResilience.ts`
- `packages/knowledge/server/src/Embedding/FallbackEmbeddingModel.ts`
- `packages/knowledge/server/test/Extraction/KnowledgeGraphArbitrary.test.ts`
- `packages/knowledge/server/test/Resilience/EmbeddingFallback.test.ts`
- `packages/knowledge/server/test/Service/StorageLocal.test.ts`
- `packages/knowledge/server/test/Service/StorageSql.test.ts`
- `packages/knowledge/server/test/Workflow/WorkflowPersistence.singleNodeSemantics.test.ts`

### Modified

- `packages/knowledge/server/src/Embedding/EmbeddingService.ts`
- `packages/knowledge/server/src/Embedding/index.ts`
- `packages/knowledge/server/src/EntityResolution/EntityClusterer.ts`
- `packages/knowledge/server/src/EntityResolution/EntityResolutionService.ts`
- `packages/knowledge/server/src/Grounding/ConfidenceFilter.ts`
- `packages/knowledge/server/src/Grounding/GroundingService.ts`
- `packages/knowledge/server/src/Rdf/ProvenanceEmitter.ts`
- `packages/knowledge/server/src/Service/DocumentClassifier.ts`
- `packages/knowledge/server/src/Service/ReconciliationService.ts`
- `packages/knowledge/server/test/Service/CrossBatchEntityResolver.test.ts`
- `packages/knowledge/server/test/Service/DocumentClassifier.test.ts`
- `packages/knowledge/server/test/Service/ReconciliationService.test.ts`
- `specs/pending/knowledge-ontology-comparison/outputs/*` (reconciled parity artifacts + this report)
- `specs/pending/knowledge-ontology-comparison/handoffs/P7_ORCHESTRATOR_PROMPT.md` (removed stray trailing artifact line)

### Deleted

- None in Phase 7 scope (legacy workflow artifacts were already removed in the completed migration spec).

---

## Risks and Rollback

- Regressions risked:
  - LLM retry behavior changes (retry delay set to zero for classifier/enrichment to avoid test-clock hangs).
- Rollback strategy:
  - Revert service-specific `baseRetryDelay: Duration.zero` to a tuned duration if production load requires backoff; keep fallback chain + schemas/tests intact.
- Follow-up required:
  - Tighten the remaining divergence evidence/rationale for `P6-02` (cluster persistence semantics) and `P6-04` (cloud storage + signed URLs).

---

## Success Criteria Status

- [x] parity artifacts reconciled with post-migration reality
- [x] remaining P1/P2 targets closed or explicitly diverged with tests
- [x] no runtime path reintroduces removed legacy workflow behavior
- [x] all verification commands pass
- [x] matrix/roadmap updated with concrete evidence links
- [x] `REFLECTION_LOG.md` updated with Phase 7 decisions

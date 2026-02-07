# Phase 6 Parity Gap Matrix (Post-Implementation)

**Spec**: `knowledge-ontology-comparison`  
**Date**: 2026-02-07  
**Baseline**: Post-Phase 5 (`P1-P2` infrastructure polish completed)

## Purpose

This matrix is a **current-state parity checkpoint** against `.repos/effect-ontology/packages/@core-v2/src` after Phase 5 work. It replaces assumptions from older matrices that predate current Workflow/Validation/Sparql/Rdf changes in `packages/knowledge/*`.

## Legend

- `FULL`: capability exists with functionally equivalent behavior
- `PARTIAL`: capability exists but narrower or architecturally different
- `GAP`: capability not implemented in knowledge slice
- `DIVERGENCE`: intentionally different architecture, with tests and rationale

## Snapshot

| Area | Status | Notes |
|---|---|---|
| SPARQL read/query stack | FULL | SELECT/ASK/CONSTRUCT/DESCRIBE + NL->SPARQL read-only path present |
| RDF + named graphs + provenance | FULL | Named graph lifecycle + PROV emission implemented |
| SHACL + reasoning | PARTIAL | Present, but effect-ontology has broader rule/profile envelope |
| Batch/workflow orchestration | DIVERGENCE | Custom durable workflow retained; reliability parity hardened (input-aware replay, retry persistence, catch-all failure status) |
| LLM control plane | DIVERGENCE | Retry + timeout + circuit feedback added; provider fallback chain explicitly deferred |
| Content enrichment + external reconciliation | GAP | Missing classifier, enrichment agent, Wikidata reconciliation |
| Multi-ontology registry + storage abstraction | DIVERGENCE | Registry + storage abstraction implemented with memory-first backends; cloud/durable backends deferred |

## Capability Matrix (Prioritized)

| ID | Capability (effect-ontology) | Reference Evidence | knowledge-slice Evidence | Status | Priority |
|---|---|---|---|---|---|
| P6-01 | Durable workflow engine via `@effect/workflow` (`Workflow.make`, workflow polling/suspension) | `.repos/effect-ontology/packages/@core-v2/src/Service/WorkflowOrchestrator.ts` | `packages/knowledge/server/src/Workflow/ExtractionWorkflow.ts`, `packages/knowledge/server/src/Workflow/DurableActivities.ts`, `packages/knowledge/server/src/Workflow/WorkflowPersistence.ts`, `packages/knowledge/server/test/Workflow/DurableActivities.test.ts`, `packages/knowledge/server/test/Workflow/ExtractionWorkflow.test.ts` | DIVERGENCE | P0 |
| P6-02 | Cluster workflow persistence (`SqlMessageStorage`, `SqlRunnerStorage`, sharded runners) | `.repos/effect-ontology/packages/@core-v2/src/Runtime/Persistence/PostgresLayer.ts` | `packages/knowledge/server/src/Workflow/WorkflowPersistence.ts`, `packages/knowledge/server/src/Workflow/DurableActivities.ts`, `packages/knowledge/server/test/Workflow/DurableActivities.test.ts` | DIVERGENCE | P0 |
| P6-03 | Unified EventBus service (durable/event journal + job queue abstraction) | `.repos/effect-ontology/packages/@core-v2/src/Service/EventBus.ts` | `packages/knowledge/server/src/Service/EventBus.ts`, `packages/knowledge/server/test/Service/EventBus.test.ts` | DIVERGENCE | P1 |
| P6-04 | Storage service abstraction (GCS/local/memory, signed URLs, generation preconditions) | `.repos/effect-ontology/packages/@core-v2/src/Service/Storage.ts` | `packages/knowledge/server/src/Service/Storage.ts`, `packages/knowledge/server/test/Service/Storage.test.ts` | DIVERGENCE | P1 |
| P6-05 | Ontology registry service (multi-ontology resolution by ID/IRI/path) | `.repos/effect-ontology/packages/@core-v2/src/Service/OntologyRegistry.ts` | `packages/knowledge/server/src/Service/OntologyRegistry.ts`, `packages/knowledge/server/test/Service/OntologyRegistry.test.ts` | FULL | P1 |
| P6-06 | Document classification preprocessing | `.repos/effect-ontology/packages/@core-v2/src/Service/DocumentClassifier.ts` | No classifier in `packages/knowledge/server/src` | GAP | P1 |
| P6-07 | Content enrichment agent | `.repos/effect-ontology/packages/@core-v2/src/Service/ContentEnrichmentAgent.ts` | No enrichment agent in `packages/knowledge/server/src` | GAP | P2 |
| P6-08 | Reconciliation service (Wikidata matching + review queue) | `.repos/effect-ontology/packages/@core-v2/src/Service/ReconciliationService.ts` | No reconciliation service in `packages/knowledge/server/src` | GAP | P2 |
| P6-09 | LLM resilience parity (circuit breaker + retry wrapper + fallback provider chain) | `.repos/effect-ontology/packages/@core-v2/src/Runtime/CircuitBreaker.ts`, `Service/LlmWithRetry.ts`, `Service/EmbeddingFallback.ts` | `packages/knowledge/server/src/LlmControl/LlmResilience.ts`, `packages/knowledge/server/src/Extraction/{MentionExtractor,EntityExtractor,RelationExtractor}.ts`, `packages/knowledge/server/src/GraphRAG/GroundedAnswerGenerator.ts`, `packages/knowledge/server/src/Sparql/SparqlGenerator.ts`, `packages/knowledge/server/test/Resilience/LlmResilience.test.ts` | DIVERGENCE | P1 |
| P6-10 | Workflow composition bundles parity | `.repos/effect-ontology/packages/@core-v2/src/Runtime/WorkflowLayers.ts` | `packages/knowledge/server/src/Runtime/ServiceBundles.ts` (LLM-focused bundles only) | PARTIAL | P2 |
| P6-11 | Cross-batch entity resolver parity as standalone service | `.repos/effect-ontology/packages/@core-v2/src/Service/CrossBatchEntityResolver.ts` | Incremental/entity registry flows exist, but no dedicated cross-batch orchestrator service | PARTIAL | P2 |
| P6-12 | Multi-modal/image ingestion path | `.repos/effect-ontology/packages/@core-v2/src/Service/ImageExtractor.ts`, `ImageFetcher.ts`, `ImageBlobStore.ts` | No image pipeline in knowledge slice | GAP | P3 |

## What Phase 5 Already Closed (Do Not Re-open)

| Capability | Status | Evidence |
|---|---|---|
| Named graph APIs + graph-scoped querying | CLOSED | `packages/knowledge/server/src/Rdf/RdfStoreService.ts`, `packages/knowledge/server/src/Sparql/QueryExecutor.ts` |
| PROV-O constants + provenance emission | CLOSED | `packages/knowledge/server/src/Rdf/ProvOConstants.ts`, `packages/knowledge/server/src/Rdf/ProvenanceEmitter.ts` |
| NL-to-SPARQL read-only generation with retries | CLOSED | `packages/knowledge/server/src/Sparql/SparqlGenerator.ts` |
| Token budget service integrations | CLOSED | `packages/knowledge/server/src/LlmControl/TokenBudget.ts` + extractor/GraphRAG integrations |
| Layer bundles baseline | CLOSED | `packages/knowledge/server/src/Runtime/ServiceBundles.ts` |

## Recommended Phase 6 Scope

### Required (P0/P1)

1. `P6-01` and `P6-02`: Decide whether to adopt `@effect/workflow` engine parity or formally codify the current custom durable workflow as the project’s accepted architecture.
2. `P6-03`: Add an EventBus abstraction or document explicit non-goal if batch/event growth stays bounded.
3. `P6-04` and `P6-05`: Add Storage + Ontology Registry services if multi-ontology and remote artifact workflows are expected.
4. `P6-09`: Add circuit breaker + retry/fallback wrappers for LLM/embedding calls.

### Optional (P2/P3)

1. `P6-06` through `P6-08`: Classifier/enrichment/reconciliation for richer ingestion quality.
2. `P6-10` and `P6-11`: Broader runtime bundle and cross-batch orchestration cleanup.
3. `P6-12`: Multi-modal ingestion (future spec candidate).

## Acceptance Criteria For “Parity Enough”

- All `P0` and `P1` rows are either `FULL` or documented as intentional architectural divergence with tests and operational rationale.
- No unresolved reliability gaps in workflow persistence/recovery for production extraction workloads.
- LLM call path has bounded failure behavior (timeouts + rate limits + breaker/retry strategy).
- Multi-ontology support decision is explicit: implemented or deferred with clear constraints.

## Phase 6 Resolution Notes (P0/P1)

- `P6-01`/`P6-02`: intentional divergence from `@effect/workflow` and cluster runner storage. The current custom workflow path is retained, with reliability parity hardening:
  - input-aware replay matching
  - per-attempt activity persistence
  - execution retry counter increments
  - non-overwriting `started_at`
  - catch-all failure status persistence
- `P6-03`: EventBus abstraction implemented with in-memory publish/subscribe + FIFO queue; durable SQL journal queue intentionally deferred.
- `P6-04`: Storage abstraction implemented with optimistic generation checks in memory backend; cloud/durable backends intentionally deferred.
- `P6-05`: Ontology registry support implemented (load/resolve by id/iri/alias).
- `P6-09`: retry + timeout + circuit feedback implemented through shared `withLlmResilience`; provider fallback chain intentionally deferred but extension seam (`recoverWith`) is present.

## Verification Evidence

- `bun run check --filter @beep/knowledge-domain` passed on 2026-02-07.
- `bun run check --filter @beep/knowledge-server` passed on 2026-02-07.
- `bun run lint --filter @beep/knowledge-server` passed on 2026-02-07.
- `bun test packages/knowledge/server/test/Workflow/` passed (`73 pass, 0 fail`) on 2026-02-07.
- `bun test packages/knowledge/server/test/Resilience/` passed (`6 pass, 0 fail`) on 2026-02-07.

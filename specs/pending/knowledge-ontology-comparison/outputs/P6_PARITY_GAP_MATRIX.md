# Phase 6 Parity Gap Matrix (Reconciled Post-Workflow Migration)

**Spec**: `knowledge-ontology-comparison`  
**Date**: 2026-02-08  
**Baseline**: Post-Phase 7 (capability parity acceleration applied) + completed `knowledge-effect-workflow-migration` (P5 legacy removal)

## Purpose

This matrix is a **current-state parity checkpoint** against `.repos/effect-ontology/packages/@core-v2/src` after Phase 7 reconciliation work. It replaces assumptions from older matrices that predate current Workflow/Validation/Sparql/Rdf changes in `packages/knowledge/*`.

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
| Batch/workflow orchestration | FULL | `@effect/workflow` engine paths are active and legacy runtime artifacts are removed |
| LLM control plane | FULL | Retry + timeout + circuit feedback + fallback chains for LanguageModel and EmbeddingModel implemented |
| Content enrichment + external reconciliation | FULL | Document classifier + enrichment + Wikidata reconciliation implemented with tests |
| Multi-ontology registry + storage abstraction | DIVERGENCE | Registry + storage abstraction implemented with memory-first backends; cloud/durable backends deferred |

## Capability Matrix (Prioritized)

| ID | Capability (effect-ontology) | Reference Evidence | knowledge-slice Evidence | Status | Priority |
|---|---|---|---|---|---|
| P6-01 | Durable workflow engine via `@effect/workflow` (`Workflow.make`, workflow polling/suspension) | `.repos/effect-ontology/packages/@core-v2/src/Service/WorkflowOrchestrator.ts` | `packages/knowledge/server/src/Workflow/ExtractionWorkflow.ts`, `packages/knowledge/server/src/Workflow/BatchOrchestrator.ts`, `packages/knowledge/server/src/Runtime/WorkflowRuntime.ts`, `specs/completed/knowledge-effect-workflow-migration/outputs/P4_PARITY_VALIDATION.md` | FULL | P0 |
| P6-02 | Cluster workflow persistence (`SqlMessageStorage`, `SqlRunnerStorage`, sharded runners) | `.repos/effect-ontology/packages/@core-v2/src/Runtime/Persistence/PostgresLayer.ts` | `packages/knowledge/server/src/Runtime/WorkflowRuntime.ts`, `packages/knowledge/server/src/Workflow/WorkflowPersistence.ts`, `packages/knowledge/server/test/Workflow/WorkflowPersistence.singleNodeSemantics.test.ts` | DIVERGENCE | P0 |
| P6-03 | Unified EventBus service (durable/event journal + job queue abstraction) | `.repos/effect-ontology/packages/@core-v2/src/Service/EventBus.ts` | `packages/knowledge/server/src/Service/EventBus.ts`, `packages/knowledge/server/test/Service/EventBus.test.ts` | FULL | P1 |
| P6-04 | Storage service abstraction (GCS/local/memory, signed URLs, generation preconditions) | `.repos/effect-ontology/packages/@core-v2/src/Service/Storage.ts` | `packages/knowledge/server/src/Service/Storage.ts`, `packages/knowledge/server/test/Service/{Storage,StorageLocal,StorageSql}.test.ts` | DIVERGENCE | P1 |
| P6-05 | Ontology registry service (multi-ontology resolution by ID/IRI/path) | `.repos/effect-ontology/packages/@core-v2/src/Service/OntologyRegistry.ts` | `packages/knowledge/server/src/Service/OntologyRegistry.ts`, `packages/knowledge/server/test/Service/OntologyRegistry.test.ts` | FULL | P1 |
| P6-06 | Document classification preprocessing | `.repos/effect-ontology/packages/@core-v2/src/Service/DocumentClassifier.ts` | `packages/knowledge/server/src/Service/DocumentClassifier.ts`, `packages/knowledge/server/test/Service/DocumentClassifier.test.ts` | FULL | P1 |
| P6-07 | Content enrichment agent | `.repos/effect-ontology/packages/@core-v2/src/Service/ContentEnrichmentAgent.ts` | `packages/knowledge/server/src/Service/ContentEnrichmentAgent.ts`, `packages/knowledge/server/test/Service/ContentEnrichmentAgent.test.ts` | FULL | P2 |
| P6-08 | Reconciliation service (Wikidata matching + review queue) | `.repos/effect-ontology/packages/@core-v2/src/Service/ReconciliationService.ts` | `packages/knowledge/server/src/Service/{ReconciliationService,WikidataClient}.ts`, `packages/knowledge/server/test/Service/ReconciliationService.test.ts` | FULL | P2 |
| P6-09 | LLM resilience parity (circuit breaker + retry wrapper + fallback provider chain) | `.repos/effect-ontology/packages/@core-v2/src/Runtime/CircuitBreaker.ts`, `Service/LlmWithRetry.ts`, `Service/EmbeddingFallback.ts` | `packages/knowledge/server/src/LlmControl/{LlmResilience,FallbackLanguageModel}.ts`, `packages/knowledge/server/src/Embedding/{EmbeddingResilience,FallbackEmbeddingModel}.ts`, `packages/knowledge/server/test/Resilience/{LlmResilience,EmbeddingFallback}.test.ts` | FULL | P1 |
| P6-10 | Workflow composition bundles parity | `.repos/effect-ontology/packages/@core-v2/src/Runtime/WorkflowLayers.ts` | `packages/knowledge/server/src/Runtime/ServiceBundles.ts` (LLM-focused bundles only) | PARTIAL | P2 |
| P6-11 | Cross-batch entity resolver parity as standalone service | `.repos/effect-ontology/packages/@core-v2/src/Service/CrossBatchEntityResolver.ts` | `packages/knowledge/server/src/Service/CrossBatchEntityResolver.ts`, `packages/knowledge/server/test/Service/CrossBatchEntityResolver.test.ts` | FULL | P2 |
| P6-12 | Multi-modal/image ingestion path | `.repos/effect-ontology/packages/@core-v2/src/Service/ImageExtractor.ts`, `ImageFetcher.ts`, `ImageBlobStore.ts` | No image pipeline in knowledge slice | GAP | P3 |

## What Phase 5 Already Closed (Do Not Re-open)

| Capability | Status | Evidence |
|---|---|---|
| Named graph APIs + graph-scoped querying | CLOSED | `packages/knowledge/server/src/Rdf/RdfStoreService.ts`, `packages/knowledge/server/src/Sparql/QueryExecutor.ts` |
| PROV-O constants + provenance emission | CLOSED | `packages/knowledge/server/src/Rdf/ProvOConstants.ts`, `packages/knowledge/server/src/Rdf/ProvenanceEmitter.ts` |
| NL-to-SPARQL read-only generation with retries | CLOSED | `packages/knowledge/server/src/Sparql/SparqlGenerator.ts` |
| Token budget service integrations | CLOSED | `packages/knowledge/server/src/LlmControl/TokenBudget.ts` + extractor/GraphRAG integrations |
| Layer bundles baseline | CLOSED | `packages/knowledge/server/src/Runtime/ServiceBundles.ts` |

## Remaining High-Value Scope (Post-Phase 7)

### Required (P0/P1)

1. `P6-02`: Confirm/lock in cluster persistence divergence stance (or implement) with production-grade evidence.
2. `P6-04`: Tighten divergence rationale and operational evidence for signed URLs / cloud storage backends (or implement).

### Optional (P2/P3)

1. `P6-10`: Bundle parity uplift (widen service bundles where warranted).
2. `P6-12`: Multi-modal ingestion (future spec candidate).

## Acceptance Criteria For “Parity Enough”

- All `P0` and `P1` rows are either `FULL` or documented as intentional architectural divergence with tests and operational rationale.
- No unresolved reliability gaps in workflow persistence/recovery for production extraction workloads.
- LLM call path has bounded failure behavior (timeouts + rate limits + breaker/retry strategy).
- Multi-ontology support decision is explicit: implemented or deferred with clear constraints.

## Phase 6+ Resolution Notes (P0/P1)

- `P6-01`: workflow engine parity is now present through active `@effect/workflow` orchestration paths.
- `P6-02`: SQL-backed *single-node* durable workflow engine is available (`engine-durable-sql`), but multi-runner sharded persistence remains out of scope (still diverges from full cluster runner semantics).
- `P6-03`: EventBus abstraction implemented with both in-memory and durable backends (EventJournal + PersistedQueue), including SQL layers.
- `P6-04`: Storage abstraction implemented with memory/local/sqlite backends and optimistic generation preconditions; signed URLs + cloud object storage support intentionally deferred.
- `P6-05`: Ontology registry support implemented (load/resolve by id/iri/alias).
- `P6-09`: retry + timeout + circuit feedback implemented through shared resilience wrappers; provider fallback chains are implemented for both LanguageModel and EmbeddingModel.

## Verification Evidence

- `bun run check --filter @beep/knowledge-domain` passed on 2026-02-08.
- `bun run check --filter @beep/knowledge-server` passed on 2026-02-08.
- `bun run lint --filter @beep/knowledge-server` passed on 2026-02-08.
- `bun test packages/knowledge/server/test/Workflow/` passed (`16 pass, 0 fail`) on 2026-02-08.
- `bun test packages/knowledge/server/test/Resilience/` passed (`14 pass, 0 fail`) on 2026-02-08.
- `bun test packages/knowledge/server/test/Service/` passed (`35 pass, 0 fail`) on 2026-02-08.
- `bun test packages/knowledge/server/test/Extraction/` passed (`28 pass, 0 fail`) on 2026-02-08.
- `bun test packages/knowledge/server/test/EntityResolution/` passed (`40 pass, 0 fail`) on 2026-02-08.
- `bun test packages/knowledge/server/test/GraphRAG/` passed (`144 pass, 0 fail`) on 2026-02-08.

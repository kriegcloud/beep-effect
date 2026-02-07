# Comparison Matrix (Reconciled)

**Spec**: `knowledge-ontology-comparison`  
**Date**: 2026-02-07  
**Baseline**: Post-Phase 6 + completed `knowledge-effect-workflow-migration` (P5 legacy removal)

## Purpose

This matrix reconciles prior stale comparisons with the current implementation state in `packages/knowledge/*` and keeps parity status aligned to `P6_PARITY_GAP_MATRIX.md`.

## Legend

- `FULL`: capability exists with functionally equivalent behavior
- `PARTIAL`: capability exists but narrower than reference
- `GAP`: capability not implemented in knowledge slice
- `DIVERGENCE`: intentional architectural difference

## High-Level Snapshot

| Area | Status | Notes |
|---|---|---|
| SPARQL read/query stack | FULL | SELECT/ASK/CONSTRUCT/DESCRIBE + NL->SPARQL read-only path present |
| RDF + named graphs + provenance | FULL | Named graph lifecycle + PROV emission implemented |
| SHACL + reasoning | PARTIAL | Core capability exists with narrower envelope than reference |
| Batch/workflow orchestration | FULL | `@effect/workflow` engine paths active; legacy runtime removed |
| LLM control plane | DIVERGENCE | Retry/timeout/circuit present; fallback chain remains deferred |
| Content enrichment + external reconciliation | GAP | Classifier/enrichment/reconciliation still missing |
| Multi-ontology registry + storage abstraction | DIVERGENCE | In-memory-first backends; cloud/durable variants deferred |

## Capability Matrix (Prioritized)

| ID | Capability (effect-ontology) | Reference Evidence | knowledge-slice Evidence | Status | Priority |
|---|---|---|---|---|---|
| P6-01 | Durable workflow engine via `@effect/workflow` (`Workflow.make`, workflow polling/suspension) | `.repos/effect-ontology/packages/@core-v2/src/Service/WorkflowOrchestrator.ts` | `packages/knowledge/server/src/Workflow/ExtractionWorkflow.ts`, `packages/knowledge/server/src/Workflow/BatchOrchestrator.ts`, `packages/knowledge/server/src/Runtime/WorkflowRuntime.ts`, `specs/completed/knowledge-effect-workflow-migration/outputs/P4_PARITY_VALIDATION.md` | FULL | P0 |
| P6-02 | Cluster workflow persistence (`SqlMessageStorage`, `SqlRunnerStorage`, sharded runners) | `.repos/effect-ontology/packages/@core-v2/src/Runtime/Persistence/PostgresLayer.ts` | `packages/knowledge/server/src/Workflow/WorkflowPersistence.ts`, `specs/completed/knowledge-effect-workflow-migration/outputs/P5_LEGACY_REMOVAL_REPORT.md` | DIVERGENCE | P0 |
| P6-03 | Unified EventBus service (durable/event journal + job queue abstraction) | `.repos/effect-ontology/packages/@core-v2/src/Service/EventBus.ts` | `packages/knowledge/server/src/Service/EventBus.ts`, `packages/knowledge/server/test/Service/EventBus.test.ts` | DIVERGENCE | P1 |
| P6-04 | Storage service abstraction (GCS/local/memory, signed URLs, generation preconditions) | `.repos/effect-ontology/packages/@core-v2/src/Service/Storage.ts` | `packages/knowledge/server/src/Service/Storage.ts`, `packages/knowledge/server/test/Service/Storage.test.ts` | DIVERGENCE | P1 |
| P6-05 | Ontology registry service (multi-ontology resolution by ID/IRI/path) | `.repos/effect-ontology/packages/@core-v2/src/Service/OntologyRegistry.ts` | `packages/knowledge/server/src/Service/OntologyRegistry.ts`, `packages/knowledge/server/test/Service/OntologyRegistry.test.ts` | FULL | P1 |
| P6-06 | Document classification preprocessing | `.repos/effect-ontology/packages/@core-v2/src/Service/DocumentClassifier.ts` | No classifier in `packages/knowledge/server/src` | GAP | P1 |
| P6-07 | Content enrichment agent | `.repos/effect-ontology/packages/@core-v2/src/Service/ContentEnrichmentAgent.ts` | No enrichment agent in `packages/knowledge/server/src` | GAP | P2 |
| P6-08 | Reconciliation service (Wikidata matching + review queue) | `.repos/effect-ontology/packages/@core-v2/src/Service/ReconciliationService.ts` | No reconciliation service in `packages/knowledge/server/src` | GAP | P2 |
| P6-09 | LLM resilience parity (circuit breaker + retry wrapper + fallback provider chain) | `.repos/effect-ontology/packages/@core-v2/src/Runtime/CircuitBreaker.ts`, `Service/LlmWithRetry.ts`, `Service/EmbeddingFallback.ts` | `packages/knowledge/server/src/LlmControl/LlmResilience.ts`, `packages/knowledge/server/src/Extraction/{MentionExtractor,EntityExtractor,RelationExtractor}.ts`, `packages/knowledge/server/src/GraphRAG/GroundedAnswerGenerator.ts`, `packages/knowledge/server/src/Sparql/SparqlGenerator.ts`, `packages/knowledge/server/test/Resilience/LlmResilience.test.ts` | DIVERGENCE | P1 |
| P6-10 | Workflow composition bundles parity | `.repos/effect-ontology/packages/@core-v2/src/Runtime/WorkflowLayers.ts` | `packages/knowledge/server/src/Runtime/ServiceBundles.ts`, `packages/knowledge/server/test/Resilience/TokenBudgetAndBundles.test.ts` | PARTIAL | P2 |
| P6-11 | Cross-batch entity resolver parity as standalone service | `.repos/effect-ontology/packages/@core-v2/src/Service/CrossBatchEntityResolver.ts` | Incremental/entity registry flows exist, but no dedicated cross-batch orchestrator service | PARTIAL | P2 |
| P6-12 | Multi-modal/image ingestion path | `.repos/effect-ontology/packages/@core-v2/src/Service/ImageExtractor.ts`, `ImageFetcher.ts`, `ImageBlobStore.ts` | No image pipeline in knowledge slice | GAP | P3 |

## Summary Counts

| Status | Count |
|---|---|
| FULL | 2 |
| PARTIAL | 2 |
| DIVERGENCE | 4 |
| GAP | 4 |
| Total Rows | 12 |

## Notes

- This reconciled matrix intentionally supersedes stale rows that referenced deleted workflow artifacts (for example, `DurableActivities.ts`).
- Detailed implementation planning should follow `IMPLEMENTATION_ROADMAP.md` and execution should log evidence in `P7_PARITY_CLOSURE_REPORT.md`.

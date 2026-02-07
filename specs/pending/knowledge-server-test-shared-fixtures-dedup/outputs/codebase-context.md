# Codebase Context (Phase 1)

## Duplication Families

### Family A: GraphRAG repeated entity/relation fixture builders + stable test IDs

Observed duplicates:
- Fixed Knowledge IDs repeated verbatim:
  - `packages/knowledge/server/test/GraphRAG/PromptTemplates.test.ts:20`
  - `packages/knowledge/server/test/GraphRAG/CitationParser.test.ts:16`
  - `packages/knowledge/server/test/GraphRAG/ConfidenceScorer.test.ts:18`
  - `packages/knowledge/server/test/GraphRAG/GroundedAnswerGenerator.test.ts:34`
  - `packages/knowledge/server/test/GraphRAG/AnswerSchemas.test.ts:9`
- Graph context fixture constructors:
  - `createTestEntity` / `createTestRelation` in `packages/knowledge/server/test/GraphRAG/PromptTemplates.test.ts:28`
  - `createTestContext` in `packages/knowledge/server/test/GraphRAG/GroundedAnswerGenerator.test.ts:42`
- Domain entity/relation fixture constructors:
  - `createMockEntity` / `createMockEntityWithId` / `createMockRelation` in `packages/knowledge/server/test/GraphRAG/ContextFormatter.test.ts:33`

Why this is a dedup candidate:
- Same concepts are re-instantiated with minor shape differences.
- Any ID format evolution or common fixture changes require multi-file updates.

### Family B: LLM test doubles duplicated across GraphRAG + Sparql

Observed duplicates:
- Text response envelope + `LanguageModel` provisioning:
  - `buildTextResponse` and `withTextLanguageModel` in `packages/knowledge/server/test/GraphRAG/GroundedAnswerGenerator.test.ts:56`
  - same pattern in `packages/knowledge/server/test/Sparql/SparqlGenerator.test.ts:23`
- Existing shared baseline already present:
  - `withLanguageModel` and related variants in `packages/knowledge/server/test/_shared/TestLayers.ts:37`

Why this is a dedup candidate:
- Duplicates already overlap with existing `_shared` abstractions.
- Common mock behavior (text/JSON response parts, usage fields) can be centralized with narrow helper APIs.

### Family C: Repeated test layer assembly recipes

Observed duplicates:
- RDF stack layer (same composition appears twice):
  - `packages/knowledge/server/test/Rdf/integration.test.ts:15`
  - `packages/knowledge/server/test/Rdf/benchmark.test.ts:11`
- RdfStore-backed single-service patterns:
  - `packages/knowledge/server/test/Rdf/Serializer.test.ts:14`
  - `packages/knowledge/server/test/Rdf/RdfBuilder.test.ts:28`
  - `packages/knowledge/server/test/Rdf/ProvenanceEmitter.test.ts:20`
- Similar graph/store/parser composition in Sparql:
  - `packages/knowledge/server/test/Sparql/SparqlGenerator.test.ts:21`
  - `packages/knowledge/server/test/Sparql/SparqlService.test.ts:118`
- Repeated workflow runtime wiring:
  - `Layer.mergeAll(persistenceLayer, pipelineLayer, WorkflowEngine.layerMemory)` in `packages/knowledge/server/test/Workflow/ExtractionWorkflow.test.ts:91`

Why this is a dedup candidate:
- Composition is mostly mechanical and can be expressed with prebuilt named layer builders.
- Repeated manual merges make intent harder to scan in tests.

### Family D: Service mock builders and in-memory harnesses

Observed duplicates:
- GraphRAG service mocks:
  - `createMockSparqlService` and `createMockReasonerService` in `packages/knowledge/server/test/GraphRAG/CitationValidator.test.ts:40`
- Workflow persistence test harness:
  - `makePersistence` in `packages/knowledge/server/test/Workflow/ExtractionWorkflow.test.ts:31`
  - inline persistence shape in `packages/knowledge/server/test/Workflow/BatchOrchestratorEngineParity.test.ts:117`
- Gmail adapter mock stack:
  - `MockGoogleAuthClient`, `MockGoogleAuthClientMissingScopes`, `makeHttpClientMock` in `packages/knowledge/server/test/adapters/GmailExtractionAdapter.test.ts:29`

Why this is a dedup candidate:
- Same mock-construction idioms repeat with only scenario inputs changed.
- Centralized builders can keep behavior explicit while reducing boilerplate.

## Candidate Shared Module Map

| Family | Proposed `_shared` module | Candidate exports | Initial call sites |
|---|---|---|---|
| A | `packages/knowledge/server/test/_shared/GraphFixtures.ts` | `graphRagFixtureIds`, `makeGraphContextEntity`, `makeGraphContextRelation`, `makeGraphContext`, `makeDomainEntity`, `makeDomainRelation` | GraphRAG tests under `packages/knowledge/server/test/GraphRAG/*.test.ts` |
| B | `packages/knowledge/server/test/_shared/TestLayers.ts` (extend existing) | `buildTextResponseParts`, `withTextLanguageModel`, optional `withJsonLanguageModel` thin wrappers over existing `withLanguageModel` | `packages/knowledge/server/test/GraphRAG/GroundedAnswerGenerator.test.ts`, `packages/knowledge/server/test/Sparql/SparqlGenerator.test.ts` |
| C | `packages/knowledge/server/test/_shared/LayerBuilders.ts` | `makeRdfBuilderSerializerLayer`, `makeRdfStoreBackedLayer`, `makeSparqlGeneratorLayer`, `makeWorkflowExtractionLayer` | RDF/Sparql/Workflow tests listed in Family C |
| D | `packages/knowledge/server/test/_shared/ServiceMocks.ts` | `makeMockSparqlService`, `makeMockReasonerService`, `makeWorkflowPersistenceRecorder`, `makeGoogleAuthClientMock`, `makeHttpClientMock` | `GraphRAG/CitationValidator.test.ts`, `Workflow/*`, `adapters/GmailExtractionAdapter.test.ts` |

## Migration Difficulty Ranking

1. Low: Family B (`withTextLanguageModel` + response part builder)
Reason: behavior already close to existing `withLanguageModel` in `packages/knowledge/server/test/_shared/TestLayers.ts:37`.

2. Low-Medium: Family C (RDF stack `TestLayer` recipe)
Reason: exact duplicates in `packages/knowledge/server/test/Rdf/integration.test.ts:15` and `packages/knowledge/server/test/Rdf/benchmark.test.ts:11`.

3. Medium: Family A (Graph fixtures + fixed IDs)
Reason: two shape domains exist (`GraphContext*` vs full `Entity/Relation` models), so shared API should avoid over-generalization.

4. Medium-High: Family D (service mocks/harnesses)
Reason: call sites rely on scenario-specific behavior injection (query matching, workflow status capture, HTTP routing).

## Intentional Non-Dedup Exceptions

- Keep Gmail response payload fixtures local in `packages/knowledge/server/test/adapters/GmailExtractionAdapter.test.ts`.
Reason: message/thread payloads are test narratives, not reusable infrastructure.

- Keep benchmark-specific perf helpers local in `packages/knowledge/server/test/Rdf/benchmark.test.ts`.
Reason: thresholds and logging are benchmark contract definitions, not general fixtures.

- Keep `sparqlServiceLayer` local in `packages/knowledge/server/test/Sparql/SparqlService.test.ts:34`.
Reason: this layer encodes assertions about query-type dispatch behavior specific to that file.

- Keep `createInferenceResultWithRelation` local in `packages/knowledge/server/test/GraphRAG/CitationValidator.test.ts:67`.
Reason: it captures relation-depth confidence semantics that are tightly coupled to validation assertions.

## Risks

- API bloat risk: a single mega helper file would reduce readability. Mitigation: keep modules split by concern (`GraphFixtures`, `LayerBuilders`, `ServiceMocks`).
- Semantic drift risk during migration: helpers that look similar may encode different defaults (especially timestamps, IDs, and relation row IDs). Mitigation: preserve explicit overrides and migrate in small batches.
- Type-safety risk: shared factories for `Entity.Model`/`Relation.Model` can invite unsafe casts. Mitigation: build from schema-valid constructors and keep no `any`/unchecked casts.
- Effect-layer lifecycle risk: abstracting layers can accidentally hide dependency order. Mitigation: expose small named builder functions that still show `Layer.mergeAll` / `Layer.provideMerge` intent.

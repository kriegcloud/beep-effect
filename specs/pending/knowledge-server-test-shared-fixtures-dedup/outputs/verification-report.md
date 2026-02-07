# Phase 4 Verification Report: Knowledge Server Test Shared Fixtures Dedup

Date: 2026-02-07

## Verification Commands Run (Repo Root)

1. `bun run check`
   - Status: PASS
   - Notes: `tsc` emits advisory `TS44 effect(preferSchemaOverJson)` messages in a few tests (e.g. `packages/knowledge/server/test/Service/OntologyRegistry.test.ts`), but they do not fail the build.

2. `bun run lint`
   - Status: PASS

3. `bun run test`
   - Status: PASS

Additional targeted runs used during stabilization:

- `bun test packages/knowledge/server/test/adapters/GmailExtractionAdapter.test.ts` (PASS)
- `bun test packages/knowledge/server/test/Service/EventBus.test.ts` (PASS)
- `bun test packages/knowledge/server/test/GraphRAG packages/knowledge/server/test/Rdf packages/knowledge/server/test/Sparql/SparqlGenerator.test.ts packages/knowledge/server/test/Workflow packages/knowledge/server/test/adapters/GmailExtractionAdapter.test.ts` (PASS)

## Rollbacks / Quarantine Applied (Prod Drift Containment)

This spec is test-only. The repo had unrelated production drift that blocked `bun run check`.

Actions taken:

- Reverted tracked diffs back to `HEAD` (examples):
  - `packages/knowledge/server/src/Service/index.ts`
  - `packages/knowledge/server/src/Extraction/ExtractionPipeline.ts`
  - `packages/knowledge/server/src/EntityResolution/IncrementalClustererLive.ts`

- Quarantined untracked production files out of compilation by moving them into spec outputs:
  - moved from `packages/knowledge/server/src/Service/*.ts`
  - to `specs/pending/knowledge-server-test-shared-fixtures-dedup/outputs/quarantined-production-drift/<timestamp>/`

Rationale:
- These files were outside spec scope and introduced `exactOptionalPropertyTypes` failures.
- Keeping them under `outputs/` preserves the artifact for later recovery without impacting compilation.

## Shared Helper Adoption Map

### `packages/knowledge/server/test/_shared/TestLayers.ts`

Exports and call sites:

- `withTextLanguageModel`
  - `packages/knowledge/server/test/GraphRAG/GroundedAnswerGenerator.test.ts`
  - `packages/knowledge/server/test/Sparql/SparqlGenerator.test.ts`

- `withLanguageModel`
  - `packages/knowledge/server/test/Extraction/EntityExtractor.test.ts` (pre-existing usage)
  - `packages/knowledge/server/test/Extraction/MentionExtractor.test.ts` (pre-existing usage)
  - `packages/knowledge/server/test/Extraction/RelationExtractor.test.ts` (pre-existing usage)

- `createMockOntologyContext`
  - `packages/knowledge/server/test/Extraction/EntityExtractor.test.ts` (pre-existing usage)
  - `packages/knowledge/server/test/Extraction/RelationExtractor.test.ts` (pre-existing usage)

Other exports (`buildTextResponseParts`, `createMockLlmWithResponse`, `createFailingMockLlm`, `createTrackingMockLlm`) are currently internal helpers or available for future tests, but were not required for the migrated call sites.

### `packages/knowledge/server/test/_shared/LayerBuilders.ts`

Exports and call sites:

- `makeRdfBuilderSerializerLayer`
  - `packages/knowledge/server/test/Rdf/integration.test.ts`
  - `packages/knowledge/server/test/Rdf/benchmark.test.ts`

- `makeSparqlGeneratorLayer`
  - `packages/knowledge/server/test/Sparql/SparqlGenerator.test.ts`

- `makeExtractionWorkflowTestLayer`
  - `packages/knowledge/server/test/Workflow/ExtractionWorkflow.test.ts`

### `packages/knowledge/server/test/_shared/GraphFixtures.ts`

Exports and call sites:

- `graphRagFixtureIds`
  - `packages/knowledge/server/test/GraphRAG/AnswerSchemas.test.ts`
  - `packages/knowledge/server/test/GraphRAG/CitationParser.test.ts`
  - `packages/knowledge/server/test/GraphRAG/ConfidenceScorer.test.ts`
  - `packages/knowledge/server/test/GraphRAG/GroundedAnswerGenerator.test.ts`
  - `packages/knowledge/server/test/GraphRAG/PromptTemplates.test.ts`

- `makeGraphContextEntity`, `makeGraphContextRelation`
  - `packages/knowledge/server/test/GraphRAG/GroundedAnswerGenerator.test.ts`
  - `packages/knowledge/server/test/GraphRAG/PromptTemplates.test.ts`

- `makeGraphContext`
  - `packages/knowledge/server/test/GraphRAG/GroundedAnswerGenerator.test.ts`

- `makeDomainEntity`, `makeDomainRelation`
  - `packages/knowledge/server/test/GraphRAG/ContextFormatter.test.ts`

### `packages/knowledge/server/test/_shared/ServiceMocks.ts`

Exports and call sites:

- `makeMockSparqlServiceLayer`, `makeMockReasonerServiceLayer`
  - `packages/knowledge/server/test/GraphRAG/CitationValidator.test.ts`

- `makeWorkflowPersistenceShape`, `WorkflowStatusUpdate`
  - `packages/knowledge/server/test/Workflow/ExtractionWorkflow.test.ts`
  - `packages/knowledge/server/test/Workflow/BatchOrchestratorEngineParity.test.ts`

- `makeGoogleAuthClientLayer`, `makeHttpClientMockLayer`
  - `packages/knowledge/server/test/adapters/GmailExtractionAdapter.test.ts`

Implementation note:
- `makeHttpClientMockLayer` uses `HttpClient.makeWith(...)` to avoid Bun test environments where `globalThis.location` can cause `InvalidUrl` errors during URL reconstruction inside `HttpClient.make(...)`.

## Preserved Non-Dedup Exceptions (Confirmed Local)

These remain intentionally local, as specified in `handoffs/HANDOFF_P4.md` and `outputs/remediation-plan.md`:

- Gmail narrative payload fixtures remain local:
  - `packages/knowledge/server/test/adapters/GmailExtractionAdapter.test.ts`

- Benchmark/perf helpers remain local:
  - `packages/knowledge/server/test/Rdf/benchmark.test.ts`

- Local `sparqlServiceLayer` remains local:
  - `packages/knowledge/server/test/Sparql/SparqlService.test.ts`

- Local inference helper remains local:
  - `packages/knowledge/server/test/GraphRAG/CitationValidator.test.ts` (`createInferenceResultWithRelation`)

## Additional Stabilization (Test-Only)

- `packages/knowledge/server/test/Service/EventBus.test.ts`
  - Fixed timeouts caused by publish-before-subscribe races by waiting for the subscriber fiber to reach a suspended state prior to publishing.
  - No production changes; assertions remain equivalent (still validates topic/payload/sequence behavior).

## Anti-Regression Guardrails (Documentation-Level)

When adding or modifying knowledge-server tests under `packages/knowledge/server/test/**`:

1. Prefer `_shared` helpers:
   - Before adding local helper factories or layer wiring, check `packages/knowledge/server/test/_shared/*`.

2. Keep `_shared` modules single-purpose:
   - Add graph fixtures to `GraphFixtures.ts`, layer recipes to `LayerBuilders.ts`, service mocks to `ServiceMocks.ts`, LLM doubles to `TestLayers.ts`.
   - Avoid introducing new grab-bag utility files.

3. Only extract when behavior is truly shared:
   - Scenario payloads and narrative fixtures (e.g., complex Gmail message fixtures) stay local unless they become reused across multiple tests.

4. Shared helper bar:
   - New `_shared` helpers should generally have at least 2 call sites at introduction, unless they are a foundational builder required to dedup an existing family.


# Phase 4 Verification Report: Knowledge Server Test Shared Fixtures Dedup

Date: 2026-02-07

## Verification Commands Run (Repo Root)

1. `bun run check`
   - Status: PASS
   - Notes: `tsc` emits advisory Effect TS plugin messages (e.g. `TS44 effect(preferSchemaOverJson)` in a few test files). These do not fail the check gate.

2. `bun run lint`
   - Status: PASS
   - Notes: Biome may report warnings in unrelated packages (e.g. `noDangerouslySetInnerHtml`), but `bun run lint` exits successfully.

3. Targeted tests for dedup-migrated knowledge-server files:
   - Command:
     - `bun test packages/knowledge/server/test/GraphRAG/AnswerSchemas.test.ts packages/knowledge/server/test/GraphRAG/CitationParser.test.ts packages/knowledge/server/test/GraphRAG/CitationValidator.test.ts packages/knowledge/server/test/GraphRAG/ConfidenceScorer.test.ts packages/knowledge/server/test/GraphRAG/ContextFormatter.test.ts packages/knowledge/server/test/GraphRAG/GroundedAnswerGenerator.test.ts packages/knowledge/server/test/GraphRAG/PromptTemplates.test.ts packages/knowledge/server/test/Rdf/integration.test.ts packages/knowledge/server/test/Rdf/benchmark.test.ts packages/knowledge/server/test/Sparql/SparqlGenerator.test.ts packages/knowledge/server/test/Workflow/ExtractionWorkflow.test.ts packages/knowledge/server/test/Workflow/BatchOrchestratorEngineParity.test.ts packages/knowledge/server/test/adapters/GmailExtractionAdapter.test.ts`
   - Status: PASS

4. Full suite:
   - `bun run test`
   - Status: PASS

Worktree note:
- At the end of this Phase 4 run, `git status` showed unrelated local changes outside this spec (e.g. under `packages/knowledge/domain/**` and other `specs/**` outputs). Those are not part of this test-only dedup effort and were not reverted here.

## Known Blocker Status (Prod Drift Containment)

The Phase 4 handoff references unexpected production-code drift and untracked production files under `packages/knowledge/server/src/**`.

In the current repo state at verification time:
- The previously-mentioned production files (e.g. `packages/knowledge/server/src/Service/ContentEnrichmentAgent.ts`) are tracked in git on this branch, so they are not “untracked drift” in this environment.

Result:
- No production rollbacks were applied as part of this Phase 4 verification run.
- The existing `outputs/quarantined-production-drift/` directory was not modified during this run.

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

- `createMockLlmWithResponse`
  - `packages/knowledge/server/test/Service/ContentEnrichmentAgent.test.ts`
  - `packages/knowledge/server/test/Service/DocumentClassifier.test.ts`

- `createFailingMockLlm`
  - `packages/knowledge/server/test/Service/ContentEnrichmentAgent.test.ts`
  - `packages/knowledge/server/test/Service/DocumentClassifier.test.ts`

Notes:
- `buildTextResponseParts` is a shared primitive used by the mock LanguageModel implementation; it is not imported directly by call sites.
- `createTrackingMockLlm` remains available for future tests that need call introspection.

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

No additional stabilization changes were required in this Phase 4 run (verification gates were green as-is).

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

# Evaluation (Phase 2)

## Proposed Shared Module Boundaries

All new helpers stay under `packages/knowledge/server/test/_shared` and remain test-only.

### 1) `GraphFixtures.ts` (new)

Responsibility:
- Canonical GraphRAG fixture IDs reused across GraphRAG tests.
- Focused builders for `GraphContext*` fixtures and domain `Entity/Relation` fixtures.

Primary duplication anchors:
- `packages/knowledge/server/test/GraphRAG/PromptTemplates.test.ts:20`
- `packages/knowledge/server/test/GraphRAG/GroundedAnswerGenerator.test.ts:34`
- `packages/knowledge/server/test/GraphRAG/CitationParser.test.ts:16`
- `packages/knowledge/server/test/GraphRAG/AnswerSchemas.test.ts:9`
- `packages/knowledge/server/test/GraphRAG/ConfidenceScorer.test.ts:18`
- `packages/knowledge/server/test/GraphRAG/ContextFormatter.test.ts:33`

Boundary rule:
- Keep `GraphContext` helpers separate from `Entity.Model` / `Relation.Model` helpers in the same module namespace (same file, separate export groups) to avoid shape confusion.

### 2) `TestLayers.ts` (extend existing)

Responsibility:
- LanguageModel test doubles only.
- Keep the existing `withLanguageModel` as the primitive and add thin text-specific wrappers.

Primary duplication anchors:
- Existing shared base: `packages/knowledge/server/test/_shared/TestLayers.ts:37`
- Duplicates to collapse: `packages/knowledge/server/test/GraphRAG/GroundedAnswerGenerator.test.ts:56`, `packages/knowledge/server/test/Sparql/SparqlGenerator.test.ts:23`

Boundary rule:
- No unrelated layer recipes here; this file stays strictly LLM/provider-mock focused.

### 3) `LayerBuilders.ts` (new)

Responsibility:
- Reusable, explicit layer composition recipes where assembly is mechanical and repeated.

Primary duplication anchors:
- RDF triple recipe duplication: `packages/knowledge/server/test/Rdf/integration.test.ts:15`, `packages/knowledge/server/test/Rdf/benchmark.test.ts:11`
- Similar local assembly style: `packages/knowledge/server/test/Sparql/SparqlGenerator.test.ts:21`, `packages/knowledge/server/test/Workflow/ExtractionWorkflow.test.ts:91`

Boundary rule:
- Export a small set of named builders; do not expose generic “merge arbitrary layers” helpers.

### 4) `ServiceMocks.ts` (new)

Responsibility:
- Reusable service/mock builders for Sparql/Reasoner/Workflow persistence and Gmail auth/http test harness.

Primary duplication anchors:
- GraphRAG validators: `packages/knowledge/server/test/GraphRAG/CitationValidator.test.ts:40`
- Workflow persistence harness: `packages/knowledge/server/test/Workflow/ExtractionWorkflow.test.ts:31`, `packages/knowledge/server/test/Workflow/BatchOrchestratorEngineParity.test.ts:108`
- Gmail adapter mocks: `packages/knowledge/server/test/adapters/GmailExtractionAdapter.test.ts:29`, `packages/knowledge/server/test/adapters/GmailExtractionAdapter.test.ts:72`

Boundary rule:
- Keep scenario payload fixtures local (email/thread narrative payloads are not infra mocks).

## Helper API Contracts (Naming, Parameters, Defaults, Return Types)

### `GraphFixtures.ts`

```ts
export const graphRagFixtureIds: {
  readonly entity1: KnowledgeEntityIds.KnowledgeEntityId.Type;
  readonly entity2: KnowledgeEntityIds.KnowledgeEntityId.Type;
  readonly relation1: KnowledgeEntityIds.RelationId.Type;
};

export interface GraphContextEntityInput {
  readonly id: string;
  readonly mention: string;
  readonly types: ReadonlyArray<string>;
  readonly attributes?: Readonly<Record<string, string>>;
}

export const makeGraphContextEntity: (input: GraphContextEntityInput) => GraphContextEntity;
export const makeGraphContextRelation: (input: {
  readonly id: string;
  readonly subjectId: string;
  readonly predicate: string;
  readonly objectId: string;
}) => GraphContextRelation;

export const makeGraphContext: (input?: {
  readonly entities?: ReadonlyArray<GraphContextEntity>;
  readonly relations?: ReadonlyArray<GraphContextRelation>;
}) => GraphContext;

export interface DomainEntityInput {
  readonly id?: KnowledgeEntityIds.KnowledgeEntityId.Type;
  readonly mention: string;
  readonly types: A.NonEmptyReadonlyArray<string>;
  readonly attributes?: Readonly<Record<string, string>>;
}

export const makeDomainEntity: (input: DomainEntityInput) => Entity.Model;

export interface DomainRelationInput {
  readonly subjectId: KnowledgeEntityIds.KnowledgeEntityId.Type;
  readonly predicate: string;
  readonly objectId?: KnowledgeEntityIds.KnowledgeEntityId.Type;
  readonly literalValue?: string;
  readonly literalType?: string;
}

export const makeDomainRelation: (input: DomainRelationInput) => Relation.Model;
```

Defaults:
- `makeGraphContext` defaults to empty arrays.
- Domain helpers default to generated IDs (`KnowledgeEntityIds.*.create()`), current timestamps (`DateTime.unsafeNow()`), and existing test defaults (e.g. `version: 1`, `source: O.some("test")`) matching `ContextFormatter.test.ts` behavior.

Type-safety guardrails:
- No `any`, no unchecked cast.
- Use existing schema-backed constructors (`new Entity.Model`, `new Relation.Model`) where current tests already rely on them.

### `TestLayers.ts` (additions)

```ts
export interface TextResponsePartsOptions {
  readonly usage?: {
    readonly inputTokens: number;
    readonly outputTokens: number;
    readonly totalTokens: number;
  };
}

export const buildTextResponseParts: (
  text: string,
  options?: TextResponsePartsOptions
) => Array<Response.PartEncoded>;

export const withTextLanguageModel: {
  (text: string, options?: TextResponsePartsOptions):
    <A, E, R>(effect: Effect.Effect<A, E, R>) =>
      Effect.Effect<A, E, Exclude<R, LanguageModel.LanguageModel>>;
  <A, E, R>(
    effect: Effect.Effect<A, E, R>,
    text: string,
    options?: TextResponsePartsOptions
  ): Effect.Effect<A, E, Exclude<R, LanguageModel.LanguageModel>>;
};
```

Design choice:
- `withTextLanguageModel` should delegate to existing `withLanguageModel` by passing `generateObject: () => text` for JSON mode where appropriate, or directly wiring `generateText` text part behavior for exact parity with current tests.
- Keep token usage default aligned with current `defaultUsage` in `packages/knowledge/server/test/_shared/TestLayers.ts:22`.

### `LayerBuilders.ts`

```ts
export const makeRdfBuilderSerializerLayer: () => Layer.Layer<
  RdfBuilder | Serializer | RdfStore,
  never,
  never
>;

export const makeSparqlGeneratorLayer: () => Layer.Layer<
  SparqlGenerator | SparqlParser | RdfStore,
  never,
  never
>;

export const makeExtractionWorkflowTestLayer: (deps: {
  readonly persistenceLayer: Layer.Layer<WorkflowPersistence, never, never>;
  readonly pipelineLayer: Layer.Layer<ExtractionPipeline, never, never>;
}) => Layer.Layer<ExtractionWorkflow, never, never>;
```

Defaults:
- No dynamic defaults needed; each builder encodes the exact existing assembly order.

Naming rule:
- `makeXLayer` naming for zero-arg/parametrized deterministic composition.

### `ServiceMocks.ts`

```ts
export interface MockSparqlServiceConfig {
  readonly knownEntities?: ReadonlyArray<string>;
  readonly knownRelations?: ReadonlyArray<string>;
}

export const makeMockSparqlServiceLayer: (
  config?: MockSparqlServiceConfig
) => Layer.Layer<SparqlService, never, never>;

export const makeMockReasonerServiceLayer: (
  inferenceResult?: InferenceResult
) => Layer.Layer<ReasonerService, never, never>;

export interface WorkflowStatusUpdate {
  readonly id: string;
  readonly status: string;
  readonly updates:
    | {
        readonly output?: Record<string, unknown>;
        readonly error?: string;
        readonly lastActivityName?: string;
      }
    | undefined;
}

export const makeWorkflowPersistenceShape: (
  statusUpdates: Array<WorkflowStatusUpdate>
) => WorkflowPersistenceShape;

export const makeGoogleAuthClientLayer: (options?: {
  readonly missingScopes?: boolean;
}) => Layer.Layer<GoogleAuthClient, never, never>;

export const makeHttpClientMockLayer: (
  handler: (
    request: HttpClientRequest.HttpClientRequest
  ) => Effect.Effect<{ status: number; body: unknown }, never, never>
) => Layer.Layer<HttpClient.HttpClient, never, never>;
```

Defaults:
- `makeMockSparqlServiceLayer` defaults empty known lists.
- `makeMockReasonerServiceLayer` defaults `emptyInferenceResult`.
- `makeGoogleAuthClientLayer` defaults to valid token behavior and switches to scope-expansion error path via `missingScopes: true`.

## Merge-vs-Local Decisions (Family-by-Family)

### Family A (Graph fixtures + IDs): Merge partially

Merge into shared:
- Stable GraphRAG fixture IDs.
- `GraphContext` constructors in `PromptTemplates` + `GroundedAnswerGenerator`.
- Domain entity/relation fixture constructors in `ContextFormatter`.

Keep local:
- Scenario-specific citation text snippets and assertion narratives.

Reason:
- Constructors are structural duplicates; narratives encode test intent and should remain inline.

### Family B (LLM doubles): Merge into existing `TestLayers.ts`

Merge into shared:
- `buildTextResponse`/`withTextLanguageModel` duplicates from `GroundedAnswerGenerator` and `SparqlGenerator`.

Keep local:
- Per-test response text payloads and query strings.

Reason:
- Infrastructure behavior is identical; payload content is intentionally test-specific.

### Family C (Layer assembly recipes): Merge selectively

Merge into shared:
- Repeated RDF layer recipe.
- Sparql generator layer recipe.
- Workflow extraction assembly that composes persistence + pipeline + memory engine.

Keep local:
- `sparqlServiceLayer` in `packages/knowledge/server/test/Sparql/SparqlService.test.ts:34` (already marked as intentional non-dedup).
- Benchmark-specific perf helpers in `packages/knowledge/server/test/Rdf/benchmark.test.ts`.

Reason:
- Mechanical layer wiring should be centralized; assertion-coupled service behavior and perf contracts stay local.

### Family D (Service mocks/harnesses): Merge carefully

Merge into shared:
- Mock Sparql/Reasoner layer builders.
- Workflow persistence recorder shape builder.
- Gmail auth and generic HttpClient mock layer builders.

Keep local:
- Gmail API payload fixtures (`mockMessage*`, `mockThread`, etc.) in `packages/knowledge/server/test/adapters/GmailExtractionAdapter.test.ts`.
- `createInferenceResultWithRelation` in `packages/knowledge/server/test/GraphRAG/CitationValidator.test.ts:67`.

Reason:
- Builder scaffolding duplicates broadly; scenario payloads and relation-depth semantics are assertion-coupled.

## Risk Analysis + Semantic-Equivalence Checks

### Low risk
- Family B LLM wrappers and Family C RDF layer recipe.

Checks:
- Run targeted tests:
  - `bun run test packages/knowledge/server/test/GraphRAG/GroundedAnswerGenerator.test.ts`
  - `bun run test packages/knowledge/server/test/Sparql/SparqlGenerator.test.ts`
  - `bun run test packages/knowledge/server/test/Rdf/integration.test.ts`
  - `bun run test packages/knowledge/server/test/Rdf/benchmark.test.ts`
- Confirm token usage fields and response parts still include one `text` and one `finish` part.

### Medium risk
- Family A domain fixtures and Family C workflow layer builder.

Checks:
- Snapshot-style parity checks in assertions already present (entity/relation counts, confidence values, citation extraction order).
- Verify row-id monotonic behavior for relation fixtures remains deterministic within each test file.
- Run:
  - `bun run test packages/knowledge/server/test/GraphRAG/ContextFormatter.test.ts`
  - `bun run test packages/knowledge/server/test/GraphRAG/PromptTemplates.test.ts`
  - `bun run test packages/knowledge/server/test/Workflow/ExtractionWorkflow.test.ts`

### Medium-high risk
- Family D service mock builders used by Workflow and Gmail tests.

Checks:
- Event/status ordering parity in batch orchestrator tests.
- Gmail scope-expansion failure path still returns `GoogleScopeExpansionRequiredError` with required/missing scopes populated.
- Run:
  - `bun run test packages/knowledge/server/test/Workflow/BatchOrchestratorEngineParity.test.ts`
  - `bun run test packages/knowledge/server/test/adapters/GmailExtractionAdapter.test.ts`

## Intentional Non-Dedup Exceptions Preserved

Preserved without re-justification change:
- `packages/knowledge/server/test/adapters/GmailExtractionAdapter.test.ts` narrative payload fixtures remain local.
- `packages/knowledge/server/test/Rdf/benchmark.test.ts` performance-specific helpers remain local.
- `packages/knowledge/server/test/Sparql/SparqlService.test.ts:34` `sparqlServiceLayer` remains local.
- `packages/knowledge/server/test/GraphRAG/CitationValidator.test.ts:67` relation-depth inference helper remains local.

## Open Questions for Phase 3 (Implementation)

- Whether `GraphFixtures.ts` should export one canonical ID set (`graphRagFixtureIds`) or multiple named presets; Phase 3 should start with one preset to avoid API growth.
- Whether to expose `makeGoogleAuthClientLayer` as one function with `missingScopes` flag vs two explicit exports; default recommendation is one function to reduce duplicate logic while keeping option names explicit.

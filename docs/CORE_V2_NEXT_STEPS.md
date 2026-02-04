# Core v2 Implementation Guide & Next Steps

> **Role**: Strategic implementation guide for @core-v2 development.
> **See Also**: [`packages/@core-v2/docs/INDEX.md`](../packages/@core-v2/docs/INDEX.md) for navigation to all technical documentation.

Strategic, implementation-focused guide for bringing `packages/@core-v2` to production using Effect patterns. Incorporates: current stubs review, Effect module style (see `docs/EFFECT_MODULE_STYLE_GUIDE.md`), and the N3 wrapping guidance provided.

## Scope & Goals
- Deliver runnable, typed services and workflows (Two-Stage + Streaming extraction) with proper dependency wiring.
- Implement a production-ready RDF layer around N3 with a minimal, capability-oriented API.
- Add a simple configuration service to avoid ad-hoc constants (LLM model, timeouts, prefixes).
- Establish layering that is override-friendly (mocks, alt implementations) and avoids double provisioning.
- Ensure observability and testing scaffolding are baked in from the start.

## Current State (refs)
- Domain models and errors exist (e.g., `packages/@core-v2/src/Domain/Model/*.ts`, `Domain/Error/*.ts`) but errors do not extend `BaseError`.
- Services are stubbed with `Effect.die` and no dependencies (`packages/@core-v2/src/Service/*.ts`).
- Workflows are signatures only (`Workflow/TwoStageExtraction.ts`, `Workflow/StreamingExtraction.ts`).
- Runtimes merge all `.Default` layers bluntly (`Runtime/ProductionRuntime.ts`, `Runtime/TestRuntime.ts`), with no mocks or overrides.

## Key Style/Pattern References
- Effect service pattern and accessors: `docs/effect-source/effect/src/Effect.ts` (Service factory near line ~13534).
- Layer composition and annotations: `docs/effect-source/effect/src/Layer.ts`.
- Batching & concurrency via `Effect.all` options: `docs/effect-source/typeclass/src/data/Effect.ts`.
- Request/RequestResolver for batched external calls: `docs/effect-source/effect/src/Request.ts`, `RequestResolver.ts`.
- Inspectable/toJSON patterns: `docs/effect-source/effect/src/Inspectable.ts`.

## Configuration (new)
- Add `packages/@core-v2/src/Service/Config.ts` using `Effect.Service<Config>()("Config", { succeed: { … } , accessors: true })`.
- Contents:
  - `llm`: provider/model name, timeout ms, max tokens.
  - `rdf`: base namespace/prefix map, output format default.
  - `ontology`: path/endpoint, cache ttl.
  - `runtime`: parallelism limits (extraction concurrency), retry policies (schedule parameters).
- Export `ConfigService.Default` and wire into relevant services (LlmService, RdfBuilder, OntologyService).

## Services: Implementation Goals
### NlpService (`packages/@core-v2/src/Service/Nlp.ts`)
- Mode: `sync` (stateless wink-nlp).
- Implement:
  - `tokenize(text)`: returns `TokenDocument`.
  - `searchSimilar(query, docs, k, opts?)`: BM25 or simple cosine; ensure deterministic ordering.
  - `chunkText(text, { preserveSentences?, maxChunkSize? })`: chunk respecting sentence boundaries when requested.
- Add dependencies? None for now (pure).
- Tests: accessor smoke, chunking size/overlap behavior.

### LlmService (`Service/Llm.ts`)
- Mode: `effect` with dependency on `ConfigService`.
- Implement with @effect/ai LanguageModel if available; otherwise stub with TODO but keep typed errors.
- Methods:
  - `generateStructured(prompt, schema)`: use structured output; timeout via config.
  - `generateText(prompt)`: plain completion.
- Errors: use `LlmError | LlmTimeout | LlmRateLimit | LlmInvalidResponse`.
- Avoid `die`; fail with domain errors.

### OntologyService (`Service/Ontology.ts`)
- Mode: `effect` with dependency on `NlpService` (for search) and `ConfigService` (for paths/settings).
- Implement:
  - `searchClasses(text, limit)`: simple BM25 over loaded ontology labels/comments; return `Chunk<ClassDefinition>`.
  - `getPropertiesFor(classIds)`: filter `PropertyDefinition` by domain.
- Future: alternative embeddings impl via `DefaultWithoutDependencies` override.

### Extraction Services (`Service/Extraction.ts`)
- Mode: `effect` with dependencies:
  - `EntityExtractor` depends on `LlmService`, `Schema` builders (once added), `ConfigService`.
  - `RelationExtractor` depends on `LlmService`, `ConfigService`.
- Implement:
  - `extract(text, candidates)` → `Chunk<Entity>` with schema decode; map decode failures to `EntityExtractionFailed`.
  - Relation extraction with properties and entities; map failures to `RelationExtractionFailed`.
- Consider batching prompts for multi-example extraction where possible (via `Effect.all` concurrency limits from config).

### RdfBuilder (`Service/Rdf.ts`)
- Mode: `scoped` (resource-aware) with dependency on `ConfigService`.
- Capabilities (minimal surface):
  - `makeStore`: `Effect.acquireRelease(Effect.sync(() => new N3.Store()), ...)`.
  - `addEntities(store, entities)`: do prefix handling, attribute IRIs from config, fail fast on invalid IRIs.
  - `addRelations(store, relations)`: same; validate predicate/subject/object IRIs.
  - `toTurtle(store)`: async writer with prefixes from config; deterministic ordering if feasible.
- Optional: `validate` placeholder for SHACL (return conforms/report).
- Hide raw `DataFactory`/quad operations inside implementation; accept only domain `Entity`/`Relation`.

## RDF Wrapper Details (from discussion)
- Capabilities only (no 1:1 N3 API exposure): `createStore`, `ingestEntities`, `ingestRelations`, `validate`, `toTurtle`.
- Prefix management centralized; store fresh per request (scoped).
- Transaction safety: wrap ingestion in `Effect.try` or `Effect.forEach` with validation; fail whole batch on invalid IRIs.
- Type safety: inputs are `Entity`/`Relation` domain types.
- Keep prefix constants in config; allow override via `ConfigService`.

## Workflows
### TwoStageExtraction (`Workflow/TwoStageExtraction.ts`)
- Implement with accessors:
  1) `classes = yield* OntologyService.searchClasses(text)`
  2) Early exit on empty.
  3) `entities = yield* EntityExtractor.extract(text, classes)`
  4) `properties = yield* OntologyService.getPropertiesFor(classIds)`
  5) `relations = yield* RelationExtractor.extract(text, entities, properties)`
  6) `Effect.scoped` → `store = yield* RdfBuilder.makeStore` → add entities/relations → `turtle = yield* RdfBuilder.toTurtle(store)`
- Error channels: preserve specific error types or map into `ExtractionError` with cause.
- Avoid `die`; return proper failures.

### StreamingExtraction (`Workflow/StreamingExtraction.ts`)
- Use `Stream`:
  - Chunk text via `NlpService.chunkText`.
  - `Stream.fromIterable(chunks)` → `Stream.mapEffect` to extract per chunk with bounded concurrency from config.
  - Aggregate `KnowledgeGraph` per chunk; consider merging downstream.
- Include backpressure and early termination controls; use `Effect.timeout`/`Schedule` for retries on LLM calls.

## Layer Composition (override-friendly)
- Define bundles in `Runtime`:
  - Infra: `Layer.mergeAll(ConfigService.Default, LlmService.Default, NlpService.Default)`
  - Core: `Layer.mergeAll(OntologyService.Default, RdfBuilder.Default).pipe(Layer.provide(Infra))`
  - Extraction: `Layer.mergeAll(EntityExtractor.Default, RelationExtractor.Default).pipe(Layer.provide(Infra))`
  - Production: `Layer.mergeAll(Core, Extraction)`
- For overrides: provide alternative implementations via `DefaultWithoutDependencies` and `Layer.provide`.
- Test runtime: replace LLM/NLP/Ontology/RDF with mocks using `Layer.succeed`/`Layer.effect`.

## Domain & Errors
- Make domain class properties `readonly` where missing.
- Ensure error classes extend `BaseError` to preserve hierarchy.
- Add `TypeId` branding if needed for richer tagging.
- Keep domain pure (no side effects).

## Observability & Safety
- Add tracing/log annotations via `Effect.withSpan` in workflows; consider `Layer.annotateLogs/annotateSpans` in runtime.
- Use `Effect.timeout` and `Effect.retry` with `Schedule` for flaky I/O (LLM/ontology fetch).
- Use `Cache.make` for ontology lookups or schema generation if needed.

## Testing Plan
- Service accessor smoke tests to ensure generated accessors work.
- Layer build tests (`Layer.build`/`ManagedRuntime.make` smoke) for prod and test layers.
- Domain schema round-trip tests for Entity/Relation/OntologyContext.
- RDF ingestion/serialization tests using small fixtures; verify prefixes and deterministic output.
- Workflow integration tests with mocks: two-stage produces non-empty results; streaming yields multiple `KnowledgeGraph` chunks.
- Error mapping tests: invalid IRIs → `RdfError`, decode failures → `ValidationFailed`/`EntityExtractionFailed`.

## Execution Plan (phased)
### Phase A: Foundations
- Add `ConfigService`.
- Fix domain errors to extend `BaseError`; enforce `readonly` where appropriate.
- Replace `Effect.die` stubs with `Effect.fail` NotImplemented errors temporarily.
- Adjust service modes (`sync`/`effect`/`scoped`) and declare dependencies.

### Phase B: RDF Wrapper
- Implement `RdfBuilder` with N3 per the capability surface; add prefixes from config.
- Add validation placeholder (`validate` returning conforms/report).
- Add RDF tests (entities/relations → Turtle).

### Phase C: Core Services
- Implement `NlpService` (tokenize/chunk/search).
- Implement `OntologyService` using NlpService; add simple in-memory ontology cache or loader stub.
- Implement `LlmService` with @effect/ai or a mockable interface honoring timeouts/errors.
- Implement `EntityExtractor`/`RelationExtractor` with schema decode + error mapping.

### Phase D: Workflows & Runtimes
- Implement `TwoStageExtraction` and `StreamingExtraction` as described.
- Rework runtimes into Infra/Core/Extraction bundles; add Test layers with mocks.
- Add basic tracing/log annotations.

### Phase E: Hardening
- Add retries/timeouts around LLM calls; expose settings via config.
- Add SHACL validation hook in RDF flow (optional but align to “prod” goal).
- Expand integration tests with fixtures.

## Guardrails & Checklist
- [ ] No `Effect.die` in service/workflow code; use typed errors.
- [ ] Services expose `Default`/`DefaultWithoutDependencies`; dependencies declared.
- [ ] Layers composed without double-providing deps; overrides documented.
- [ ] Config service present and provided to LLM/RDF/Ontology/Extraction where needed.
- [ ] Domain errors extend `BaseError`.
- [ ] Accessor smoke tests added per service.
- [ ] Runtimes build successfully with current implementations and with mocks.
- [ ] RDF serialization includes prefixes and isolates store per request.

## File TODOs (per path)
- `packages/@core-v2/src/Service/Config.ts`: new service with defaults + accessors.
- `packages/@core-v2/src/Service/Rdf.ts`: switch to `scoped`; implement N3 wrapper per capability surface; add dependencies on Config.
- `packages/@core-v2/src/Service/Nlp.ts`: implement sync NLP functions; add tests.
- `packages/@core-v2/src/Service/Llm.ts`: effect init; use Config; real or mock impl.
- `packages/@core-v2/src/Service/Ontology.ts`: effect init; depends on Nlp + Config; implement search/properties.
- `packages/@core-v2/src/Service/Extraction.ts`: effect init; depends on Llm + Config; implement entity/relation extraction.
- `packages/@core-v2/src/Workflow/TwoStageExtraction.ts`: implement orchestration with scoped RDF builder and accessors.
- `packages/@core-v2/src/Workflow/StreamingExtraction.ts`: implement stream pipeline with concurrency limits.
- `packages/@core-v2/src/Runtime/ProductionRuntime.ts`: refactor to Infra/Core/Extraction bundles.
- `packages/@core-v2/src/Runtime/TestRuntime.ts`: add mock layers; avoid production defaults.
- `packages/@core-v2/src/Domain/Error/*.ts`: extend `BaseError`; ensure `readonly`.
- Tests: add under `packages/@core-v2/test` (or repo test location) for services/workflows/RDF.

## Notes on Over-Engineering Avoidance
- Do not mirror full N3 API; keep to the five capabilities noted.
- Avoid complex config hierarchies; keep Config minimal and override via layers.
- Keep workflows lean; rely on services for heavy lifting.
- Prefer `Effect.all` with bounded concurrency over bespoke pools.

## References
- Effect Service pattern: `docs/effect-source/effect/src/Effect.ts` (Service factory, tag proxies).
- Layer composition & annotations: `docs/effect-source/effect/src/Layer.ts`.
- Concurrency options: `docs/effect-source/typeclass/src/data/Effect.ts`.
- Request batching: `docs/effect-source/effect/src/Request.ts`, `RequestResolver.ts`.
- Inspectable/toJSON: `docs/effect-source/effect/src/Inspectable.ts`.
- Style guides: `docs/EFFECT_MODULE_STYLE_GUIDE.md`, `docs/EFFECT_APPLICATION_PATTERNS.md`.

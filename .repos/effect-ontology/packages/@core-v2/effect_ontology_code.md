This file is a merged representation of the entire codebase, combined into a single document by Repomix.

================================================================
File Summary
================================================================

Purpose:
--------
This file contains a packed representation of the entire repository's contents.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

File Format:
------------
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Multiple file entries, each consisting of:
  a. A separator line (================)
  b. The file path (File: path/to/file)
  c. Another separator line
  d. The full contents of the file
  e. A blank line

Usage Guidelines:
-----------------
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

Notes:
------
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded

Additional Info:
----------------

================================================================
Directory Structure
================================================================
docs/
  functional_spec.md
src/
  Domain/
    Error/
      Base.ts
      Extraction.ts
      index.ts
      Llm.ts
      Ontology.ts
      Rdf.ts
    Model/
      Entity.ts
      index.ts
      Ontology.ts
    Rdf/
      Constants.ts
      index.ts
      Types.ts
    index.ts
  Prompt/
    ExtractionRule.ts
    FeedbackGenerator.ts
    index.ts
    PromptGenerator.ts
    RuleSet.ts
    SchemaGenerator.ts
  Runtime/
    index.ts
    ProductionRuntime.ts
    RateLimitedLanguageModel.ts
    TestRuntime.ts
  Schema/
    EntityFactory.ts
    Errors.ts
    index.ts
    MentionFactory.ts
    RelationFactory.ts
  Service/
    Config.ts
    Extraction.ts
    GenerateWithFeedback.ts
    Grounder.ts
    index.ts
    Nlp.ts
    Ontology.ts
    Rdf.ts
    Retry.ts
  Telemetry/
    CostCalculator.ts
    index.ts
    LlmAttributes.ts
    Tracing.ts
    TracingContext.ts
  Utils/
    index.ts
    Iri.ts
    Rdf.ts
    String.ts
  Workflow/
    EntityResolution.ts
    index.ts
    Merge.ts
    StreamingExtraction.ts
    TwoStageExtraction.ts
  index.ts
  main.ts
  playground.ts
test/
  Schema/
    EntityFactory.test.ts
    RelationFactory.test.ts
  Workflow/
    Merge.test.ts
  Ontology.test.ts
  RdfBuilder.test.ts
package.json
search-quality-results.csv
tsconfig.build.json
tsconfig.json
vitest.config.ts

================================================================
Files
================================================================

================
File: docs/functional_spec.md
================
This is the **Functional Specification** of your pipeline.

In Functional Programming (FP), we model this as a **Stream Processing Topology**. We treat the extraction not as a series of object manipulations, but as a flow of immutable data through a series of pure (effectful) transformations.

Here is the corrected and formalized map of your pipeline.

### 1\. The High-Level Type Signature

Your entire application is essentially one function:

$$f: \text{String (Book)} \rightarrow \text{Effect}\langle \text{KnowledgeGraph} \rangle$$

We break this down into a composition of smaller functions:

```text
Stream<Text>
  -> map(chunking)
  -> mapEffect(context_retrieval)
  -> mapEffect(entity_extraction)
  -> mapEffect(property_scoping)
  -> mapEffect(relation_extraction)
  -> reduce(graph_merge)
```

---

### 2\. The Data Types (The "States")

In FP, we define the shape of data at each step of the pipe.

1.  **`Source`**: `String` (The raw input).
2.  **`Chunk`**: `String` (A window of \~500 tokens).
3.  **`Context`**: `ClassDefinition[]` (The "Ontology Snippet" relevant to the chunk).
4.  **`Nodes`**: `Entity[]` (The instance data found in Stage 1).
5.  **`Schema`**: `PropertyDefinition[]` (The allowed edges for Stage 2).
6.  **`Edges`**: `Relation[]` (The connections found in Stage 2).
7.  **`GraphFragment`**: `{ entities: Nodes, relations: Edges }` (The result of one chunk).

---

### 3\. The Transformation Pipeline (The "Functions")

Here is the exact functional mapping of your "Stage 1 / Stage 2" logic.

#### **Phase A: The Expansion (Map)**

We expand one document into a stream of localized graph fragments.

**Step 1: Chunking (Pure)**

- **Signature:** `f_chunk: String -> Stream<Chunk>`
- **Logic:** Split text by sentence boundaries with overlap.

**Step 2: Context Retrieval (Effectful)**

- **Signature:** `f_search: Chunk -> Effect<{ chunk, context }>`
- **Logic:** Vector Search (`searchClasses`) to find the top-k `ClassDefinitions` relevant to this specific text chunk.

**Step 3: Node Extraction (Effectful)**

- **Signature:** `f_stage_1: { chunk, context } -> Effect<{ chunk, nodes }>`
- **Logic:** LLM extracts entities.
  - _Constraint:_ `nodes.type` must be in `context`.

**Step 4: Property Scoping (Effectful/Pure)**

- **Signature:** `f_scope: { nodes } -> Effect<{ chunk, nodes, schema }>`
- **Logic:** TBox Lookup (`getPropertiesFor`).
  - _Input:_ The types of the `nodes` we just found.
  - _Output:_ Only the properties valid for those types.

**Step 5: Edge Extraction (Effectful)**

- **Signature:** `f_stage_2: { chunk, nodes, schema } -> Effect<GraphFragment>`
- **Logic:** LLM extracts relations.
  - _Constraint:_ `subject` and `object` must be in `nodes`.
  - _Constraint:_ `predicate` must be in `schema`.

#### **Phase B: The Contraction (Reduce)**

We collapse the stream of fragments into one coherent graph.

**Step 6: Merge (Pure/Monoid)**

- **Signature:** `f_reduce: (GraphFragment, GraphFragment) -> GraphFragment`
- **Logic:**
  - **Entities:** Union by ID (`snake_case`). If attributes conflict, last-one-wins or merge strategies apply.
  - **Relations:** Union by signature (Subject + Predicate + Object).

---

### 4\. The Implementation (Effect TS)

Here is how this translates directly to your `Workflow/StreamingExtraction.ts`.

```typescript
import { Stream, Effect, Chunk } from "effect"
import { KnowledgeGraph } from "../Domain/Model/Entity.js"

// 1. Define the "Accumulator" (The State being passed down)
interface ExtractionState {
  readonly text: string
  readonly classes?: Chunk.Chunk<ClassDefinition>
  readonly entities?: Chunk.Chunk<Entity>
  readonly properties?: Chunk.Chunk<PropertyDefinition>
}

export const extractStream = (fullText: string) => {
  return Stream.fromIterable(chunkText(fullText)).pipe(
    // --- Step 2: Context Retrieval ---
    Stream.mapEffect((chunk) =>
      Effect.gen(function* (_) {
        const ontology = yield* _(OntologyService)
        const classes = yield* _(ontology.searchClasses(chunk))
        return { text: chunk, classes }
      })
    ),

    // --- Step 3: Stage 1 (Entities) ---
    Stream.mapEffect((state) =>
      Effect.gen(function* (_) {
        const extractor = yield* _(EntityExtractor)
        const entities = yield* _(extractor.extract(state.text, state.classes))
        return { ...state, entities }
      })
    ),

    // --- Step 4 & 5: Stage 2 (Relations) ---
    Stream.mapEffect((state) =>
      Effect.gen(function* (_) {
        // Optimization: Skip Stage 2 if no entities found
        if (Chunk.isEmpty(state.entities)) {
          return new KnowledgeGraph({
            entities: Chunk.empty(),
            relations: Chunk.empty()
          })
        }

        const ontology = yield* _(OntologyService)
        const relationExt = yield* _(RelationExtractor)

        // Scoping (Step 4)
        const types = Chunk.flatMap(state.entities, (e) =>
          Chunk.fromIterable(e.types)
        )
        const props = yield* _(
          ontology.getPropertiesFor(Chunk.toReadonlyArray(types))
        )

        // Extraction (Step 5)
        const relations = yield* _(
          relationExt.extract(state.text, state.entities, props)
        )

        return new KnowledgeGraph({ entities: state.entities, relations })
      })
    ),

    // --- Step 6: Reduction (Merge) ---
    // We use 'runFold' to merge all GraphFragments into one final KnowledgeGraph
    Stream.runFold(
      new KnowledgeGraph({ entities: [], relations: [] }),
      (acc, currentFragment) => mergeGraphs(acc, currentFragment)
    )
  )
}
```

### 5\. Evaluation: Why this model is superior

1.  **Bounded Context:** `f_search` ensures the LLM never sees the whole ontology, only the slice relevant to the current 500 tokens.
2.  **Hallucination barrier:** `f_stage_2` depends on the output of `f_stage_1`. The LLM physically cannot invent a relationship involving a node it didn't previously define.
3.  **Parallelism:** Because the stream is composed of independent chunks (up until the Reduce step), you can run `f_stage_1` and `f_stage_2` on 100 chunks in parallel using `Stream.mapEffect(..., { concurrency: 10 })`.

---

### 6\. Implementation Notes by Pipeline Phase (Effect-first, @core-v2)

The following notes walk phase-by-phase through the pipeline with concrete implementation guidance tied to the existing `@core-v2` services and the Effect APIs (`Stream`, `Effect`, `Schema`, `@effect/ai`). Keep the code generation tight: prefer statically typed schemas, eliminate hidden mutable state, and wire observability into each step.

#### Phase 0: Pre-flight, Context, and Contracts

- Keep `OntologyService` and `NlpService` layered and memoized with `Layer` so every effect in the stream resolves dependencies cheaply via `Effect.provideService`.
- Load ontologies through `OntologyService.loadFromFile` (or equivalent) during program startup; store the resulting `OntologyContext` in a `Layer` that can be shared by the streaming workflow to avoid repeated RDF parsing.
- Validate ontology materialization with `Schema.encode` on `ClassDefinition` and `PropertyDefinition` to catch malformed RDF payloads early, failing fast with `OntologyParsingFailed`.
- Normalize ontology IRI handling using `extractLocalName` helper so downstream chunk-level prompts only surface compact identifiers (while preserving the full IRI for graph writes).
- Build BM25 and semantic indexes once via `NlpService.buildOntologyBM25Index` and `NlpService.buildOntologySemanticIndex`; keep them on `WeakMap` keyed by ontology context to support multiple ontologies without leaking memory.
- Gate all LLM-related effects behind a `LlmService` abstraction that wraps `@effect/ai` `LanguageModel`; enforce timeouts with `Effect.timeout` and classify them as `LlmTimeout`.
- Make every service method return `Effect` with explicit error channels: e.g., `Effect<E, R, _>` instead of throwing; model predictable errors (`OntologyFileNotFound`, `EntityExtractionFailed`) and unexpected ones (`Cause.die`) separately.
- Keep deterministic chunk sizes configurable (`ChunkOptions`) surfaced from config service; default to 500 tokens but expose overrides per workflow run for tuning.
- Pre-compute prompt-safe ontology snippets: convert `ClassDefinition` and `PropertyDefinition` to compact JSON with only relevant fields (label, comment, range/domain) to keep tokens bounded.
- Introduce a pipeline-level `ExtractionConfig` Schema that captures concurrency, chunk size, retrieval `k`, semantic/BM25 blend weights, retry policies, and caching toggles.
- Provide a `Clock` dependency (Effect's default) for all timing (timeouts, metrics, debounce) to make replay deterministic in tests.
- Make the workflow effect cancelable; use `Effect.interruptible` around LLM calls and `Stream.unwrapScoped` so shutting down cancels pending fibers.
- Add guardrails on concurrency: `Stream.mapEffectPar(chunkStream, { concurrency })` should be capped by CPU or rate-limit budgets; expose this on config.
- Encode outputs using the domain schemas: `KnowledgeGraph`, `Entity`, `Relation` to ensure the LLM responses are decoded/validated, preventing structural drift.
- Expose deterministic seeds for any randomization (e.g., sampling in chunk overlap decisions) using `Effect.random`; seed injection helps reproducing test failures.
- Separate shared caches per workflow instance using `FiberRef` so per-run ephemeral data (e.g., dedup map of entity IDs) stays scoped and does not leak across invocations.
- Wire tracing via `@effect/otel` (if available) or manual span tagging using `Effect.logDebug`/`logTrace` with correlation IDs carried in a `FiberRef`.
- Ensure the top-level driver (`streamingExtraction` and `extractToTurtle`) is pure with respect to input text and config; no hidden IO, all IO effects are explicit.
- Keep the specification of ID generation (`snake_case` mention or alias) stable and tested in isolation; collisions should be handled in the merge phase not earlier.
- Use `Effect.annotateLogs` to propagate chunk index, chunk hash, ontology revision, and request IDs into every log line generated in the pipeline.
- Codify invariants as `Schema` refinements (e.g., `Entity.id` snake_case) rather than ad-hoc runtime checks; rely on decode failures to short-circuit invalid outputs.
- Always document which parts of the `Effect` environment each phase requires; tighten so that each phase depends only on the minimal services it needs.
- Add a `DryRun` mode that runs every phase except the LLM calls by replacing `LlmService` with a stub that emits deterministic fake output for pipelines tests.
- Stage-specific metrics: counters for chunks processed, entities emitted, relations emitted, retrieval recall, LLM retry counts, decode failures, merge conflicts.
- Define a consistent `ChunkHash` (e.g., SHA-256 of normalized chunk text) to index caches for retrieval and extraction reuse.
- Ensure text normalization (Unicode NFC) is applied once at ingestion and stored alongside the source so chunk splits are stable across runs/platforms.
- Apply `Effect.acquireUseRelease` for any resourceful operations (file handles during ontology load, Rdf store instances) to avoid leaks when the stream is interrupted.
- Document Rdf prefix mapping and keep it in config; prompts should show human-readable prefixes while the graph retains absolute IRIs.
- Use `Layer.scopedDiscard` to register cleanup hooks (closing N3 stores) triggered when the workflow scope ends.
- Keep `playground.ts` wired to the workflow for rapid ad-hoc testing; ensure it provides the same `Layer` stack as production to avoid configuration drift.
- Ensure all text manipulations remain ASCII-safe but not ASCII-only; retain original unicode in `mention` and `sourceText`.
- Include a provenance structure per output graph that records the chunk indexes that contributed to each entity/relation (useful for human review).
- Bundle SHACL shapes (if available) to validate the merged graph post-reduction using `RdfService.validate`; wire failures into `ExtractionError`.
- Use strict TypeScript `noImplicitAny` and `strictNullChecks`; keep `Schema` and domain classes as the canonical source of truth for runtime validations.
- Keep read operations pure where possible; chunking and retrieval should be side-effect free aside from logging metrics.
- Avoid throwing; use `Effect.die` only for truly unexpected states (e.g., impossible pattern match), not for normal error cases.
- Prefer `Chunk` over `Array` for intermediate results to leverage structural sharing and reduce allocations inside the stream.
- Keep conversions between `Chunk` and `Array` localized; do not pass native arrays across boundaries unless the receiver requires them.
- Consolidate config defaults in `ConfigService` so pipeline code remains declarative and testable via `Layer` overrides.
- Bake in exhaustive tests for each schema decode; use `Schema.decodeUnknown` when parsing LLM JSON to avoid bypassing validation.

#### Phase 1: Chunking (Pure, NlpService)

- Use `NlpService.chunkText` to perform sentence-aware chunking with overlap; align with `ChunkOptions` default `maxChunkSize: 500` and optional `preserveSentences`.
- Implement chunk overlap by keeping trailing sentences from the previous chunk; store `startOffset` and `endOffset` for provenance and deduplication.
- Normalize whitespace and remove zero-width characters before chunking; keep offsets calculated on the normalized string and carry along a mapping to original positions.
- Provide deterministic chunk ordering; assign `index` sequentially and never reorder in concurrency pipelines.
- Ensure chunk boundaries respect sentence boundaries first, then token count; fallback to naive split if wink-nlp sentence detector fails.
- Maintain a `ChunkDigest` using a stable hash for caching retrieval and extraction outputs.
- Keep chunk text trimmed but do not lowercase; preserve casing for proper noun fidelity in prompts.
- Expose chunk stats (tokens, sentences) for dynamic prompt sizing: use shorter prompts when chunk is small to save tokens.
- Guard against empty chunks; filter them out early to reduce downstream work.
- Optionally add a `ChunkContext` structure containing `prev` and `next` chunk IDs for windowed reasoning in future iterations (v2).
- Validate chunk sequence determinism with a test fixture containing known text -> known chunk set.
- Keep chunk emission as `Stream.fromIterable` so `mapEffectPar` downstream respects ordering once merged with `Stream.mapEffect` and `Stream.runCollect`.
- Use `Stream.peel` or `Stream.partition` if we later want to treat headers/footers differently; keep design open for extra structural chunking (e.g., section-based).
- Add logging per chunk creation with `logDebug` containing size and boundaries to support debugging extraction misalignments.
- Wire chunk creation into `ExtractionState` with shape `{ chunk: TextChunk; classes?: Chunk<ClassDefinition>; entities?: Chunk<Entity>; properties?: Chunk<PropertyDefinition> }`.
- Keep chunking pure; never reach out to ontology or LLM during this phase.
- Provide a fallback to `generateNGrams` based chunking for non-sentence languages (configurable through `ChunkOptions`).
- Avoid splitting inside quoted strings when possible; heuristically join sentences if the split would break a quote (wink-nlp `quote` entity list can assist).
- Keep tokens per chunk under model limits for downstream LLM (account for prompt scaffolding ~200-400 tokens).
- Add cross-validation: recombine all chunks and ensure it matches normalized input text to catch accidental drops.
- Use `Chunk.map` over chunk stream to annotate with `ChunkScope` metadata (e.g., domain, source name) for logging.
- Provide a `dryRunChunking` CLI to visualize chunk boundaries for authors during ontology iteration.
- Keep chunk ordering stable across platform-specific newline encodings; normalize line endings to `\n` at ingestion.
- Expose chunk overlap size in config; default to one sentence overlap to preserve entity continuity.
- Consider `Stream.rechunk` if retrieving from an upstream stream to ensure efficient chunk boundaries for mapEffectPar.
- Use `Chunk.isEmpty` check to skip zero-length chunk after trimming whitespace.
- Keep chunk-level metrics: histogram of chunk sizes, tokens per chunk, total chunks.
- Use `Effect.memoize` to cache chunking results per source text to enable reprocessing with different downstream configs without recomputation.
- Ensure chunker returns `Chunk<TextChunk>` for compatibility with `Chunk` combinators and low allocation.
- Provide a `Chunk` -> `Stream` conversion via `Stream.fromChunk` for easy integration with stream pipeline.
- Keep chunk-level debug output within log level `trace` to avoid noise in production logs.
- When chunking HTML or Markdown, strip tags/markup but keep structural markers (headings) as tokens to help context retrieval.
- Keep mention of `enhanceTextForSearch` reserved for retrieval not for chunk content to avoid changing semantics before extraction.
- Maintain separate `ChunkOptions` for knowledge extraction vs retrieval; chunk for extraction may be smaller than retrieval to reduce hallucinations.
- Add property `language` detection stub in chunk metadata for future multilingual handling; default to `en`.
- Remember to freeze chunk objects (Object.freeze) if mutability ever creeps in from caller side.
- Keep chunking test fixtures under `test-data/` with golden outputs to enforce deterministic boundaries.
- Use `Schema` to describe chunk metadata for validation when caching to disk or storing in DB.

#### Phase 2: Context Retrieval (Effectful, OntologyService + NlpService)

- Combine BM25 and semantic scoring: run `NlpService.searchOntologyBM25` and `NlpService.searchOntologySemantic` then fuse results via weighted sum; expose weights in config.
- Default retrieval `k` to 10 classes and 15 properties; allow override based on ontology density.
- Always scope retrieval to the specific chunk; do not leak previous chunk results unless explicitly configured (no global top-k for the whole doc).
- Use `OntologyService` domain definitions for classes/properties; never return free-form strings to the extractor.
- Keep retrieval pure with respect to ontology state; avoid mutating `OntologyContext`.
- Wrap retrieval in `Effect.retry` with a bounded policy (`Schedule.recurs(2)` plus jitter) for transient BM25 index errors.
- Deduplicate retrieval results on `iri`; keep the top score per `iri`.
- Include `range`, `domain`, `functional` flags in retrieved property definitions to support later constraint checking.
- Attach provenance: `result.chunkIndex`, `result.score`, `result.strategy` (bm25 | semantic | hybrid) to make prompts inspectable.
- If no classes returned, short-circuit with an empty context but still emit chunk so metrics remain accurate.
- Ensure retrieval returns `Chunk<ClassDefinition>` and `Chunk<PropertyDefinition>`; avoid arrays.
- Cache retrieval outputs keyed by `ChunkHash` and ontology revision to skip duplicate computation in repeated runs.
- Keep retrieval text pre-processing aligned with `prepareText` (camelCase split, bigrams) to improve recall for ontology terms written in camelCase.
- Make retrieval model language-aware; if future `language` metadata exists on chunk, adapt stopwords list accordingly.
- Surface retrieval latency metrics and log slow queries (>200ms) to tune BM25 parameters.
- Provide an integration point to plug vector stores later; keep interface narrow (`searchClasses`, `searchProperties`).
- Convert retrieval results into prompt-ready summaries: `ClassDefinition` -> `{ id, label, synonyms, comment }`; truncate long comments to stay under token limits.
- In tests, use synthetic ontology with small class set to assert scoring order and decoding logic.
- For hybrid scoring, experiment with min-max normalization of BM25 and semantic scores before fusion; document the chosen strategy in config comments.
- Keep retrieval resilient to missing embeddings; fallback to BM25 when semantic embeddings are unavailable.
- Add guard: do not return datatype properties in class retrieval context; keep property retrieval explicit and separate.
- Ensure property retrieval respects class domains; optionally filter properties whose domain is outside retrieved class set to reduce prompt noise.
- Use `Effect.forEach` with `Chunk` to parallelize retrieval across classes if needed; keep concurrency low to avoid thrashing the index.
- Use `Effect.tapError` to log retrieval failures with chunk index and hash; rethrow as `OntologySearchFailed` (if defined) or reuse `ExtractionError`.
- Validate retrieval outputs against `Schema` (class/property definitions) to prevent drift between index and domain models.
- When retrieving across multiple ontologies, annotate each result with `ontologyId` and keep prompts separated to avoid cross-ontology leakage.
- Store the BM25 index in memory; if later persisted, ensure serialization keeps token normalization consistent with `prepareText`.
- Expose retrieval debug endpoints in `playground.ts` to inspect top-k for given text.
- Keep retrieval deterministic for tests by seeding any randomness; BM25 is deterministic given identical input.
- If chunk is too small (<50 tokens), consider raising retrieval `k` to counter low context; if too big, lower `k` to stay within prompt budget.
- Build prompts with consistent ordering: sort classes by score descending then by label; same for properties.
- Avoid mixing class and property retrieval results in one call; stage them separately for clarity in prompts.
- Include `skos:prefLabel`, `altLabel`, `hiddenLabel` in retrieval output to help the LLM disambiguate synonyms.
- Do not expose IRIs with blank nodes to the LLM; filter them out in retrieval.
- Keep retrieval effect fast (<50ms ideally); profile BM25 vectorizer initialization cost and ensure it is done once per process.
- Provide structured retrieval result type: `{ chunk: TextChunk; classes: Chunk<ClassDefinition>; properties: Chunk<PropertyDefinition>; debug?: {...} }`.
- Maintain `Effect` environments minimal: retrieval phase depends on `OntologyService` + `NlpService` only.
- When no ontology is loaded, fail early with `OntologyFileNotFound` rather than letting downstream LLM hallucinate schema.
- Consider reranking retrieved classes using simple heuristics (e.g., term overlap with chunk mention) before prompting; document the heuristic for reproducibility.
- Keep retrieval for properties optional; Stage 2 can request them later; avoid premature property retrieval to reduce wasted tokens.

#### Phase 3: Entity Extraction (Effectful, EntityExtractor + LlmService)

- Build prompts that include: chunk text, class shortlist (id, label, short description), extraction rules, output schema example.
- Use `@effect/ai` `SchemaModel` to request structured output directly as `Schema.Array(Entity)` to reduce manual parsing.
- Enforce deterministic ID generation in prompt: `snake_case` from mention, remove stopwords, keep diacritics transliterated deterministically.
- Keep entity `types` restricted to retrieved classes; make prompt explicit that no unseen class is allowed.
- Include instruction to avoid duplicate entities within a chunk; if duplicates occur, merge attributes within the chunk before emitting.
- Use `Effect.timeout` for LLM calls and classify as `LlmTimeout`; retries should use `Schedule.exponential` with cap and jitter.
- Decode LLM responses with `Schema.decodeUnknown(Entity)`; handle decode failures by retrying with a clarifying prompt that includes the validation error message.
- Keep extraction effect cancelable; wrap in `Effect.uninterruptibleMask` only around critical sections like cache writes.
- Introduce chunk-level caching: persist decoded entities keyed by `ChunkHash` + ontology revision + extraction prompt version to avoid repeated LLM cost.
- Log prompt and response snippets (redacted) at debug level for observability; never log full responses in production.
- Use `Effect.tap` to attach chunk index to metrics: `entities_extracted_total` counter incremented by count.
- Keep `EntityExtractor` interface synchronous in signature but effectful; actual implementation should call `LlmService.generateStructured`.
- Provide fallback heuristics for trivial entities (dates, numbers) without LLM when model budget is limited; gate via config.
- Maintain temperature and maxTokens configuration; default to temperature 0.2 for extraction stability.
- Validate mention spans: ensure mention text exists in chunk; optionally store start/end character offsets in attributes for traceability.
- Encourage the LLM to emit canonical IRIs for classes (`types`) rather than labels; supply mapping in prompt to avoid label-based guessing.
- Avoid attributes not present in chunk; instruct LLM to leave fields empty rather than hallucinating values.
- Keep attribute values typed: prefer ISO dates for date properties, boolean for yes/no, numbers for quantities; include examples in prompt.
- If chunk contains tables or lists, consider pre-processing to mark cell boundaries; pass this annotated text to the LLM to improve extraction accuracy.
- Use `Effect.validate` style combinators to ensure minimum one entity when certain heuristics match (e.g., named entity presence detected by wink-nlp); otherwise allow zero entities.
- Add a `maxEntitiesPerChunk` cap to prevent runaway outputs; clamp results and log warnings if the cap is exceeded.
- Thread `Chunk<ClassDefinition>` into prompt as a bullet list with short descriptions; keep total tokens under model limit.
- Keep entity extraction stateless; do not rely on previous chunk extractions to avoid temporal coupling.
- Provide a `--extraction-dry-run` that runs chunking + retrieval but replaces LLM call with synthetic results for debugging pipeline shape.
- Add guard rails on invalid IRIs in `types`: validate against retrieved classes; drop entities referencing unknown classes with a warning.
- Normalize attributes keys to property IRIs; never allow labels in the decoded structure.
- Keep mention case as in text; do not lowercase mention to preserve fidelity for downstream display.
- Provide a summarization prompt variant for very long chunks: first ask the LLM to summarize chunk into entity-centric bullets, then run structured extraction on the summary; keep both steps deterministic and cached.
- Ensure `EntityExtractor` only depends on `LlmService` and not on `OntologyService` directly; context should be passed in by caller.
- Add backpressure to entity extraction concurrency using `Stream.mapEffectPar` with a bounded queue; avoid exhausting API rate limits.
- Use `Effect.catchTag` to map service-specific errors into `EntityExtractionFailed` domain error with metadata (chunk index, chunk hash).
- Keep the typed `Chunk<Entity>` in memory until Stage 2; avoid serialization until after merge to reduce overhead.
- Ensure prompts instruct model to avoid merging co-referent mentions across chunk boundaries; cross-chunk merging belongs to Phase 6.
- Expose evaluation harness comparing extracted entities to gold annotations; compute precision/recall per class.
- Keep test vectors covering pluralization, abbreviations, nested entities, and attribute edge cases.
- Add `traceId` per extraction call to correlate with upstream chunk logs.
- Consider streaming responses from LLM if provider supports; accumulate partial JSON and decode once complete.
- Use `Schema` descriptions for attributes to auto-generate validation hints in prompt (e.g., `birthDate` expects ISO date).
- Keep entity extraction prompts versioned; store version in cache key and metrics to track regressions.
- Guard attribute length; truncate long strings to avoid passing huge values downstream.
- Provide `EntityExtractor` a deterministic random generator when sampling negative examples for clarifying prompts.
- Include `stopSequences` in LLM call to prevent trailing prose after JSON output.
- Evaluate extraction under token pressure; design prompts that remain valid when truncated; include required keys first.
- Keep outputs stable by avoiding temperature in classification tasks; set `topP` and `frequencyPenalty` to 0 unless experimentation suggests otherwise.
- When decode fails repeatedly, emit a structured error object into metrics and proceed with an empty chunk result to keep pipeline flowing (configurable).
- Ensure extraction step is annotated with `Span` for tracing if using OpenTelemetry integration.
- Avoid output-order dependence; treat extracted entities as a set.
- Provide sample prompts in code comments for maintainers; ensure they stay synchronized with schema changes.

#### Phase 4: Property Scoping (Effectful/Pure, OntologyService)

- Compute allowed properties for the union of entity types via `OntologyService.getPropertiesFor`; pass `Array<string>` of class IRIs.
- Filter properties by domain intersection with entity types; if property domain is broader, keep but lower priority in prompts.
- Include property range metadata (datatype vs object) to guide relation extraction on literal vs entity target.
- Deduplicate properties and sort deterministically (score by specificity: functional > datatype > object > annotation).
- Cache scoped property sets keyed by sorted type tuple + ontology revision to avoid repeated lookups across chunks.
- Validate property definitions with `Schema` before passing to Stage 2 to prevent malformed predicates reaching prompts.
- If no properties found for a type, log a warning and skip relation extraction or fall back to inherited properties (if subclass tree available).
- Keep scoping pure when possible; avoid invoking LLM here.
- Include property examples if present in ontology (e.g., SKOS notes) trimmed to short strings.
- Provide configuration for expanding properties via hierarchy (inherit from superclasses) when ontology uses subclassing; default to include inherited properties.
- Keep property scoping effect dependence limited to `OntologyService` (and possibly `ConfigService` for inheritance rules).
- Store scoping result inside `ExtractionState.properties` for reuse by relation extractor.
- Add metrics: properties per chunk, properties per type, scoping latency.
- Apply `Effect.memoize` if `getPropertiesFor` is expensive and called frequently with the same type sets.
- Validate functional properties count; if property is functional, Stage 6 merge must enforce at most one value per subject.
- Include inverse properties if ontology defines them; Stage 2 prompt should know subject/object orientation.
- Avoid properties with blank node ranges; treat them as unsupported and log.
- Provide deterministic ordering to ensure prompts do not change order across runs (stability for caching).
- Keep property scoping tested with synthetic ontology fixtures to ensure filtering logic works (domain/range intersection).
- If ontology lacks domains, allow all properties but make prompt explicit to select only those supported by mentioned entities.
- Ensure ranges that are literals map to expected JS types in relation extraction (string/number/boolean/date).
- Keep scoping step as a thin wrapper; heavy logic should remain in ontology layer rather than the workflow.
- Store property metadata (functional, datatype) for merge conflict resolution later.
- Use `Chunk` to hold scoped properties to minimize conversions.
- When `types` list is huge, limit to top-N frequent types to control property explosion; expose config for this cap.
- Record scoping provenance: which entity IDs/types triggered which property to help debugging mis-assigned predicates.
- Keep property URIs canonical; if ontology uses prefixes, store canonical IRIs in state and render prefixes only in prompt.
- For multi-ontology setups, keep property scoping per ontology; do not mix property sets across ontologies in one chunk.
- Apply `Effect.filterOrFail` to drop unknown type IRIs early and surface an error rather than passing empty property sets silently.
- Consider `Effect.cached` if property scoping is deterministic; avoid recompute per chunk when type set repeats.
- Provide unit tests for property scoping with edge cases: functional property duplication, datatype vs object mix, domain mismatch.

#### Phase 5: Relation Extraction (Effectful, RelationExtractor + LlmService)

- Build prompts that include: chunk text, extracted entities (id, mention, types, attributes), scoped properties (predicate, range, notes), and strict constraints.
- Enforce that `subjectId` and `object` references must exist in the provided entity set; instruct model to skip otherwise.
- For datatype properties, instruct the model to emit literals (string/number/boolean/date) instead of entity IDs.
- Use `Schema.Array(Relation)` decoding with `Schema.decodeUnknown` to enforce structure; include custom refinement that entity references must pass `isEntityReference`.
- Limit `maxRelationsPerChunk` to prevent combinatorial explosion; clamp results and log warnings.
- Apply `Effect.timeout` and `Effect.retry` similar to Stage 3; keep separate metrics for relation retries.
- Avoid cross-chunk relations; only allow relations between entities that co-occur in the chunk (per prompt instructions).
- Promote deterministic predicate selection by providing prioritized property list (functional first, high-range match).
- Include negative examples in the prompt (cases not to extract) to reduce hallucinated edges.
- Use `stopSequences` and low temperature to enforce JSON output.
- Normalize predicates to canonical IRIs; drop outputs containing labels or unrecognized predicates.
- Keep relation extractor stateless; no dependence on previous chunks.
- Provide caching keyed by `ChunkHash` + entity hash + property hash + prompt version to reuse results when rerunning.
- When decode fails, retry with validation errors appended to prompt (e.g., "predicate must be IRI from allowed list").
- Add `traceId` logging similar to entity extraction.
- Keep concurrency controlled; Stage 5 can run in the same `mapEffectPar` pipeline as Stage 3 if Stage 4 results are available, or run sequentially in a `flatMap` to reuse scoped properties.
- For symmetrical properties (e.g., `relatedTo`), instruct the model on direction conventions; enforce deterministic ordering (e.g., alphabetical by subject/object ID) if symmetric.
- Add heuristics to skip relation extraction when fewer than 2 entities exist or when property set is empty; short-circuit to empty `Chunk<Relation>`.
- Preserve literal formatting; dates as ISO strings, numbers as raw numerics, booleans as `true/false`.
- Provide test fixtures verifying relation extraction prompt templates and decode logic with sample LLM outputs.
- Keep relation extraction prompts versioned and stored near code.
- Encourage model to include justification snippets (short quotes) in an optional debug field for human review; drop this field before Schema decode to avoid validation noise.
- Use `Effect.catchTag` to map `NotImplemented` from `RelationExtractor` to `RelationExtractionFailed`.
- If property is functional, instruct model to pick the single best relation per subject; enforce in merge if duplicates slip through.
- Keep predicate range adherence strict: for datatype ranges, forbid entity IDs; for object ranges, forbid literals unless range is union.
- Optionally pre-compute candidate pairs (subject-object) to constrain model search space; pass as hints in prompt.
- Add detection for symmetric duplicates (A->B and B->A) when predicate is symmetric; prune duplicates in merge or immediately after decode.
- Ensure relation extraction respects attributes: use attributes as hints to choose predicates (e.g., birthDate -> birthDate property not generic relatedTo).
- For multi-sentence chunks, consider sentence-level relation grouping to reduce cross-sentence hallucinations; include sentence markers in prompt.
- Keep `RelationExtractor` dependency minimal: `LlmService` only; all schema/context passed in by caller.
- Provide a short-circuit mode using rule-based extraction for simple predicates (e.g., equality with regex) to save LLM calls when high confidence.
- Maintain metrics: relations per chunk, invalid predicate count, decode failure count, average latency.
- Log slow relation calls; differentiate between time spent in LLM vs decoding for diagnostics.
- Keep relation outputs stable across prompt versions by freezing prompt templates and versioning caches.
- When relation extraction is skipped, still propagate entities into a `KnowledgeGraph` fragment with empty relations for merge consistency.
- Ensure relation extraction stage returns `Chunk<Relation>` not `KnowledgeGraph`; let merge stage construct graphs.
- For prompts, show properties grouped by subject type to reduce cognitive load for the LLM.
- Encourage the model to avoid self-relations unless property permits; add explicit rule in prompt.
- Validate that each predicate exists in scoped property set; drop any out-of-scope relations before merge with a warning.
- Avoid global uniqueness assumptions; allow the same predicate multiple times with different objects unless functional.
- Provide deterministic ordering (sort relations by subjectId, predicate, object) post-decode for stable downstream operations.
- Handle numbers carefully: ensure numeric strings are parsed as numbers in `Relation` schema; configure `Schema` to accept numeric strings via refinements if needed.
- Keep optional property confidence scoring: allow LLM to emit a confidence (0-1); store as debug metadata not in `Relation` schema.
- Add guard for multi-hop reasoning; instruct model to avoid inferring relations that require external knowledge not present in chunk.
- Provide reranking of relations using lexical heuristics if necessary; keep pure and well-documented.

#### Phase 6: Graph Merge (Pure/Monoid)

- Represent fragment as `KnowledgeGraph` with `Chunk<Entity>` and `Chunk<Relation>` per chunk.
- Merge entities by `id`; union attributes with preference for non-empty values, or apply strategy: last-one-wins, first-one-wins, or merge-with-conflict flag.
- Detect attribute conflicts; record them in a `MergeConflict` log for review; keep merge pure and return conflicts as side-channel if needed.
- Merge relations by `(subjectId, predicate, object)` signature; deduplicate exact matches.
- Enforce functional properties: if multiple values exist for a functional predicate, keep first or highest-confidence and mark conflict.
- Preserve provenance: attach list of chunk indexes contributing to each entity/relation for auditability.
- Keep merge deterministic by sorting entities and relations before final output.
- Provide merge as pure function `mergeGraphs(a, b): KnowledgeGraph` to enable `Stream.runFold`.
- Consider using `HashMap`/`HashSet` for dedup to keep merge O(n) on graph size.
- Validate merged graph against `Schema` and optional SHACL shapes; fail fast if invalid.
- Keep merge associativity and identity for streaming reduction; test with small fixtures to guarantee monoid laws.
- Maintain mapping from mention -> entity ID to support co-reference resolution (future extension).
- Optionally compute summary statistics during merge: counts per class, predicate distribution.
- Ensure relations referencing missing entities are dropped or flagged; maintain invariant that every relation subject/object exists in merged entity set.
- Keep merge output stable across run order; rely on sorted union to avoid nondeterminism.
- Allow merging partial graphs from different sources by parameterizing merge strategy (strict vs permissive) via config.
- Provide `mergeGraphs` unit tests covering duplicate entity IDs, conflicting functional properties, self-relations, missing subjects/objects.
- Attach `sourceText` optionally; for streaming pipeline, keep `sourceText` empty or include concatenated chunk digests depending on size.
- Prepare output for Rdf conversion: map entity attributes and relations to triples, respecting datatype mappings.
- Keep merge pure of side effects; logging should happen outside in the stream fold.
- If entity attributes are nested (future), flatten or map to RDF-literals appropriately.
- Add support for `Relation` debug metadata only transiently; strip before final Schema encode.
- Provide final `KnowledgeGraph` ready for `RdfBuilder` to turn into Turtle.
- Keep merge tolerant to empty fragments; identity element is graph with empty arrays.
- Use `Chunk` aware operations to avoid converting to arrays repeatedly.
- Provide optional `mergeGraphsWithConflicts` returning `[KnowledgeGraph, MergeConflict[]]` for UI review tools.
- Maintain referential transparency; given same inputs, merge yields same output.

#### Phase 7: Output and Post-processing (RdfBuilder, Validation)

- Use `RdfBuilder` to convert merged `KnowledgeGraph` into triples; map entity IDs to IRIs using configured base namespace.
- For attributes, choose datatype based on Schema; numbers -> xsd:decimal, booleans -> xsd:boolean, dates -> xsd:dateTime (configurable).
- Preserve relation orientation; ensure predicates map directly to ontology IRIs without prefix loss.
- Include provenance triples (chunk index, source offsets) if supported; otherwise store externally in metadata.
- Run optional SHACL validation via `RdfService.validate`; treat violations as `ExtractionError` or warnings based on config.
- Provide serialization options: Turtle for export, JSON-LD for APIs; keep same graph semantics.
- Ensure output encoding is UTF-8; escape literals correctly.
- Add minimal graph cleaning: remove isolated entities if configured, but default to keep them for completeness.
- Emit metrics: total entities, relations, conflicts, validation warnings.
- Keep post-processing effect pure except for Rdf serialization IO.
- Provide CLI/Playground integration to dump graph to file for inspection.
- Version graph outputs (include ontology version, prompt version, pipeline version) in metadata for reproducibility.
- Ensure `extractToTurtle` is implemented as `Effect` chaining Stage 1-6 plus Rdf conversion; keep error channel typed with `ExtractionError`.
- Provide tests that round-trip `KnowledgeGraph` through RdfBuilder and back to ensure no data loss on serialization.
- Support streaming output variant if graph is huge: emit triples incrementally via `Stream` rather than building full string in memory.
- Keep Namespace resolution deterministic; store prefix map in config and reuse across serialization to avoid drift.
- Add optional compaction step to collapse repeated literal relations if configured.
- Provide example Turtle outputs in docs for quick validation.
- Keep `RdfBuilder` implementation free of LLM dependencies; pure data transformation only.
- Use `Effect.acquireUseRelease` if Rdf builder uses underlying stores that require cleanup.
- Validate final graph with `Schema` encode to ensure in-memory structure remains conformant before serialization.
- Include `sourceText` optionally in final graph for traceability; keep truncated to avoid giant outputs.

#### Phase 8: Orchestration with Effect.Stream

- Implement `streamingExtraction` as a `Stream` pipeline: `Stream.fromChunk` -> `mapEffect` retrieval -> `mapEffect` entity -> `mapEffect` scoping -> `mapEffect` relations -> `runFold` merge.
- Use `Stream.mapEffectPar` to parallelize entity + relation extraction; choose concurrency to respect rate limits.
- Guard concurrency with `maxQueued: concurrency * 2` using `Stream.buffer` to prevent memory blowups.
- Ensure `mapEffectPar` maintains output ordering if needed; if order is irrelevant post-merge, use unordered for throughput.
- Use `Stream.unwrapScoped` when services require scope management (e.g., NlpService resources) to ensure cleanup.
- Thread `ExtractionState` through pipeline immutably; avoid mutating properties on the state object.
- Handle errors with `Stream.tapError` for metrics and `Stream.mapError` to coerce into `ExtractionError`.
- Decide restart strategy: fail-fast on first chunk error or skip failed chunks; expose config flag (`failFast`).
- Provide `Stream.broadcast` when multiple consumers need chunk outputs (e.g., one for extraction, one for QA).
- Use `Stream.runCollect` in tests for deterministic arrays; use `runDrain` in prod when writing to sinks (Rdf, DB).
- Keep final effect typed: `Effect<KnowledgeGraph, ExtractionError, Services>` for `extractToTurtle` after `runFold`.
- Avoid `unsafeRunPromise` inside library code; leave execution to top-level app entrypoint.
- Encode `ExtractionError` union with tags to allow pattern matching; map LLM, ontology, RDF, and validation errors explicitly.
- Use `Schedule` for retries on LLM phases; attach `Schedule.recurs` and jitter to avoid thundering herd.
- Add per-chunk fiber supervision: track active fibers and expose gauge metrics.
- Keep stream interruption-friendly: use `Stream.interruptWhen` tied to a shutdown signal.
- Provide structured logging at each step with contextual tags; avoid string concatenation logs.
- For big docs, consider chunk-level checkpoints persisted to disk; on restart, resume from last processed chunk using `Stream.dropWhile` with persisted index.
- Use `Stream.tap` for instrumentation rather than mixing logging into business logic functions.
- Keep `ExtractionState` small; avoid carrying full ontology or large prompt strings through the stream.
- Add `Stream.compact` after each map to drop `undefined` results if needed.
- Use `Stream.chainParSwitch` cautiously if you need to interleave relation extraction with retrieval; document behavior clearly.
- Guard against unbounded memory: `Stream.take` in tests; consider streaming merges to disk for extremely large documents.
- Keep test harness for stream pipeline using `TestClock` to control timeouts and retries deterministically.
- Provide property-based tests with random chunk orders to ensure merge associativity/commutativity holds.
- Ensure `Stream` stages are referentially transparent; avoid hidden caches outside `Effect`.
- Document `Env` requirements per stage to keep DI clean and avoid leaking services into unrelated phases.
- Use `Effect.contextWith` to pull services rather than passing them explicitly through state when possible.
- Keep `Stream` combinators typed; avoid `any` casts; rely on `Schema` for runtime guard rails.
- Apply `Stream.throttleEnforce` if downstream sinks (DB) need rate limiting.
- Provide `Stream.mapEffect` vs `Stream.tap` distinction: use `tap` for side effects without altering data.
- Keep pipeline structure mirrored between `streamingExtraction` and `extractToTurtle` to avoid divergence.
- Write integration tests that run the full stream on a tiny doc with stub LLM to assert shape and error propagation.
- Use `Effect.onExit` to log success/failure per chunk in streaming pipeline.

#### Phase 9: Performance, Observability, and Testing

- Establish metrics: counters (`chunks_total`, `entities_total`, `relations_total`, `llm_timeouts_total`), histograms (chunk size, LLM latency), gauges (active_fibers).
- Add tracing spans around LLM calls, retrieval, and merge; propagate chunk index as span attribute.
- Provide log sampling for verbose debug logs; avoid flooding logs on large documents.
- Benchmark chunking and retrieval throughput; set budgets (e.g., chunking < 20ms/1k tokens).
- Load test LLM concurrency with stub service to validate supervision and backpressure behavior.
- Add contract tests for `EntityExtractor` and `RelationExtractor` ensuring schema-compatible outputs and proper error tagging.
- Include golden files for prompt templates; snapshot tests ensure future edits are intentional.
- Validate caching behavior; ensure cache hits bypass LLM and metrics reflect hits/misses.
- Add chaos tests: simulate `OntologyService` failures mid-stream to assert retries or skip behavior.
- Provide lint rules to avoid accidental `any` in workflow code.
- Keep docs and codegen aligned: update spec when prompt/version changes; version docs with semantic version tags.
- Test SHACL validation with sample shapes to ensure integration with `RdfService.validate`.
- Provide CLI for manual runs with toggles for concurrency, retrieval `k`, dry-run, cache usage.
- Add regression tests for merge associativity/commutativity with random fragment ordering.
- Validate that pipeline handles very small and very large inputs gracefully (0-length, >1M chars).
- Use `TestContext` to inject fake services (mock OntologyService, stub LlmService) for deterministic unit tests.
- Capture failure snapshots (chunk text, context, errors) for debugging; store securely.
- Ensure telemetry export is async and non-blocking; do not block pipeline on metrics/log writes.
- Add docs for operational runbooks: what to do on LLM provider outage, ontology load failure, cache corruption.
- Keep TypeScript strict mode enforced; run `tsc --noEmit` in CI.
- Use `vitest` with parallelization disabled for integration tests touching shared resources.
- Provide coverage targets for workflow modules; ensure tests cover error paths.
- Document retry policies clearly; avoid infinite retries that could stall pipeline.
- Add invariant checks around `Entity.id` uniqueness post-merge; fail if duplicates remain unresolved.
- Provide sample ontologies and source texts under `test-data` for reproducible QA.
- Keep `bun.lock` or package manager lockfile stable; avoid accidental dependency drift impacting NLP/LLM behavior.
- Monitor memory usage during streaming; ensure `Chunk` conversions do not leak arrays.
- Keep lint and format tasks fast to encourage frequent runs; integrate into pre-push hook.
- Provide synthetic latency injection toggles in services to test timeout handling.
- Add configuration validation at startup to catch misconfigurations before processing.
- Document assumptions about text language, character set, and ontology structure explicitly in this spec.
- Review `@effect/ai` updates regularly; align `LlmService` implementation with latest `LanguageModel`/`SchemaModel` APIs.
- Keep sandbox awareness: avoid writing outside allowed roots; caches should live under writable project dirs.
- Plan for multi-tenant contexts: ensure caches and metrics are namespaced by tenant/ontology.
- Provide release checklist: update docs, bump version, run full test suite, verify playground output, regenerate prompt snapshots.
- Add security considerations: do not log sensitive source text; redact PII when needed; ensure TLS enforced on LLM provider.
- Keep fallback path for offline mode: allow ingestion without LLM to still run retrieval and produce empty graphs for testing.
- Validate the pipeline using property-based tests for ID generation and merge invariants.
- Establish coding standards for prompt templates to keep them consistent (placeholders, JSON structure, instructions).
- Keep `Schema` definitions co-located with domain models; avoid duplicating them in services.
- Ensure `Effect` generics annotate all error channels; avoid `Effect<_, unknown>` signatures.
- Use `Layer` composition to assemble services; keep layering diagrams in docs for clarity.
- Provide `README` snippet referencing this spec for newcomers.

#### Phase 10: Notes on Effect Modules and Integration Points

- `Effect`: use `Effect.gen` for sequential composition; prefer `Effect.all` for parallel retrieval steps when independent; always type error channels.
- `Stream`: leverage `mapEffectPar` for concurrency; use `buffer` to manage backpressure; `runFold` for merge; `broadcast` for multi-sink; `throttleShape` for rate limits.
- `Schema`: use `Schema.Class` for domain models; `Schema.decodeUnknown` for LLM outputs; `Schema.annotations` to drive prompt generation; refinements for invariants.
- `@effect/ai`: adopt `LanguageModel` and `SchemaModel` to request structured output; define provider layer (OpenAI, Anthropic) at app boundary; enforce `ResponseFormat.json` when available.
- Use `Effect.tapBoth` around LLM calls to log success/failure metrics without altering control flow.
- Apply `Effect.sandbox` to inspect causes; map to domain errors (`ExtractionError`) via `Effect.mapError`.
- Keep environment requirements explicit in type signatures to ensure DI is clear; prefer small service interfaces (LlmService, OntologyService, NlpService, RdfBuilder).
- When bridging to `SchemaModel`, define validators for arrays of `Entity`/`Relation`; rely on automatic JSON parsing rather than regex extraction.
- Use `FiberRef` to store per-request metadata (trace IDs, prompt version) and propagate through `Effect`/`Stream`.
- Prefer `Cause.pretty` for debugging but avoid leaking into production logs; include chunk index and ontology id in error messages.
- Use `Effect.scoped` for resources like BM25 indices if they ever become lazily initialized.
- Keep `Chunk` operations pure; avoid `push`/mutation; rely on `Chunk.appendAll` and `Chunk.map`.
- Utilize `Option` and `Either` (from `effect`) for optional values instead of `null`/`undefined` where practical.
- Provide `Schedule` definitions centrally; share between entity and relation extraction to keep retry behavior consistent.
- Use `Logger` service integration to centralize logging configuration; avoid `console.log` in library code.
- Keep `ConfigService` typed via `Schema` to prevent runtime config errors.
- For testing, use `TestClock` and `TestContext` to control timeouts and fiber scheduling.
- Use `Scope` and `Layer` composition to assemble services for CLI/Playground; keep layering diagrams in docs or comments.
- Ensure code examples in docs compile against current `@core-v2` APIs; keep them updated as signatures change.

---

### 7\. End-to-End Walkthrough (Stepwise Construction)

- **Input Preparation:** Ingest raw book/text; normalize whitespace and line endings; compute `ChunkHash`.
- **Chunk Stream Build:** `Stream.fromChunk(NlpService.chunkText(text, options))` to produce `ExtractionState` seeds.
- **Retrieval Stage:** `Stream.mapEffect` to attach `classes` via `OntologyService.searchClasses` (BM25/semantic); optionally `properties` if eager.
- **Entity Stage:** `Stream.mapEffect` invoking `EntityExtractor.extract` with LLM + `Schema.decodeUnknown` to get `entities`.
- **Property Scope Stage:** `Stream.mapEffect` to fetch allowed properties for entity types; attach to state.
- **Relation Stage:** `Stream.mapEffect` to extract relations using `RelationExtractor.extract`; produces `KnowledgeGraph` fragments.
- **Merge Stage:** `Stream.runFold` with `mergeGraphs` monoid to produce final `KnowledgeGraph`.
- **Rdf Conversion:** `Effect.map` the merged graph through `RdfBuilder` to get Turtle/JSON-LD.
- **Error Handling:** Each `mapEffect` uses `Effect.catchTag` to wrap errors into `ExtractionError` variants; pipeline stops or skips per config.
- **Metrics:** `Stream.tap` and `Effect.tap` to record counters and latency; `Effect.annotateLogs` for traceability.
- **Caching:** Wrap LLM steps with caching keyed by `ChunkHash` + prompt version.
- **Testing:** Use stub `LlmService` in tests; run end-to-end on sample text; assert graph matches expected fixtures.
- **Operational Controls:** Flags for concurrency, fail-fast, dry-run, cache usage; environment-based provider selection for LLM.
- **Extensibility:** Additional phases (co-reference resolution, summarization) can be inserted as `mapEffect` steps without breaking purity.
- **Safety:** All IO captured in `Effect`; no hidden shared mutable state; deterministic merges ensure reproducibility.

---

### 8\. Backlog / TODO Anchors (Grounded in Current Stubs)

- Implement `streamingExtraction` and `extractToTurtle` per the signatures in `Workflow/StreamingExtraction.ts` and `Workflow/TwoStageExtraction.ts` using the above phases.
- Implement `EntityExtractor` and `RelationExtractor` using `LlmService.generateStructured` and `Schema` decoding.
- Implement `LlmService` atop `@effect/ai` `LanguageModel`, supporting JSON structured outputs and timeouts.
- Fill `mergeGraphs` utility and tests enforcing monoid laws and conflict reporting.
- Add caching layer for LLM calls with pluggable storage (in-memory, file, Redis) respecting sandbox constraints.
- Integrate `RdfBuilder` serialization and SHACL validation into `extractToTurtle`.
- Add observability hooks (metrics/tracing/logging) as outlined to support production readiness.
- Build playground CLI paths to exercise each stage independently with stubbed services.
- Write comprehensive unit/integration tests covering all schema decodes, retrieval, extraction, scoping, relations, and merge.

---

### 9\. Quick Reference for Maintainers

- **Primary types:** `Entity`, `Relation`, `KnowledgeGraph`, `ClassDefinition`, `PropertyDefinition`, `TextChunk`.
- **Primary services:** `NlpService` (chunk/search), `OntologyService` (ontology load/search), `EntityExtractor`/`RelationExtractor` (LLM), `LlmService` (LLM backend), `RdfBuilder` (serialization).
- **Primary combinators:** `Stream.mapEffectPar`, `Stream.runFold`, `Effect.gen`, `Schema.decodeUnknown`, `Effect.timeout`, `Effect.retry`, `Schedule.exponential`.
- **Primary configs:** chunk size, retrieval `k`, concurrency, prompt versions, cache toggles, fail-fast vs skip-on-error, SHACL validation toggle.
- **Primary invariants:** entity IDs snake_case; predicates from ontology; relations reference known entities; merge is associative with identity; no hallucinated classes/properties.

---

### 10\. Phase-by-Phase Implementation Recipes and Edge Cases

##### Phase 0 (Pre-flight)

- Validate config via `Schema.decodeUnknown(ExtractionConfig)` before starting; fail with actionable error messages.
- Ensure ontology path exists using `FileSystem.exists`; short-circuit with `OntologyFileNotFound` if missing.
- Warm BM25/semantic indexes at startup to avoid first-request latency spikes; run warm-up inside `Layer.scoped`.
- Verify LLM provider credentials via a cheap test call (`generateText("ping")`) and cache the health result.
- Prepare prompt templates with placeholders resolved at runtime; store template versions in config.
- Lock dependency versions that affect NLP (wink models) to avoid non-deterministic tokenization changes.
- Run a dry-run self-check: chunk minimal text and run retrieval with stub services to ensure pipeline wiring is intact.
- Precompute prefix map for ontology IRIs and expose to prompts and Rdf builder.
- Generate a run-level UUID and store in `FiberRef` to tag logs/metrics consistently.
- Register global error handler to turn unhandled defects into logged diagnostics without crashing the process abruptly.

##### Phase 1 (Chunking)

- Handle documents with long sentences by applying secondary split on punctuation when sentence exceeds max token budget.
- Detect language drift; if chunk language differs from ontology language, consider increasing retrieval `k`.
- Guard against extremely long tokens (URLs); consider truncating or replacing with placeholder to keep token counts stable.
- Include structural hints like headings as separate tokens to guide later retrieval and extraction.
- Keep chunk overlap minimal to reduce duplicate extraction; measure duplication rate and adjust overlap size.
- When chunking code blocks or tables, preserve formatting markers to retain semantic boundaries.
- Provide optional OCR cleanup step for scanned text before chunking (strip artifacts).
- Persist chunk metadata to disk for reprocessing without re-chunking large sources.
- Normalize quotes/apostrophes to a consistent form to help LLM matching with ontology labels.
- Add checksum validation to detect mutated input between chunking and later phases.

##### Phase 2 (Context Retrieval)

- Apply query expansion using synonyms from ontology labels/altLabels to improve recall.
- When BM25 results are sparse, backfill with semantic-only results to maintain context richness.
- For ontology with deep hierarchies, consider limiting retrieval to leaf classes unless parent context is required.
- Detect and remove nearly identical classes (e.g., same label) from prompt to save tokens.
- Attach compact examples to classes/properties if available to prime the LLM.
- Keep retrieval deterministic by seeding any sampling in semantic search if present.
- Provide tracing for retrieval scoring breakdown to debug relevance issues.
- Limit property retrieval to those whose range matches observed literal patterns (numbers/dates) in chunk.
- Cache tokenized documents used in BM25 to avoid repeated tokenization in future builds of the index.
- Ensure retrieval gracefully handles ontologies without embeddings by downgrading to BM25-only with a log entry.

##### Phase 3 (Entity Extraction)

- Include a guardrail asking the LLM to emit an empty list explicitly when no entities are found; helps decode stability.
- Provide a minimal JSON schema example in prompt that mirrors `Entity` Schema to reduce format drift.
- Detect and drop entities with empty `types` arrays before decode; instruct model to always include at least one class.
- If multiple mentions map to same ID inside chunk, aggregate attributes and keep the longest mention as canonical.
- Enforce casing normalization for IDs but keep mentions untouched.
- When chunk contains ambiguous pronouns, instruct model to skip rather than guess entity.
- Use `Effect.firstSuccessOf` with alternative prompt templates when initial decode fails repeatedly.
- Record per-entity confidence if model supports it; store externally for ranking/QA.
- Add guard to cap attribute key count to prevent runaway JSON if prompt misbehaves.
- In multilingual chunks, allow types to be emitted regardless of language; rely on ontology IRIs for correctness.

##### Phase 4 (Property Scoping)

- Maintain a cache of domain->properties and range->properties maps to speed up repeated lookups.
- Filter properties whose range contradicts observed attribute literal types (e.g., numeric only).
- Keep property descriptions concise (<120 chars) when passing to prompts.
- If ontology defines property subPropertyOf relationships, include inherited predicates optionally in scoped list.
- Track whether properties are deprecated and exclude them from prompts unless explicitly allowed.
- Align property ordering with ontology-defined priority if available.
- If scoped properties exceed a prompt budget, prioritize functional and datatype properties first.
- Normalize property labels to ASCII for prompt clarity while retaining IRIs in state.
- Provide scoping fallback: if lookup fails, return an empty property set with warning to avoid halting pipeline.
- Store scoping results in memory with eviction policy to prevent unbounded growth.

##### Phase 5 (Relation Extraction)

- Provide explicit "do not infer" rules in prompt (e.g., avoid temporal relations without explicit dates).
- Include entity attributes as hints to pick predicates (e.g., if attribute is a team name, prefer `memberOf`).
- Ask model to avoid duplicate relations differing only by capitalization; canonicalize before decode.
- For literal objects, request model to include datatype hints; use them to coerce values during decode.
- Require the model to emit an empty array rather than `null` to simplify decoding logic.
- For symmetric predicates, pick a deterministic orientation (alphabetical IDs) and state it in prompt.
- Include examples of valid and invalid relations to anchor model behavior.
- Detect and drop self-relations unless predicate explicitly allows self-links.
- Keep prompts small: list only top-N properties relevant to entities present; avoid dumping entire scoped list if large.
- Encourage quote extraction: optional debug field pointing to supporting text spans; strip in production decode.
- Add a guard to ensure `object` references known entity IDs or literal types; drop others pre-merge.

##### Phase 6 (Merge)

- Before merge, normalize entity IDs to ensure consistent casing and underscore usage.
- When conflicts occur, store both values in a conflict log with chunk provenance for human resolution.
- For relations referencing missing entities, either drop or create placeholder entities with `@invalid` tag based on config.
- Deduplicate entities using both ID and mention+type similarity to catch near-duplicate IDs.
- Merge attributes by preferring values backed by provenance from later chunks (configurable strategy).
- Provide conflict metrics to surface hotspots in source text where extra curation may be needed.
- Ensure merge functions are pure and side-effect free to keep `runFold` lawful.
- Keep merged graph sorted for deterministic serialization output.
- Run a final validation after merge to confirm invariants: all relations have valid subjects, predicates, objects.
- Consider optional post-merge co-reference resolution to unify entities that refer to the same real-world item.

##### Phase 7 (Output/Validation)

- Provide multiple serialization targets: Turtle for interoperability, compact JSON for APIs, optional NDJSON stream for pipelines.
- Validate with SHACL and surface violations with pointers to offending triples.
- Apply datatype conversions carefully when emitting RDF literals; respect ontology range if typed.
- Ensure namespace prefixes are stable and documented for downstream consumers.
- Support chunk-level provenance mapping (chunk index -> triple count) in output metadata.
- Offer a `strict` mode that fails on any validation warning and a `permissive` mode that logs and proceeds.
- Include pipeline version and prompt version in serialized metadata for audit trails.
- Provide checksum of final graph to detect accidental modifications downstream.
- Keep output generation memory-safe by streaming when graphs are large.
- Add CLI flags to write output to file or stdout; ensure sandbox respects writable roots.
- Include option to redact sensitive literals before serialization if required by policy.

================
File: src/Domain/Error/Base.ts
================
/**
 * Domain Errors: Base Error Types
 *
 * Tagged error hierarchy using Schema.TaggedError for type-safe error handling.
 *
 * @since 2.0.0
 * @module Domain/Error/Base
 */

import { Schema } from "effect"

/**
 * BaseError - Root error type
 *
 * All domain errors extend this base.
 *
 * @since 2.0.0
 * @category Error
 */
export class BaseError extends Schema.TaggedError<BaseError>()("BaseError", {
  message: Schema.String.annotations({
    title: "Error Message",
    description: "Human-readable error description"
  }),

  cause: Schema.optional(Schema.Unknown).annotations({
    title: "Cause",
    description: "Underlying error or failure cause"
  })
}) {}

/**
 * NotImplemented - Temporary error for incomplete implementations
 *
 * Used during development instead of Effect.die to maintain type safety.
 * Should be replaced with actual implementations.
 *
 * @since 2.0.0
 * @category Error
 */
export class NotImplemented extends Schema.TaggedError<NotImplemented>()(
  "NotImplemented",
  {
    message: Schema.String,

    /**
     * Service name
     */
    service: Schema.String.annotations({
      title: "Service",
      description: "Name of the service with unimplemented method"
    }),

    /**
     * Method name
     */
    method: Schema.String.annotations({
      title: "Method",
      description: "Name of the unimplemented method"
    })
  }
) {}

================
File: src/Domain/Error/Extraction.ts
================
/**
 * Domain Errors: Extraction Errors
 *
 * Errors specific to entity and relation extraction.
 *
 * @since 2.0.0
 * @module Domain/Error/Extraction
 */

import { Schema } from "effect"
import { BaseError } from "./Base.js"

/**
 * ExtractionError - Errors during extraction process
 *
 * @since 2.0.0
 * @category Error
 */
export class ExtractionError extends Schema.TaggedError<ExtractionError>()(
  "ExtractionError",
  {
    message: Schema.String,
    cause: Schema.optional(Schema.Unknown),

    /**
     * Text that failed to extract
     */
    text: Schema.optional(Schema.String).annotations({
      title: "Text",
      description: "Source text that caused the error"
    })
  }
) {}

/**
 * MentionExtractionFailed - Mention extraction failure
 *
 * @since 2.0.0
 * @category Error
 */
export class MentionExtractionFailed extends Schema.TaggedError<MentionExtractionFailed>()(
  "MentionExtractionFailed",
  {
    message: Schema.String,
    cause: Schema.optional(Schema.Unknown),
    text: Schema.optional(Schema.String)
  }
) {}

/**
 * EntityExtractionFailed - Entity extraction failure
 *
 * @since 2.0.0
 * @category Error
 */
export class EntityExtractionFailed extends Schema.TaggedError<EntityExtractionFailed>()(
  "EntityExtractionFailed",
  {
    message: Schema.String,
    cause: Schema.optional(Schema.Unknown),
    text: Schema.optional(Schema.String)
  }
) {}

/**
 * RelationExtractionFailed - Relation extraction failure
 *
 * @since 2.0.0
 * @category Error
 */
export class RelationExtractionFailed extends Schema.TaggedError<RelationExtractionFailed>()(
  "RelationExtractionFailed",
  {
    message: Schema.String,
    cause: Schema.optional(Schema.Unknown),
    text: Schema.optional(Schema.String),

    /**
     * Entities that were successfully extracted (for debugging)
     */
    entities: Schema.optional(Schema.Array(Schema.Unknown))
  }
) {}

/**
 * SchemaGenerationFailed - JSON schema generation failure
 *
 * @since 2.0.0
 * @category Error
 */
export class SchemaGenerationFailed extends Schema.TaggedError<SchemaGenerationFailed>()(
  "SchemaGenerationFailed",
  {
    message: Schema.String,
    cause: Schema.optional(Schema.Unknown)
  }
) {}

/**
 * ValidationFailed - Schema validation failure
 *
 * @since 2.0.0
 * @category Error
 */
export class ValidationFailed extends Schema.TaggedError<ValidationFailed>()(
  "ValidationFailed",
  {
    message: Schema.String,
    cause: Schema.optional(Schema.Unknown),

    /**
     * Invalid data that failed validation
     */
    data: Schema.optional(Schema.Unknown)
  }
) {}

/**
 * EntityValidationFailed - Entity validation failure during extraction
 *
 * Used for per-row validation failures that don't kill the entire chunk.
 * These errors are logged but don't stop processing.
 *
 * @since 2.0.0
 * @category Error
 */
export class EntityValidationFailed extends Schema.TaggedError<EntityValidationFailed>()(
  "EntityValidationFailed",
  {
    /**
     * Reason for validation failure
     */
    reason: Schema.String,

    /**
     * Raw entity data that failed validation
     */
    entityData: Schema.Unknown,

    /**
     * Optional chunk index for context
     */
    chunkIndex: Schema.optional(Schema.Number)
  }
) {}

/**
 * RelationValidationFailed - Relation validation failure during extraction
 *
 * Used for per-row validation failures that don't kill the entire chunk.
 * These errors are logged but don't stop processing.
 *
 * @since 2.0.0
 * @category Error
 */
export class RelationValidationFailed extends Schema.TaggedError<RelationValidationFailed>()(
  "RelationValidationFailed",
  {
    /**
     * Reason for validation failure
     */
    reason: Schema.String,

    /**
     * Raw relation data that failed validation
     */
    relationData: Schema.Unknown,

    /**
     * Optional chunk index for context
     */
    chunkIndex: Schema.optional(Schema.Number)
  }
) {}

================
File: src/Domain/Error/index.ts
================
/**
 * Domain Error Exports
 *
 * @since 2.0.0
 * @module Domain/Error
 */

export * from "./Base.js"
export * from "./Extraction.js"
export * from "./Llm.js"
export * from "./Ontology.js"
export * from "./Rdf.js"

================
File: src/Domain/Error/Llm.ts
================
/**
 * Domain Errors: LLM Errors
 *
 * Errors specific to LLM operations.
 *
 * @since 2.0.0
 * @module Domain/Error/Llm
 */

import { Schema } from "effect"

/**
 * LlmError - LLM operation errors
 *
 * @since 2.0.0
 * @category Error
 */
export class LlmError extends Schema.TaggedError<LlmError>()(
  "LlmError",
  {
    message: Schema.String,
    cause: Schema.optional(Schema.Unknown)
  }
) {}

/**
 * LlmTimeout - LLM call exceeded timeout
 *
 * @since 2.0.0
 * @category Error
 */
export class LlmTimeout extends Schema.TaggedError<LlmTimeout>()(
  "LlmTimeout",
  {
    message: Schema.String,
    cause: Schema.optional(Schema.Unknown),

    /**
     * Timeout duration in milliseconds
     */
    timeoutMs: Schema.optional(Schema.Number)
  }
) {}

/**
 * LlmRateLimit - Rate limit exceeded
 *
 * @since 2.0.0
 * @category Error
 */
export class LlmRateLimit extends Schema.TaggedError<LlmRateLimit>()(
  "LlmRateLimit",
  {
    message: Schema.String,
    cause: Schema.optional(Schema.Unknown),

    /**
     * Retry after duration in milliseconds (if available)
     */
    retryAfterMs: Schema.optional(Schema.Number)
  }
) {}

/**
 * LlmInvalidResponse - LLM returned invalid/unparseable response
 *
 * @since 2.0.0
 * @category Error
 */
export class LlmInvalidResponse extends Schema.TaggedError<LlmInvalidResponse>()(
  "LlmInvalidResponse",
  {
    message: Schema.String,
    cause: Schema.optional(Schema.Unknown),

    /**
     * Raw response from LLM
     */
    response: Schema.optional(Schema.String)
  }
) {}

================
File: src/Domain/Error/Ontology.ts
================
/**
 * Domain Errors: Ontology Errors
 *
 * Errors specific to ontology operations.
 *
 * @since 2.0.0
 * @module Domain/Error/Ontology
 */

import { Schema } from "effect"

/**
 * OntologyError - Ontology operation errors
 *
 * @since 2.0.0
 * @category Error
 */
export class OntologyError extends Schema.TaggedError<OntologyError>()(
  "OntologyError",
  {
    message: Schema.String,
    cause: Schema.optional(Schema.Unknown)
  }
) {}

/**
 * ClassNotFound - Class IRI not found in ontology
 *
 * @since 2.0.0
 * @category Error
 */
export class ClassNotFound extends Schema.TaggedError<ClassNotFound>()(
  "ClassNotFound",
  {
    message: Schema.String,
    cause: Schema.optional(Schema.Unknown),

    /**
     * Class IRI that was not found
     */
    classIri: Schema.String.annotations({
      title: "Class IRI",
      description: "IRI of the class that was not found"
    })
  }
) {}

/**
 * PropertyNotFound - Property IRI not found in ontology
 *
 * @since 2.0.0
 * @category Error
 */
export class PropertyNotFound extends Schema.TaggedError<PropertyNotFound>()(
  "PropertyNotFound",
  {
    message: Schema.String,
    cause: Schema.optional(Schema.Unknown),

    /**
     * Property IRI that was not found
     */
    propertyIri: Schema.String.annotations({
      title: "Property IRI",
      description: "IRI of the property that was not found"
    })
  }
) {}

/**
 * OntologyFileNotFound - Ontology file not found
 *
 * @since 2.0.0
 * @category Error
 */
export class OntologyFileNotFound extends Schema.TaggedError<OntologyFileNotFound>()(
  "OntologyFileNotFound",
  {
    message: Schema.String,
    cause: Schema.optional(Schema.Unknown),

    /**
     * File path that was not found
     */
    path: Schema.String.annotations({
      title: "File Path",
      description: "Path to the ontology file that was not found"
    })
  }
) {}

/**
 * OntologyParsingFailed - Failed to parse ontology file
 *
 * @since 2.0.0
 * @category Error
 */
export class OntologyParsingFailed extends Schema.TaggedError<OntologyParsingFailed>()(
  "OntologyParsingFailed",
  {
    message: Schema.String,
    cause: Schema.optional(Schema.Unknown),

    /**
     * File path that failed to parse
     */
    path: Schema.String.annotations({
      title: "File Path",
      description: "Path to the ontology file that failed to parse"
    })
  }
) {}

================
File: src/Domain/Error/Rdf.ts
================
/**
 * Domain Errors: RDF Errors
 *
 * Errors specific to RDF processing and serialization.
 *
 * @since 2.0.0
 * @module Domain/Error/Rdf
 */

import { Schema } from "effect"

/**
 * RdfError - RDF processing errors
 *
 * @since 2.0.0
 * @category Error
 */
export class RdfError extends Schema.TaggedError<RdfError>()(
  "RdfError",
  {
    message: Schema.String,
    cause: Schema.optional(Schema.Unknown)
  }
) {}

/**
 * SerializationFailed - RDF serialization failure
 *
 * @since 2.0.0
 * @category Error
 */
export class SerializationFailed extends Schema.TaggedError<SerializationFailed>()(
  "SerializationFailed",
  {
    message: Schema.String,
    cause: Schema.optional(Schema.Unknown),

    /**
     * Target format that failed
     */
    format: Schema.optional(Schema.String).annotations({
      title: "Format",
      description: "Serialization format (e.g., 'Turtle', 'N-Triples')"
    })
  }
) {}

/**
 * ParsingFailed - RDF parsing failure
 *
 * @since 2.0.0
 * @category Error
 */
export class ParsingFailed extends Schema.TaggedError<ParsingFailed>()(
  "ParsingFailed",
  {
    message: Schema.String,
    cause: Schema.optional(Schema.Unknown),

    /**
     * Source format that failed to parse
     */
    format: Schema.optional(Schema.String)
  }
) {}

================
File: src/Domain/Model/Entity.ts
================
/**
 * Domain Model: Entity and Relation
 *
 * Pure Schema.Class definitions for knowledge graph entities and relations.
 * No business logic - just data structures with validation.
 *
 * @since 2.0.0
 * @module Domain/Model/Entity
 */

import { Equal, Hash, pipe, Schema } from "effect"

/**
 * Entity - Represents an extracted entity from text
 *
 * @example
 * ```typescript
 * const entity = new Entity({
 *   id: "cristiano_ronaldo",
 *   mention: "Cristiano Ronaldo",
 *   types: ["http://schema.org/Person", "http://schema.org/Athlete"],
 *   attributes: {
 *     "http://schema.org/birthDate": "1985-02-05",
 *     "http://schema.org/nationality": "Portuguese"
 *   }
 * })
 * ```
 *
 * @since 2.0.0
 * @category Domain
 */
export class Entity extends Schema.Class<Entity>("Entity")({
  /**
   * Unique identifier for the entity (snake_case)
   *
   * @example "cristiano_ronaldo", "al_nassr_fc"
   */
  id: Schema.String.pipe(
    Schema.pattern(/^[a-z][a-z0-9_]*$/),
    Schema.annotations({
      title: "Entity ID",
      description: "Unique identifier in snake_case format"
    })
  ),

  /**
   * Original text mention from source
   *
   * @example "Cristiano Ronaldo", "Al-Nassr"
   */
  mention: Schema.String.annotations({
    title: "Mention",
    description: "Exact text span extracted from source"
  }),

  /**
   * Ontology class URIs this entity instantiates
   *
   * @example ["http://schema.org/Person", "http://schema.org/Athlete"]
   */
  types: Schema.Array(Schema.String).pipe(
    Schema.minItems(1),
    Schema.annotations({
      title: "Types",
      description: "Ontology class URIs (at least one required)"
    })
  ),

  /**
   * Entity attributes as property-value pairs
   *
   * Keys are property URIs, values are literals (string, number, boolean)
   *
   * @example
   * ```typescript
   * {
   *   "http://schema.org/birthDate": "1985-02-05",
   *   "http://schema.org/age": 39,
   *   "http://schema.org/active": true
   * }
   * ```
   */
  attributes: Schema.Record({
    key: Schema.String,
    value: Schema.Union(Schema.String, Schema.Number, Schema.Boolean)
  }).annotations({
    title: "Attributes",
    description: "Property-value pairs (literal values only)"
  })
}) {
  /**
   * Debugger-friendly representation
   */
  toJSON() {
    return {
      _tag: "Entity" as const,
      id: this.id,
      mention: this.mention,
      types: this.types,
      attributes: this.attributes
    }
  }
}

/**
 * Relation - Represents a relationship between entities
 *
 * Links two entities via an ontology property.
 *
 * @example
 * ```typescript
 * const relation = new Relation({
 *   subjectId: "cristiano_ronaldo",
 *   predicate: "http://schema.org/memberOf",
 *   object: "al_nassr_fc"  // Entity reference
 * })
 *
 * const literalRelation = new Relation({
 *   subjectId: "cristiano_ronaldo",
 *   predicate: "http://schema.org/birthDate",
 *   object: "1985-02-05"  // Literal value
 * })
 * ```
 *
 * @since 2.0.0
 * @category Domain
 */
export class Relation extends Schema.Class<Relation>("Relation")({
  /**
   * Entity ID of the subject
   *
   * @example "cristiano_ronaldo"
   */
  subjectId: Schema.String.annotations({
    title: "Subject ID",
    description: "Entity ID of the triple subject"
  }),

  /**
   * Ontology property URI
   *
   * @example "http://schema.org/memberOf"
   */
  predicate: Schema.String.annotations({
    title: "Predicate",
    description: "Ontology property URI"
  }),

  /**
   * Object - either entity ID or literal value
   *
   * - String starting with lowercase letter = entity reference
   * - Other string = literal
   * - Number/Boolean = literal
   */
  object: Schema.Union(
    Schema.String,
    Schema.Number,
    Schema.Boolean
  ).annotations({
    title: "Object",
    description: "Entity ID reference or literal value"
  })
}) {
  /**
   * Check if object is an entity reference (vs literal)
   */
  get isEntityReference(): boolean {
    return typeof this.object === "string" && /^[a-z][a-z0-9_]*$/.test(this.object)
  }

  /**
   * Structural equality based on (subjectId, predicate, object) signature
   */
  [Equal.symbol](that: Relation): boolean {
    return (
      Equal.equals(this.subjectId, that.subjectId) &&
      Equal.equals(this.predicate, that.predicate) &&
      Equal.equals(this.object, that.object)
    )
  }

  /**
   * Structural hash based on (subjectId, predicate, object) signature
   */
  [Hash.symbol](): number {
    return Hash.cached(
      this,
      pipe(
        Hash.hash(this.subjectId),
        Hash.combine(Hash.hash(this.predicate)),
        Hash.combine(Hash.hash(this.object))
      )
    )
  }

  /**
   * Debugger-friendly representation
   */
  toJSON() {
    return {
      _tag: "Relation" as const,
      subjectId: this.subjectId,
      predicate: this.predicate,
      object: this.object,
      isEntityReference: this.isEntityReference
    }
  }
}

/**
 * KnowledgeGraph - Complete extraction result
 *
 * Contains all entities and relations extracted from a text.
 *
 * @since 2.0.0
 * @category Domain
 */
export class KnowledgeGraph extends Schema.Class<KnowledgeGraph>("KnowledgeGraph")({
  /**
   * All extracted entities
   */
  entities: Schema.Array(Entity).annotations({
    title: "Entities",
    description: "All entities extracted from text"
  }),

  /**
   * All extracted relations
   */
  relations: Schema.Array(Relation).annotations({
    title: "Relations",
    description: "All relations between entities"
  }),

  /**
   * Source text (optional, for provenance)
   */
  sourceText: Schema.optional(Schema.String).annotations({
    title: "Source Text",
    description: "Original text this graph was extracted from"
  })
}) {
  /**
   * Get entity by ID
   */
  getEntity(id: string): Entity | undefined {
    return this.entities.find((e) => e.id === id)
  }

  /**
   * Get all relations where entity is subject
   */
  getRelationsFrom(subjectId: string): Array<Relation> {
    return this.relations.filter((r) => r.subjectId === subjectId)
  }

  /**
   * Get all relations where entity is object
   */
  getRelationsTo(entityId: string): Array<Relation> {
    return this.relations.filter(
      (r) => typeof r.object === "string" && r.object === entityId
    )
  }

  toJSON() {
    return {
      _tag: "KnowledgeGraph" as const,
      entities: this.entities.map((e) => e.toJSON()),
      relations: this.relations.map((r) => r.toJSON()),
      sourceText: this.sourceText
    }
  }
}

================
File: src/Domain/Model/index.ts
================
/**
 * Domain Model Exports
 *
 * @since 2.0.0
 * @module Domain/Model
 */

export * from "./Entity.js"
export * from "./Ontology.js"

================
File: src/Domain/Model/Ontology.ts
================
/**
 * Domain Model: Ontology Types
 *
 * Pure Schema.Class definitions for ontology metadata (classes and properties).
 *
 * @since 2.0.0
 * @module Domain/Model/Ontology
 */

import { Schema } from "effect"
import {
  enhanceTextForSearch,
  extractLocalName,
  splitCamelCase,
  transformIriArrayToLocalNames
} from "../../Utils/Rdf.js"

/**
 * ClassDefinition - OWL/RDFS Class metadata
 *
 * Represents a class from the ontology with its metadata.
 *
 * @example
 * ```typescript
 * const personClass = new ClassDefinition({
 *   id: "http://schema.org/Person",
 *   label: "Person",
 *   comment: "A person (alive, dead, undead, or fictional).",
 *   properties: ["http://schema.org/name", "http://schema.org/birthDate"]
 * })
 * ```
 *
 * @since 2.0.0
 * @category Domain
 */
export class ClassDefinition extends Schema.Class<ClassDefinition>("ClassDefinition")({
  /**
   * Class URI
   *
   * @example "http://schema.org/Person"
   */
  id: Schema.String.annotations({
    title: "Class IRI",
    description: "Full IRI of the OWL/RDFS class"
  }),

  /**
   * Human-readable label
   *
   * @example "Person"
   */
  label: Schema.String.annotations({
    title: "Label",
    description: "rdfs:label - human-readable name"
  }),

  /**
   * Description/documentation
   *
   * @example "A person (alive, dead, undead, or fictional)."
   */
  comment: Schema.String.annotations({
    title: "Comment",
    description: "rdfs:comment - class description"
  }),

  /**
   * Property IRIs applicable to this class
   *
   * @example ["http://schema.org/name", "http://schema.org/birthDate"]
   */
  properties: Schema.Array(Schema.String).annotations({
    title: "Properties",
    description: "Property IRIs that can be used with this class"
  }),

  /**
   * SKOS preferred labels (skos:prefLabel)
   *
   * @example ["Person", "Human"]
   */
  prefLabels: Schema.Array(Schema.String).pipe(
    Schema.annotations({
      title: "Preferred Labels",
      description: "SKOS preferred labels - primary names for the concept"
    }),
    Schema.propertySignature,
    Schema.withConstructorDefault(() => [])
  ),

  /**
   * SKOS alternative labels (skos:altLabel) - synonyms
   *
   * @example ["Individual", "Human Being"]
   */
  altLabels: Schema.Array(Schema.String).pipe(
    Schema.annotations({
      title: "Alternative Labels",
      description: "SKOS alternative labels - synonyms and alternative names"
    }),
    Schema.propertySignature,
    Schema.withConstructorDefault(() => [])
  ),

  /**
   * SKOS hidden labels (skos:hiddenLabel)
   *
   * @example ["Ppl", "Pers"]
   */
  hiddenLabels: Schema.Array(Schema.String).pipe(
    Schema.annotations({
      title: "Hidden Labels",
      description: "SKOS hidden labels - misspellings, abbreviations, etc."
    }),
    Schema.propertySignature,
    Schema.withConstructorDefault(() => [])
  ),

  /**
   * SKOS definition (skos:definition)
   *
   * @example "A person (alive, dead, undead, or fictional)."
   */
  definition: Schema.optional(Schema.String).annotations({
    title: "Definition",
    description: "SKOS definition - formal definition of the concept"
  }),

  /**
   * SKOS scope note (skos:scopeNote)
   *
   * @example "Includes both living and deceased persons."
   */
  scopeNote: Schema.optional(Schema.String).annotations({
    title: "Scope Note",
    description: "SKOS scope note - clarification of concept scope"
  }),

  /**
   * SKOS example (skos:example)
   *
   * @example "John Doe, Jane Smith"
   */
  example: Schema.optional(Schema.String).annotations({
    title: "Example",
    description: "SKOS example - example usage of the concept"
  }),

  /**
   * SKOS broader concepts (skos:broader) - parent concepts
   *
   * @example ["http://schema.org/Thing"]
   */
  broader: Schema.Array(Schema.String).pipe(
    Schema.annotations({
      title: "Broader Concepts",
      description: "SKOS broader - parent concepts in hierarchy"
    }),
    Schema.propertySignature,
    Schema.withConstructorDefault(() => [])
  ),

  /**
   * SKOS narrower concepts (skos:narrower) - child concepts
   *
   * @example ["http://schema.org/Student", "http://schema.org/Employee"]
   */
  narrower: Schema.Array(Schema.String).pipe(
    Schema.annotations({
      title: "Narrower Concepts",
      description: "SKOS narrower - child concepts in hierarchy"
    }),
    Schema.propertySignature,
    Schema.withConstructorDefault(() => [])
  ),

  /**
   * SKOS related concepts (skos:related)
   *
   * @example ["http://schema.org/Organization"]
   */
  related: Schema.Array(Schema.String).pipe(
    Schema.annotations({
      title: "Related Concepts",
      description: "SKOS related - related concepts (non-hierarchical)"
    }),
    Schema.propertySignature,
    Schema.withConstructorDefault(() => [])
  ),

  /**
   * SKOS exact match (skos:exactMatch)
   *
   * @example ["http://www.wikidata.org/entity/Q215627"]
   */
  exactMatch: Schema.Array(Schema.String).pipe(
    Schema.annotations({
      title: "Exact Match",
      description: "SKOS exact match - equivalent concepts in other vocabularies"
    }),
    Schema.propertySignature,
    Schema.withConstructorDefault(() => [])
  ),

  /**
   * SKOS close match (skos:closeMatch)
   *
   * @example ["http://dbpedia.org/ontology/Person"]
   */
  closeMatch: Schema.Array(Schema.String).pipe(
    Schema.annotations({
      title: "Close Match",
      description: "SKOS close match - closely related concepts in other vocabularies"
    }),
    Schema.propertySignature,
    Schema.withConstructorDefault(() => [])
  )
}) {
  toJSON() {
    return {
      _tag: "ClassDefinition" as const,
      id: this.id,
      label: this.label,
      comment: this.comment,
      properties: this.properties,
      prefLabels: this.prefLabels,
      altLabels: this.altLabels,
      hiddenLabels: this.hiddenLabels,
      definition: this.definition,
      scopeNote: this.scopeNote,
      example: this.example,
      broader: this.broader,
      narrower: this.narrower,
      related: this.related,
      exactMatch: this.exactMatch,
      closeMatch: this.closeMatch
    }
  }

  /**
   * Convert class definition to semantic document for embedding
   *
   * Creates a rich document with class name, description, and property information.
   * Includes camelCase-split labels and property names for better searchability.
   * Includes SKOS labels (prefLabel, altLabel, hiddenLabel) for enhanced search.
   * Uses sync transform helper to convert IRIs to local names.
   *
   * @returns Formatted text document optimized for BM25 search
   */
  toDocument(): string {
    const parts: Array<string> = []

    // Add label - prefer prefLabel if available, otherwise use rdfs:label
    const primaryLabel = this.prefLabels.length > 0 ? this.prefLabels[0] : this.label
    const labelEnhanced = enhanceTextForSearch(primaryLabel)
    parts.push(labelEnhanced)

    // Add all prefLabels (if multiple)
    if (this.prefLabels.length > 1) {
      const additionalPrefLabels = this.prefLabels.slice(1).map(enhanceTextForSearch)
      for (const label of additionalPrefLabels) {
        parts.push(label)
      }
    }

    // Add altLabels as synonyms (critical for search)
    // Add each synonym as a separate line to give individual weight
    if (this.altLabels.length > 0) {
      const altLabelsEnhanced = this.altLabels.map(enhanceTextForSearch)
      for (const label of altLabelsEnhanced) {
        parts.push(label)
      }
    }

    // Add hiddenLabels (for misspelling/abbreviation matching)
    if (this.hiddenLabels.length > 0) {
      const hiddenLabelsEnhanced = this.hiddenLabels.map(enhanceTextForSearch)
      for (const label of hiddenLabelsEnhanced) {
        parts.push(label)
      }
    }

    // Add definition - prefer skos:definition if available, otherwise use rdfs:comment
    const description = this.definition || this.comment
    if (description) {
      parts.push(description)
    }

    // Add scopeNote if present
    if (this.scopeNote) {
      parts.push(this.scopeNote)
    }

    // Add example if present
    if (this.example) {
      parts.push(`Example: ${this.example}`)
    }

    // Add properties with enhanced searchability
    if (this.properties.length > 0) {
      const propertyNames = transformIriArrayToLocalNames(this.properties)
      // Split camelCase in property names and add to document
      const propertyNamesEnhanced = propertyNames.map((name) => {
        const split = splitCamelCase(name)
        return split !== name.toLowerCase() ? `${name} ${split}` : name
      })
      parts.push(`Properties: ${propertyNamesEnhanced.join(", ")}`)
    }

    // Add related concepts (broader, narrower, related)
    const relatedConcepts: Array<string> = []
    if (this.broader.length > 0) {
      const broaderNames = transformIriArrayToLocalNames(this.broader)
      relatedConcepts.push(`Broader: ${broaderNames.join(", ")}`)
    }
    if (this.narrower.length > 0) {
      const narrowerNames = transformIriArrayToLocalNames(this.narrower)
      relatedConcepts.push(`Narrower: ${narrowerNames.join(", ")}`)
    }
    if (this.related.length > 0) {
      const relatedNames = transformIriArrayToLocalNames(this.related)
      relatedConcepts.push(`Related: ${relatedNames.join(", ")}`)
    }
    if (relatedConcepts.length > 0) {
      parts.push(relatedConcepts.join(" | "))
    }

    return parts.join("\n")
  }
}

/**
 * PropertyDefinition - OWL/RDFS Property metadata
 *
 * Represents a property from the ontology with domain/range constraints.
 *
 * @example
 * ```typescript
 * const memberOfProperty = new PropertyDefinition({
 *   id: "http://schema.org/memberOf",
 *   label: "member of",
 *   comment: "An Organization to which this person belongs.",
 *   domain: ["http://schema.org/Person"],
 *   range: ["http://schema.org/Organization"],
 *   rangeType: "object"
 * })
 * ```
 *
 * @since 2.0.0
 * @category Domain
 */
export class PropertyDefinition extends Schema.Class<PropertyDefinition>("PropertyDefinition")({
  /**
   * Property URI
   *
   * @example "http://schema.org/memberOf"
   */
  id: Schema.String.annotations({
    title: "Property IRI",
    description: "Full IRI of the OWL/RDFS property"
  }),

  /**
   * Human-readable label
   *
   * @example "member of"
   */
  label: Schema.String.annotations({
    title: "Label",
    description: "rdfs:label - human-readable name"
  }),

  /**
   * Description/documentation
   *
   * @example "An Organization to which this person belongs."
   */
  comment: Schema.String.annotations({
    title: "Comment",
    description: "rdfs:comment - property description"
  }),

  /**
   * Domain class IRIs (valid subject types)
   *
   * @example ["http://schema.org/Person"]
   */
  domain: Schema.Array(Schema.String).annotations({
    title: "Domain",
    description: "Class IRIs that can use this property (rdfs:domain)"
  }),

  /**
   * Range class IRIs or datatype (valid object types)
   *
   * @example ["http://schema.org/Organization"] for object properties
   * @example ["http://www.w3.org/2001/XMLSchema#string"] for datatype properties
   */
  range: Schema.Array(Schema.String).annotations({
    title: "Range",
    description: "Class IRIs or datatypes for property values (rdfs:range)"
  }),

  /**
   * Property type: object (links entities) or datatype (literal values)
   *
   * - "object": ObjectProperty - range is entity class
   * - "datatype": DatatypeProperty - range is XSD datatype
   */
  rangeType: Schema.Literal("object", "datatype").annotations({
    title: "Range Type",
    description: "Whether property links entities (object) or has literal values (datatype)"
  }),

  /**
   * Whether property is functional (has at most one value)
   *
   * Functional properties (owl:FunctionalProperty) enforce cardinality of 0..1.
   * Used for schema generation to enforce maxItems: 1 or return single object.
   *
   * @example true for properties like "hostedBy", "managedBy"
   */
  isFunctional: Schema.Boolean.pipe(
    Schema.annotations({
      title: "Is Functional",
      description: "Whether property is functional (owl:FunctionalProperty) - has at most one value"
    }),
    Schema.propertySignature,
    Schema.withConstructorDefault(() => false)
  ),

  /**
   * SKOS preferred labels (skos:prefLabel)
   *
   * @example ["member of", "belongs to"]
   */
  prefLabels: Schema.Array(Schema.String).pipe(
    Schema.annotations({
      title: "Preferred Labels",
      description: "SKOS preferred labels - primary names for the property"
    }),
    Schema.propertySignature,
    Schema.withConstructorDefault(() => [])
  ),

  /**
   * SKOS alternative labels (skos:altLabel) - synonyms
   *
   * @example ["part of", "member"]
   */
  altLabels: Schema.Array(Schema.String).pipe(
    Schema.annotations({
      title: "Alternative Labels",
      description: "SKOS alternative labels - synonyms and alternative names"
    }),
    Schema.propertySignature,
    Schema.withConstructorDefault(() => [])
  ),

  /**
   * SKOS hidden labels (skos:hiddenLabel)
   *
   * @example ["mbr", "mem"]
   */
  hiddenLabels: Schema.Array(Schema.String).pipe(
    Schema.annotations({
      title: "Hidden Labels",
      description: "SKOS hidden labels - misspellings, abbreviations, etc."
    }),
    Schema.propertySignature,
    Schema.withConstructorDefault(() => [])
  ),

  /**
   * SKOS definition (skos:definition)
   *
   * @example "An Organization to which this person belongs."
   */
  definition: Schema.optional(Schema.String).annotations({
    title: "Definition",
    description: "SKOS definition - formal definition of the property"
  }),

  /**
   * SKOS scope note (skos:scopeNote)
   *
   * @example "Includes both current and former memberships."
   */
  scopeNote: Schema.optional(Schema.String).annotations({
    title: "Scope Note",
    description: "SKOS scope note - clarification of property scope"
  }),

  /**
   * SKOS example (skos:example)
   *
   * @example "John is a member of Acme Corp"
   */
  example: Schema.optional(Schema.String).annotations({
    title: "Example",
    description: "SKOS example - example usage of the property"
  }),

  /**
   * SKOS broader concepts (skos:broader) - parent properties
   *
   * @example ["http://schema.org/affiliation"]
   */
  broader: Schema.Array(Schema.String).pipe(
    Schema.annotations({
      title: "Broader Concepts",
      description: "SKOS broader - parent properties in hierarchy"
    }),
    Schema.propertySignature,
    Schema.withConstructorDefault(() => [])
  ),

  /**
   * SKOS narrower concepts (skos:narrower) - child properties
   *
   * @example ["http://schema.org/alumniOf"]
   */
  narrower: Schema.Array(Schema.String).pipe(
    Schema.annotations({
      title: "Narrower Concepts",
      description: "SKOS narrower - child properties in hierarchy"
    }),
    Schema.propertySignature,
    Schema.withConstructorDefault(() => [])
  ),

  /**
   * SKOS related concepts (skos:related)
   *
   * @example ["http://schema.org/worksFor"]
   */
  related: Schema.Array(Schema.String).pipe(
    Schema.annotations({
      title: "Related Concepts",
      description: "SKOS related - related properties (non-hierarchical)"
    }),
    Schema.propertySignature,
    Schema.withConstructorDefault(() => [])
  ),

  /**
   * SKOS exact match (skos:exactMatch)
   *
   * @example ["http://www.wikidata.org/prop/direct/P463"]
   */
  exactMatch: Schema.Array(Schema.String).pipe(
    Schema.annotations({
      title: "Exact Match",
      description: "SKOS exact match - equivalent properties in other vocabularies"
    }),
    Schema.propertySignature,
    Schema.withConstructorDefault(() => [])
  ),

  /**
   * SKOS close match (skos:closeMatch)
   *
   * @example ["http://dbpedia.org/ontology/affiliation"]
   */
  closeMatch: Schema.Array(Schema.String).pipe(
    Schema.annotations({
      title: "Close Match",
      description: "SKOS close match - closely related properties in other vocabularies"
    }),
    Schema.propertySignature,
    Schema.withConstructorDefault(() => [])
  )
}) {
  /**
   * Check if property is an ObjectProperty (links entities)
   */
  get isObjectProperty(): boolean {
    return this.rangeType === "object"
  }

  /**
   * Check if property is a DatatypeProperty (literal values)
   */
  get isDatatypeProperty(): boolean {
    return this.rangeType === "datatype"
  }

  toJSON() {
    return {
      _tag: "PropertyDefinition" as const,
      id: this.id,
      label: this.label,
      comment: this.comment,
      domain: this.domain,
      range: this.range,
      rangeType: this.rangeType,
      isFunctional: this.isFunctional,
      isObjectProperty: this.isObjectProperty,
      isDatatypeProperty: this.isDatatypeProperty,
      prefLabels: this.prefLabels,
      altLabels: this.altLabels,
      hiddenLabels: this.hiddenLabels,
      definition: this.definition,
      scopeNote: this.scopeNote,
      example: this.example,
      broader: this.broader,
      narrower: this.narrower,
      related: this.related,
      exactMatch: this.exactMatch,
      closeMatch: this.closeMatch
    }
  }

  /**
   * Convert property definition to semantic document for embedding
   *
   * Creates a rich document with property name, description, domain, range, and constraints.
   * Includes camelCase-split labels and domain/range names for better searchability.
   * Includes SKOS labels (prefLabel, altLabel, hiddenLabel) for enhanced search.
   * Uses sync transform helpers to convert IRIs to local names.
   *
   * @returns Formatted text document optimized for BM25 search
   */
  toDocument(): string {
    const parts: Array<string> = []

    // Add label - prefer prefLabel if available, otherwise use rdfs:label
    const primaryLabel = this.prefLabels.length > 0 ? this.prefLabels[0] : this.label
    const labelEnhanced = enhanceTextForSearch(primaryLabel)
    parts.push(labelEnhanced)

    // Add all prefLabels (if multiple)
    if (this.prefLabels.length > 1) {
      const additionalPrefLabels = this.prefLabels.slice(1).map(enhanceTextForSearch)
      for (const label of additionalPrefLabels) {
        parts.push(label)
      }
    }

    // Add altLabels as synonyms (critical for search)
    // Add each synonym as a separate line to give individual weight
    if (this.altLabels.length > 0) {
      const altLabelsEnhanced = this.altLabels.map(enhanceTextForSearch)
      for (const label of altLabelsEnhanced) {
        parts.push(label)
      }
    }

    // Add hiddenLabels (for misspelling/abbreviation matching)
    if (this.hiddenLabels.length > 0) {
      const hiddenLabelsEnhanced = this.hiddenLabels.map(enhanceTextForSearch)
      for (const label of hiddenLabelsEnhanced) {
        parts.push(label)
      }
    }

    // Add definition - prefer skos:definition if available, otherwise use rdfs:comment
    const description = this.definition || this.comment
    if (description) {
      parts.push(description)
    }

    // Add scopeNote if present
    if (this.scopeNote) {
      parts.push(this.scopeNote)
    }

    // Add example if present
    if (this.example) {
      parts.push(`Example: ${this.example}`)
    }

    // Add domain classes with enhanced searchability
    if (this.domain.length > 0) {
      const domainNames = transformIriArrayToLocalNames(this.domain)
      // Split camelCase in domain names and add to document
      const domainNamesEnhanced = domainNames.map((name) => {
        const split = splitCamelCase(name)
        return split !== name.toLowerCase() ? `${name} ${split}` : name
      })
      parts.push(`Domain: ${domainNamesEnhanced.join(", ")}`)
    }

    // Add range classes/datatypes with enhanced searchability
    if (this.range.length > 0) {
      const rangeNames = transformIriArrayToLocalNames(this.range)
      // Split camelCase in range names and add to document
      const rangeNamesEnhanced = rangeNames.map((name) => {
        const split = splitCamelCase(name)
        return split !== name.toLowerCase() ? `${name} ${split}` : name
      })
      parts.push(`Range: ${rangeNamesEnhanced.join(", ")}`)
    }

    // Add type constraints
    const constraints: Array<string> = []
    if (this.rangeType === "object") {
      constraints.push("object")
    } else {
      constraints.push("datatype")
    }
    if (this.isFunctional) {
      constraints.push("functional")
    }

    if (constraints.length > 0) {
      parts.push(`Type: ${constraints.join(", ")}`)
    }

    // Add related properties (broader, narrower, related)
    const relatedProperties: Array<string> = []
    if (this.broader.length > 0) {
      const broaderNames = transformIriArrayToLocalNames(this.broader)
      relatedProperties.push(`Broader: ${broaderNames.join(", ")}`)
    }
    if (this.narrower.length > 0) {
      const narrowerNames = transformIriArrayToLocalNames(this.narrower)
      relatedProperties.push(`Narrower: ${narrowerNames.join(", ")}`)
    }
    if (this.related.length > 0) {
      const relatedNames = transformIriArrayToLocalNames(this.related)
      relatedProperties.push(`Related: ${relatedNames.join(", ")}`)
    }
    if (relatedProperties.length > 0) {
      parts.push(relatedProperties.join(" | "))
    }

    return parts.join("\n")
  }
}

/**
 * OntologyContext - Complete ontology snapshot
 *
 * Contains all classes and properties from loaded ontology.
 * Used for focused extraction and validation.
 *
 * @since 2.0.0
 * @category Domain
 */
export class OntologyContext extends Schema.Class<OntologyContext>("OntologyContext")({
  /**
   * All class definitions
   */
  classes: Schema.Array(ClassDefinition).annotations({
    title: "Classes",
    description: "All OWL/RDFS classes in the ontology"
  }),

  /**
   * All property definitions
   */
  properties: Schema.Array(PropertyDefinition).annotations({
    title: "Properties",
    description: "All OWL/RDFS properties in the ontology"
  }),

  /**
   * Ontology metadata (optional)
   */
  metadata: Schema.optional(Schema.Record({ key: Schema.String, value: Schema.String })).annotations({
    title: "Metadata",
    description: "Ontology-level metadata (title, version, etc.)"
  })
}) {
  /**
   * Get class by IRI
   */
  getClass(iri: string): ClassDefinition | undefined {
    return this.classes.find((c) => c.id === iri)
  }

  /**
   * Get property by IRI
   */
  getProperty(iri: string): PropertyDefinition | undefined {
    return this.properties.find((p) => p.id === iri)
  }

  /**
   * Get all properties for a class
   *
   * Accepts either full IRI or local name. Extracts local name for comparison
   * since property domains are stored as local names.
   */
  getPropertiesForClass(classIri: string): Array<PropertyDefinition> {
    // Extract local name for comparison since domains are stored as local names
    const localName = extractLocalName(classIri)
    return this.properties.filter((p) => p.domain.includes(localName))
  }

  /**
   * Convert all classes and properties to semantic documents for embedding
   *
   * Creates an array of tuples [id, document], one for each class and property,
   * optimized for semantic search and embedding. The ID can be used to retrieve
   * the actual ClassDefinition or PropertyDefinition from this OntologyContext.
   *
   * @returns Array of tuples [IRI, document] where IRI can be used to look up the domain model
   *
   * @example
   * ```typescript
   * const documents = ontology.toDocuments()
   * // => [["http://schema.org/Person", "Person\n..."], ...]
   *
   * // After semantic search, retrieve the actual class:
   * const [iri, _doc] = documents[0]
   * const classDef = ontology.getClass(iri)
   * ```
   */
  toDocuments(): ReadonlyArray<[string, string]> {
    return [
      ...this.classes.map((c) => [c.id, c.toDocument()] as [string, string]),
      ...this.properties.map((p) => [p.id, p.toDocument()] as [string, string])
    ]
  }

  toJSON() {
    return {
      _tag: "OntologyContext" as const,
      classes: this.classes.map((c) => c.toJSON()),
      properties: this.properties.map((p) => p.toJSON()),
      metadata: this.metadata
    }
  }
}

================
File: src/Domain/Rdf/Constants.ts
================
/**
 * Domain Model: RDF Constants
 *
 * Standard RDF/OWL IRI constants using domain types.
 * These are backend-agnostic and can be used with any RDF engine.
 *
 * @since 2.0.0
 * @module Domain/Rdf/Constants
 */

import { Schema } from "effect"
import { type IRI, IriSchema } from "./Types.js"

/**
 * Create an IRI from a string
 */
const iri = (value: string): IRI => Schema.decodeSync(IriSchema)(value)

/**
 * RDF Vocabulary IRIs
 */
export const RDF_TYPE: IRI = iri("http://www.w3.org/1999/02/22-rdf-syntax-ns#type")

/**
 * OWL Vocabulary IRIs
 */
export const OWL_CLASS: IRI = iri("http://www.w3.org/2002/07/owl#Class")
export const OWL_OBJECT_PROPERTY: IRI = iri("http://www.w3.org/2002/07/owl#ObjectProperty")
export const OWL_DATATYPE_PROPERTY: IRI = iri("http://www.w3.org/2002/07/owl#DatatypeProperty")
export const OWL_FUNCTIONAL_PROPERTY: IRI = iri("http://www.w3.org/2002/07/owl#FunctionalProperty")

/**
 * RDFS Vocabulary IRIs
 */
export const RDFS_LABEL: IRI = iri("http://www.w3.org/2000/01/rdf-schema#label")
export const RDFS_COMMENT: IRI = iri("http://www.w3.org/2000/01/rdf-schema#comment")
export const RDFS_DOMAIN: IRI = iri("http://www.w3.org/2000/01/rdf-schema#domain")
export const RDFS_RANGE: IRI = iri("http://www.w3.org/2000/01/rdf-schema#range")

/**
 * SKOS Vocabulary IRIs
 */
export const SKOS_PREFLABEL: IRI = iri("http://www.w3.org/2004/02/skos/core#prefLabel")
export const SKOS_ALTLABEL: IRI = iri("http://www.w3.org/2004/02/skos/core#altLabel")
export const SKOS_HIDDENLABEL: IRI = iri("http://www.w3.org/2004/02/skos/core#hiddenLabel")
export const SKOS_DEFINITION: IRI = iri("http://www.w3.org/2004/02/skos/core#definition")
export const SKOS_SCOPENOTE: IRI = iri("http://www.w3.org/2004/02/skos/core#scopeNote")
export const SKOS_EXAMPLE: IRI = iri("http://www.w3.org/2004/02/skos/core#example")
export const SKOS_NOTE: IRI = iri("http://www.w3.org/2004/02/skos/core#note")
export const SKOS_BROADER: IRI = iri("http://www.w3.org/2004/02/skos/core#broader")
export const SKOS_NARROWER: IRI = iri("http://www.w3.org/2004/02/skos/core#narrower")
export const SKOS_RELATED: IRI = iri("http://www.w3.org/2004/02/skos/core#related")
export const SKOS_EXACTMATCH: IRI = iri("http://www.w3.org/2004/02/skos/core#exactMatch")
export const SKOS_CLOSEMATCH: IRI = iri("http://www.w3.org/2004/02/skos/core#closeMatch")

================
File: src/Domain/Rdf/index.ts
================
/**
 * RDF Domain Exports
 *
 * @since 2.0.0
 * @module Domain/Rdf
 */

export * from "./Types.js"

================
File: src/Domain/Rdf/Types.ts
================
/**
 * Domain Model: RDF Types
 *
 * Branded types for RDF primitives (IRI, BlankNode, Literal, Triple).
 * Prevents "stringly typed" errors.
 *
 * @since 2.0.0
 * @module Domain/Rdf/Types
 */

import { Schema } from "effect"

/**
 * IRI - Internationalized Resource Identifier
 *
 * Branded string type for IRIs to prevent mixing with regular strings.
 *
 * @example
 * ```typescript
 * const personIri: IRI = Schema.decodeSync(IriSchema)("http://schema.org/Person")
 * ```
 *
 * @since 2.0.0
 * @category Domain
 */
export const IriSchema = Schema.String.pipe(
  Schema.brand("IRI"),
  Schema.annotations({
    title: "IRI",
    description: "Internationalized Resource Identifier (branded string)"
  })
)

export type IRI = typeof IriSchema.Type

/**
 * BlankNode - RDF Blank Node identifier
 *
 * Represents unnamed nodes in RDF graphs (starts with _:).
 *
 * @example "_:b0", "_:genid123"
 *
 * @since 2.0.0
 * @category Domain
 */
export const BlankNodeSchema = Schema.String.pipe(
  Schema.pattern(/^_:/),
  Schema.brand("BlankNode"),
  Schema.annotations({
    title: "Blank Node",
    description: "RDF blank node identifier (starts with '_:')"
  })
)

export type BlankNode = typeof BlankNodeSchema.Type

/**
 * Literal - RDF Literal value
 *
 * Represents a literal value with optional language tag or datatype.
 *
 * @since 2.0.0
 * @category Domain
 */
export class Literal extends Schema.Class<Literal>("Literal")({
  /**
   * Lexical value
   */
  value: Schema.String.annotations({
    title: "Value",
    description: "Lexical form of the literal"
  }),

  /**
   * Language tag (for language-tagged strings)
   *
   * @example "en", "fr", "pt"
   */
  language: Schema.optional(Schema.String).annotations({
    title: "Language",
    description: "Language tag (e.g., 'en', 'fr')"
  }),

  /**
   * Datatype IRI
   *
   * @example "http://www.w3.org/2001/XMLSchema#string"
   */
  datatype: Schema.optional(IriSchema).annotations({
    title: "Datatype",
    description: "Datatype IRI (defaults to xsd:string if not specified)"
  })
}) {
  toJSON() {
    return {
      _tag: "Literal" as const,
      value: this.value,
      language: this.language,
      datatype: this.datatype
    }
  }
}

/**
 * RdfTerm - Union of IRI, BlankNode, or Literal
 *
 * Represents any RDF term.
 *
 * @since 2.0.0
 * @category Domain
 */
export const RdfTermSchema = Schema.Union(
  IriSchema,
  BlankNodeSchema,
  Schema.instanceOf(Literal)
).annotations({
  title: "RDF Term",
  description: "Any RDF term (IRI, BlankNode, or Literal)"
})

export type RdfTerm = typeof RdfTermSchema.Type

/**
 * Triple - RDF Triple (subject, predicate, object)
 *
 * Represents a single RDF statement.
 *
 * @since 2.0.0
 * @category Domain
 */
export class Triple extends Schema.Class<Triple>("Triple")({
  /**
   * Subject (IRI or BlankNode)
   */
  subject: Schema.Union(IriSchema, BlankNodeSchema).annotations({
    title: "Subject",
    description: "Triple subject (IRI or BlankNode)"
  }),

  /**
   * Predicate (IRI)
   */
  predicate: IriSchema.annotations({
    title: "Predicate",
    description: "Triple predicate (IRI)"
  }),

  /**
   * Object (any RDF term)
   */
  object: RdfTermSchema.annotations({
    title: "Object",
    description: "Triple object (IRI, BlankNode, or Literal)"
  })
}) {
  toJSON() {
    return {
      _tag: "Triple" as const,
      subject: this.subject,
      predicate: this.predicate,
      object: this.object instanceof Literal ? this.object.toJSON() : this.object
    }
  }
}

/**
 * Quad - RDF Quad (triple + named graph)
 *
 * Extends Triple with a graph IRI for named graph support.
 *
 * @since 2.0.0
 * @category Domain
 */
export class Quad extends Schema.Class<Quad>("Quad")({
  /**
   * Subject (IRI or BlankNode)
   */
  subject: Schema.Union(IriSchema, BlankNodeSchema).annotations({
    title: "Subject",
    description: "Quad subject (IRI or BlankNode)"
  }),

  /**
   * Predicate (IRI)
   */
  predicate: IriSchema.annotations({
    title: "Predicate",
    description: "Quad predicate (IRI)"
  }),

  /**
   * Object (any RDF term)
   */
  object: RdfTermSchema.annotations({
    title: "Object",
    description: "Quad object (IRI, BlankNode, or Literal)"
  }),

  /**
   * Graph IRI (for named graphs)
   */
  graph: Schema.optional(IriSchema).annotations({
    title: "Graph",
    description: "Named graph IRI (omit for default graph)"
  })
}) {
  /**
   * Convert to Triple (discard graph)
   */
  toTriple(): Triple {
    return new Triple({
      subject: this.subject,
      predicate: this.predicate,
      object: this.object
    })
  }

  toJSON() {
    return {
      _tag: "Quad" as const,
      subject: this.subject,
      predicate: this.predicate,
      object: this.object instanceof Literal ? this.object.toJSON() : this.object,
      graph: this.graph
    }
  }
}

================
File: src/Domain/index.ts
================
/**
 * Domain Layer Exports
 *
 * Pure data types, schemas, and errors.
 * ZERO side effects or business logic.
 *
 * @since 2.0.0
 * @module Domain
 */

export * as Error from "./Error/index.js"
export * as Model from "./Model/index.js"
export * as Rdf from "./Rdf/index.js"

================
File: src/Prompt/ExtractionRule.ts
================
/**
 * Extraction Rule - Core type definitions
 *
 * Defines extraction constraints as structured data that generate both:
 * - Effect Schema annotations (descriptions, validation messages)
 * - Prompt text (instructions, examples, allowed values)
 *
 * @module Prompt/ExtractionRule
 * @since 2.0.0
 */

import { Data, Schema as S } from "effect"

/**
 * RuleCategory - Groups related extraction rules
 *
 * @since 2.0.0
 */
export const RuleCategory = S.Literal(
  "id_format", // Entity ID formatting rules
  "type_mapping", // Class/type assignment rules
  "property_usage", // Property IRI usage rules
  "iri_casing", // IRI case sensitivity rules
  "cardinality", // Min/max value rules
  "reference_integrity", // Entity reference rules
  "mention_format", // Mention text formatting rules
  "literal_format" // Literal value formatting rules
)
export type RuleCategory = S.Schema.Type<typeof RuleCategory>

/**
 * RuleSeverity - Constraint enforcement level
 *
 * - "error": Hard constraint - schema validation will fail
 * - "warning": Soft preference - prompt guidance only
 *
 * @since 2.0.0
 */
export const RuleSeverity = S.Literal("error", "warning")
export type RuleSeverity = S.Schema.Type<typeof RuleSeverity>

/**
 * RuleExample - Demonstrates correct or incorrect usage
 *
 * @since 2.0.0
 */
export class RuleExample extends Data.Class<{
  /** Input context or scenario */
  readonly input: string
  /** Expected output */
  readonly output: string
  /** Brief explanation */
  readonly explanation: string
}> {}

/**
 * ExtractionRule - Atomic extraction constraint as structured data
 *
 * Represents a single rule that can be rendered to:
 * - Effect Schema annotation (description field)
 * - Prompt instruction (natural language rule)
 * - Validation feedback (error message)
 *
 * @example
 * ```typescript
 * const idFormatRule = new ExtractionRule({
 *   id: "entity-id-format",
 *   category: "id_format",
 *   severity: "error",
 *   instruction: "Assign unique snake_case IDs starting with a letter",
 *   example: new RuleExample({
 *     input: "Cristiano Ronaldo",
 *     output: "cristiano_ronaldo",
 *     explanation: "Lowercase with underscores"
 *   }),
 *   counterExample: new RuleExample({
 *     input: "Cristiano Ronaldo",
 *     output: "CristianoRonaldo",
 *     explanation: "Avoid PascalCase"
 *   }),
 *   schemaDescription: "Snake_case unique identifier (e.g., 'cristiano_ronaldo')",
 *   validationTemplate: "Entity ID '{value}' must be snake_case starting with a letter"
 * })
 * ```
 *
 * @since 2.0.0
 */
export class ExtractionRule extends Data.Class<{
  /** Unique identifier for this rule */
  readonly id: string

  /** Rule category for grouping */
  readonly category: RuleCategory

  /** Severity: error = hard constraint, warning = preference */
  readonly severity: RuleSeverity

  /** Imperative instruction for prompt (e.g., "Use snake_case IDs") */
  readonly instruction: string

  /** Example of correct usage */
  readonly example: RuleExample

  /** Counter-example showing what NOT to do (null if not applicable) */
  readonly counterExample: RuleExample | null

  /** Schema annotation description */
  readonly schemaDescription: string

  /** Validation message template (use {value} for interpolation) */
  readonly validationTemplate: string
}> {
  /**
   * Check if this is a hard constraint (error severity)
   */
  get isHardConstraint(): boolean {
    return this.severity === "error"
  }

  /**
   * Check if this is a soft preference (warning severity)
   */
  get isSoftPreference(): boolean {
    return this.severity === "warning"
  }

  /**
   * Interpolate validation template with actual value
   */
  formatValidationMessage(value: unknown): string {
    return this.validationTemplate.replace("{value}", String(value))
  }
}

/**
 * ExtractionStage - Pipeline stages that have distinct rule sets
 *
 * @since 2.0.0
 */
export const ExtractionStage = S.Literal("mention", "entity", "relation")
export type ExtractionStage = S.Schema.Type<typeof ExtractionStage>

================
File: src/Prompt/FeedbackGenerator.ts
================
/**
 * Feedback Generator - Generate validation feedback from RuleSet
 *
 * Transforms schema validation errors into rule-aware feedback messages
 * that can be used to guide LLM retries.
 *
 * @module Prompt/FeedbackGenerator
 * @since 2.0.0
 */

import { Doc } from "@effect/printer"
import { Option as O } from "effect"
import { type ParseError, TreeFormatter } from "effect/ParseResult"
import type { ExtractionRule } from "./ExtractionRule.js"
import type { RuleSet } from "./RuleSet.js"

/**
 * Violation extracted from ParseError
 *
 * @since 2.0.0
 */
export interface Violation {
  /** Path to the failing field (e.g., "entities[0].types") */
  readonly path: string
  /** Error message from schema validation */
  readonly message: string
  /** Actual value that failed validation */
  readonly actual: unknown
}

/**
 * Extract violations from Effect Schema ParseError
 *
 * Recursively walks the error tree to extract all violations with paths.
 *
 * @param error - ParseError from schema validation
 * @returns Array of violations
 *
 * @since 2.0.0
 */
export const extractViolations = (error: ParseError): ReadonlyArray<Violation> => {
  const violations: Array<Violation> = []

  const walk = (issue: unknown, path: string): void => {
    if (!issue || typeof issue !== "object") return

    const obj = issue as Record<string, unknown>

    // Check for actual value and message
    if ("actual" in obj && "message" in obj) {
      violations.push({
        path: path || "root",
        message: String(obj.message ?? "Unknown error"),
        actual: obj.actual
      })
    }

    // Handle array issues (e.g., [0], [1])
    if ("issues" in obj && Array.isArray(obj.issues)) {
      obj.issues.forEach((sub: unknown, idx: number) => {
        const subPath = path ? `${path}[${idx}]` : `[${idx}]`
        walk(sub, subPath)
      })
    }

    // Handle property issues
    if ("ast" in obj && typeof obj.ast === "object" && obj.ast !== null) {
      const ast = obj.ast as Record<string, unknown>
      if ("key" in ast) {
        const key = String(ast.key)
        const subPath = path ? `${path}.${key}` : key
        walk(obj, subPath)
      }
    }

    // Handle nested errors
    if ("error" in obj) {
      walk(obj.error, path)
    }
  }

  // Start walking from the error
  if ("issue" in error && error.issue) {
    walk(error.issue, "")
  } else {
    walk(error, "")
  }

  return violations
}

/**
 * Find matching rule for a violation
 *
 * Attempts to match a violation to a rule based on:
 * - Field path keywords (e.g., "types" → type_mapping rules)
 * - Error message content
 *
 * @param violation - Violation to match
 * @param ruleSet - Rule set to search
 * @returns Matching rule if found
 *
 * @since 2.0.0
 */
export const findMatchingRule = (
  violation: Violation,
  ruleSet: RuleSet
): O.Option<ExtractionRule> => {
  const path = violation.path.toLowerCase()
  const message = violation.message.toLowerCase()

  // Path-based matching
  const pathMatchers: Array<{ pattern: string; category: string }> = [
    { pattern: ".id", category: "id_format" },
    { pattern: "id]", category: "id_format" },
    { pattern: ".types", category: "type_mapping" },
    { pattern: "types]", category: "type_mapping" },
    { pattern: ".predicate", category: "property_usage" },
    { pattern: ".subjectid", category: "reference_integrity" },
    { pattern: ".object", category: "property_usage" },
    { pattern: ".mention", category: "mention_format" },
    { pattern: ".attributes", category: "property_usage" }
  ]

  for (const matcher of pathMatchers) {
    if (path.includes(matcher.pattern)) {
      const categoryRules = ruleSet.getRulesByCategory(matcher.category)
      if (categoryRules.length > 0) {
        return O.some(categoryRules[0])
      }
    }
  }

  // Message-based matching
  if (message.includes("casing") || message.includes("case")) {
    const iriRules = ruleSet.getRulesByCategory("iri_casing")
    if (iriRules.length > 0) {
      return O.some(iriRules[0])
    }
  }

  if (message.includes("snake") || message.includes("lowercase")) {
    const idRules = ruleSet.getRulesByCategory("id_format")
    if (idRules.length > 0) {
      return O.some(idRules[0])
    }
  }

  return O.none()
}

/**
 * Interpolate template with values
 *
 * Replaces {key} placeholders with actual values.
 *
 * @param template - Template string with {key} placeholders
 * @param values - Values to interpolate
 * @returns Interpolated string
 *
 * @since 2.0.0
 */
export const interpolate = (
  template: string,
  values: Record<string, unknown>
): string => template.replace(/\{(\w+)\}/g, (_, key) => key in values ? String(values[key]) : `{${key}}`)

/**
 * Generate user-friendly feedback from schema validation errors
 *
 * Uses RuleSet to provide rule-aware error messages instead of generic
 * schema validation messages.
 *
 * @param error - ParseError from schema validation
 * @param ruleSet - Rule set for the extraction stage
 * @returns Formatted feedback string
 *
 * @example
 * ```typescript
 * const ruleSet = makeEntityRuleSet(classes, properties)
 * try {
 *   S.decodeUnknownSync(schema)(llmOutput)
 * } catch (e) {
 *   if (e instanceof ParseError) {
 *     const feedback = generateFeedback(e, ruleSet)
 *     console.log(feedback)
 *     // "Entity ID '2pac' must be snake_case starting with a letter"
 *   }
 * }
 * ```
 *
 * @since 2.0.0
 */
export const generateFeedback = (
  error: ParseError,
  ruleSet: RuleSet
): string => {
  const violations = extractViolations(error)

  if (violations.length === 0) {
    return "Validation failed. Please check the output format."
  }

  return violations
    .map((v) => {
      const ruleOpt = findMatchingRule(v, ruleSet)
      return O.match(ruleOpt, {
        onNone: () => `Error at ${v.path}: ${v.message}`,
        onSome: (rule) => interpolate(rule.validationTemplate, { value: v.actual })
      })
    })
    .join("\n")
}

/**
 * Build rule reminders section for violated rules
 *
 * Identifies which rules were violated and creates a Doc with reminders.
 *
 * @param error - ParseError from schema validation
 * @param ruleSet - Rule set to search for matching rules
 * @returns Doc with rule reminders or empty if no rules matched
 *
 * @internal
 * @since 2.0.0
 */
const buildRuleReminders = (
  error: ParseError,
  ruleSet: RuleSet
): Doc.Doc<never> => {
  const violations = extractViolations(error)
  const matchedRuleIds = new Set<string>()

  for (const v of violations) {
    const rule = findMatchingRule(v, ruleSet)
    if (O.isSome(rule)) {
      matchedRuleIds.add(rule.value.id)
    }
  }

  if (matchedRuleIds.size === 0) {
    return Doc.empty
  }

  const ruleReminders = Array.from(matchedRuleIds).map((id) => {
    const rule = ruleSet.allRules.find((r) => r.id === id)
    return rule ? Doc.text(`• ${rule.instruction}`) : Doc.empty
  })

  return Doc.vsep([
    Doc.empty,
    Doc.text("Remember these rules:"),
    ...ruleReminders
  ])
}

/**
 * Generate tree-formatted feedback with rule-aware messages
 *
 * Uses Effect's built-in TreeFormatter for hierarchical error display,
 * then appends rule reminders for violated rules.
 *
 * @param error - ParseError from schema validation
 * @param ruleSet - Rule set for the extraction stage
 * @returns Tree-formatted feedback string with rule reminders
 *
 * @example
 * ```typescript
 * const feedback = generateTreeFeedback(error, ruleSet)
 * // Output:
 * // Validation Errors:
 * //
 * // { readonly entities: ... }
 * // └─ [entities]
 * //    └─ [0]
 * //       └─ [types]
 * //          └─ Expected valid IRI, actual "invalid"
 * //
 * // Remember these rules:
 * // • Copy IRIs EXACTLY as shown
 * ```
 *
 * @since 2.0.0
 */
export const generateTreeFeedback = (
  error: ParseError,
  ruleSet: RuleSet
): string => {
  // Use Effect's built-in tree formatter for base error display
  const baseTree = TreeFormatter.formatErrorSync(error)

  // Build Doc structure with tree and rule reminders
  const doc = Doc.vsep([
    Doc.text("Validation Errors:"),
    Doc.empty,
    Doc.text(baseTree),
    buildRuleReminders(error, ruleSet)
  ])

  return Doc.render(doc, { style: "pretty", options: { lineWidth: 100 } })
}

/**
 * Generate improvement prompt for retry
 *
 * Creates a prompt that includes:
 * - Tree-formatted validation errors from previous attempt
 * - Path guidance for locating errors
 * - Reminder of critical rules
 *
 * @param error - ParseError from schema validation
 * @param ruleSet - Rule set for the extraction stage
 * @returns Improvement prompt for LLM retry
 *
 * @since 2.0.0
 */
export const generateImprovementPrompt = (
  error: ParseError,
  ruleSet: RuleSet
): string => {
  const treeFeedback = generateTreeFeedback(error, ruleSet)

  const doc = Doc.vsep([
    Doc.text("Your previous output had validation errors:"),
    Doc.empty,
    Doc.text(treeFeedback),
    Doc.empty,
    Doc.text("Please correct these issues. The tree above shows:"),
    Doc.text("• The path to each error (e.g., [entities][0][types])"),
    Doc.text("• What was expected vs what was received"),
    Doc.empty,
    Doc.text("Generate a corrected output that fixes all validation errors.")
  ])

  return Doc.render(doc, { style: "pretty", options: { lineWidth: 100 } })
}

/**
 * Check if an error is likely retryable
 *
 * Determines if the validation error is something the LLM can fix
 * (e.g., format issues) vs something systemic (e.g., missing schema).
 *
 * @param error - ParseError from schema validation
 * @returns true if the error is likely fixable by retry
 *
 * @since 2.0.0
 */
export const isRetryable = (error: ParseError): boolean => {
  const violations = extractViolations(error)

  // If no violations extracted, probably a systemic issue
  if (violations.length === 0) {
    return false
  }

  // Check if all violations are for format/value issues (retryable)
  // vs structural issues (not retryable)
  const retryablePatterns = [
    /casing/i,
    /format/i,
    /invalid.*value/i,
    /expected.*got/i,
    /must be/i,
    /should be/i
  ]

  const structuralPatterns = [
    /missing.*required/i,
    /unknown.*property/i,
    /undefined/i
  ]

  for (const v of violations) {
    // If any violation looks structural, not retryable
    for (const pattern of structuralPatterns) {
      if (pattern.test(v.message)) {
        return false
      }
    }
  }

  // If most violations look retryable, return true
  let retryableCount = 0
  for (const v of violations) {
    for (const pattern of retryablePatterns) {
      if (pattern.test(v.message)) {
        retryableCount++
        break
      }
    }
  }

  return retryableCount >= violations.length * 0.5
}

================
File: src/Prompt/index.ts
================
/**
 * Prompt Module - Unified extraction rule system
 *
 * Defines extraction constraints as structured data that generate both:
 * - Effect Schema annotations (descriptions, validation messages)
 * - Prompt text (instructions, examples, allowed values)
 *
 * Single source of truth for schema-prompt alignment.
 *
 * @module Prompt
 * @since 2.0.0
 */

// Core Types
export {
  ExtractionRule,
  ExtractionStage,
  RuleCategory,
  RuleExample,
  RuleSeverity
} from "./ExtractionRule.js"
export type {
  ExtractionStage as ExtractionStageType,
  RuleCategory as RuleCategoryType,
  RuleSeverity as RuleSeverityType
} from "./ExtractionRule.js"

// Rule Collections
export {
  AllowedIriSet,
  makeEntityRuleSet,
  makeMentionRuleSet,
  makeRelationRuleSet,
  RuleSet
} from "./RuleSet.js"

// Generators
export {
  findRuleById,
  findRulesByCategory,
  generateSchemaAnnotations,
  generateSchemaDescription,
  generateSchemaIdentifier,
  generateSchemaTitle,
  getFieldDescription,
  getFieldValidationTemplate
} from "./SchemaGenerator.js"

export {
  generateEntityPrompt,
  generateMentionPrompt,
  generatePrompt,
  generateRelationPrompt
} from "./PromptGenerator.js"
export type { OntologyPromptContext } from "./PromptGenerator.js"

export {
  extractViolations,
  findMatchingRule,
  generateFeedback,
  generateImprovementPrompt,
  generateTreeFeedback,
  interpolate,
  isRetryable
} from "./FeedbackGenerator.js"
export type { Violation } from "./FeedbackGenerator.js"

================
File: src/Prompt/PromptGenerator.ts
================
/**
 * Prompt Generator - Generate LLM prompts from RuleSet using @effect/printer
 *
 * Transforms extraction rules and ontology context into structured prompts
 * using Effect's Doc API for composable document formatting.
 *
 * @module Prompt/PromptGenerator
 * @since 2.0.0
 */

import { Doc } from "@effect/printer"
import type { ClassDefinition, PropertyDefinition } from "../Domain/Model/Ontology.js"
import type { Entity } from "../Domain/Model/Entity.js"
import { extractLocalName } from "../Utils/Rdf.js"
import type { RuleSet } from "./RuleSet.js"

/**
 * Context for ontology-aware prompt generation
 *
 * @since 2.0.0
 */
export interface OntologyPromptContext {
  /** Available ontology classes */
  readonly classes: ReadonlyArray<ClassDefinition>
  /** Object properties (link entities) */
  readonly objectProperties: ReadonlyArray<PropertyDefinition>
  /** Datatype properties (literal values) */
  readonly datatypeProperties: ReadonlyArray<PropertyDefinition>
  /** Entity IDs from Stage 1 (for relation extraction) */
  readonly entityIds?: ReadonlyArray<string>
  /** Entities from Stage 1 (for relation extraction) */
  readonly entities?: ReadonlyArray<Entity>
}

// =============================================================================
// Document Builders - Sections
// =============================================================================

/**
 * Build task header section
 */
const buildTaskSection = (text: string, stage: "mention" | "entity" | "relation"): Doc.Doc<never> => {
  const taskDescription = stage === "mention"
    ? "Extract all named entity mentions from the following text WITHOUT assigning types."
    : stage === "entity"
      ? "Extract all named entities from the following text and map them to the ontology classes defined below."
      : "Extract relationships between entities from the following text using the ontology properties defined below."

  return Doc.vsep([
    Doc.text(taskDescription),
    Doc.empty,
    Doc.text("TEXT TO EXTRACT FROM:"),
    Doc.text(text)
  ])
}

/**
 * Build class snippet for ontology documentation
 */
const buildClassSnippet = (
  cls: ClassDefinition,
  applicableProperties: ReadonlyArray<PropertyDefinition>
): Doc.Doc<never> => {
  const clsLocalName = extractLocalName(cls.id)
  const props = applicableProperties.filter(
    (p) => p.domain.includes(clsLocalName) || p.domain.length === 0
  )

  const propLines = props.length > 0
    ? props.map((p) => {
      const rangeNote = p.rangeType === "datatype" ? "literal value" : "entity reference"
      return Doc.text(`    - ${p.label} (${p.id}): ${p.comment || "No description"} [expects ${rangeNote}]`)
    })
    : [Doc.text("    (no specific properties)")]

  const broaderNote = cls.broader.length > 0
    ? Doc.text(`Broader: ${cls.broader.join(", ")}`)
    : Doc.empty

  return Doc.vsep([
    Doc.text(`## ${cls.label} (${cls.id})`),
    Doc.text(cls.comment || "No description available."),
    broaderNote,
    Doc.text("Properties:"),
    ...propLines
  ])
}

/**
 * Build property snippet for relation extraction
 */
const buildPropertySnippet = (prop: PropertyDefinition): Doc.Doc<never> => {
  const rangeType = prop.rangeType === "datatype" ? "LITERAL VALUE" : "ENTITY REFERENCE"
  const domainNote = prop.domain.length > 0 ? `Domain: ${prop.domain.join(", ")}` : "Domain: any entity"
  const rangeNote = prop.range.length > 0 ? `Range: ${prop.range.join(", ")}` : `Range: ${rangeType.toLowerCase()}`

  return Doc.vsep([
    Doc.text(`### ${prop.label} (${prop.id})`),
    Doc.text(prop.comment || "No description available."),
    Doc.text(`- ${domainNote}`),
    Doc.text(`- ${rangeNote}`),
    Doc.text(`- Expects: ${rangeType}`)
  ])
}

/**
 * Build ontology schema section for entity extraction
 */
const buildOntologySection = (ctx: OntologyPromptContext): Doc.Doc<never> => {
  if (ctx.classes.length === 0) {
    return Doc.empty
  }

  const allProperties = [...ctx.objectProperties, ...ctx.datatypeProperties]
  const classSnippets = ctx.classes.map((cls) => buildClassSnippet(cls, allProperties))

  return Doc.vsep([
    Doc.text("=== ONTOLOGY SCHEMA ==="),
    Doc.empty,
    ...classSnippets.flatMap((s) => [s, Doc.empty])
  ])
}

/**
 * Build properties section for relation extraction
 */
const buildPropertiesSection = (ctx: OntologyPromptContext): Doc.Doc<never> => {
  const parts: Doc.Doc<never>[] = [Doc.text("=== ONTOLOGY PROPERTIES ==="), Doc.empty]

  if (ctx.objectProperties.length > 0) {
    parts.push(Doc.text("## Object Properties (link entities together)"))
    ctx.objectProperties.forEach((p) => {
      parts.push(buildPropertySnippet(p))
      parts.push(Doc.empty)
    })
  }

  if (ctx.datatypeProperties.length > 0) {
    parts.push(Doc.text("## Datatype Properties (literal values)"))
    ctx.datatypeProperties.forEach((p) => {
      parts.push(buildPropertySnippet(p))
      parts.push(Doc.empty)
    })
  }

  return Doc.vsep(parts)
}

/**
 * Build entities list section for relation extraction
 */
const buildEntitiesSection = (ctx: OntologyPromptContext): Doc.Doc<never> => {
  if (!ctx.entities || ctx.entities.length === 0) {
    return Doc.empty
  }

  const entityLines = ctx.entities.map((e) =>
    Doc.text(`- ${e.id} (${e.mention}): [${e.types.join(", ")}]`)
  )

  return Doc.vsep([
    Doc.text("=== EXTRACTED ENTITIES (from Stage 1) ==="),
    ...entityLines
  ])
}

/**
 * Build quick reference section showing allowed values
 */
const buildQuickReferenceSection = (ruleSet: RuleSet): Doc.Doc<never> => {
  const parts: Doc.Doc<never>[] = []
  const iris = ruleSet.allowedIris

  if (iris.classIris.length > 0) {
    const classListSimple = iris.classIris.map((iri) => Doc.text(`- ${iri}`))
    parts.push(
      Doc.text("=== QUICK REFERENCE: ALLOWED CLASSES ==="),
      ...classListSimple,
      Doc.empty
    )
  }

  const allPropertyIris = [...iris.objectPropertyIris, ...iris.datatypePropertyIris]
  if (allPropertyIris.length > 0) {
    const propertyListSimple = allPropertyIris.map((iri) => Doc.text(`- ${iri}`))
    parts.push(
      Doc.text("=== QUICK REFERENCE: ALLOWED PROPERTIES ==="),
      ...propertyListSimple,
      Doc.empty
    )
  }

  if (iris.entityIds.length > 0) {
    parts.push(
      Doc.text("=== VALID ENTITY IDs ==="),
      Doc.text(iris.entityIds.join(", ")),
      Doc.empty
    )
  }

  return parts.length > 0 ? Doc.vsep(parts) : Doc.empty
}

/**
 * Build extraction rules section from RuleSet
 *
 * This is the key integration point - rules are defined once and rendered here.
 */
const buildRulesSection = (ruleSet: RuleSet): Doc.Doc<never> => {
  const errorRules = ruleSet.errorRules
  const warningRules = ruleSet.warningRules

  const parts: Doc.Doc<never>[] = []

  // Critical rules
  if (errorRules.length > 0) {
    parts.push(Doc.text("=== EXTRACTION RULES ==="))
    errorRules.forEach((rule, idx) => {
      parts.push(Doc.text(`${idx + 1}. ${rule.instruction}`))
    })
    parts.push(Doc.empty)
  }

  // IRI casing warning (always include for entity/relation)
  if (ruleSet.stage !== "mention") {
    parts.push(
      Doc.text("=== CRITICAL: USE EXACT IRIs ==="),
      Doc.text("Copy class and property IRIs EXACTLY as shown above."),
      Doc.text("Do NOT reconstruct IRIs from labels - labels may have different casing."),
      Doc.text('Example: Use "http://ontology/Player" NOT "http://ontology/player"'),
      Doc.empty
    )
  }

  // Preferences (warnings)
  if (warningRules.length > 0) {
    parts.push(Doc.text("=== PREFERENCES ==="))
    warningRules.forEach((rule) => {
      parts.push(Doc.text(`- ${rule.instruction}`))
    })
    parts.push(Doc.empty)
  }

  return Doc.vsep(parts)
}

/**
 * Build output format section
 */
const buildOutputFormatSection = (stage: "mention" | "entity" | "relation"): Doc.Doc<never> => {
  const formatContent = stage === "mention"
    ? `Return a JSON object with a "mentions" array. Each mention should have:
- id: snake_case unique identifier
- mention: exact text from source (human-readable name)
- context: brief description of what this entity is based on the text`
    : stage === "entity"
      ? `Return a JSON object with an "entities" array. Each entity should have:
- id: snake_case unique identifier (e.g., "arsenal_fc")
- mention: exact text from source (human-readable name)
- types: array of ontology class URIs (use the most specific applicable class)
- attributes: optional object with property URIs as keys and literal values as values`
      : `Return a JSON object with a "relations" array. Each relation should have:
- subjectId: entity ID from Stage 1
- predicate: property URI from allowed list
- object: entity ID (for object properties) OR literal value (for datatype properties)`

  return Doc.vsep([
    Doc.text("=== OUTPUT FORMAT ==="),
    Doc.text(formatContent)
  ])
}

// =============================================================================
// Public API
// =============================================================================

/**
 * Generate complete extraction prompt
 *
 * Combines all prompt sections using rules from the RuleSet
 * to ensure schema and prompt are aligned.
 *
 * @param text - Source text to extract from
 * @param ruleSet - Rule set for the extraction stage
 * @param ctx - Ontology context (classes, properties, entities)
 * @returns Complete prompt string
 *
 * @example
 * ```typescript
 * const ruleSet = makeEntityRuleSet(classes, datatypeProperties)
 * const prompt = generatePrompt(text, ruleSet, {
 *   classes,
 *   objectProperties: [],
 *   datatypeProperties
 * })
 * ```
 *
 * @since 2.0.0
 */
export const generatePrompt = (
  text: string,
  ruleSet: RuleSet,
  ctx: OntologyPromptContext
): string => {
  const sections: Doc.Doc<never>[] = [
    buildTaskSection(text, ruleSet.stage)
  ]

  // Stage-specific sections
  if (ruleSet.stage === "entity") {
    sections.push(Doc.empty, buildOntologySection(ctx))
  } else if (ruleSet.stage === "relation") {
    sections.push(Doc.empty, buildEntitiesSection(ctx))
    sections.push(Doc.empty, buildPropertiesSection(ctx))
  }

  // Common sections
  sections.push(Doc.empty, buildQuickReferenceSection(ruleSet))
  sections.push(Doc.empty, buildRulesSection(ruleSet))
  sections.push(Doc.empty, buildOutputFormatSection(ruleSet.stage))

  const doc = Doc.vsep(sections)
  return Doc.render(doc, { style: "pretty", options: { lineWidth: 120 } })
}

/**
 * Generate entity extraction prompt
 *
 * Convenience wrapper that creates RuleSet internally.
 *
 * @param text - Source text to extract from
 * @param classes - Available ontology classes
 * @param datatypeProperties - Available datatype properties
 * @returns Complete entity extraction prompt
 *
 * @since 2.0.0
 */
export const generateEntityPrompt = (
  text: string,
  classes: ReadonlyArray<ClassDefinition>,
  datatypeProperties: ReadonlyArray<PropertyDefinition>
): string => {
  // Import here to avoid circular dependency
  const { makeEntityRuleSet } = require("./RuleSet.js")
  const ruleSet = makeEntityRuleSet(classes, datatypeProperties)

  return generatePrompt(text, ruleSet, {
    classes,
    objectProperties: [],
    datatypeProperties
  })
}

/**
 * Generate relation extraction prompt
 *
 * Convenience wrapper that creates RuleSet internally.
 *
 * @param text - Source text to extract from
 * @param entities - Entities from Stage 1
 * @param properties - Available properties
 * @returns Complete relation extraction prompt
 *
 * @since 2.0.0
 */
export const generateRelationPrompt = (
  text: string,
  entities: ReadonlyArray<Entity>,
  properties: ReadonlyArray<PropertyDefinition>
): string => {
  // Import here to avoid circular dependency
  const { makeRelationRuleSet } = require("./RuleSet.js")
  const entityIds = entities.map((e) => e.id)
  const ruleSet = makeRelationRuleSet(entityIds, properties)

  const objectProperties = properties.filter((p) => p.rangeType === "object")
  const datatypeProperties = properties.filter((p) => p.rangeType === "datatype")

  return generatePrompt(text, ruleSet, {
    classes: [],
    objectProperties,
    datatypeProperties,
    entityIds,
    entities
  })
}

/**
 * Generate mention extraction prompt
 *
 * Convenience wrapper for pre-Stage 1 mention detection.
 *
 * @param text - Source text to extract from
 * @returns Complete mention extraction prompt
 *
 * @since 2.0.0
 */
export const generateMentionPrompt = (text: string): string => {
  // Import here to avoid circular dependency
  const { makeMentionRuleSet } = require("./RuleSet.js")
  const ruleSet = makeMentionRuleSet()

  return generatePrompt(text, ruleSet, {
    classes: [],
    objectProperties: [],
    datatypeProperties: []
  })
}

================
File: src/Prompt/RuleSet.ts
================
/**
 * RuleSet - Rule collections and factory functions
 *
 * Provides composed rule collections for each extraction stage,
 * combining static rules (constant) with dynamic rules (from ontology context).
 *
 * @module Prompt/RuleSet
 * @since 2.0.0
 */

import { Data } from "effect"
import type { ClassDefinition, PropertyDefinition } from "../Domain/Model/Ontology.js"
import { buildCaseInsensitiveIriMap } from "../Utils/Iri.js"
import { ExtractionRule, RuleExample, type ExtractionStage } from "./ExtractionRule.js"

/**
 * AllowedIriSet - Type-safe IRI constraints with case-insensitive lookups
 *
 * Stores the canonical IRIs and pre-built lookup maps for validation.
 *
 * @since 2.0.0
 */
export class AllowedIriSet extends Data.Class<{
  /** Canonical class IRIs */
  readonly classIris: ReadonlyArray<string>
  /** Canonical object property IRIs */
  readonly objectPropertyIris: ReadonlyArray<string>
  /** Canonical datatype property IRIs */
  readonly datatypePropertyIris: ReadonlyArray<string>
  /** Valid entity IDs (from Stage 1) */
  readonly entityIds: ReadonlyArray<string>
  /** Case-insensitive class IRI lookup */
  readonly classIriMap: Map<string, string>
  /** Case-insensitive property IRI lookup */
  readonly propertyIriMap: Map<string, string>
}> {
  /**
   * Create from ontology definitions
   */
  static fromOntology(
    classes: ReadonlyArray<ClassDefinition>,
    objectProperties: ReadonlyArray<PropertyDefinition>,
    datatypeProperties: ReadonlyArray<PropertyDefinition>,
    entityIds: ReadonlyArray<string> = []
  ): AllowedIriSet {
    const classIris = classes.map((c) => c.id)
    const objectPropertyIris = objectProperties.map((p) => p.id)
    const datatypePropertyIris = datatypeProperties.map((p) => p.id)
    const allPropertyIris = [...objectPropertyIris, ...datatypePropertyIris]

    return new AllowedIriSet({
      classIris,
      objectPropertyIris,
      datatypePropertyIris,
      entityIds,
      classIriMap: buildCaseInsensitiveIriMap(classIris),
      propertyIriMap: buildCaseInsensitiveIriMap(allPropertyIris)
    })
  }

  /**
   * Get preview string of allowed IRIs (first N items)
   */
  previewIris(type: "classes" | "objectProperties" | "datatypeProperties" | "entityIds", limit = 5): string {
    const iris = type === "classes"
      ? this.classIris
      : type === "objectProperties"
        ? this.objectPropertyIris
        : type === "datatypeProperties"
          ? this.datatypePropertyIris
          : this.entityIds

    const preview = iris.slice(0, limit).join(", ")
    return iris.length > limit ? `${preview}...` : preview
  }
}

/**
 * RuleSet - Collection of rules for a specific extraction stage
 *
 * Combines static rules (constant across extractions) with dynamic rules
 * (derived from specific ontology context).
 *
 * @since 2.0.0
 */
export class RuleSet extends Data.Class<{
  /** Stage identifier */
  readonly stage: ExtractionStage
  /** Static rules (don't depend on ontology) */
  readonly staticRules: ReadonlyArray<ExtractionRule>
  /** Dynamic rules (generated from ontology context) */
  readonly dynamicRules: ReadonlyArray<ExtractionRule>
  /** Allowed IRIs (for validation and prompt generation) */
  readonly allowedIris: AllowedIriSet
}> {
  /**
   * Get all rules (static + dynamic)
   */
  get allRules(): ReadonlyArray<ExtractionRule> {
    return [...this.staticRules, ...this.dynamicRules]
  }

  /**
   * Get only hard constraints (error severity)
   */
  get errorRules(): ReadonlyArray<ExtractionRule> {
    return this.allRules.filter((r) => r.severity === "error")
  }

  /**
   * Get only soft preferences (warning severity)
   */
  get warningRules(): ReadonlyArray<ExtractionRule> {
    return this.allRules.filter((r) => r.severity === "warning")
  }

  /**
   * Get rules by category
   */
  getRulesByCategory(category: string): ReadonlyArray<ExtractionRule> {
    return this.allRules.filter((r) => r.category === category)
  }
}

// =============================================================================
// Static Rules - Entity Extraction
// =============================================================================

/**
 * Static rules for entity extraction (Stage 1)
 *
 * These rules are constant across all entity extractions.
 *
 * @since 2.0.0
 */
export const ENTITY_STATIC_RULES: ReadonlyArray<ExtractionRule> = [
  new ExtractionRule({
    id: "entity-id-format",
    category: "id_format",
    severity: "error",
    instruction: "Assign unique snake_case IDs starting with a lowercase letter (e.g., 'cristiano_ronaldo' for 'Cristiano Ronaldo')",
    example: new RuleExample({
      input: "Cristiano Ronaldo",
      output: "cristiano_ronaldo",
      explanation: "Lowercase with underscores, no special characters"
    }),
    counterExample: new RuleExample({
      input: "Cristiano Ronaldo",
      output: "CristianoRonaldo",
      explanation: "Avoid PascalCase or camelCase for entity IDs"
    }),
    schemaDescription: "Snake_case unique identifier - use this exact ID when referring to this entity in relations (e.g., 'cristiano_ronaldo')",
    validationTemplate: "Entity ID '{value}' must be snake_case starting with a lowercase letter"
  }),

  new ExtractionRule({
    id: "entity-id-numbers",
    category: "id_format",
    severity: "error",
    instruction: "For names starting with numbers, prepend 'e' (e.g., '2pac' becomes 'e2pac')",
    example: new RuleExample({
      input: "2Pac",
      output: "e2pac",
      explanation: "Prepend 'e' for IDs that would start with a number"
    }),
    counterExample: new RuleExample({
      input: "2Pac",
      output: "2pac",
      explanation: "IDs cannot start with a number"
    }),
    schemaDescription: "IDs must start with a letter - prepend 'e' for numeric names",
    validationTemplate: "Entity ID '{value}' cannot start with a number"
  }),

  new ExtractionRule({
    id: "entity-mention-complete",
    category: "mention_format",
    severity: "warning",
    instruction: "Use complete, human-readable names for mentions (e.g., 'Stanford University' not 'Stanford')",
    example: new RuleExample({
      input: "Stanford is a top university",
      output: "Stanford University",
      explanation: "Use full canonical name even if abbreviated in text"
    }),
    counterExample: new RuleExample({
      input: "Stanford is a top university",
      output: "Stanford",
      explanation: "Incomplete - prefer full canonical form"
    }),
    schemaDescription: "Human-readable entity name found in text - use complete, canonical form (e.g., 'Cristiano Ronaldo' not 'Ronaldo')",
    validationTemplate: "Mention '{value}' may be incomplete - prefer full canonical form"
  }),

  new ExtractionRule({
    id: "entity-type-required",
    category: "type_mapping",
    severity: "error",
    instruction: "Map each entity to at least one ontology class from the allowed list",
    example: new RuleExample({
      input: "Cristiano Ronaldo is a footballer",
      output: '["http://schema.org/Person"]',
      explanation: "At least one type IRI is required"
    }),
    counterExample: new RuleExample({
      input: "Cristiano Ronaldo is a footballer",
      output: "[]",
      explanation: "Empty types array is not allowed"
    }),
    schemaDescription: "Array of ontology class URIs this entity instantiates (at least one required)",
    validationTemplate: "Entity must have at least one type, got: {value}"
  }),

  new ExtractionRule({
    id: "entity-type-specific",
    category: "type_mapping",
    severity: "warning",
    instruction: "Map each entity to the MOST SPECIFIC applicable ontology class",
    example: new RuleExample({
      input: "Cristiano Ronaldo is a footballer",
      output: "http://ontology/FootballPlayer",
      explanation: "Use specific subclass, not generic Person"
    }),
    counterExample: new RuleExample({
      input: "Cristiano Ronaldo is a footballer",
      output: "http://schema.org/Thing",
      explanation: "Too generic - prefer specific type"
    }),
    schemaDescription: "Use the most specific applicable class from the ontology",
    validationTemplate: "Type '{value}' may be too generic - consider more specific class"
  }),

  new ExtractionRule({
    id: "iri-exact-casing",
    category: "iri_casing",
    severity: "error",
    instruction: "Copy class and property IRIs EXACTLY as shown in the schema. Do NOT reconstruct from labels.",
    example: new RuleExample({
      input: "Player class with label 'player'",
      output: "http://ontology/Player",
      explanation: "Use exact IRI from schema, not http://ontology/player"
    }),
    counterExample: new RuleExample({
      input: "Player class with label 'player'",
      output: "http://ontology/player",
      explanation: "Wrong casing - derived from label instead of IRI"
    }),
    schemaDescription: "Use exact IRI from allowed list (case-sensitive)",
    validationTemplate: "IRI '{value}' has incorrect casing - check the allowed list"
  }),

  new ExtractionRule({
    id: "entity-id-reuse",
    category: "reference_integrity",
    severity: "error",
    instruction: "Reuse the exact same ID when referring to the same entity across the text",
    example: new RuleExample({
      input: "Ronaldo scored. Ronaldo celebrated.",
      output: "cristiano_ronaldo (both occurrences)",
      explanation: "Same entity = same ID"
    }),
    counterExample: new RuleExample({
      input: "Ronaldo scored. Ronaldo celebrated.",
      output: "cristiano_ronaldo, ronaldo_2",
      explanation: "Don't create duplicate IDs for same entity"
    }),
    schemaDescription: "Reuse exact ID for same entity",
    validationTemplate: "Entity ID '{value}' may be a duplicate - reuse existing ID"
  }),

  new ExtractionRule({
    id: "entity-extract-all",
    category: "cardinality",
    severity: "warning",
    instruction: "Extract as many entities as possible - be thorough",
    example: new RuleExample({
      input: "Ronaldo plays for Al-Nassr in Saudi Arabia",
      output: "3 entities: cristiano_ronaldo, al_nassr, saudi_arabia",
      explanation: "Extract all named entities"
    }),
    counterExample: new RuleExample({
      input: "Ronaldo plays for Al-Nassr in Saudi Arabia",
      output: "1 entity: cristiano_ronaldo",
      explanation: "Missing entities - extract all of them"
    }),
    schemaDescription: "Extract all named entities from the text",
    validationTemplate: "May have missed entities - extraction found only {value}"
  })
]

// =============================================================================
// Static Rules - Relation Extraction
// =============================================================================

/**
 * Static rules for relation extraction (Stage 2)
 *
 * These rules are constant across all relation extractions.
 *
 * @since 2.0.0
 */
export const RELATION_STATIC_RULES: ReadonlyArray<ExtractionRule> = [
  new ExtractionRule({
    id: "relation-subject-valid",
    category: "reference_integrity",
    severity: "error",
    instruction: "Subject MUST be one of the entity IDs from Stage 1",
    example: new RuleExample({
      input: "cristiano_ronaldo plays for al_nassr",
      output: '{ "subjectId": "cristiano_ronaldo" }',
      explanation: "Use exact entity ID from Stage 1"
    }),
    counterExample: new RuleExample({
      input: "cristiano_ronaldo plays for al_nassr",
      output: '{ "subjectId": "ronaldo" }',
      explanation: "Must use exact ID from Stage 1, not abbreviated"
    }),
    schemaDescription: "Subject entity ID - MUST be from Stage 1 entity list",
    validationTemplate: "Subject '{value}' is not a valid entity ID from Stage 1"
  }),

  new ExtractionRule({
    id: "relation-predicate-valid",
    category: "property_usage",
    severity: "error",
    instruction: "Predicate MUST be one of the allowed property URIs",
    example: new RuleExample({
      input: "uses playsFor property",
      output: "http://ontology/PlaysFor",
      explanation: "Use exact property IRI from allowed list"
    }),
    counterExample: new RuleExample({
      input: "uses playsFor property",
      output: "playsFor",
      explanation: "Must use full IRI, not local name"
    }),
    schemaDescription: "Property IRI - MUST be from allowed properties list",
    validationTemplate: "Predicate '{value}' is not a valid property IRI"
  }),

  new ExtractionRule({
    id: "relation-object-type",
    category: "property_usage",
    severity: "error",
    instruction: "Object type depends on property: object properties require entity ID, datatype properties require literal value",
    example: new RuleExample({
      input: "Object property 'playsFor'",
      output: '{ "object": "al_nassr" }',
      explanation: "Object property → entity ID as object"
    }),
    counterExample: new RuleExample({
      input: "Object property 'playsFor'",
      output: '{ "object": "Al-Nassr" }',
      explanation: "Must use entity ID, not literal string"
    }),
    schemaDescription: "Object: entity ID (for object properties) OR literal value (for datatype properties)",
    validationTemplate: "Object '{value}' has wrong type for this property"
  }),

  new ExtractionRule({
    id: "relation-iri-casing",
    category: "iri_casing",
    severity: "error",
    instruction: "Copy property IRIs EXACTLY as shown. Do NOT reconstruct from labels.",
    example: new RuleExample({
      input: "teamRanking property",
      output: "http://ontology/TeamRanking",
      explanation: "Use exact IRI, not http://ontology/teamRanking"
    }),
    counterExample: new RuleExample({
      input: "teamRanking property",
      output: "http://ontology/teamRanking",
      explanation: "Wrong casing - derived from label"
    }),
    schemaDescription: "Use exact property IRI from allowed list (case-sensitive)",
    validationTemplate: "Property IRI '{value}' has incorrect casing"
  }),

  new ExtractionRule({
    id: "relation-extract-all",
    category: "cardinality",
    severity: "warning",
    instruction: "Extract ALL relationships mentioned or implied in the text - be thorough",
    example: new RuleExample({
      input: "Ronaldo plays for Al-Nassr in Saudi Arabia",
      output: "2 relations: ronaldo-playsFor->al_nassr, al_nassr-locatedIn->saudi_arabia",
      explanation: "Extract all valid relations"
    }),
    counterExample: new RuleExample({
      input: "Ronaldo plays for Al-Nassr in Saudi Arabia",
      output: "1 relation: ronaldo-playsFor->al_nassr",
      explanation: "Missing relation - extract all of them"
    }),
    schemaDescription: "Extract all valid relations from the text",
    validationTemplate: "May have missed relations - extraction found only {value}"
  })
]

// =============================================================================
// Factory Functions
// =============================================================================

/**
 * Create entity extraction rule set from ontology context
 *
 * Combines static entity rules with dynamic rules derived from
 * the specific classes and properties available.
 *
 * @param classes - Available ontology classes
 * @param datatypeProperties - Available datatype properties for attributes
 * @returns RuleSet for entity extraction
 *
 * @since 2.0.0
 */
export const makeEntityRuleSet = (
  classes: ReadonlyArray<ClassDefinition>,
  datatypeProperties: ReadonlyArray<PropertyDefinition>
): RuleSet => {
  const dynamicRules: Array<ExtractionRule> = []

  // Dynamic rule: allowed classes
  if (classes.length > 0) {
    const preview = classes.slice(0, 5).map((c) => c.id).join(", ")
    const suffix = classes.length > 5 ? "..." : ""

    dynamicRules.push(
      new ExtractionRule({
        id: "entity-allowed-classes",
        category: "type_mapping",
        severity: "error",
        instruction: `Types MUST be from allowed classes: ${preview}${suffix}`,
        example: new RuleExample({
          input: "Selecting entity type",
          output: classes[0]?.id ?? "http://example.org/Person",
          explanation: "Use IRI from the ontology schema"
        }),
        counterExample: null,
        schemaDescription: `Allowed classes: ${preview}${suffix}`,
        validationTemplate: "Type '{value}' is not in allowed classes"
      })
    )
  }

  // Dynamic rule: allowed datatype properties (for attributes)
  if (datatypeProperties.length > 0) {
    const preview = datatypeProperties.slice(0, 5).map((p) => p.id).join(", ")
    const suffix = datatypeProperties.length > 5 ? "..." : ""

    dynamicRules.push(
      new ExtractionRule({
        id: "entity-allowed-attributes",
        category: "property_usage",
        severity: "warning", // Warning because we use permissive + filter
        instruction: `Attribute keys SHOULD use property IRIs from: ${preview}${suffix}`,
        example: new RuleExample({
          input: "age attribute",
          output: datatypeProperties[0]?.id ?? "http://schema.org/age",
          explanation: "Use property IRI, not label"
        }),
        counterExample: null,
        schemaDescription: "Attribute keys should preferably use ontology datatype property IRIs",
        validationTemplate: "Attribute key '{value}' is not in allowed properties (will be filtered)"
      })
    )
  }

  const allowedIris = AllowedIriSet.fromOntology(
    classes,
    [], // No object properties for entity stage
    datatypeProperties,
    [] // No entity IDs yet
  )

  return new RuleSet({
    stage: "entity",
    staticRules: ENTITY_STATIC_RULES,
    dynamicRules,
    allowedIris
  })
}

/**
 * Create relation extraction rule set from ontology context
 *
 * Combines static relation rules with dynamic rules derived from
 * the specific entity IDs and properties available.
 *
 * @param entityIds - Valid entity IDs from Stage 1
 * @param properties - Available properties (both object and datatype)
 * @returns RuleSet for relation extraction
 *
 * @since 2.0.0
 */
export const makeRelationRuleSet = (
  entityIds: ReadonlyArray<string>,
  properties: ReadonlyArray<PropertyDefinition>
): RuleSet => {
  const dynamicRules: Array<ExtractionRule> = []
  const objectProperties = properties.filter((p) => p.rangeType === "object")
  const datatypeProperties = properties.filter((p) => p.rangeType === "datatype")

  // Dynamic rule: valid entity IDs
  if (entityIds.length > 0) {
    const preview = entityIds.slice(0, 5).join(", ")
    const suffix = entityIds.length > 5 ? "..." : ""

    dynamicRules.push(
      new ExtractionRule({
        id: "relation-valid-entities",
        category: "reference_integrity",
        severity: "error",
        instruction: `Use ONLY these entity IDs from Stage 1: ${preview}${suffix}`,
        example: new RuleExample({
          input: "Selecting subject/object",
          output: entityIds[0] ?? "entity_1",
          explanation: "Use exact ID from Stage 1"
        }),
        counterExample: null,
        schemaDescription: `Valid entity IDs: ${preview}${suffix}`,
        validationTemplate: "Entity ID '{value}' is not from Stage 1"
      })
    )
  }

  // Dynamic rule: allowed object properties
  if (objectProperties.length > 0) {
    const preview = objectProperties.slice(0, 5).map((p) => p.id).join(", ")
    const suffix = objectProperties.length > 5 ? "..." : ""

    dynamicRules.push(
      new ExtractionRule({
        id: "relation-allowed-object-props",
        category: "property_usage",
        severity: "error",
        instruction: `Object properties (link entities): ${preview}${suffix}`,
        example: new RuleExample({
          input: "Entity-to-entity relation",
          output: objectProperties[0]?.id ?? "http://example.org/relatedTo",
          explanation: "Object property → object must be entity ID"
        }),
        counterExample: null,
        schemaDescription: `Object properties: ${preview}${suffix}`,
        validationTemplate: "Property '{value}' is not in allowed object properties"
      })
    )
  }

  // Dynamic rule: allowed datatype properties
  if (datatypeProperties.length > 0) {
    const preview = datatypeProperties.slice(0, 5).map((p) => p.id).join(", ")
    const suffix = datatypeProperties.length > 5 ? "..." : ""

    dynamicRules.push(
      new ExtractionRule({
        id: "relation-allowed-datatype-props",
        category: "property_usage",
        severity: "error",
        instruction: `Datatype properties (literal values): ${preview}${suffix}`,
        example: new RuleExample({
          input: "Entity-to-literal relation",
          output: datatypeProperties[0]?.id ?? "http://example.org/name",
          explanation: "Datatype property → object must be literal"
        }),
        counterExample: null,
        schemaDescription: `Datatype properties: ${preview}${suffix}`,
        validationTemplate: "Property '{value}' is not in allowed datatype properties"
      })
    )
  }

  const allowedIris = AllowedIriSet.fromOntology(
    [], // No classes for relation stage
    objectProperties,
    datatypeProperties,
    entityIds
  )

  return new RuleSet({
    stage: "relation",
    staticRules: RELATION_STATIC_RULES,
    dynamicRules,
    allowedIris
  })
}

/**
 * Create mention extraction rule set
 *
 * Mention extraction has simpler rules since it doesn't involve type assignment.
 *
 * @returns RuleSet for mention extraction
 *
 * @since 2.0.0
 */
export const makeMentionRuleSet = (): RuleSet => {
  const staticRules: ReadonlyArray<ExtractionRule> = [
    new ExtractionRule({
      id: "mention-id-format",
      category: "id_format",
      severity: "error",
      instruction: "Assign unique snake_case IDs starting with a lowercase letter",
      example: new RuleExample({
        input: "Cristiano Ronaldo",
        output: "cristiano_ronaldo",
        explanation: "Lowercase with underscores"
      }),
      counterExample: null,
      schemaDescription: "Snake_case unique identifier",
      validationTemplate: "Mention ID '{value}' must be snake_case"
    }),

    new ExtractionRule({
      id: "mention-complete",
      category: "mention_format",
      severity: "warning",
      instruction: "Use complete, human-readable names for mentions",
      example: new RuleExample({
        input: "Stanford is a university",
        output: "Stanford University",
        explanation: "Use full canonical form"
      }),
      counterExample: null,
      schemaDescription: "Human-readable entity name - use complete form",
      validationTemplate: "Mention '{value}' may be incomplete"
    }),

    new ExtractionRule({
      id: "mention-context",
      category: "mention_format",
      severity: "warning",
      instruction: "Include brief context about each entity to help with later classification",
      example: new RuleExample({
        input: "Ronaldo scored a goal",
        output: '{ "context": "A professional footballer who scored" }',
        explanation: "Context helps with type assignment in Stage 1"
      }),
      counterExample: null,
      schemaDescription: "Brief context about the entity from text",
      validationTemplate: "Missing context for mention '{value}'"
    }),

    new ExtractionRule({
      id: "mention-extract-all",
      category: "cardinality",
      severity: "warning",
      instruction: "Extract as many entity mentions as possible - be thorough",
      example: new RuleExample({
        input: "Ronaldo plays for Al-Nassr",
        output: "2 mentions",
        explanation: "Extract all named entities"
      }),
      counterExample: null,
      schemaDescription: "Extract all entity mentions from text",
      validationTemplate: "May have missed mentions"
    })
  ]

  return new RuleSet({
    stage: "mention",
    staticRules,
    dynamicRules: [],
    allowedIris: new AllowedIriSet({
      classIris: [],
      objectPropertyIris: [],
      datatypePropertyIris: [],
      entityIds: [],
      classIriMap: new Map(),
      propertyIriMap: new Map()
    })
  })
}

================
File: src/Prompt/SchemaGenerator.ts
================
/**
 * Schema Generator - Generate Effect Schema annotations from RuleSet
 *
 * Transforms extraction rules into Effect Schema annotation content,
 * ensuring schema descriptions align with prompt instructions.
 *
 * @module Prompt/SchemaGenerator
 * @since 2.0.0
 */

import type { ExtractionRule } from "./ExtractionRule.js"
import type { RuleSet } from "./RuleSet.js"

/**
 * Generate top-level schema description from rule set
 *
 * Creates a structured description for the schema's top-level annotation
 * that includes all critical rules (error severity).
 *
 * @param ruleSet - Rule set for the extraction stage
 * @returns Description string for schema annotation
 *
 * @example
 * ```typescript
 * const ruleSet = makeEntityRuleSet(classes, properties)
 * const description = generateSchemaDescription(ruleSet)
 * // Returns:
 * // "CRITICAL RULES:
 * // - Assign unique snake_case IDs starting with a lowercase letter
 * // - Map each entity to at least one ontology class
 * // ..."
 * ```
 *
 * @since 2.0.0
 */
export const generateSchemaDescription = (ruleSet: RuleSet): string => {
  const errorRules = ruleSet.errorRules
  const warningRules = ruleSet.warningRules

  const sections: string[] = []

  // Critical rules section
  if (errorRules.length > 0) {
    const criticalLines = errorRules.map((r) => `- ${r.instruction}`)
    sections.push(`CRITICAL RULES:\n${criticalLines.join("\n")}`)
  }

  // Preferences section (warnings)
  if (warningRules.length > 0) {
    const preferenceLines = warningRules.map((r) => `- ${r.instruction}`)
    sections.push(`PREFERENCES:\n${preferenceLines.join("\n")}`)
  }

  return sections.join("\n\n")
}

/**
 * Generate title for schema based on stage
 *
 * @param ruleSet - Rule set for the extraction stage
 * @returns Title string for schema annotation
 *
 * @since 2.0.0
 */
export const generateSchemaTitle = (ruleSet: RuleSet): string => {
  switch (ruleSet.stage) {
    case "mention":
      return "Mention Extraction"
    case "entity":
      return "Entity Extraction (Stage 1)"
    case "relation":
      return "Relation Extraction (Stage 2)"
  }
}

/**
 * Generate identifier for schema based on stage
 *
 * @param ruleSet - Rule set for the extraction stage
 * @returns Identifier string for schema annotation
 *
 * @since 2.0.0
 */
export const generateSchemaIdentifier = (ruleSet: RuleSet): string => {
  switch (ruleSet.stage) {
    case "mention":
      return "MentionGraph"
    case "entity":
      return "EntityGraph"
    case "relation":
      return "RelationGraph"
  }
}

/**
 * Field path to rule mapping
 *
 * Maps schema field paths to rule IDs for looking up field-specific descriptions.
 */
const FIELD_TO_RULE_MAP: Record<string, string> = {
  // Entity fields
  "entities.id": "entity-id-format",
  "entities.mention": "entity-mention-complete",
  "entities.types": "entity-type-required",
  "entities.attributes": "entity-allowed-attributes",
  // Relation fields
  "relations.subjectId": "relation-subject-valid",
  "relations.predicate": "relation-predicate-valid",
  "relations.object": "relation-object-type",
  // Mention fields
  "mentions.id": "mention-id-format",
  "mentions.mention": "mention-complete",
  "mentions.context": "mention-context"
}

/**
 * Get schema description for a specific field
 *
 * Looks up the appropriate rule for a field path and returns its schema description.
 *
 * @param ruleSet - Rule set containing the rules
 * @param fieldPath - Dot-separated path to the field (e.g., "entities.id")
 * @returns Field description if rule exists, undefined otherwise
 *
 * @example
 * ```typescript
 * const ruleSet = makeEntityRuleSet(classes, properties)
 * const desc = getFieldDescription(ruleSet, "entities.id")
 * // Returns: "Snake_case unique identifier - use this exact ID when referring to this entity in relations (e.g., 'cristiano_ronaldo')"
 * ```
 *
 * @since 2.0.0
 */
export const getFieldDescription = (
  ruleSet: RuleSet,
  fieldPath: string
): string | undefined => {
  const ruleId = FIELD_TO_RULE_MAP[fieldPath]
  if (!ruleId) return undefined

  const rule = ruleSet.allRules.find((r) => r.id === ruleId)
  return rule?.schemaDescription
}

/**
 * Get validation message for a field
 *
 * Returns the validation template from the corresponding rule,
 * which can be interpolated with actual values.
 *
 * @param ruleSet - Rule set containing the rules
 * @param fieldPath - Dot-separated path to the field
 * @returns Validation template if rule exists, undefined otherwise
 *
 * @since 2.0.0
 */
export const getFieldValidationTemplate = (
  ruleSet: RuleSet,
  fieldPath: string
): string | undefined => {
  const ruleId = FIELD_TO_RULE_MAP[fieldPath]
  if (!ruleId) return undefined

  const rule = ruleSet.allRules.find((r) => r.id === ruleId)
  return rule?.validationTemplate
}

/**
 * Generate schema annotations object
 *
 * Creates a complete annotations object for use with Effect Schema.
 *
 * @param ruleSet - Rule set for the extraction stage
 * @returns Annotations object for S.annotations()
 *
 * @example
 * ```typescript
 * const ruleSet = makeEntityRuleSet(classes, properties)
 * const annotations = generateSchemaAnnotations(ruleSet)
 *
 * const schema = S.Struct({ ... }).annotations(annotations)
 * ```
 *
 * @since 2.0.0
 */
export const generateSchemaAnnotations = (ruleSet: RuleSet): {
  identifier: string
  title: string
  description: string
} => ({
  identifier: generateSchemaIdentifier(ruleSet),
  title: generateSchemaTitle(ruleSet),
  description: generateSchemaDescription(ruleSet)
})

/**
 * Find rule by category
 *
 * Utility to find rules matching a specific category.
 *
 * @param ruleSet - Rule set to search
 * @param category - Rule category to filter by
 * @returns Array of matching rules
 *
 * @since 2.0.0
 */
export const findRulesByCategory = (
  ruleSet: RuleSet,
  category: string
): ReadonlyArray<ExtractionRule> => ruleSet.getRulesByCategory(category)

/**
 * Find rule by ID
 *
 * @param ruleSet - Rule set to search
 * @param ruleId - Unique rule identifier
 * @returns Matching rule or undefined
 *
 * @since 2.0.0
 */
export const findRuleById = (
  ruleSet: RuleSet,
  ruleId: string
): ExtractionRule | undefined => ruleSet.allRules.find((r) => r.id === ruleId)

================
File: src/Runtime/index.ts
================
/**
 * Runtime Layer Exports
 *
 * @since 2.0.0
 * @module Runtime
 */

export * from "./ProductionRuntime.js"
export * from "./TestRuntime.js"

================
File: src/Runtime/ProductionRuntime.ts
================
/**
 * Runtime: Production Runtime
 *
 * Layer composition for production deployment.
 * Provides all services with correct dependency order.
 *
 * **Note**: LanguageModel.LanguageModel must be provided separately
 * by the application (e.g., from @effect/ai-anthropic or @effect/ai-openai).
 * Use `makeLanguageModelLayer()` helper to create it from ConfigService.
 *
 * @since 2.0.0
 * @module Runtime/ProductionRuntime
 */

import { AnthropicClient, AnthropicLanguageModel } from "@effect/ai-anthropic"
import { GoogleClient, GoogleLanguageModel } from "@effect/ai-google"
import { OpenAiClient, OpenAiLanguageModel } from "@effect/ai-openai"
import { FetchHttpClient } from "@effect/platform"
import { Config, Effect, Layer, Redacted } from "effect"
import { ConfigService } from "../Service/Config.js"
import { EntityExtractor, MentionExtractor, RelationExtractor } from "../Service/Extraction.js"
import { Grounder } from "../Service/Grounder.js"
import { makeTracingLayer } from "../Telemetry/Tracing.js"
import { RateLimitedLanguageModelLayer } from "./RateLimitedLanguageModel.js"

/**
 * Create LanguageModel layer with ConfigService
 *
 * Reads LLM provider configuration from ConfigService and creates
 * the appropriate LanguageModel layer with API key from environment.
 * Only loads the API key for the configured provider.
 *
 * This is a Layer that depends on ConfigService and provides LanguageModel.
 *
 * @returns Layer providing LanguageModel (with all dependencies satisfied)
 *
 * @example
 * ```typescript
 * const layers = ProductionLayers.pipe(
 *   Layer.provide(makeLanguageModelLayer())
 * )
 * ```
 *
 * @since 2.0.0
 */
export const makeLanguageModelLayer = Layer.unwrapEffect(
  Effect.gen(function*() {
    const config = yield* ConfigService

    switch (config.llm.provider) {
      case "anthropic": {
        // Only load Anthropic API key from environment
        const apiKeyRedacted = yield* Config.redacted("ANTHROPIC_API_KEY").pipe(
          Config.orElse(() => Config.redacted("VITE_LLM_ANTHROPIC_API_KEY")),
          Config.orElse(() => Config.succeed(Redacted.make(config.llm.anthropicApiKey)))
        )
        const apiKey = Redacted.value(apiKeyRedacted)

        // Build ConfigService with updated API key
        const configLayer = Layer.succeed(ConfigService, {
          ...config,
          llm: {
            ...config.llm,
            model: "claude-haiku-4-5",
            anthropicApiKey: apiKey
          }
        })

        return AnthropicLanguageModel.layer({ model: config.llm.model }).pipe(
          Layer.provide(
            AnthropicClient.layer({ apiKey: Redacted.make(apiKey) }).pipe(
              Layer.provide(FetchHttpClient.layer)
            )
          ),
          Layer.provide(configLayer)
        )
      }

      case "openai": {
        // Only load OpenAI API key from environment
        const apiKeyRedacted = yield* Config.redacted("OPENAI_API_KEY").pipe(
          Config.orElse(() => Config.redacted("VITE_LLM_OPENAI_API_KEY")),
          Config.orElse(() => Config.succeed(Redacted.make(config.llm.openaiApiKey)))
        )
        const apiKey = Redacted.value(apiKeyRedacted)

        // Build ConfigService with updated API key
        const configLayer = Layer.succeed(ConfigService, {
          ...config,
          llm: {
            ...config.llm,
            openaiApiKey: apiKey
          }
        })

        return OpenAiLanguageModel.layer({ model: config.llm.model }).pipe(
          Layer.provide(
            OpenAiClient.layer({ apiKey: Redacted.make(apiKey) }).pipe(Layer.provide(FetchHttpClient.layer))
          ),
          Layer.provide(configLayer)
        )
      }

      case "google": {
        // Only load Google API key from environment
        const apiKeyRedacted = yield* Config.redacted("GOOGLE_API_KEY").pipe(
          Config.orElse(() => Config.redacted("VITE_LLM_GEMINI_API_KEY")),
          Config.orElse(() => Config.succeed(Redacted.make(config.llm.googleApiKey)))
        )
        const apiKey = Redacted.value(apiKeyRedacted)

        // Build ConfigService with updated API key
        const configLayer = Layer.succeed(ConfigService, {
          ...config,
          llm: {
            ...config.llm,
            googleApiKey: apiKey
          }
        })

        return GoogleLanguageModel.layer({ model: config.llm.model }).pipe(
          Layer.provide(
            GoogleClient.layer({ apiKey: Redacted.make(apiKey) }).pipe(Layer.provide(FetchHttpClient.layer))
          ),
          Layer.provide(configLayer)
        )
      }
    }
  })
)

/**
 * Rate-limited LanguageModel layer
 *
 * Composes the base LanguageModel with rate limiting.
 * All LLM calls go through the rate limiter automatically.
 *
 * @since 2.0.0
 */
export const RateLimitedLlmLayer = RateLimitedLanguageModelLayer.pipe(
  Layer.provide(makeLanguageModelLayer)
)

/**
 * Production extraction layers with rate-limited LLM
 *
 * Provides all extraction services:
 * - EntityExtractor
 * - MentionExtractor
 * - RelationExtractor
 * - Grounder
 *
 * All services use the rate-limited LanguageModel automatically.
 *
 * @since 2.0.0
 */
export const ExtractionLayersLive = Layer.mergeAll(
  EntityExtractor.Default,
  MentionExtractor.Default,
  RelationExtractor.Default,
  Grounder.Default
).pipe(Layer.provide(RateLimitedLlmLayer))

/**
 * OpenTelemetry tracing layer for Jaeger export
 *
 * Exports spans to Jaeger via OTLP HTTP protocol.
 * Run Jaeger locally with: docker run -d -p 16686:16686 -p 4318:4318 jaegertracing/all-in-one:latest
 * View traces at: http://localhost:16686
 *
 * @example
 * ```typescript
 * // Use in production
 * const layers = ExtractionLayersLive.pipe(
 *   Layer.provide(TracingLive)
 * )
 * ```
 *
 * @since 2.0.0
 */
export const TracingLive = makeTracingLayer({
  serviceName: "effect-ontology-extraction",
  otlpEndpoint: "http://localhost:4318/v1/traces",
  enabled: true
}).pipe(Layer.provide(FetchHttpClient.layer))

/**
 * Production layers with tracing
 *
 * Full production layer composition including:
 * - All extraction services
 * - Rate-limited LLM
 * - OpenTelemetry tracing to Jaeger
 *
 * @since 2.0.0
 */
export const ProductionLayersWithTracing = Layer.mergeAll(
  ExtractionLayersLive,
  TracingLive
)

================
File: src/Runtime/RateLimitedLanguageModel.ts
================
/**
 * Runtime: Rate-Limited Language Model Layer
 *
 * Wraps LanguageModel.LanguageModel with rate limiting to prevent API quota exhaustion.
 * Uses Effect's built-in RateLimiter with token-bucket algorithm.
 *
 * Implements dual rate limiting:
 * - Per-second burst protection (max 2 concurrent starts)
 * - Per-minute sustained rate (max 20 RPM)
 *
 * This layer sits between the base LanguageModel provider and consuming services,
 * ensuring all LLM calls are automatically rate limited.
 *
 * @since 2.0.0
 * @module Runtime/RateLimitedLanguageModel
 */

import { LanguageModel } from "@effect/ai"
import { Clock, Effect, Layer, RateLimiter, Scope, Stream } from "effect"
import { pipe } from "effect/Function"
import { ConfigService } from "../Service/Config.js"
import { LlmAttributes } from "../Telemetry/LlmAttributes.js"

/**
 * Rate limit configurations per provider
 *
 * Uses very conservative values to avoid socket errors from API rate limiting.
 * Dual limits: per-second (burst) and per-minute (sustained).
 *
 * @internal
 */
const RATE_LIMITS: Record<string, {
  perSecond: number
  perMinute: number
}> = {
  // Anthropic: Very conservative - 2/sec burst, 20/min sustained
  anthropic: { perSecond: 2, perMinute: 20 },
  // OpenAI: Slightly higher limits
  openai: { perSecond: 3, perMinute: 30 },
  // Google: Similar to Anthropic
  google: { perSecond: 2, perMinute: 20 }
}

/**
 * Create a rate-limited LanguageModel layer
 *
 * Wraps the base LanguageModel with rate limiting based on provider configuration.
 * All LLM methods (generateObject, generateText, streamText) are wrapped.
 *
 * @example
 * ```typescript
 * // In ProductionRuntime
 * const layers = ExtractionLayersLive.pipe(
 *   Layer.provide(RateLimitedLanguageModelLayer),
 *   Layer.provide(makeLanguageModelLayer)
 * )
 * ```
 *
 * @since 2.0.0
 */
/**
 * Track LLM call statistics for observability
 */
let callCount = 0

export const RateLimitedLanguageModelLayer = Layer.scoped(
  LanguageModel.LanguageModel,
  Effect.gen(function*() {
    const config = yield* ConfigService
    const baseLlm = yield* LanguageModel.LanguageModel
    const scope = yield* Scope.Scope

    // Get rate limit config for the current provider
    const rateLimitConfig = RATE_LIMITS[config.llm.provider] ?? RATE_LIMITS.anthropic

    // Create dual rate limiters:
    // 1. Per-second burst limiter - prevents too many concurrent starts
    const perSecondLimiter = yield* RateLimiter.make({
      limit: rateLimitConfig.perSecond,
      interval: "1 seconds",
      algorithm: "fixed-window"
    }).pipe(Scope.extend(scope))

    // 2. Per-minute sustained limiter - respects API quota
    const perMinuteLimiter = yield* RateLimiter.make({
      limit: rateLimitConfig.perMinute,
      interval: "1 minutes",
      algorithm: "fixed-window"
    }).pipe(Scope.extend(scope))

    // Compose both rate limiters - request must pass both
    const rateLimiter = pipe(
      perSecondLimiter,
      (rl) => <A, E, R>(effect: Effect.Effect<A, E, R>) => rl(perMinuteLimiter(effect))
    )

    yield* Effect.logInfo("Dual rate limiter initialized", {
      provider: config.llm.provider,
      perSecond: rateLimitConfig.perSecond,
      perMinute: rateLimitConfig.perMinute
    })

    // Helper to wrap LLM calls with rate limiting and observability
    const withRateLimit = <A, E, R>(
      method: string,
      effect: Effect.Effect<A, E, R>
    ): Effect.Effect<A, E, R> =>
      Effect.gen(function*() {
        const callId = ++callCount
        const startTime = yield* Clock.currentTimeMillis

        yield* Effect.logDebug("LLM call queued", {
          provider: config.llm.provider,
          method,
          callId
        })

        // Rate limiter will block until a token is available
        const result = yield* rateLimiter(effect)

        const endTime = yield* Clock.currentTimeMillis
        const waitMs = Number(endTime - startTime)

        yield* Effect.all([
          Effect.logDebug("LLM call completed", {
            provider: config.llm.provider,
            method,
            callId,
            rateLimiterWaitMs: waitMs
          }),
          Effect.annotateCurrentSpan(LlmAttributes.RATE_LIMITER_WAIT_MS, waitMs),
          Effect.annotateCurrentSpan(LlmAttributes.LLM_CALL_ID, callId),
          Effect.annotateCurrentSpan(LlmAttributes.LLM_METHOD, method)
        ])

        return result
      }).pipe(
        Effect.withSpan(`llm.${method}`, {
          attributes: {
            [LlmAttributes.PROVIDER]: config.llm.provider,
            [LlmAttributes.MODEL]: config.llm.model
          }
        })
      )

    // Return wrapped LanguageModel with all methods rate-limited
    return LanguageModel.LanguageModel.of({
      generateObject: (opts) => withRateLimit("generateObject", baseLlm.generateObject(opts)),
      generateText: (opts) => withRateLimit("generateText", baseLlm.generateText(opts)),
      // streamText returns a Stream, so we rate-limit the stream creation
      streamText: (opts) =>
        Stream.unwrap(
          withRateLimit("streamText", Effect.succeed(baseLlm.streamText(opts)))
        )
    })
  })
)

================
File: src/Runtime/TestRuntime.ts
================
/**
 * Runtime: Test Runtime
 *
 * Layer composition for testing with mocks.
 * Uses test layers for EntityExtractor and RelationExtractor,
 * and provides a mock LanguageModel for LLM operations.
 *
 * @since 2.0.0
 * @module Runtime/TestRuntime
 */

import { LanguageModel } from "@effect/ai"
import { BunContext } from "@effect/platform-bun"
import { Effect, Layer, ManagedRuntime } from "effect"
import { ConfigService } from "../Service/Config.js"
import { EntityExtractor, RelationExtractor } from "../Service/Extraction.js"
import { NlpService } from "../Service/Nlp.js"
import { OntologyService } from "../Service/Ontology.js"
import { RdfBuilder } from "../Service/Rdf.js"

/**
 * Mock LanguageModel for testing
 *
 * Provides a stub implementation that returns empty responses.
 * Used by EntityExtractor and RelationExtractor test layers.
 *
 * @since 2.0.0
 */
const MockLanguageModel = Layer.succeed(
  LanguageModel.LanguageModel,
  {
    generate: () => Effect.succeed({ value: "", usage: { inputTokens: 0, outputTokens: 0 } }),
    stream: () => Effect.succeed({ value: "", usage: { inputTokens: 0, outputTokens: 0 } }),
    generateObject: () =>
      Effect.succeed({
        value: { entities: [], relations: [] },
        usage: { inputTokens: 0, outputTokens: 0 }
      })
  } as LanguageModel.LanguageModel
)

/**
 * Test Layers
 *
 * Uses test/mock implementations for deterministic testing:
 * - EntityExtractor.Test: Returns deterministic fake entities
 * - RelationExtractor.Test: Returns deterministic fake relations
 * - MockLanguageModel: Stub LLM that returns empty responses
 * - Other services use Default layers (can be mocked per test)
 *
 * @since 2.0.0
 */
export const TestLayers = Layer.mergeAll(
  ConfigService.Default,
  NlpService.Default,
  RdfBuilder.Default,
  OntologyService.Default,
  MockLanguageModel,
  EntityExtractor.Test,
  RelationExtractor.Test,
  BunContext.layer
)

/**
 * Test Runtime
 *
 * Managed runtime for testing with all test layers provided.
 *
 * @since 2.0.0
 */
export const TestRuntime = ManagedRuntime.make(TestLayers)

================
File: src/Schema/EntityFactory.ts
================
/**
 * Entity Schema Factory (Stage 1)
 *
 * Creates Effect Schemas for entity extraction in the two-stage ODKE pipeline.
 * Stage 1: Extract all named entities and map them to ontology classes.
 *
 * This schema ensures entity consistency by requiring unique IDs that will
 * be used in Stage 2 for relation extraction.
 *
 * @module Schema/EntityFactory
 * @since 2.0.0
 */

import { Array as A, Schema as S } from "effect"
import type { ClassDefinition, PropertyDefinition } from "../Domain/Model/Ontology.js"
import { buildCaseInsensitiveIriMap, normalizeIri } from "../Utils/Iri.js"
import { EmptyVocabularyError } from "./Errors.js"

// Re-export for convenience
export { EmptyVocabularyError }

/**
 * Helper: Creates a Union schema from a non-empty array of string literals
 *
 * @internal
 * @deprecated Use caseInsensitiveIriSchema for IRI validation to handle casing mismatches
 */
const _unionFromStringArray = <T extends string>(
  values: ReadonlyArray<T>,
  errorType: "classes" | "properties"
): S.Schema<T> => {
  if (A.isEmptyReadonlyArray(values)) {
    throw new EmptyVocabularyError({
      message: `Cannot create schema with zero ${errorType} IRIs`,
      type: errorType
    })
  }

  // Create individual Literal schemas for each IRI
  const literals = values.map((iri) => S.Literal(iri)) as [S.Literal<[T]>, ...Array<S.Literal<[T]>>]

  // Union them - TypeScript will infer the correct type
  return S.Union(...literals)
}

// Silence unused variable warning
void _unionFromStringArray

/**
 * Helper: Creates a case-insensitive IRI schema
 *
 * Accepts any string input, normalizes casing to match canonical IRIs,
 * then validates that the normalized value is in the allowed list.
 * This handles the mismatch between ontology IRI local names (PascalCase)
 * and rdfs:label values (camelCase) that LLMs may use interchangeably.
 *
 * @internal
 */
const caseInsensitiveIriSchema = (
  values: ReadonlyArray<string>,
  errorType: "classes" | "properties"
): S.Schema<string> => {
  if (A.isEmptyReadonlyArray(values)) {
    throw new EmptyVocabularyError({
      message: `Cannot create schema with zero ${errorType} IRIs`,
      type: errorType
    })
  }

  // Build case-insensitive lookup map
  const iriMap = buildCaseInsensitiveIriMap(values)
  const validIris = new Set(values)

  // Transform schema: normalize casing on decode, pass through on encode
  return S.transform(
    S.String, // Input: any string
    S.String, // Output: normalized string
    {
      decode: (input) => normalizeIri(input, iriMap),
      encode: (canonical) => canonical
    }
  ).pipe(
    // After normalization, filter to ensure it's a valid IRI
    S.filter(
      (iri) => validIris.has(iri),
      {
        message: () =>
          `IRI not in allowed ${errorType} list (checked case-insensitively). Valid options: ${
            values.slice(0, 5).join(", ")
          }${values.length > 5 ? "..." : ""}`
      }
    )
  )
}

/**
 * Creates Effect Schema for entity extraction (Stage 1)
 *
 * This is the first stage of the two-stage ODKE pipeline:
 * 1. Extract all named entities from text
 * 2. Map them to ontology classes
 * 3. Assign unique IDs for Stage 2 linking
 *
 * @param classes - Array of ClassDefinition objects from ontology context
 * @param datatypeProperties - Optional array of datatype properties to constrain attribute keys
 * @returns Entity schema for LLM structured output
 *
 * @example
 * ```typescript
 * const schema = makeEntitySchema([
 *   new ClassDefinition({ id: "http://schema.org/Person", label: "Person", ... }),
 *   new ClassDefinition({ id: "http://schema.org/Organization", label: "Organization", ... })
 * ], [
 *   new PropertyDefinition({ id: "http://schema.org/age", rangeType: "datatype", ... })
 * ])
 *
 * // Valid output:
 * {
 *   entities: [
 *     {
 *       mention: "Cristiano Ronaldo",
 *       id: "cristiano_ronaldo",
 *       types: ["http://schema.org/Person"],
 *       attributes: { "http://schema.org/age": 39 }
 *     }
 *   ]
 * }
 * ```
 *
 * @category constructors
 * @since 2.0.0
 */
export const makeEntitySchema = (
  classes: ReadonlyArray<ClassDefinition>,
  datatypeProperties?: ReadonlyArray<PropertyDefinition>
) => {
  // Extract class IRIs from ClassDefinition objects
  const classIris = classes.map((c) => c.id)

  // Create case-insensitive class IRI schema for types array elements
  // This handles the mismatch between ontology IRI casing and LLM output
  const ClassUnion = caseInsensitiveIriSchema(classIris, "classes")

  // Attributes schema: permissive with any string keys
  // Invalid keys will be filtered post-extraction to avoid schema validation failures
  // when LLM produces semantically valid but structurally unexpected property keys
  const AttributesSchema = S.Record({
    key: S.String.annotations({
      description: "Property IRI - preferably from the ALLOWED DATATYPE PROPERTIES list"
    }),
    value: S.Union(S.String, S.Number, S.Boolean)
  }).annotations({
    description: "Entity attributes as property-value pairs (literal values only)"
  })

  // Note: datatypeProperties parameter is kept for API compatibility and for prompt building
  // The actual filtering happens in Service/Extraction.ts after successful extraction
  void datatypeProperties

  // Single entity schema matching Entity domain model
  const EntitySchema = S.Struct({
    id: S.String.pipe(
      S.pattern(/^[a-z][a-z0-9_]*$/),
      S.annotations({
        description:
          "Snake_case unique identifier for this entity - use this exact ID when referring to this entity in relations (e.g., 'cristiano_ronaldo')"
      })
    ),
    mention: S.String.annotations({
      description:
        "Human-readable entity name found in text - use complete, canonical form (e.g., 'Cristiano Ronaldo' not 'Ronaldo')"
    }),
    types: S.Array(ClassUnion).pipe(
      S.minItems(1),
      S.annotations({
        description: "Array of ontology class URIs this entity instantiates (at least one required)"
      })
    ),
    attributes: S.optional(AttributesSchema).annotations({
      description: "Entity attributes as property-value pairs - use IRIs from ALLOWED DATATYPE PROPERTIES when possible"
    })
  }).annotations({
    description: "A single entity with its types and optional attributes"
  })

  // Full entity graph schema
  return S.Struct({
    entities: S.Array(EntitySchema).annotations({
      description: "Array of entities - extract all named entities from the text and assign unique IDs"
    })
  }).annotations({
    identifier: "EntityGraph",
    title: "Entity Extraction (Stage 1)",
    description: `Extract all named entities from the text and map them to ontology classes.

CRITICAL RULES:
- Use complete, human-readable names for mentions (e.g., "Stanford University" not "Stanford")
- Assign unique snake_case IDs (e.g., "stanford_university")
- Reuse the exact same ID when referring to the same entity
- Map each entity to at least one ontology class from the allowed list
- Extract as many entities as possible`
  })
}

/**
 * Type helpers
 *
 * @category type utilities
 * @since 2.0.0
 */
export type EntityGraphSchema = ReturnType<typeof makeEntitySchema>

export type EntityGraphType = S.Schema.Type<EntityGraphSchema>

================
File: src/Schema/Errors.ts
================
/**
 * Schema Factory Errors
 *
 * Error types used by schema factories.
 *
 * @module Schema/Errors
 * @since 2.0.0
 */

import { Schema } from "effect"

/**
 * Error thrown when attempting to create a schema with empty vocabularies
 *
 * @category errors
 * @since 2.0.0
 */
export class EmptyVocabularyError extends Schema.TaggedError<EmptyVocabularyError>()(
  "EmptyVocabularyError",
  {
    message: Schema.String.annotations({
      title: "Error Message",
      description: "Human-readable error description"
    }),

    type: Schema.Literal("classes", "properties").annotations({
      title: "Vocabulary Type",
      description: "Type of vocabulary that was empty"
    })
  }
) {}

================
File: src/Schema/index.ts
================
/**
 * Schema Module
 *
 * Dynamic Effect Schema generation from ontology vocabularies with JSON Schema export
 * for LLM tool calling APIs.
 *
 * @module Schema
 * @since 2.0.0
 */

export { type EntityGraphSchema, type EntityGraphType, makeEntitySchema } from "./EntityFactory.js"
export { EmptyVocabularyError } from "./Errors.js"
export { makeRelationSchema, type RelationGraphSchema, type RelationGraphType } from "./RelationFactory.js"

================
File: src/Schema/MentionFactory.ts
================
/**
 * Mention Schema Factory (Pre-Stage 1)
 *
 * Creates Effect Schemas for mention extraction before entity typing.
 * This enables entity-level semantic search for better class assignment.
 *
 * @module Schema/MentionFactory
 * @since 2.0.0
 */

import { Schema as S } from "effect"

/**
 * Schema for a single entity mention (without types)
 *
 * @since 2.0.0
 */
const MentionSchema = S.Struct({
  id: S.String.pipe(
    S.pattern(/^[a-z][a-z0-9_]*$/),
    S.annotations({
      description: "Snake_case unique identifier for this entity (e.g., 'cristiano_ronaldo')"
    })
  ),
  mention: S.String.annotations({
    description:
      "Human-readable entity name found in text - use complete, canonical form (e.g., 'Cristiano Ronaldo' not 'Ronaldo')"
  }),
  context: S.optional(S.String).annotations({
    description: "Brief context about this entity from the text (helps with type classification)"
  })
}).annotations({
  description: "A single entity mention extracted from text"
})

/**
 * Schema for mention extraction (entity detection without typing)
 *
 * @since 2.0.0
 */
export const MentionGraphSchema = S.Struct({
  mentions: S.Array(MentionSchema).annotations({
    description: "Array of entity mentions - extract all named entities from the text"
  })
}).annotations({
  identifier: "MentionGraph",
  title: "Entity Mention Extraction",
  description: `Extract all named entity mentions from the text WITHOUT assigning types.

CRITICAL RULES:
- Use complete, human-readable names for mentions (e.g., "Stanford University" not "Stanford")
- Assign unique snake_case IDs (e.g., "stanford_university")
- Reuse the exact same ID when referring to the same entity
- Include brief context about each entity to help with classification
- Extract as many entity mentions as possible`
})

/**
 * Type helpers
 *
 * @category type utilities
 * @since 2.0.0
 */
export type MentionGraphType = S.Schema.Type<typeof MentionGraphSchema>

export interface Mention {
  readonly id: string
  readonly mention: string
  readonly context?: string
}

================
File: src/Schema/RelationFactory.ts
================
/**
 * Relation Schema Factory (Stage 2)
 *
 * Creates Effect Schemas for relation extraction in the two-stage ODKE pipeline.
 * Stage 2: Extract relationships between entities identified in Stage 1.
 *
 * This schema constrains subject and object references to entity IDs from Stage 1,
 * eliminating identity hallucination and ensuring entity consistency.
 *
 * @module Schema/RelationFactory
 * @since 2.0.0
 */

import { Array as A, Schema as S } from "effect"
import type { PropertyDefinition } from "../Domain/Model/Ontology.js"
import { buildCaseInsensitiveIriMap, normalizeIri } from "../Utils/Iri.js"
import { EmptyVocabularyError } from "./Errors.js"

// Re-export for convenience
export { EmptyVocabularyError }

/**
 * Helper: Creates a Union schema from a non-empty array of string literals
 *
 * @internal
 */
const unionFromStringArray = <T extends string>(
  values: ReadonlyArray<T>,
  errorType: "classes" | "properties"
): S.Schema<T> => {
  if (A.isEmptyReadonlyArray(values)) {
    throw new EmptyVocabularyError({
      message: `Cannot create schema with zero ${errorType} IRIs`,
      type: errorType
    })
  }

  // Create individual Literal schemas for each IRI
  const literals = values.map((iri) => S.Literal(iri)) as [S.Literal<[T]>, ...Array<S.Literal<[T]>>]

  // Union them - TypeScript will infer the correct type
  return S.Union(...literals)
}

/**
 * Helper: Creates a case-insensitive IRI schema
 *
 * Accepts any string input, normalizes casing to match canonical IRIs,
 * then validates that the normalized value is in the allowed list.
 * This handles the mismatch between ontology IRI local names (PascalCase)
 * and rdfs:label values (camelCase) that LLMs may use interchangeably.
 *
 * @internal
 */
const caseInsensitiveIriSchema = (
  values: ReadonlyArray<string>,
  errorType: "classes" | "properties"
): S.Schema<string> => {
  if (A.isEmptyReadonlyArray(values)) {
    throw new EmptyVocabularyError({
      message: `Cannot create schema with zero ${errorType} IRIs`,
      type: errorType
    })
  }

  // Build case-insensitive lookup map
  const iriMap = buildCaseInsensitiveIriMap(values)
  const validIris = new Set(values)

  // Transform schema: normalize casing on decode, pass through on encode
  return S.transform(
    S.String, // Input: any string
    S.String, // Output: normalized string
    {
      decode: (input) => normalizeIri(input, iriMap),
      encode: (canonical) => canonical
    }
  ).pipe(
    // After normalization, filter to ensure it's a valid IRI
    S.filter(
      (iri) => validIris.has(iri),
      {
        message: () =>
          `IRI not in allowed ${errorType} list (checked case-insensitively). Valid options: ${
            values.slice(0, 5).join(", ")
          }${values.length > 5 ? "..." : ""}`
      }
    )
  )
}

/**
 * Creates Effect Schema for relation extraction (Stage 2)
 *
 * This is the second stage of the two-stage ODKE pipeline:
 * 1. Use entities identified in Stage 1
 * 2. Extract relationships between them
 * 3. Constrain subject/object to Stage 1 entity IDs
 *
 * @param validEntityIds - Entity IDs from Stage 1 (constrains subjectId/object)
 * @param properties - Array of PropertyDefinition objects from ontology
 * @returns Relation schema for LLM structured output
 *
 * @example
 * ```typescript
 * const schema = makeRelationSchema(
 *   ["cristiano_ronaldo", "al_nassr"], // From Stage 1
 *   [new PropertyDefinition({ id: "http://schema.org/memberOf", ... })]
 * )
 *
 * // Valid output:
 * {
 *   relations: [
 *     {
 *       subjectId: "cristiano_ronaldo",
 *       predicate: "http://schema.org/memberOf",
 *       object: "al_nassr"
 *     }
 *   ]
 * }
 * ```
 *
 * @category constructors
 * @since 2.0.0
 */
export const makeRelationSchema = (
  validEntityIds: ReadonlyArray<string>,
  properties: ReadonlyArray<PropertyDefinition>
) => {
  if (A.isEmptyReadonlyArray(validEntityIds)) {
    throw new EmptyVocabularyError({
      message: "Cannot create relation schema with zero entity IDs from Stage 1",
      type: "classes"
    })
  }

  // Create entity ID union - constrains subjectId and object (when entity reference)
  const EntityIdUnion = unionFromStringArray(validEntityIds, "classes")

  // Group properties by rangeType for predicate-discriminated schemas
  const objectProperties = properties.filter((p) => p.rangeType === "object")
  const datatypeProperties = properties.filter((p) => p.rangeType === "datatype")

  // Create case-insensitive property IRI schemas for each type
  // This handles the mismatch between ontology IRI casing and LLM output
  const ObjectPropertyUnion = objectProperties.length > 0
    ? caseInsensitiveIriSchema(objectProperties.map((p) => p.id), "properties")
    : null
  const DatatypePropertyUnion = datatypeProperties.length > 0
    ? caseInsensitiveIriSchema(datatypeProperties.map((p) => p.id), "properties")
    : null

  // Create relation schemas discriminated by rangeType
  const relationSchemas: Array<S.Schema<any>> = []

  // Object property relation schema: object must be entity ID only
  if (ObjectPropertyUnion) {
    relationSchemas.push(
      S.Struct({
        subjectId: EntityIdUnion.annotations({
          description: "Subject entity ID - MUST be one of the entity IDs identified in Stage 1"
        }),
        predicate: ObjectPropertyUnion.annotations({
          description: "Object property IRI - links entities (object must be entity ID)"
        }),
        object: EntityIdUnion.annotations({
          description: "Object entity ID from Stage 1 - MUST be one of the identified entities"
        })
      }).annotations({
        description: "Object property relation - links two entities"
      })
    )
  }

  // Datatype property relation schema: object must be literal only (NOT entity ID)
  if (DatatypePropertyUnion) {
    relationSchemas.push(
      S.Struct({
        subjectId: EntityIdUnion.annotations({
          description: "Subject entity ID - MUST be one of the entity IDs identified in Stage 1"
        }),
        predicate: DatatypePropertyUnion.annotations({
          description: "Datatype property IRI - has literal value (object must be string/number/boolean, NOT entity ID)"
        }),
        object: S.Union(
          S.String.annotations({
            description: "Literal string value (for datatype properties)"
          }),
          S.Number.annotations({
            description: "Literal number value (for numeric datatype properties)"
          }),
          S.Boolean.annotations({
            description: "Literal boolean value (for boolean datatype properties)"
          })
        ).annotations({
          description: "Literal value - string, number, or boolean (NOT entity ID)"
        })
      }).annotations({
        description: "Datatype property relation - has literal value"
      })
    )
  }

  // Create union of relation schemas (discriminated by predicate rangeType)
  // If only one type exists, use that schema directly
  const RelationSchema = relationSchemas.length === 1
    ? relationSchemas[0]!
    : relationSchemas.length === 2
    ? S.Union(relationSchemas[0]!, relationSchemas[1]!)
    : (() => {
      throw new EmptyVocabularyError({
        message: "Cannot create relation schema with zero properties",
        type: "properties"
      })
    })()

  // Full relation graph schema
  return S.Struct({
    relations: S.Array(RelationSchema).annotations({
      description: "Array of relations - extract relationships between the entities identified in Stage 1"
    })
  }).annotations({
    identifier: "RelationGraph",
    title: "Relation Extraction (Stage 2)",
    description: `Extract relationships between entities identified in Stage 1.

CRITICAL RULES:
- Subject MUST be one of the entity IDs from Stage 1: ${validEntityIds.slice(0, 5).join(", ")}${
      validEntityIds.length > 5 ? "..." : ""
    }
- Object can be either:
  - An entity ID from Stage 1 (for relationships between entities)
  - A literal string/number/boolean (for datatype properties)
- Use the exact entity IDs from Stage 1 - do not create new IDs
- Predicate MUST be one of the allowed property IRIs
- Extract as many relations as possible`
  })
}

/**
 * Type helpers
 *
 * @category type utilities
 * @since 2.0.0
 */
export type RelationGraphSchema = ReturnType<typeof makeRelationSchema>

export type RelationGraphType = S.Schema.Type<RelationGraphSchema>

================
File: src/Service/Config.ts
================
/**
 * Service: Configuration Service
 *
 * Centralized configuration for LLM, RDF, Ontology, and Runtime settings.
 * Avoids ad-hoc constants scattered throughout codebase.
 *
 * @since 2.0.0
 * @module Service/Config
 */

import { Effect } from "effect"

/**
 * Configuration interface
 *
 * All settings for the application in one place.
 * Override via Layer.succeed for custom configs.
 *
 * @since 2.0.0
 * @category Config
 */
export interface Config {
  /**
   * LLM provider settings
   */
  readonly llm: {
    readonly provider: "anthropic" | "openai" | "google"
    readonly model: string
    readonly timeoutMs: number
    readonly maxTokens: number
    readonly temperature: number
    readonly anthropicApiKey: string
    readonly openaiApiKey: string
    readonly googleApiKey: string
  }

  /**
   * RDF serialization settings
   */
  readonly rdf: {
    readonly baseNamespace: string
    readonly prefixes: Record<string, string>
    readonly outputFormat: "Turtle" | "N-Triples" | "JSON-LD"
  }

  /**
   * Ontology loading settings
   */
  readonly ontology: {
    readonly path: string
    readonly cacheTtlSeconds: number
  }

  /**
   * Runtime behavior settings
   */
  readonly runtime: {
    readonly extractionConcurrency: number
    readonly retryMaxAttempts: number
    readonly retryInitialDelayMs: number
    readonly retryMaxDelayMs: number
  }
}

/**
 * Default configuration values
 *
 * Production-ready defaults for all settings.
 *
 * @since 2.0.0
 */
export const DEFAULT_CONFIG: Config = {
  llm: {
    provider: "anthropic",
    model: "claude-haiku-4-5",
    timeoutMs: 60_000,
    maxTokens: 4096,
    temperature: 0.1,
    anthropicApiKey: "",
    openaiApiKey: "",
    googleApiKey: ""
  },
  rdf: {
    baseNamespace: "http://example.org/kg/",
    prefixes: {
      "": "http://example.org/kg/",
      rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
      rdfs: "http://www.w3.org/2000/01/rdf-schema#",
      owl: "http://www.w3.org/2002/07/owl#",
      xsd: "http://www.w3.org/2001/XMLSchema#",
      schema: "http://schema.org/"
    },
    outputFormat: "Turtle"
  },
  ontology: {
    path: "/Users/pooks/Dev/effect-ontology/ontologies/football/ontology_skos.ttl",
    cacheTtlSeconds: 3600
  },
  runtime: {
    extractionConcurrency: 2, // Reduced from 4 to avoid API rate limits
    retryMaxAttempts: 8, // Increased for transient network/rate limit errors
    retryInitialDelayMs: 3000, // Base delay for exponential backoff
    retryMaxDelayMs: 30_000 // Cap max delay at 30s to avoid excessively long waits
  }
}

/**
 * ConfigService - Application configuration provider
 *
 * Provides typed access to all configuration settings.
 * Use accessors for clean API: `yield* ConfigService.llm`
 *
 * @example
 * ```typescript
 * // In a service
 * const config = yield* ConfigService
 * const timeout = config.llm.timeoutMs
 *
 * // With accessor
 * const llmConfig = yield* ConfigService.llm
 * ```
 *
 * @example
 * ```typescript
 * // Custom config override
 * const CustomConfig = Layer.succeed(ConfigService, {
 *   ...DEFAULT_CONFIG,
 *   llm: { ...DEFAULT_CONFIG.llm, model: "gpt-4" }
 * })
 *
 * const runtime = ManagedRuntime.make(
 *   ProductionLayers.pipe(Layer.provide(CustomConfig))
 * )
 * ```
 *
 * @since 2.0.0
 * @category Services
 */
export class ConfigService extends Effect.Service<ConfigService>()(
  "ConfigService",
  {
    succeed: DEFAULT_CONFIG,
    accessors: true
  }
) {}

================
File: src/Service/Extraction.ts
================
/**
 * Service: Extraction Services
 *
 * EntityExtractor and RelationExtractor service contracts.
 * Implements two-stage extraction using LLM with structured output.
 *
 * @since 2.0.0
 * @module Service/Extraction
 */

import { LanguageModel } from "@effect/ai"
import { Cause, Chunk, Duration, Effect, JSONSchema, Layer, Ref, Schedule, Stream } from "effect"
import {
  EntityExtractionFailed,
  MentionExtractionFailed,
  RelationExtractionFailed
} from "../Domain/Error/Extraction.js"
import { Entity, Relation } from "../Domain/Model/Entity.js"
import type { ClassDefinition, PropertyDefinition } from "../Domain/Model/Ontology.js"
import { generateEntityPrompt, generateMentionPrompt, generateRelationPrompt } from "../Prompt/index.js"
import { makeEntitySchema } from "../Schema/EntityFactory.js"
import { type Mention, MentionGraphSchema } from "../Schema/MentionFactory.js"
import { makeRelationSchema } from "../Schema/RelationFactory.js"
import {
  annotateError,
  annotateExtraction,
  annotateLlmCall,
  annotateRetry,
  LlmAttributes
} from "../Telemetry/LlmAttributes.js"
import { buildCaseInsensitiveIriMap, normalizeIri } from "../Utils/Iri.js"
import { ConfigService } from "./Config.js"
import { generateObjectWithFeedback } from "./GenerateWithFeedback.js"
import { makeRetryPolicy } from "./Retry.js"

/**
 * Generate deterministic snake_case ID from mention
 *
 * @internal
 */
const generateEntityId = (mention: string): string => {
  return mention
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // Remove special chars
    .replace(/\s+/g, "_") // Spaces to underscores
    .replace(/_+/g, "_") // Multiple underscores to single
    .replace(/^_|_$/g, "") // Trim leading/trailing underscores
    .replace(/^[0-9]/, "e$&") // Ensure starts with letter
}

/**
 * EntityExtractor - Stage 1 extraction service
 *
 * Extracts entities from text using LLM with structured output.
 *
 * @since 2.0.0
 * @category Services
 */
export class EntityExtractor extends Effect.Service<EntityExtractor>()("EntityExtractor", {
  effect: Effect.gen(function*() {
    const config = yield* ConfigService

    const llm = yield* LanguageModel.LanguageModel

    // Note: generateObjectWithFeedback handles its own retry logic internally
    // keeping this for potential future use in other operations
    const _retryPolicy = makeRetryPolicy({
      initialDelayMs: config.runtime.retryInitialDelayMs,
      maxDelayMs: config.runtime.retryMaxDelayMs,
      maxAttempts: config.runtime.retryMaxAttempts,
      serviceName: "EntityExtractor"
    })
    void _retryPolicy

    return {
      /**
       * Extract entities from text given candidate classes
       *
       * @param text - Source text to extract from
       * @param candidates - Ontology classes to extract instances of
       * @returns Chunk of extracted entities
       */
      extract: (
        text: string,
        candidates: ReadonlyArray<ClassDefinition>,
        datatypeProperties?: ReadonlyArray<PropertyDefinition>
      ) =>
        Effect.gen(function*() {
          // Validate candidates
          if (candidates.length === 0) {
            return yield* Effect.fail(
              new EntityExtractionFailed({
                message: "Cannot extract entities with zero candidate classes",
                text
              })
            )
          }

          const datatypeProps = datatypeProperties ?? []

          // Build prompt using unified Prompt module (ensures schema-prompt alignment)
          const prompt = generateEntityPrompt(text, candidates, datatypeProps)

          // Create schema from candidate classes and datatype properties
          const schema = makeEntitySchema(candidates, datatypeProps)

          // Log extraction stage details
          yield* Effect.logDebug("Entity extraction stage", {
            stage: "entity-extraction",
            candidateClasses: candidates.length,
            candidateClassIris: candidates.map((c) => c.id).slice(0, 10),
            textLength: text.length,
            textPreview: text.slice(0, 200)
          })

          // Log prompt (truncated for readability)
          yield* Effect.logDebug("Entity extraction prompt", {
            stage: "entity-extraction",
            promptLength: prompt.length,
            prompt: prompt.slice(0, 1000) // First 1000 chars
          })

          // Log schema summary
          const jsonSchema = JSONSchema.make(schema)
          const schemaJson = JSON.stringify(jsonSchema).slice(0, 2000)
          yield* Effect.logDebug("Entity extraction schema", {
            stage: "entity-extraction",
            schemaIdentifier: jsonSchema.$defs?.EntityGraph?.title || "EntityGraph",
            schemaDescription: jsonSchema.$defs?.EntityGraph?.description?.slice(0, 200),
            allowedClassCount: candidates.length
          })

          // Call LLM for structured output using generateObjectWithFeedback
          // This handles retries with schema validation feedback automatically
          const response = yield* generateObjectWithFeedback(llm, {
            prompt,
            schema,
            objectName: "EntityGraph",
            maxAttempts: config.runtime.retryMaxAttempts,
            serviceName: "EntityExtractor",
            timeoutMs: config.llm.timeoutMs
          }).pipe(
            Effect.tap((response) =>
              Effect.all([
                Effect.logInfo("Entity extraction LLM response", {
                  stage: "entity-extraction",
                  entityCount: response.value.entities.length,
                  inputTokens: response.usage.inputTokens,
                  outputTokens: response.usage.outputTokens
                }),
                annotateLlmCall({
                  model: config.llm.model,
                  provider: config.llm.provider,
                  promptLength: prompt.length,
                  inputTokens: response.usage.inputTokens,
                  outputTokens: response.usage.outputTokens,
                  promptText: prompt.slice(0, 2000),
                  schemaJson
                }),
                annotateExtraction({
                  entityCount: response.value.entities.length,
                  candidateClassCount: candidates.length
                })
              ])
            ),
            Effect.withSpan("entity-extraction-llm", {
              attributes: {
                [LlmAttributes.PROMPT_LENGTH]: prompt.length,
                [LlmAttributes.CANDIDATE_CLASS_COUNT]: candidates.length,
                [LlmAttributes.PROMPT_TEXT]: prompt.slice(0, 2000),
                [LlmAttributes.REQUEST_SCHEMA]: schemaJson
              }
            }),
            Effect.mapError((error) =>
              new EntityExtractionFailed({
                message: `LLM entity extraction failed: ${error instanceof Error ? error.message : String(error)}`,
                cause: error,
                text
              })
            )
          )

          // Build set of valid property IRIs for post-extraction filtering
          // Schema is permissive (accepts any string keys), we filter invalid keys here
          const validPropertyIris = new Set(
            (datatypeProps ?? []).map((p) => p.id)
          )

          // Convert to Entity domain models
          // Schema validation already enforced all constraints (types in candidate classes, ID format)
          // If generateObject succeeded, all entities are valid
          // Only perform business logic transformations (ID generation, attribute filtering)
          let filteredAttributeCount = 0
          const entities = yield* Stream.fromIterable(response.value.entities)
            .pipe(
              Stream.map((entityData) => {
                // Generate deterministic ID if not provided or invalid (business logic, not validation)
                let entityId = entityData.id
                if (!entityId || !/^[a-z][a-z0-9_]*$/.test(entityId)) {
                  entityId = generateEntityId(entityData.mention)
                }

                // Convert attributes to proper format and filter invalid keys
                // Only keep attributes with keys that are valid ontology property IRIs
                const attributes: Record<string, string | number | boolean> = {}
                if (entityData.attributes) {
                  for (const [key, value] of Object.entries(entityData.attributes)) {
                    // Filter: only keep if validPropertyIris is empty (no constraints) or key is valid
                    if (validPropertyIris.size === 0 || validPropertyIris.has(key)) {
                      if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
                        attributes[key] = value
                      }
                    } else {
                      // Track filtered attributes for logging
                      filteredAttributeCount++
                    }
                  }
                }

                // Create Entity domain model - types are already validated by schema
                return new Entity({
                  id: entityId,
                  mention: entityData.mention,
                  types: entityData.types, // Schema ensures these are in candidate classes
                  attributes
                })
              }),
              Stream.runCollect
            )

          // Log if any attributes were filtered
          if (filteredAttributeCount > 0) {
            yield* Effect.logDebug("Filtered invalid attribute keys", {
              stage: "entity-extraction",
              filteredAttributeCount,
              validPropertyCount: validPropertyIris.size
            })
          }

          // Log extracted entities summary
          const entityArray = Chunk.toReadonlyArray(entities)
          yield* Effect.logInfo("Entity extraction complete", {
            stage: "entity-extraction",
            extractedCount: entityArray.length,
            entityIds: entityArray.map((e) => e.id).slice(0, 10),
            entityMentions: entityArray.map((e) => e.mention).slice(0, 5)
          })

          return Chunk.fromIterable(entities)
        })
    }
  }),
  dependencies: [ConfigService.Default],
  accessors: true
}) {
  /**
   * Test layer with deterministic fake entities
   *
   * @since 2.0.0
   */
  static Test = Layer.effect(
    EntityExtractor,
    Effect.succeed({
      _tag: "EntityExtractor" as const,
      extract: (
        _text: string,
        candidates: ReadonlyArray<ClassDefinition>,
        _datatypeProperties?: ReadonlyArray<PropertyDefinition>
      ): Effect.Effect<Chunk.Chunk<Entity>, EntityExtractionFailed, LanguageModel.LanguageModel> =>
        Effect.succeed(
          Chunk.fromIterable([
            new Entity({
              id: "test_entity",
              mention: "Test Entity",
              types: candidates.length > 0 ? [candidates[0].id] : [],
              attributes: {}
            })
          ])
        )
    } as EntityExtractor)
  )
}

/**
 * MentionExtractor - Pre-Stage 1 mention detection
 *
 * Extracts entity mentions from text without type assignment.
 * This enables entity-level semantic search for better class retrieval.
 *
 * @since 2.0.0
 * @category Services
 */
export class MentionExtractor extends Effect.Service<MentionExtractor>()("MentionExtractor", {
  effect: Effect.gen(function*() {
    const config = yield* ConfigService

    const llm = yield* LanguageModel.LanguageModel

    // Retry policy for LLM calls with logging and max delay cap
    const retryPolicy = makeRetryPolicy({
      initialDelayMs: config.runtime.retryInitialDelayMs,
      maxDelayMs: config.runtime.retryMaxDelayMs,
      maxAttempts: config.runtime.retryMaxAttempts,
      serviceName: "MentionExtractor"
    })

    return {
      /**
       * Extract entity mentions from text (without types)
       *
       * @param text - Source text to extract from
       * @returns Chunk of extracted mentions
       */
      extract: (text: string) =>
        Effect.gen(function*() {
          // Build prompt using unified Prompt module (ensures schema-prompt alignment)
          const prompt = generateMentionPrompt(text)

          yield* Effect.logDebug("Mention extraction stage", {
            stage: "mention-extraction",
            textLength: text.length,
            textPreview: text.slice(0, 200)
          })

          // Track retry count for observability
          const retryCount = yield* Ref.make(0)

          const response = yield* llm.generateObject({
            prompt,
            schema: MentionGraphSchema,
            objectName: "MentionGraph"
          }).pipe(
            Effect.timeout(Duration.millis(config.llm.timeoutMs)),
            Effect.retry(
              retryPolicy.pipe(
                Schedule.tapInput(() => Ref.update(retryCount, (n) => n + 1))
              )
            ),
            Effect.tapErrorCause((cause) =>
              Effect.all([
                Effect.logError("Mention extraction LLM call failed, will retry", {
                  stage: "mention-extraction",
                  promptLength: prompt.length,
                  textPreview: text.slice(0, 500),
                  cause: Cause.pretty(cause)
                }),
                annotateError({
                  errorType: Cause.isFailType(cause)
                    ? (cause.error as Error).constructor?.name ?? "UnknownError"
                    : "UnknownCause",
                  errorMessage: Cause.pretty(cause).slice(0, 500)
                })
              ])
            ),
            Effect.tap((response) =>
              Effect.gen(function*() {
                const retries = yield* Ref.get(retryCount)
                yield* Effect.all([
                  Effect.logInfo("Mention extraction LLM response", {
                    stage: "mention-extraction",
                    mentionCount: response.value.mentions.length,
                    inputTokens: response.usage.inputTokens,
                    outputTokens: response.usage.outputTokens,
                    retryCount: retries
                  }),
                  annotateLlmCall({
                    model: config.llm.model,
                    provider: config.llm.provider,
                    promptLength: prompt.length,
                    inputTokens: response.usage.inputTokens,
                    outputTokens: response.usage.outputTokens,
                    promptText: prompt.slice(0, 2000)
                  }),
                  annotateExtraction({
                    mentionCount: response.value.mentions.length
                  }),
                  annotateRetry({
                    retryCount: retries,
                    maxAttempts: config.runtime.retryMaxAttempts
                  })
                ])
              })
            ),
            Effect.withSpan("mention-extraction-llm", {
              attributes: {
                [LlmAttributes.PROMPT_LENGTH]: prompt.length,
                [LlmAttributes.CHUNK_TEXT_LENGTH]: text.length,
                [LlmAttributes.PROMPT_TEXT]: prompt.slice(0, 2000)
              }
            }),
            Effect.mapError((error) =>
              new MentionExtractionFailed({
                message: `LLM mention extraction failed: ${error instanceof Error ? error.message : String(error)}`,
                cause: error,
                text
              })
            )
          )

          // Convert to Mention objects
          const mentions = response.value.mentions.map((m): Mention => ({
            id: m.id && /^[a-z][a-z0-9_]*$/.test(m.id)
              ? m.id
              : generateEntityId(m.mention),
            mention: m.mention,
            context: m.context
          }))

          yield* Effect.logInfo("Mention extraction complete", {
            stage: "mention-extraction",
            extractedCount: mentions.length,
            mentionIds: mentions.map((m) => m.id).slice(0, 10)
          })

          return Chunk.fromIterable(mentions)
        })
    }
  }),
  dependencies: [ConfigService.Default],
  accessors: true
}) {
  /**
   * Test layer with deterministic fake mentions
   *
   * @since 2.0.0
   */
  static Test = Layer.effect(
    MentionExtractor,
    Effect.succeed({
      _tag: "MentionExtractor" as const,
      extract: (
        _text: string
      ): Effect.Effect<Chunk.Chunk<Mention>, MentionExtractionFailed, LanguageModel.LanguageModel> =>
        Effect.succeed(
          Chunk.fromIterable([
            { id: "test_entity", mention: "Test Entity", context: "A test entity" }
          ])
        )
    } as MentionExtractor)
  )
}

/**
 * RelationExtractor - Stage 2 extraction service
 *
 * Extracts relations between entities using LLM with structured output.
 *
 * @since 2.0.0
 * @category Services
 */
export class RelationExtractor extends Effect.Service<RelationExtractor>()("RelationExtractor", {
  effect: Effect.gen(function*() {
    const config = yield* ConfigService

    const llm = yield* LanguageModel.LanguageModel

    // Retry policy for LLM calls with logging and max delay cap
    const retryPolicy = makeRetryPolicy({
      initialDelayMs: config.runtime.retryInitialDelayMs,
      maxDelayMs: config.runtime.retryMaxDelayMs,
      maxAttempts: config.runtime.retryMaxAttempts,
      serviceName: "RelationExtractor"
    })

    return {
      /**
       * Extract relations from text given entities and allowed properties
       *
       * @param text - Source text to extract from
       * @param entities - Previously extracted entities
       * @param properties - Ontology properties to use for relations
       * @returns Chunk of extracted relations
       */
      extract: (
        text: string,
        entities: Chunk.Chunk<Entity>,
        properties: ReadonlyArray<PropertyDefinition>
      ) =>
        Effect.gen(function*() {
          // Short-circuit if insufficient entities or properties
          const entityArray = Chunk.toReadonlyArray(entities)
          if (entityArray.length < 2) {
            return Chunk.empty<Relation>()
          }

          if (properties.length === 0) {
            return Chunk.empty<Relation>()
          }

          // Extract entity IDs for schema constraints
          const validEntityIds = entityArray.map((e) => e.id)

          // Build prompt using unified Prompt module (ensures schema-prompt alignment)
          const prompt = generateRelationPrompt(text, entityArray, properties)

          // Create schema from entity IDs and properties
          const schema = makeRelationSchema(validEntityIds, properties)

          // Log extraction stage details
          yield* Effect.logDebug("Relation extraction stage", {
            stage: "relation-extraction",
            entityCount: entityArray.length,
            entityIds: validEntityIds.slice(0, 10),
            propertyCount: properties.length,
            propertyIris: properties.map((p) => p.id).slice(0, 10),
            textLength: text.length,
            textPreview: text.slice(0, 200)
          })

          // Log prompt (truncated for readability)
          yield* Effect.logDebug("Relation extraction prompt", {
            stage: "relation-extraction",
            promptLength: prompt.length,
            prompt: prompt.slice(0, 1000) // First 1000 chars
          })

          // Log schema summary
          const jsonSchema = JSONSchema.make(schema)
          const schemaJson = JSON.stringify(jsonSchema).slice(0, 2000)
          yield* Effect.logDebug("Relation extraction schema", {
            stage: "relation-extraction",
            schemaIdentifier: jsonSchema.$defs?.RelationGraph?.title || "RelationGraph",
            schemaDescription: jsonSchema.$defs?.RelationGraph?.description?.slice(0, 200),
            validEntityIdCount: validEntityIds.length,
            allowedPropertyCount: properties.length
          })

          // Track retry count for observability
          const retryCount = yield* Ref.make(0)

          // Call LLM for structured output using LanguageModel.generateObject directly
          const response = yield* llm.generateObject({
            prompt,
            schema,
            objectName: "RelationGraph"
          }).pipe(
            Effect.timeout(Duration.millis(config.llm.timeoutMs)),
            Effect.retry(
              retryPolicy.pipe(
                Schedule.tapInput(() => Ref.update(retryCount, (n) => n + 1))
              )
            ),
            Effect.tapErrorCause((cause) =>
              Effect.all([
                Effect.logError("Relation extraction LLM call failed, will retry", {
                  stage: "relation-extraction",
                  promptLength: prompt.length,
                  entityCount: entityArray.length,
                  propertyCount: properties.length,
                  textPreview: text.slice(0, 500),
                  cause: Cause.pretty(cause)
                }),
                annotateError({
                  errorType: Cause.isFailType(cause)
                    ? (cause.error as Error).constructor?.name ?? "UnknownError"
                    : "UnknownCause",
                  errorMessage: Cause.pretty(cause).slice(0, 500)
                })
              ])
            ),
            Effect.tap((response) =>
              Effect.gen(function*() {
                const retries = yield* Ref.get(retryCount)
                yield* Effect.all([
                  Effect.logInfo("Relation extraction LLM response", {
                    stage: "relation-extraction",
                    relationCount: response.value.relations.length,
                    inputTokens: response.usage.inputTokens,
                    outputTokens: response.usage.outputTokens,
                    retryCount: retries
                  }),
                  annotateLlmCall({
                    model: config.llm.model,
                    provider: config.llm.provider,
                    promptLength: prompt.length,
                    inputTokens: response.usage.inputTokens,
                    outputTokens: response.usage.outputTokens,
                    promptText: prompt.slice(0, 2000),
                    schemaJson
                  }),
                  annotateExtraction({
                    relationCount: response.value.relations.length,
                    entityCount: entityArray.length
                  }),
                  annotateRetry({
                    retryCount: retries,
                    maxAttempts: config.runtime.retryMaxAttempts
                  })
                ])
              })
            ),
            Effect.withSpan("relation-extraction-llm", {
              attributes: {
                [LlmAttributes.PROMPT_LENGTH]: prompt.length,
                [LlmAttributes.ENTITY_COUNT]: entityArray.length,
                [LlmAttributes.PROMPT_TEXT]: prompt.slice(0, 2000),
                [LlmAttributes.REQUEST_SCHEMA]: schemaJson
              }
            }),
            Effect.mapError((error) =>
              new RelationExtractionFailed({
                message: `LLM relation extraction failed: ${error instanceof Error ? error.message : String(error)}`,
                cause: error,
                text
              })
            )
          )

          // Convert to Relation domain models with IRI normalization
          // Schema validation already enforced all constraints (subjectId, predicate, rangeType)
          // If generateObject succeeded, all relations are valid
          // Post-extraction normalization ensures canonical IRI casing as a backup
          const propertyIriMap = buildCaseInsensitiveIriMap(properties.map((p) => p.id))
          const relations = yield* Stream.fromIterable(response.value.relations)
            .pipe(
              Stream.map((relationData) => {
                // Normalize predicate IRI casing to match canonical ontology form
                const normalizedPredicate = normalizeIri(relationData.predicate, propertyIriMap)
                return new Relation({
                  subjectId: relationData.subjectId,
                  predicate: normalizedPredicate,
                  object: relationData.object
                })
              }),
              Stream.runCollect
            )

          // Log extracted relations summary
          const relationArray = Chunk.toReadonlyArray(relations)
          yield* Effect.logInfo("Relation extraction complete", {
            stage: "relation-extraction",
            extractedCount: relationArray.length,
            relations: relationArray
              .slice(0, 10)
              .map(
                (r: Relation) =>
                  `${r.subjectId} --[${r.predicate}]--> ${typeof r.object === "string" ? r.object : String(r.object)}`
              )
          })

          return Chunk.fromIterable(relations)
        })
    }
  }),
  dependencies: [ConfigService.Default],
  accessors: true
}) {
  /**
   * Test layer with deterministic fake relations
   *
   * @since 2.0.0
   */
  static Test = Layer.effect(
    RelationExtractor,
    Effect.succeed({
      _tag: "RelationExtractor" as const,
      extract: (
        _text: string,
        entities: Chunk.Chunk<Entity>,
        _properties: ReadonlyArray<PropertyDefinition>
      ): Effect.Effect<Chunk.Chunk<Relation>, RelationExtractionFailed, LanguageModel.LanguageModel> => {
        const entityArray = Chunk.toReadonlyArray(entities)
        if (entityArray.length < 2) {
          return Effect.succeed(Chunk.empty<Relation>())
        }

        return Effect.succeed(
          Chunk.fromIterable([
            new Relation({
              subjectId: entityArray[0].id,
              predicate: _properties.length > 0 ? _properties[0].id : "http://example.org/relatedTo",
              object: entityArray[1].id
            })
          ])
        )
      }
    } as RelationExtractor)
  )
}

================
File: src/Service/GenerateWithFeedback.ts
================
/**
 * Service: Generate Object with Feedback
 *
 * Provides retry with feedback for LLM structured output generation.
 * When schema validation fails (MalformedOutput), includes the error
 * in the retry prompt so the LLM can self-correct.
 *
 * @since 2.0.0
 * @module Service/GenerateWithFeedback
 */

import type { AiError, LanguageModel } from "@effect/ai"
import { Prompt } from "@effect/ai"
import type { Schema } from "effect"
import { Duration, Effect, Either } from "effect"
import type { TimeoutException } from "effect/Cause"

/**
 * Options for generateObjectWithFeedback
 *
 * @since 2.0.0
 */
export interface GenerateWithFeedbackOptions<A, I extends Record<string, unknown>, R> {
  /**
   * The initial prompt text
   */
  readonly prompt: string
  /**
   * The schema for structured output
   */
  readonly schema: Schema.Schema<A, I, R>
  /**
   * Name for the structured output object
   */
  readonly objectName: string
  /**
   * Maximum number of retry attempts
   */
  readonly maxAttempts: number
  /**
   * Service name for logging
   */
  readonly serviceName: string
  /**
   * Timeout per attempt in milliseconds
   */
  readonly timeoutMs?: number
}

/**
 * Generate object with schema validation feedback on retry.
 *
 * When MalformedOutput occurs (schema validation failure), includes the error
 * description in the retry prompt so the LLM can understand what went wrong
 * and self-correct.
 *
 * For other errors (network, rate limiting), retries without feedback.
 *
 * @example
 * ```typescript
 * const response = yield* generateObjectWithFeedback(llm, {
 *   prompt: entityExtractionPrompt,
 *   schema: EntityGraphSchema,
 *   objectName: "EntityGraph",
 *   maxAttempts: 5,
 *   serviceName: "EntityExtractor"
 * })
 * ```
 *
 * @since 2.0.0
 */
export const generateObjectWithFeedback = <A, I extends Record<string, unknown>, R>(
  llm: LanguageModel.Service,
  opts: GenerateWithFeedbackOptions<A, I, R>
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
): Effect.Effect<LanguageModel.GenerateObjectResponse<{}, A>, AiError.AiError | TimeoutException, R> =>
  Effect.gen(function*() {
    // Build initial prompt from string
    let currentPrompt: Prompt.Prompt = Prompt.make(opts.prompt)
    let lastError: AiError.AiError | TimeoutException | null = null
    let attempts = 0

    while (attempts < opts.maxAttempts) {
      attempts++

      // Attempt to generate object
      const generateEffect = llm.generateObject({
        prompt: currentPrompt,
        schema: opts.schema,
        objectName: opts.objectName
      })

      // Apply timeout if specified
      const timedEffect = opts.timeoutMs
        ? generateEffect.pipe(Effect.timeout(Duration.millis(opts.timeoutMs)))
        : generateEffect

      const result = yield* timedEffect.pipe(Effect.either)

      // Success - return the response
      if (Either.isRight(result)) {
        // Log if we succeeded after retries with feedback
        if (attempts > 1) {
          yield* Effect.logInfo("Schema validation succeeded after feedback retry", {
            service: opts.serviceName,
            attempt: attempts,
            maxAttempts: opts.maxAttempts
          })
        }
        return result.right
      }

      // Failure - check error type
      const error = result.left
      lastError = error

      // Only add feedback for MalformedOutput (schema validation errors)
      if (error._tag === "MalformedOutput") {
        yield* Effect.logWarning("Schema validation failed, retrying with feedback", {
          service: opts.serviceName,
          attempt: attempts,
          maxAttempts: opts.maxAttempts,
          errorDescription: error.description?.slice(0, 500)
        })

        // Build feedback prompt with error details
        // This creates a multi-turn conversation where the LLM sees its mistake
        const feedbackMessage = buildFeedbackMessage(error)
        currentPrompt = Prompt.merge(currentPrompt, feedbackMessage)
      } else {
        // For other errors (network, timeout, etc), retry without feedback
        yield* Effect.logWarning("LLM call failed, retrying without feedback", {
          service: opts.serviceName,
          attempt: attempts,
          maxAttempts: opts.maxAttempts,
          errorTag: error._tag
        })
        // Keep the same prompt for non-schema errors
      }
    }

    // All attempts exhausted - fail with last error
    yield* Effect.logError("All retry attempts exhausted", {
      service: opts.serviceName,
      attempts: opts.maxAttempts,
      lastErrorTag: lastError?._tag
    })

    return yield* Effect.fail(lastError!)
  })

/**
 * Build a feedback message to help the LLM understand the schema validation error.
 *
 * @internal
 */
const buildFeedbackMessage = (error: AiError.MalformedOutput): ReadonlyArray<Prompt.MessageEncoded> => {
  // Extract useful information from the error description
  const errorDescription = error.description || "Schema validation failed"

  return [
    {
      role: "assistant" as const,
      content: "I attempted to generate the output but it failed schema validation."
    },
    {
      role: "user" as const,
      content: `Your response failed schema validation with this error:

${errorDescription}

Please try again. Common issues:
1. Entity types must be from the ALLOWED CLASSES list (use full IRIs)
2. Attribute keys should be from ALLOWED DATATYPE PROPERTIES when possible
3. Entity IDs must be snake_case (lowercase with underscores)
4. Each entity must have at least one type

Generate a corrected response following the schema exactly.`
    }
  ]
}

/**
 * Type helper for the generateObjectWithFeedback result
 *
 * @since 2.0.0
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type GenerateWithFeedbackResult<A> = LanguageModel.GenerateObjectResponse<{}, A>

================
File: src/Service/Grounder.ts
================
/**
 * Service: Grounder
 *
 * Verifies extracted triples against source context using a second LLM pass.
 * Inspired by ODKE+ Grounder component.
 *
 * Supports both single and batched verification for efficiency.
 *
 * @since 2.0.0
 * @module Service/Grounder
 */

import { LanguageModel } from "@effect/ai"
import { Cause, Chunk, Duration, Effect, Layer, Ref, Schedule, Schema, Stream } from "effect"
import type { Relation } from "../Domain/Model/Entity.js"
import type { PropertyDefinition } from "../Domain/Model/Ontology.js"
import { annotateError, annotateLlmCall, annotateRetry, LlmAttributes } from "../Telemetry/LlmAttributes.js"
import { ConfigService } from "./Config.js"
import { makeRetryPolicy } from "./Retry.js"

/**
 * Verification result schema returned by LLM (single relation)
 */
const VerificationSchema = Schema.Struct({
  grounded: Schema.Boolean,
  confidence: Schema.Number.pipe(
    Schema.greaterThanOrEqualTo(0),
    Schema.lessThanOrEqualTo(1)
  )
}).annotations({
  identifier: "GroundingDecision",
  description: "Indicates whether a triple is grounded in the provided context"
})

/**
 * Batch verification result schema
 */
const BatchVerificationSchema = Schema.Struct({
  results: Schema.Array(
    Schema.Struct({
      index: Schema.Number.annotations({
        description: "Index of the triple in the input list (0-based)"
      }),
      grounded: Schema.Boolean.annotations({
        description: "Whether this triple is supported by the context"
      }),
      confidence: Schema.Number.pipe(
        Schema.greaterThanOrEqualTo(0),
        Schema.lessThanOrEqualTo(1)
      ).annotations({
        description: "Confidence score from 0 to 1"
      })
    })
  )
}).annotations({
  identifier: "BatchGroundingDecision",
  description: "Verification results for multiple triples"
})

/**
 * Input required to verify a relation triple
 */
export interface RelationVerificationInput {
  readonly context: string
  readonly object?: {
    readonly entityId?: string
    readonly literal?: string | number | boolean
    readonly mention?: string
    readonly types?: ReadonlyArray<string>
  }
  readonly predicate?: PropertyDefinition
  readonly relation: Relation
  readonly subject?: {
    readonly entityId: string
    readonly mention: string
    readonly types: ReadonlyArray<string>
  }
}

/**
 * Build prompt for single relation verification
 *
 * @internal
 */
const buildGrounderPrompt = ({
  context,
  object,
  predicate,
  relation,
  subject
}: RelationVerificationInput): string => {
  const predicateLabel = predicate?.label ?? relation.predicate
  const subjectLabel = subject
    ? `${subject.mention} (${subject.entityId})`
    : relation.subjectId

  const objectLabel = typeof relation.object === "string"
    ? object?.mention
      ? `${object.mention} (${relation.object})`
      : relation.object
    : String(relation.object)

  const objectDetail = typeof relation.object === "string" && object?.types
    ? `\nObject types: ${object.types.join(", ")}`
    : ""

  return `You are a verifier that determines whether a triple is grounded in the provided context.

Context:
${context}

Triple:
<${subjectLabel}, ${predicateLabel}, ${objectLabel}>${objectDetail}

Instructions:
- Answer using JSON matching the schema { "grounded": boolean, "confidence": number between 0 and 1 }
- "grounded" is true if and only if the triple is explicitly supported by the context.
- Confidence should reflect how certain you are about the grounding decision.
- Do not use external knowledge beyond the provided context.`
}

/**
 * Format a single relation for batch verification prompt
 *
 * @internal
 */
const formatRelationForBatch = (
  input: RelationVerificationInput,
  index: number
): string => {
  const { object, predicate, relation, subject } = input
  const predicateLabel = predicate?.label ?? relation.predicate
  const subjectLabel = subject
    ? `${subject.mention} (${subject.entityId})`
    : relation.subjectId

  const objectLabel = typeof relation.object === "string"
    ? object?.mention
      ? `${object.mention} (${relation.object})`
      : relation.object
    : String(relation.object)

  return `${index}. <${subjectLabel}, ${predicateLabel}, ${objectLabel}>`
}

/**
 * Build prompt for batch relation verification
 *
 * @internal
 */
const buildBatchGrounderPrompt = (
  context: string,
  inputs: ReadonlyArray<RelationVerificationInput>
): string => {
  const triplesFormatted = inputs
    .map((input, index) => formatRelationForBatch(input, index))
    .join("\n")

  return `You are a verifier that determines whether triples are grounded in the provided context.

Context:
${context}

Triples to verify:
${triplesFormatted}

Instructions:
- For each triple, determine if it is explicitly supported by the context.
- Return a JSON object with a "results" array.
- Each result should have: { "index": <triple number>, "grounded": boolean, "confidence": number between 0 and 1 }
- "grounded" is true if and only if the triple is explicitly stated or clearly implied by the context.
- Do not use external knowledge beyond the provided context.
- Return results for ALL triples in the same order as provided.`
}

/**
 * Grounder verification result
 */
export interface GrounderResult {
  readonly grounded: boolean
  readonly confidence: number
  readonly relation: Relation
}

/**
 * Default batch size for grouped verification
 */
const DEFAULT_BATCH_SIZE = 5

/**
 * Grounder Service
 *
 * Provides relation verification via secondary LLM pass.
 * Supports both single relation and batched verification.
 *
 * @since 2.0.0
 */
export class Grounder extends Effect.Service<Grounder>()("Grounder", {
  effect: Effect.gen(function*() {
    const config = yield* ConfigService
    const llm = yield* LanguageModel.LanguageModel

    // Retry policy with exponential backoff, max delay cap, and logging
    const retryPolicy = makeRetryPolicy({
      initialDelayMs: config.runtime.retryInitialDelayMs,
      maxDelayMs: config.runtime.retryMaxDelayMs,
      maxAttempts: config.runtime.retryMaxAttempts,
      serviceName: "Grounder"
    })

    return {
      /**
       * Verify whether a single relation triple is grounded in the context
       *
       * @param input - Verification input
       * @returns Verification decision with confidence score
       */
      verifyRelation: (input: RelationVerificationInput) =>
        Effect.gen(function*() {
          const prompt = buildGrounderPrompt(input)
          const retryCount = yield* Ref.make(0)

          const result = yield* llm.generateObject({
            prompt,
            schema: VerificationSchema,
            objectName: "GroundingDecision"
          }).pipe(
            Effect.retry(
              retryPolicy.pipe(
                Schedule.tapInput(() => Ref.update(retryCount, (n) => n + 1))
              )
            ),
            Effect.tapErrorCause((cause) =>
              Effect.all([
                Effect.logError("Grounder verification failed, will retry", {
                  stage: "grounder",
                  promptLength: prompt.length,
                  cause: Cause.pretty(cause)
                }),
                annotateError({
                  errorType: Cause.isFailType(cause)
                    ? (cause.error as Error).constructor?.name ?? "UnknownError"
                    : "UnknownCause",
                  errorMessage: Cause.pretty(cause).slice(0, 500)
                })
              ])
            ),
            Effect.tap((response) =>
              Effect.gen(function*() {
                const retries = yield* Ref.get(retryCount)
                yield* Effect.all([
                  Effect.logDebug("Grounder verification result", {
                    stage: "grounder",
                    grounded: response.value.grounded,
                    confidence: response.value.confidence,
                    retryCount: retries
                  }),
                  annotateLlmCall({
                    model: config.llm.model,
                    provider: config.llm.provider,
                    promptLength: prompt.length,
                    inputTokens: response.usage.inputTokens,
                    outputTokens: response.usage.outputTokens,
                    promptText: prompt.slice(0, 2000)
                  }),
                  annotateRetry({
                    retryCount: retries,
                    maxAttempts: config.runtime.retryMaxAttempts
                  })
                ])
              })
            ),
            Effect.withSpan("grounder-single-verification", {
              attributes: {
                [LlmAttributes.PROMPT_LENGTH]: prompt.length,
                [LlmAttributes.PROMPT_TEXT]: prompt.slice(0, 2000)
              }
            }),
            Effect.timeout(Duration.millis(config.llm.timeoutMs * 2))
          )

          return {
            grounded: result.value.grounded,
            confidence: result.value.confidence,
            relation: input.relation
          }
        }),

      /**
       * Verify a batch of relations in a single LLM call
       *
       * More efficient than verifying one at a time.
       *
       * @param context - Shared context for all relations
       * @param inputs - Array of verification inputs (all should share same context)
       * @returns Array of verification results
       */
      verifyRelationBatch: (
        context: string,
        inputs: ReadonlyArray<RelationVerificationInput>
      ) =>
        Effect.gen(function*() {
          if (inputs.length === 0) {
            return []
          }

          // If only one input, use single verification for efficiency
          if (inputs.length === 1) {
            const result = yield* llm.generateObject({
              prompt: buildGrounderPrompt(inputs[0]),
              schema: VerificationSchema,
              objectName: "GroundingDecision"
            }).pipe(
              Effect.retry(retryPolicy),
              Effect.timeout(Duration.millis(config.llm.timeoutMs * 2))
            )
            return [{
              grounded: result.value.grounded,
              confidence: result.value.confidence,
              relation: inputs[0].relation
            }]
          }

          // Batch verification
          const prompt = buildBatchGrounderPrompt(context, inputs)

          const response = yield* llm.generateObject({
            prompt,
            schema: BatchVerificationSchema,
            objectName: "BatchGroundingDecision"
          }).pipe(
            Effect.retry(retryPolicy),
            Effect.timeout(Duration.millis(config.llm.timeoutMs * 3)) // Extra time for batch
          )

          // Map results back to inputs
          const resultsMap = new Map(
            response.value.results.map((r) => [r.index, r])
          )

          return inputs.map((input, index) => {
            const result = resultsMap.get(index)
            return {
              grounded: result?.grounded ?? false,
              confidence: result?.confidence ?? 0,
              relation: input.relation
            }
          })
        }).pipe(
          Effect.tap((results) =>
            Effect.all([
              Effect.logDebug("Grounder batch verification complete", {
                stage: "grounder",
                batchSize: inputs.length,
                groundedCount: results.filter((r) => r.grounded).length
              }),
              Effect.annotateCurrentSpan(LlmAttributes.RELATION_COUNT, inputs.length),
              Effect.annotateCurrentSpan("grounder.grounded_count", results.filter((r) => r.grounded).length)
            ])
          ),
          Effect.withSpan("grounder-batch-verification", {
            attributes: {
              [LlmAttributes.RELATION_COUNT]: inputs.length
            }
          })
        ),

      /**
       * Verify relations using batched streaming
       *
       * Groups relations into batches and processes each batch in one LLM call.
       * More efficient for large numbers of relations.
       *
       * @param context - Shared context
       * @param relations - Stream of verification inputs
       * @param batchSize - Number of relations per batch (default: 5)
       * @returns Stream of verification results
       */
      verifyRelationStream: (
        context: string,
        relations: Stream.Stream<RelationVerificationInput>,
        batchSize: number = DEFAULT_BATCH_SIZE
      ) =>
        relations.pipe(
          // Group into batches
          Stream.grouped(batchSize),
          // Process each batch with single LLM call
          Stream.mapEffect((batch) => {
            const batchArray = Chunk.toReadonlyArray(batch)
            return llm.generateObject({
              prompt: buildBatchGrounderPrompt(context, batchArray),
              schema: BatchVerificationSchema,
              objectName: "BatchGroundingDecision"
            }).pipe(
              Effect.retry(retryPolicy),
              Effect.timeout(Duration.millis(config.llm.timeoutMs * 3)),
              Effect.map((response) => {
                const resultsMap = new Map(
                  response.value.results.map((r) => [r.index, r])
                )
                return batchArray.map((input, index) => {
                  const result = resultsMap.get(index)
                  return {
                    grounded: result?.grounded ?? false,
                    confidence: result?.confidence ?? 0,
                    relation: input.relation
                  }
                })
              })
            )
          }),
          // Flatten batch results
          Stream.mapConcat((results) => results)
        )
    }
  }),
  dependencies: [ConfigService.Default],
  accessors: true
}) {
  /**
   * Test layer with deterministic responses (all relations pass verification)
   *
   * @since 2.0.0
   */
  static Test = Layer.succeed(
    Grounder,
    {
      verifyRelation: (input: RelationVerificationInput) =>
        Effect.succeed({
          grounded: true,
          confidence: 1,
          relation: input.relation
        }),
      verifyRelationBatch: (_context: string, inputs: ReadonlyArray<RelationVerificationInput>) =>
        Effect.succeed(
          inputs.map((input) => ({
            grounded: true,
            confidence: 1,
            relation: input.relation
          }))
        ),
      verifyRelationStream: (_context: string, relations: Stream.Stream<RelationVerificationInput>) =>
        relations.pipe(
          Stream.map((input) => ({
            grounded: true,
            confidence: 1,
            relation: input.relation
          }))
        )
    } as unknown as Grounder
  )
}

================
File: src/Service/index.ts
================
/**
 * Service Layer Exports
 *
 * @since 2.0.0
 * @module Service
 */

export * from "./Config.js"
export * from "./Extraction.js"
export * from "./GenerateWithFeedback.js"
export * from "./Grounder.js"
export * from "./Nlp.js"
export * from "./Ontology.js"
export * from "./Rdf.js"
export * from "./Retry.js"

================
File: src/Service/Nlp.ts
================
/**
 * Service: NLP Services
 *
 * Stateless NLP operations using wink-nlp.
 * Provides tokenization, BM25 search, and text chunking.
 *
 * @since 2.0.0
 * @module Service/Nlp
 */

import { Effect } from "effect"
import vectors from "wink-embeddings-sg-100d"
import model from "wink-eng-lite-web-model"
import winkNLP from "wink-nlp"
import BM25Vectorizer from "wink-nlp/utilities/bm25-vectorizer"
// @ts-expect-error - wink-nlp/utilities/similarity has no type definitions
import similarity from "wink-nlp/utilities/similarity.js"
// @ts-expect-error - wink-bm25-text-search has no type definitions
import winkBM25 from "wink-bm25-text-search"
import type { ClassDefinition, OntologyContext, PropertyDefinition } from "../Domain/Model/Ontology.js"
import { enhanceTextForSearch, generateNGrams } from "../Utils/Rdf.js"

/**
 * Tokenization result
 */
export interface TokenizeResult {
  readonly tokens: ReadonlyArray<string>
  readonly sentences: ReadonlyArray<string>
  readonly entities: ReadonlyArray<string>
}

/**
 * BM25 similarity result
 */
export interface SimilarityResult {
  readonly doc: string
  readonly score: number
  readonly index: number
}

/**
 * Text chunk with offset information
 */
export interface TextChunk {
  readonly index: number
  readonly text: string
  readonly startOffset: number
  readonly endOffset: number
}

/**
 * Chunking options
 */
export interface ChunkOptions {
  readonly preserveSentences?: boolean
  readonly maxChunkSize?: number
  /**
   * Number of sentences to overlap between consecutive chunks.
   * Default: 2 (good balance for context preservation)
   * Set to 0 for no overlap.
   */
  readonly overlapSentences?: number
}

/**
 * BM25 configuration parameters
 */
export interface BM25Config {
  /**
   * Term frequency saturation parameter (default: 1.2)
   */
  readonly k1?: number
  /**
   * Length normalization parameter (default: 0.75)
   */
  readonly b?: number
  /**
   * Query term frequency normalization (default: 1)
   */
  readonly k?: number
}

/**
 * Opaque BM25 index for ontology search
 */
export interface OntologyBM25Index {
  readonly _tag: "OntologyBM25Index"
  readonly documentCount: number
}

/**
 * Opaque semantic index for ontology search
 */
export interface OntologySemanticIndex {
  readonly _tag: "OntologySemanticIndex"
  readonly documentCount: number
}

/**
 * Search result from ontology BM25 index
 */
export interface OntologySearchResult {
  /**
   * IRI of the matched class or property
   */
  readonly iri: string
  /**
   * BM25 relevance score
   */
  readonly score: number
  /**
   * Class definition if result is a class
   */
  readonly class?: ClassDefinition
  /**
   * Property definition if result is a property
   */
  readonly property?: PropertyDefinition
}

/**
 * NlpService - Stateless NLP operations
 *
 * Mode: sync (synchronous operations, no async init)
 * Dependencies: None
 *
 * Capabilities:
 * - tokenize: Extract tokens, sentences, entities
 * - searchSimilar: BM25 ranking over documents
 * - chunkText: Sentence-aware text chunking
 *
 * @example
 * ```typescript
 * Effect.gen(function*() {
 *   const result = yield* NlpService.tokenize("Hello world")
 *   console.log(result.tokens)  // ["hello", "world"]
 * }).pipe(Effect.provide(NlpService.Default))
 * ```
 *
 * @since 2.0.0
 * @category Services
 */
/**
 * Prepare text for BM25 indexing with enhanced preprocessing
 *
 * Tokenizes text, removes stopwords, handles camelCase splitting, and generates n-grams.
 * This creates a richer representation for better search matching.
 *
 * Steps:
 * 1. Split camelCase identifiers into words
 * 2. Tokenize using wink-nlp (normalized, lowercase)
 * 3. Remove stopwords and non-word tokens
 * 4. Generate bigrams for multi-word phrase matching
 *
 * @param text - Input text to prepare
 * @param nlp - wink-nlp instance
 * @returns Array of tokens ready for BM25 indexing
 */
const prepareText = (text: string, nlp: ReturnType<typeof winkNLP>): Array<string> => {
  // First, enhance text by splitting camelCase and adding n-grams
  const enhancedText = enhanceTextForSearch(text, 2)

  // Tokenize the enhanced text
  const doc = nlp.readDoc(enhancedText)
  const tokens = doc
    .tokens()
    .filter((t) => !t.out(nlp.its.stopWordFlag)) // Remove stopwords
    .filter((t) => t.out(nlp.its.type) === "word") // Only words (no punctuation)
    .out() as Array<string> // Extract token strings

  // Generate additional bigrams from the tokens for phrase matching
  const bigrams = generateNGrams(tokens, 2)

  // Combine tokens and bigrams for richer representation
  return [...tokens, ...bigrams]
}

export class NlpService extends Effect.Service<NlpService>()(
  "NlpService",
  {
    sync: () => {
      // Initialize wink-nlp with model, pipes (sbd+pos for embeddings), and vectors
      // sbd = sentence boundary detection, pos = part-of-speech (required for lemmas/contextual vectors)
      const nlp = winkNLP(model, ["sbd", "pos"], vectors)
      const its = nlp.its
      const as = nlp.as

      // Store for BM25 engines (keyed by index reference)
      const bm25Engines = new WeakMap<OntologyBM25Index, ReturnType<typeof winkBM25>>()
      const bm25DomainModels = new WeakMap<
        OntologyBM25Index,
        Map<string, ClassDefinition | PropertyDefinition>
      >()
      const bm25Ontologies = new WeakMap<OntologyBM25Index, OntologyContext>()

      // Store for semantic indexes (keyed by index reference)
      const semanticEmbeddings = new WeakMap<
        OntologySemanticIndex,
        Map<string, ReadonlyArray<number>>
      >()
      const semanticDomainModels = new WeakMap<
        OntologySemanticIndex,
        Map<string, ClassDefinition | PropertyDefinition>
      >()
      const semanticOntologies = new WeakMap<OntologySemanticIndex, OntologyContext>()

      /**
       * Compute document embedding from text
       *
       * Tokenizes text, filters to words (non-stopwords), and gets averaged embedding vector.
       * Uses wink-nlp's built-in vector averaging via as.vector reducer.
       * Returns a 100-dimensional vector representing the document.
       */
      const computeDocumentEmbedding = (text: string): ReadonlyArray<number> | null => {
        const doc = nlp.readDoc(text)
        const tokens = doc
          .tokens()
          .filter((t) => t.out(its.type) === "word" && !t.out(its.stopWordFlag))

        // Check if we have any tokens by trying to get the first one
        const firstToken = tokens.itemAt(0)
        if (!firstToken) {
          return null
        }

        // Get averaged embedding vector directly from wink-nlp
        // as.vector on a token collection returns the averaged vector
        const embedding = tokens.out(its.value, as.vector) as ReadonlyArray<number> | null

        if (!embedding || embedding.length === 0) {
          return null
        }

        return embedding
      }

      /**
       * Compute cosine similarity between two vectors using wink-nlp's built-in utility
       */
      const cosineSimilarity = (
        a: ReadonlyArray<number>,
        b: ReadonlyArray<number>
      ): number => {
        if (a.length !== b.length) {
          return 0
        }
        // Use wink-nlp's built-in similarity utility
        return similarity.vector.cosine(a, b) as number
      }

      return {
        /**
         * Tokenize text into tokens, sentences, and entities
         *
         * Uses wink-nlp's normalized tokens (lowercase, no punctuation)
         *
         * @param text - Input text to tokenize
         * @returns Tokenization result with tokens, sentences, entities
         */
        tokenize: (text: string) =>
          Effect.sync(() => {
            const doc = nlp.readDoc(text)

            return {
              tokens: doc.tokens().out(its.normal) as Array<string>,
              sentences: doc.sentences().out() as Array<string>,
              entities: doc.entities().out() as Array<string>
            }
          }),

        /**
         * Search similar documents using BM25
         *
         * Uses BM25 algorithm with default parameters (k1=1.2, b=0.75, k=1)
         *
         * @param query - Search query
         * @param docs - Document collection to search
         * @param k - Number of top results to return
         * @returns Top-k similar documents with scores
         */
        searchSimilar: (
          query: string,
          docs: ReadonlyArray<string>,
          k: number = 5
        ) =>
          Effect.sync(() => {
            // Create BM25 vectorizer with default config
            const bm25 = BM25Vectorizer()

            // Learn from documents (train the model)
            docs.forEach((doc) => {
              const tokens = nlp.readDoc(doc).tokens().out(its.normal)
              bm25.learn(tokens)
            })

            // Get query vector
            const queryTokens = nlp.readDoc(query).tokens().out(its.normal)
            const queryVector = bm25.vectorOf(queryTokens)

            // Compute similarities for all documents using wink-nlp's built-in similarity
            const results = docs
              .map((doc, index) => {
                const docTokens = nlp.readDoc(doc).tokens().out(its.normal)
                const docVector = bm25.vectorOf(docTokens)

                // Use wink-nlp's built-in cosine similarity
                const score = similarity.vector.cosine(queryVector, docVector) as number

                return { doc, index, score }
              })
              .filter((r) => r.score > 0)
              .sort((a, b) => b.score - a.score)
              .slice(0, k)

            return results
          }),

        /**
         * Search similar documents using embeddings (semantic search)
         *
         * Uses word embeddings via as.vector for semantic similarity.
         * More robust to paraphrasing than BM25.
         *
         * @param query - Search query
         * @param docs - Document collection to search
         * @param k - Number of top results to return
         * @returns Top-k semantically similar documents with scores
         */
        searchSemantic: (
          query: string,
          docs: ReadonlyArray<string>,
          k: number = 5
        ) =>
          Effect.sync(() => {
            // Get query vector (average of token embeddings)
            const queryDoc = nlp.readDoc(query)
            const queryVector = queryDoc.tokens().out(its.value, as.vector) as Array<number>

            if (!queryVector || queryVector.length === 0) {
              return []
            }

            // Compute cosine similarity for each document using wink-nlp's built-in utility
            const results = docs
              .map((doc, index) => {
                const docObj = nlp.readDoc(doc)
                const docVector = docObj.tokens().out(its.value, as.vector) as Array<number>

                if (!docVector || docVector.length === 0) {
                  return { doc, index, score: 0 }
                }

                // Use wink-nlp's built-in cosine similarity
                const score = similarity.vector.cosine(queryVector, docVector) as number

                return { doc, index, score }
              })
              .filter((r) => r.score > 0)
              .sort((a, b) => b.score - a.score)
              .slice(0, k)

            return results
          }),

        /**
         * Chunk text while preserving sentence boundaries with optional overlap
         *
         * Uses wink-nlp's sentence segmentation to create context-preserving chunks.
         * Supports overlapping chunks via sliding window approach for better context
         * preservation across chunk boundaries.
         *
         * @param text - Text to chunk
         * @param options - Chunking options
         * @returns Array of text chunks with offsets
         *
         * @example
         * ```typescript
         * // Chunk with 2 sentence overlap
         * const chunks = yield* nlp.chunkText(text, {
         *   maxChunkSize: 500,
         *   preserveSentences: true,
         *   overlapSentences: 2
         * })
         * ```
         */
        chunkText: (
          text: string,
          options?: ChunkOptions
        ) =>
          Effect.sync(() => {
            const {
              maxChunkSize = 500,
              overlapSentences = 2,
              preserveSentences = true
            } = options ?? {}

            const doc = nlp.readDoc(text)
            const sentences = doc.sentences().out() as Array<string>

            if (sentences.length === 0) {
              return []
            }

            if (!preserveSentences) {
              // Simple character-based chunking (no overlap support)
              const chunks: Array<TextChunk> = []
              let currentChunk = ""
              let startOffset = 0

              for (const sentence of sentences) {
                if (currentChunk.length + sentence.length > maxChunkSize && currentChunk) {
                  chunks.push({
                    index: chunks.length,
                    text: currentChunk.trim(),
                    startOffset,
                    endOffset: startOffset + currentChunk.length
                  })
                  startOffset += currentChunk.length
                  currentChunk = ""
                }
                currentChunk += sentence + " "
              }

              if (currentChunk) {
                chunks.push({
                  index: chunks.length,
                  text: currentChunk.trim(),
                  startOffset,
                  endOffset: startOffset + currentChunk.length
                })
              }

              return chunks
            }

            // Sentence-aware chunking with overlap support
            // Calculate sentence positions manually since wink-nlp doesn't provide span() method
            const sentenceCollection = doc.sentences()
            const sentenceIndex: Array<{ text: string; startOffset: number; endOffset: number }> = []

            // Build sentence index by finding each sentence in the original text sequentially
            let searchOffset = 0
            sentenceCollection.each((sentence: any) => {
              const sentenceText = sentence.out()
              // Find sentence position in original text starting from last position
              // This ensures we get the correct position even if sentence text appears multiple times
              const startOffset = text.indexOf(sentenceText, searchOffset)
              const endOffset = startOffset + sentenceText.length

              sentenceIndex.push({
                text: sentenceText,
                startOffset: startOffset >= 0 ? startOffset : searchOffset,
                endOffset: startOffset >= 0 ? endOffset : searchOffset + sentenceText.length
              })

              // Update search offset to continue from end of this sentence
              searchOffset = startOffset >= 0 ? endOffset : searchOffset + sentenceText.length
            })

            const chunks: Array<TextChunk> = []
            const overlap = Math.max(0, overlapSentences)

            // Sliding window approach with overlap
            // Step size = window size - overlap (ensures overlap sentences are included in next chunk)
            let i = 0
            let chunkIndex = 0

            while (i < sentences.length) {
              // Build chunk by collecting sentences until we reach maxChunkSize
              const chunkSentences: Array<string> = []
              let chunkSize = 0

              // Collect sentences for this chunk
              for (let j = i; j < sentences.length; j++) {
                const sentence = sentences[j]
                const sentenceLength = sentence.length + (j > i ? 1 : 0) // +1 for space separator (except first)

                // Check if adding this sentence would exceed max size
                if (chunkSize + sentenceLength > maxChunkSize && chunkSentences.length > 0) {
                  break
                }

                chunkSentences.push(sentence)
                chunkSize += sentenceLength
              }

              if (chunkSentences.length > 0) {
                const chunkText = chunkSentences.join(" ")
                const chunkStartOffset = sentenceIndex[i]?.startOffset ?? 0
                const lastSentenceIdx = i + chunkSentences.length - 1
                const chunkEndOffset = sentenceIndex[lastSentenceIdx]?.endOffset ?? chunkStartOffset + chunkText.length

                chunks.push({
                  index: chunkIndex++,
                  text: chunkText,
                  startOffset: chunkStartOffset,
                  endOffset: chunkEndOffset
                })

                // Calculate step size: move forward by (chunk size - overlap)
                // This ensures the next chunk starts with `overlap` sentences from the previous chunk
                const step = Math.max(1, chunkSentences.length - overlap)
                i += step

                // If we've processed all sentences, break
                if (i >= sentences.length) {
                  break
                }
              } else {
                // Edge case: single sentence exceeds maxChunkSize - include it anyway
                const sentence = sentences[i]
                const chunkStartOffset = sentenceIndex[i]?.startOffset ?? 0
                const chunkEndOffset = sentenceIndex[i]?.endOffset ?? chunkStartOffset + sentence.length

                chunks.push({
                  index: chunkIndex++,
                  text: sentence,
                  startOffset: chunkStartOffset,
                  endOffset: chunkEndOffset
                })

                i += 1
              }
            }

            return chunks
          }),

        /**
         * Create BM25 search index from ontology context
         *
         * Builds an in-memory full-text search index using BM25 algorithm
         * from the ontology's classes and properties. The index maps IRIs
         * to domain models for retrieval after search.
         *
         * @param ontology - Ontology context to index
         * @param config - Optional BM25 parameters (k1, b, k)
         * @returns Effect yielding opaque OntologyBM25Index
         *
         * @example
         * ```typescript
         * const index = yield* nlp.createOntologyIndex(ontology)
         * ```
         */
        createOntologyIndex: (
          ontology: OntologyContext,
          config?: BM25Config
        ): Effect.Effect<OntologyBM25Index, Error> =>
          Effect.sync(() => {
            // Create BM25 search engine
            const engine = winkBM25()

            // Configure BM25 parameters
            const bm25Params = {
              k1: config?.k1 ?? 1.2,
              b: config?.b ?? 0.75,
              k: config?.k ?? 1
            }

            // Define configuration
            engine.defineConfig({
              fldWeights: { text: 1 }, // Field weights (text field has weight 1)
              bm25Params
            })

            // Define text preparation pipeline
            engine.definePrepTasks([(text: string) => prepareText(text, nlp)])

            // Get documents from ontology (returns [IRI, document] tuples)
            const documents = ontology.toDocuments()

            // Create mapping from IRI to domain model
            const domainModelMap = new Map<string, ClassDefinition | PropertyDefinition>()

            // Add documents to index
            for (const [iri, document] of documents) {
              // Add document to BM25 index with IRI as ID
              engine.addDoc(
                {
                  text: document
                },
                iri
              )

              // Map IRI to domain model for later retrieval
              const classDef = ontology.getClass(iri)
              const propertyDef = ontology.getProperty(iri)
              if (classDef) {
                domainModelMap.set(iri, classDef)
              } else if (propertyDef) {
                domainModelMap.set(iri, propertyDef)
              }
            }

            // Consolidate index (required after adding docs)
            engine.consolidate()

            // Create opaque index reference
            const index: OntologyBM25Index = {
              _tag: "OntologyBM25Index",
              documentCount: documents.length
            }

            // Store engine, domain model mapping, and ontology for later retrieval
            bm25Engines.set(index, engine)
            bm25DomainModels.set(index, domainModelMap)
            bm25Ontologies.set(index, ontology)

            return index
          }),

        /**
         * Search ontology BM25 index with query string
         *
         * Returns top-k ontology entities (classes/properties) ranked by BM25
         * relevance score. Results include the actual domain models for direct use.
         *
         * @param index - BM25 index created by createOntologyIndex
         * @param query - Search query string
         * @param limit - Maximum number of results (default: 10)
         * @returns Effect yielding ranked search results with domain models
         *
         * @example
         * ```typescript
         * const results = yield* nlp.searchOntologyIndex(index, "person entity", 5)
         * // Returns top 5 matching classes/properties
         * ```
         */
        searchOntologyIndex: (
          index: OntologyBM25Index,
          query: string,
          limit: number = 10
        ): Effect.Effect<ReadonlyArray<OntologySearchResult>, Error> =>
          Effect.sync(() => {
            const engine = bm25Engines.get(index)
            const domainModelMap = bm25DomainModels.get(index)
            const ontology = bm25Ontologies.get(index)

            if (!engine || !domainModelMap || !ontology) {
              throw new Error("Invalid BM25 index reference")
            }

            // Search with query
            const rawResults = engine.search(query, limit)

            // Map results to OntologySearchResult format
            // wink-bm25 returns array of [id, score] tuples
            const results: Array<OntologySearchResult> = []
            for (const result of rawResults) {
              const [iri, score] = result as [string, number]
              const domainModel = domainModelMap.get(iri)

              if (domainModel) {
                // Determine if it's a class or property
                const classDef = ontology.getClass(iri)
                const propertyDef = ontology.getProperty(iri)

                results.push({
                  iri,
                  score,
                  class: classDef,
                  property: propertyDef
                })
              }
            }

            return results
          }),

        /**
         * Create semantic search index from ontology context
         *
         * Builds an in-memory semantic index using word embeddings from the ontology's
         * classes and properties. Each document is converted to a 100-dimensional embedding
         * vector using wink-embeddings-sg-100d. The index maps IRIs to domain models for retrieval.
         *
         * @param ontology - Ontology context to index
         * @returns Effect yielding opaque OntologySemanticIndex
         *
         * @example
         * ```typescript
         * const index = yield* nlp.createOntologySemanticIndex(ontology)
         * ```
         */
        createOntologySemanticIndex: (
          ontology: OntologyContext
        ): Effect.Effect<OntologySemanticIndex, Error> =>
          Effect.sync(() => {
            // Get documents from ontology (returns [IRI, document] tuples)
            const documents = ontology.toDocuments()

            // Create mapping from IRI to embedding and domain model
            const embeddingMap = new Map<string, ReadonlyArray<number>>()
            const domainModelMap = new Map<string, ClassDefinition | PropertyDefinition>()

            // Compute embeddings for each document
            for (const [iri, document] of documents) {
              const embedding = computeDocumentEmbedding(document)
              if (embedding) {
                embeddingMap.set(iri, embedding)

                // Map IRI to domain model for later retrieval
                const classDef = ontology.getClass(iri)
                const propertyDef = ontology.getProperty(iri)
                if (classDef) {
                  domainModelMap.set(iri, classDef)
                } else if (propertyDef) {
                  domainModelMap.set(iri, propertyDef)
                }
              }
            }

            // Create opaque index reference
            const index: OntologySemanticIndex = {
              _tag: "OntologySemanticIndex",
              documentCount: embeddingMap.size
            }

            // Store embeddings, domain model mapping, and ontology for later retrieval
            semanticEmbeddings.set(index, embeddingMap)
            semanticDomainModels.set(index, domainModelMap)
            semanticOntologies.set(index, ontology)

            return index
          }),

        /**
         * Search ontology semantic index with query string
         *
         * Returns top-k ontology entities (classes/properties) ranked by cosine similarity
         * of their embeddings to the query embedding. Results include the actual domain models
         * for direct use. More robust to paraphrasing than BM25.
         *
         * @param index - Semantic index created by createOntologySemanticIndex
         * @param query - Search query string
         * @param limit - Maximum number of results (default: 10)
         * @returns Effect yielding ranked search results with domain models
         *
         * @example
         * ```typescript
         * const results = yield* nlp.searchOntologySemanticIndex(index, "athlete person", 5)
         * // Returns top 5 semantically similar classes/properties
         * ```
         */
        searchOntologySemanticIndex: (
          index: OntologySemanticIndex,
          query: string,
          limit: number = 10
        ): Effect.Effect<ReadonlyArray<OntologySearchResult>, Error> =>
          Effect.sync(() => {
            const embeddingMap = semanticEmbeddings.get(index)
            const domainModelMap = semanticDomainModels.get(index)
            const ontology = semanticOntologies.get(index)

            if (!embeddingMap || !domainModelMap || !ontology) {
              throw new Error("Invalid semantic index reference")
            }

            // Compute query embedding
            const queryEmbedding = computeDocumentEmbedding(query)
            if (!queryEmbedding) {
              return []
            }

            // Compute cosine similarity for each document
            const results: Array<OntologySearchResult & { score: number }> = []
            for (const [iri, docEmbedding] of embeddingMap.entries()) {
              const score = cosineSimilarity(queryEmbedding, docEmbedding)

              if (score > 0) {
                const domainModel = domainModelMap.get(iri)
                if (domainModel) {
                  // Determine if it's a class or property
                  const classDef = ontology.getClass(iri)
                  const propertyDef = ontology.getProperty(iri)

                  results.push({
                    iri,
                    score,
                    class: classDef,
                    property: propertyDef
                  })
                }
              }
            }

            // Sort by score descending and take top-k
            return results
              .sort((a, b) => b.score - a.score)
              .slice(0, limit)
          })
      }
    },
    accessors: true
  }
) {}

================
File: src/Service/Ontology.ts
================
/**
 * Service: Ontology Services
 *
 * Production-ready ontology loading using RdfService abstraction.
 * Parses OWL/RDFS ontologies and exposes classes and properties.
 * Backend-agnostic: works with any RDF engine via RdfService.
 *
 * @since 2.0.0
 * @module Service/Ontology
 */

import { FileSystem } from "@effect/platform"
import { Chunk, Effect, Schema } from "effect"
import { OntologyFileNotFound, OntologyParsingFailed } from "../Domain/Error/Ontology.js"
import type { RdfError } from "../Domain/Error/Rdf.js"
import { ClassDefinition, OntologyContext, PropertyDefinition } from "../Domain/Model/Ontology.js"
import {
  OWL_CLASS,
  OWL_DATATYPE_PROPERTY,
  OWL_FUNCTIONAL_PROPERTY,
  OWL_OBJECT_PROPERTY,
  RDF_TYPE,
  RDFS_COMMENT,
  RDFS_DOMAIN,
  RDFS_LABEL,
  RDFS_RANGE,
  SKOS_ALTLABEL,
  SKOS_BROADER,
  SKOS_CLOSEMATCH,
  SKOS_DEFINITION,
  SKOS_EXACTMATCH,
  SKOS_EXAMPLE,
  SKOS_HIDDENLABEL,
  SKOS_NARROWER,
  SKOS_PREFLABEL,
  SKOS_RELATED,
  SKOS_SCOPENOTE
} from "../Domain/Rdf/Constants.js"
import { type IRI, Literal, type Quad } from "../Domain/Rdf/Types.js"
import { extractLocalName, iriArrayToLocalNameArrayTransform } from "../Utils/Rdf.js"
import { ConfigService } from "./Config.js"
import { NlpService } from "./Nlp.js"
import { RdfBuilder, type RdfStore } from "./Rdf.js"

/**
 * Parse ontology from RDF store using RdfService queries
 *
 * Uses RdfService's queryStore to extract classes and properties.
 * Works with domain types (IRI, Quad) instead of N3 types.
 */
const parseOntologyFromStore = (
  rdf: {
    readonly queryStore: (
      store: RdfStore,
      pattern: {
        readonly subject?: IRI | null
        readonly predicate?: IRI | null
        readonly object?: IRI | null
        readonly graph?: IRI | null
      }
    ) => Effect.Effect<Chunk.Chunk<Quad>, RdfError>
  },
  store: RdfStore,
  ontologyPath: string
): Effect.Effect<
  {
    classes: Chunk.Chunk<ClassDefinition>
    properties: Chunk.Chunk<PropertyDefinition>
  },
  OntologyParsingFailed
> =>
  Effect.gen(function*() {
    // Query 1: Find all classes (subjects where ?s rdf:type owl:Class)
    const classQuads = yield* rdf.queryStore(store, {
      predicate: RDF_TYPE,
      object: OWL_CLASS
    })
    const classMap = new Map<
      IRI,
      {
        label: string
        comment: string
        properties: Array<IRI>
        prefLabels: Array<string>
        altLabels: Array<string>
        hiddenLabels: Array<string>
        definition: string
        scopeNote: string
        example: string
        broader: Array<IRI>
        narrower: Array<IRI>
        related: Array<IRI>
        exactMatch: Array<IRI>
        closeMatch: Array<IRI>
      }
    >()

    // Initialize class entries
    const classQuadsArray = Chunk.toReadonlyArray(classQuads)
    for (const quad of classQuadsArray) {
      if (typeof quad.subject === "string" && !quad.subject.startsWith("_:")) {
        const classIri = quad.subject as IRI
        if (!classMap.has(classIri)) {
          classMap.set(classIri, {
            label: "",
            comment: "",
            properties: [],
            prefLabels: [],
            altLabels: [],
            hiddenLabels: [],
            definition: "",
            scopeNote: "",
            example: "",
            broader: [],
            narrower: [],
            related: [],
            exactMatch: [],
            closeMatch: []
          })
        }
      }
    }

    // Query 2: Get labels, comments, and SKOS properties for each class
    for (const [classIri] of classMap.entries()) {
      const classInfo = classMap.get(classIri)!

      // Get rdfs:label
      const labelQuads = yield* rdf.queryStore(store, {
        subject: classIri,
        predicate: RDFS_LABEL
      })
      const labelArray = Chunk.toReadonlyArray(labelQuads)
      if (labelArray.length > 0 && labelArray[0].object instanceof Literal) {
        classInfo.label = labelArray[0].object.value
      }

      // Get rdfs:comment
      const commentQuads = yield* rdf.queryStore(store, {
        subject: classIri,
        predicate: RDFS_COMMENT
      })
      const commentArray = Chunk.toReadonlyArray(commentQuads)
      if (
        commentArray.length > 0 &&
        commentArray[0].object instanceof Literal
      ) {
        classInfo.comment = commentArray[0].object.value
      }

      // Get skos:prefLabel (can have multiple with different language tags)
      const prefLabelQuads = yield* rdf.queryStore(store, {
        subject: classIri,
        predicate: SKOS_PREFLABEL
      })
      classInfo.prefLabels = Chunk.toReadonlyArray(prefLabelQuads)
        .map((q) => (q.object instanceof Literal ? q.object.value : ""))
        .filter((s) => s !== "")

      // Get skos:altLabel (synonyms)
      const altLabelQuads = yield* rdf.queryStore(store, {
        subject: classIri,
        predicate: SKOS_ALTLABEL
      })
      classInfo.altLabels = Chunk.toReadonlyArray(altLabelQuads)
        .map((q) => (q.object instanceof Literal ? q.object.value : ""))
        .filter((s) => s !== "")

      // Get skos:hiddenLabel (misspellings, abbreviations)
      const hiddenLabelQuads = yield* rdf.queryStore(store, {
        subject: classIri,
        predicate: SKOS_HIDDENLABEL
      })
      classInfo.hiddenLabels = Chunk.toReadonlyArray(hiddenLabelQuads)
        .map((q) => (q.object instanceof Literal ? q.object.value : ""))
        .filter((s) => s !== "")

      // Get skos:definition (preferred over rdfs:comment)
      const definitionQuads = yield* rdf.queryStore(store, {
        subject: classIri,
        predicate: SKOS_DEFINITION
      })
      const definitionArray = Chunk.toReadonlyArray(definitionQuads)
      if (
        definitionArray.length > 0 &&
        definitionArray[0].object instanceof Literal
      ) {
        classInfo.definition = definitionArray[0].object.value
      }

      // Get skos:scopeNote
      const scopeNoteQuads = yield* rdf.queryStore(store, {
        subject: classIri,
        predicate: SKOS_SCOPENOTE
      })
      const scopeNoteArray = Chunk.toReadonlyArray(scopeNoteQuads)
      if (
        scopeNoteArray.length > 0 &&
        scopeNoteArray[0].object instanceof Literal
      ) {
        classInfo.scopeNote = scopeNoteArray[0].object.value
      }

      // Get skos:example
      const exampleQuads = yield* rdf.queryStore(store, {
        subject: classIri,
        predicate: SKOS_EXAMPLE
      })
      const exampleArray = Chunk.toReadonlyArray(exampleQuads)
      if (exampleArray.length > 0 && exampleArray[0].object instanceof Literal) {
        classInfo.example = exampleArray[0].object.value
      }

      // Get skos:broader (parent concepts)
      const broaderQuads = yield* rdf.queryStore(store, {
        subject: classIri,
        predicate: SKOS_BROADER
      })
      for (const quad of Chunk.toReadonlyArray(broaderQuads)) {
        if (typeof quad.object === "string" && !quad.object.startsWith("_:")) {
          classInfo.broader.push(quad.object as IRI)
        }
      }

      // Get skos:narrower (child concepts)
      const narrowerQuads = yield* rdf.queryStore(store, {
        subject: classIri,
        predicate: SKOS_NARROWER
      })
      for (const quad of Chunk.toReadonlyArray(narrowerQuads)) {
        if (typeof quad.object === "string" && !quad.object.startsWith("_:")) {
          classInfo.narrower.push(quad.object as IRI)
        }
      }

      // Get skos:related (related concepts)
      const relatedQuads = yield* rdf.queryStore(store, {
        subject: classIri,
        predicate: SKOS_RELATED
      })
      for (const quad of Chunk.toReadonlyArray(relatedQuads)) {
        if (typeof quad.object === "string" && !quad.object.startsWith("_:")) {
          classInfo.related.push(quad.object as IRI)
        }
      }

      // Get skos:exactMatch
      const exactMatchQuads = yield* rdf.queryStore(store, {
        subject: classIri,
        predicate: SKOS_EXACTMATCH
      })
      for (const quad of Chunk.toReadonlyArray(exactMatchQuads)) {
        if (typeof quad.object === "string" && !quad.object.startsWith("_:")) {
          classInfo.exactMatch.push(quad.object as IRI)
        }
      }

      // Get skos:closeMatch
      const closeMatchQuads = yield* rdf.queryStore(store, {
        subject: classIri,
        predicate: SKOS_CLOSEMATCH
      })
      for (const quad of Chunk.toReadonlyArray(closeMatchQuads)) {
        if (typeof quad.object === "string" && !quad.object.startsWith("_:")) {
          classInfo.closeMatch.push(quad.object as IRI)
        }
      }
    }

    // Query 3: Find all properties (ObjectProperty or DatatypeProperty)
    const objectPropQuads = yield* rdf.queryStore(store, {
      predicate: RDF_TYPE,
      object: OWL_OBJECT_PROPERTY
    })
    const datatypePropQuads = yield* rdf.queryStore(store, {
      predicate: RDF_TYPE,
      object: OWL_DATATYPE_PROPERTY
    })
    const propertyMap = new Map<
      IRI,
      {
        label: string
        comment: string
        domain: Array<IRI>
        range: Array<IRI>
        rangeType: "datatype" | "object"
        isFunctional: boolean
        prefLabels: Array<string>
        altLabels: Array<string>
        hiddenLabels: Array<string>
        definition: string
        scopeNote: string
        example: string
        broader: Array<IRI>
        narrower: Array<IRI>
        related: Array<IRI>
        exactMatch: Array<IRI>
        closeMatch: Array<IRI>
      }
    >()

    // Initialize property entries
    const objectPropQuadsArray = Chunk.toReadonlyArray(objectPropQuads)
    for (const quad of objectPropQuadsArray) {
      if (typeof quad.subject === "string" && !quad.subject.startsWith("_:")) {
        const propIri = quad.subject as IRI
        if (!propertyMap.has(propIri)) {
          propertyMap.set(propIri, {
            label: "",
            comment: "",
            domain: [],
            range: [],
            rangeType: "object",
            isFunctional: false,
            prefLabels: [],
            altLabels: [],
            hiddenLabels: [],
            definition: "",
            scopeNote: "",
            example: "",
            broader: [],
            narrower: [],
            related: [],
            exactMatch: [],
            closeMatch: []
          })
        }
      }
    }
    const datatypePropQuadsArray = Chunk.toReadonlyArray(datatypePropQuads)
    for (const quad of datatypePropQuadsArray) {
      if (typeof quad.subject === "string" && !quad.subject.startsWith("_:")) {
        const propIri = quad.subject as IRI
        if (!propertyMap.has(propIri)) {
          propertyMap.set(propIri, {
            label: "",
            comment: "",
            domain: [],
            range: [],
            rangeType: "datatype",
            isFunctional: false,
            prefLabels: [],
            altLabels: [],
            hiddenLabels: [],
            definition: "",
            scopeNote: "",
            example: "",
            broader: [],
            narrower: [],
            related: [],
            exactMatch: [],
            closeMatch: []
          })
        }
      }
    }

    // Query 4: Get metadata for each property (label, comment, domain, range, SKOS)
    for (const [propIri] of propertyMap.entries()) {
      const propInfo = propertyMap.get(propIri)!

      // Get rdfs:label
      const labelQuads = yield* rdf.queryStore(store, {
        subject: propIri,
        predicate: RDFS_LABEL
      })
      const labelArray = Chunk.toReadonlyArray(labelQuads)
      if (labelArray.length > 0 && labelArray[0].object instanceof Literal) {
        propInfo.label = labelArray[0].object.value
      }

      // Get rdfs:comment
      const commentQuads = yield* rdf.queryStore(store, {
        subject: propIri,
        predicate: RDFS_COMMENT
      })
      const commentArray = Chunk.toReadonlyArray(commentQuads)
      if (
        commentArray.length > 0 &&
        commentArray[0].object instanceof Literal
      ) {
        propInfo.comment = commentArray[0].object.value
      }

      // Get domain (can have multiple)
      const domainQuads = yield* rdf.queryStore(store, {
        subject: propIri,
        predicate: RDFS_DOMAIN
      })
      for (const quad of Chunk.toReadonlyArray(domainQuads)) {
        if (typeof quad.object === "string" && !quad.object.startsWith("_:")) {
          propInfo.domain.push(quad.object as IRI)
        }
      }

      // Get range (can have multiple)
      const rangeQuads = yield* rdf.queryStore(store, {
        subject: propIri,
        predicate: RDFS_RANGE
      })
      for (const quad of Chunk.toReadonlyArray(rangeQuads)) {
        if (typeof quad.object === "string" && !quad.object.startsWith("_:")) {
          propInfo.range.push(quad.object as IRI)
        }
      }

      // Check if property is functional (owl:FunctionalProperty)
      const functionalQuads = yield* rdf.queryStore(store, {
        subject: propIri,
        predicate: RDF_TYPE,
        object: OWL_FUNCTIONAL_PROPERTY
      })
      if (Chunk.toReadonlyArray(functionalQuads).length > 0) {
        propInfo.isFunctional = true
      }

      // Get skos:prefLabel (can have multiple with different language tags)
      const prefLabelQuads = yield* rdf.queryStore(store, {
        subject: propIri,
        predicate: SKOS_PREFLABEL
      })
      propInfo.prefLabels = Chunk.toReadonlyArray(prefLabelQuads)
        .map((q) => (q.object instanceof Literal ? q.object.value : ""))
        .filter((s) => s !== "")

      // Get skos:altLabel (synonyms)
      const altLabelQuads = yield* rdf.queryStore(store, {
        subject: propIri,
        predicate: SKOS_ALTLABEL
      })
      propInfo.altLabels = Chunk.toReadonlyArray(altLabelQuads)
        .map((q) => (q.object instanceof Literal ? q.object.value : ""))
        .filter((s) => s !== "")

      // Get skos:hiddenLabel (misspellings, abbreviations)
      const hiddenLabelQuads = yield* rdf.queryStore(store, {
        subject: propIri,
        predicate: SKOS_HIDDENLABEL
      })
      propInfo.hiddenLabels = Chunk.toReadonlyArray(hiddenLabelQuads)
        .map((q) => (q.object instanceof Literal ? q.object.value : ""))
        .filter((s) => s !== "")

      // Get skos:definition (preferred over rdfs:comment)
      const definitionQuads = yield* rdf.queryStore(store, {
        subject: propIri,
        predicate: SKOS_DEFINITION
      })
      const definitionArray = Chunk.toReadonlyArray(definitionQuads)
      if (
        definitionArray.length > 0 &&
        definitionArray[0].object instanceof Literal
      ) {
        propInfo.definition = definitionArray[0].object.value
      }

      // Get skos:scopeNote
      const scopeNoteQuads = yield* rdf.queryStore(store, {
        subject: propIri,
        predicate: SKOS_SCOPENOTE
      })
      const scopeNoteArray = Chunk.toReadonlyArray(scopeNoteQuads)
      if (
        scopeNoteArray.length > 0 &&
        scopeNoteArray[0].object instanceof Literal
      ) {
        propInfo.scopeNote = scopeNoteArray[0].object.value
      }

      // Get skos:example
      const exampleQuads = yield* rdf.queryStore(store, {
        subject: propIri,
        predicate: SKOS_EXAMPLE
      })
      const exampleArray = Chunk.toReadonlyArray(exampleQuads)
      if (exampleArray.length > 0 && exampleArray[0].object instanceof Literal) {
        propInfo.example = exampleArray[0].object.value
      }

      // Get skos:broader (parent properties)
      const broaderQuads = yield* rdf.queryStore(store, {
        subject: propIri,
        predicate: SKOS_BROADER
      })
      for (const quad of Chunk.toReadonlyArray(broaderQuads)) {
        if (typeof quad.object === "string" && !quad.object.startsWith("_:")) {
          propInfo.broader.push(quad.object as IRI)
        }
      }

      // Get skos:narrower (child properties)
      const narrowerQuads = yield* rdf.queryStore(store, {
        subject: propIri,
        predicate: SKOS_NARROWER
      })
      for (const quad of Chunk.toReadonlyArray(narrowerQuads)) {
        if (typeof quad.object === "string" && !quad.object.startsWith("_:")) {
          propInfo.narrower.push(quad.object as IRI)
        }
      }

      // Get skos:related (related properties)
      const relatedQuads = yield* rdf.queryStore(store, {
        subject: propIri,
        predicate: SKOS_RELATED
      })
      for (const quad of Chunk.toReadonlyArray(relatedQuads)) {
        if (typeof quad.object === "string" && !quad.object.startsWith("_:")) {
          propInfo.related.push(quad.object as IRI)
        }
      }

      // Get skos:exactMatch
      const exactMatchQuads = yield* rdf.queryStore(store, {
        subject: propIri,
        predicate: SKOS_EXACTMATCH
      })
      for (const quad of Chunk.toReadonlyArray(exactMatchQuads)) {
        if (typeof quad.object === "string" && !quad.object.startsWith("_:")) {
          propInfo.exactMatch.push(quad.object as IRI)
        }
      }

      // Get skos:closeMatch
      const closeMatchQuads = yield* rdf.queryStore(store, {
        subject: propIri,
        predicate: SKOS_CLOSEMATCH
      })
      for (const quad of Chunk.toReadonlyArray(closeMatchQuads)) {
        if (typeof quad.object === "string" && !quad.object.startsWith("_:")) {
          propInfo.closeMatch.push(quad.object as IRI)
        }
      }
    }

    // Link properties to classes based on domain
    for (const [propIri, propInfo] of propertyMap.entries()) {
      for (const domainClass of propInfo.domain) {
        const classInfo = classMap.get(domainClass)
        if (classInfo) {
          classInfo.properties.push(propIri)
        }
      }
    }

    // Transform schemas: convert IRIs to local names
    const propertiesTransform = iriArrayToLocalNameArrayTransform()
    const domainTransform = iriArrayToLocalNameArrayTransform()
    const rangeTransform = iriArrayToLocalNameArrayTransform()

    // Transform schemas for relationship IRIs
    const broaderTransform = iriArrayToLocalNameArrayTransform()
    const narrowerTransform = iriArrayToLocalNameArrayTransform()
    const relatedTransform = iriArrayToLocalNameArrayTransform()
    const exactMatchTransform = iriArrayToLocalNameArrayTransform()
    const closeMatchTransform = iriArrayToLocalNameArrayTransform()

    // Build ClassDefinition Chunk with transforms applied
    const classesBuilder: Array<ClassDefinition> = []
    for (const [id, info] of classMap.entries()) {
      // Only include classes with labels (rdfs:label or skos:prefLabel)
      if (info.label || info.prefLabels.length > 0) {
        // Transform properties IRIs to local names using Schema transform
        const propertiesLocalNames = Schema.decodeUnknownSync(
          propertiesTransform
        )(info.properties)

        // Transform relationship IRIs to local names
        const broaderLocalNames = Schema.decodeUnknownSync(broaderTransform)(
          info.broader
        )
        const narrowerLocalNames = Schema.decodeUnknownSync(narrowerTransform)(
          info.narrower
        )
        const relatedLocalNames = Schema.decodeUnknownSync(relatedTransform)(
          info.related
        )
        const exactMatchLocalNames = Schema.decodeUnknownSync(
          exactMatchTransform
        )(info.exactMatch)
        const closeMatchLocalNames = Schema.decodeUnknownSync(
          closeMatchTransform
        )(info.closeMatch)

        classesBuilder.push(
          new ClassDefinition({
            id,
            label: info.label,
            comment: info.comment || "",
            properties: propertiesLocalNames,
            prefLabels: info.prefLabels,
            altLabels: info.altLabels,
            hiddenLabels: info.hiddenLabels,
            definition: info.definition || undefined,
            scopeNote: info.scopeNote || undefined,
            example: info.example || undefined,
            broader: broaderLocalNames,
            narrower: narrowerLocalNames,
            related: relatedLocalNames,
            exactMatch: exactMatchLocalNames,
            closeMatch: closeMatchLocalNames
          })
        )
      }
    }

    // Build PropertyDefinition Chunk with transforms applied
    const propertiesBuilder: Array<PropertyDefinition> = []
    for (const [id, info] of propertyMap.entries()) {
      // Only include properties with labels (rdfs:label or skos:prefLabel)
      if (info.label || info.prefLabels.length > 0) {
        // Transform domain and range IRIs to local names using Schema transforms
        const domainLocalNames = Schema.decodeUnknownSync(domainTransform)(
          info.domain
        )
        const rangeLocalNames = Schema.decodeUnknownSync(rangeTransform)(
          info.range
        )

        // Transform relationship IRIs to local names
        const broaderLocalNames = Schema.decodeUnknownSync(broaderTransform)(
          info.broader
        )
        const narrowerLocalNames = Schema.decodeUnknownSync(narrowerTransform)(
          info.narrower
        )
        const relatedLocalNames = Schema.decodeUnknownSync(relatedTransform)(
          info.related
        )
        const exactMatchLocalNames = Schema.decodeUnknownSync(
          exactMatchTransform
        )(info.exactMatch)
        const closeMatchLocalNames = Schema.decodeUnknownSync(
          closeMatchTransform
        )(info.closeMatch)

        propertiesBuilder.push(
          new PropertyDefinition({
            id,
            label: info.label,
            comment: info.comment || "",
            domain: domainLocalNames,
            range: rangeLocalNames,
            rangeType: info.rangeType,
            isFunctional: info.isFunctional,
            prefLabels: info.prefLabels,
            altLabels: info.altLabels,
            hiddenLabels: info.hiddenLabels,
            definition: info.definition || undefined,
            scopeNote: info.scopeNote || undefined,
            example: info.example || undefined,
            broader: broaderLocalNames,
            narrower: narrowerLocalNames,
            related: relatedLocalNames,
            exactMatch: exactMatchLocalNames,
            closeMatch: closeMatchLocalNames
          })
        )
      }
    }

    return {
      classes: Chunk.fromIterable(classesBuilder),
      properties: Chunk.fromIterable(propertiesBuilder)
    }
  }).pipe(
    Effect.mapError(
      (error) =>
        new OntologyParsingFailed({
          message: `Failed to parse ontology at ${ontologyPath}`,
          path: ontologyPath,
          cause: error
        })
    )
  )

/**
 * OntologyService - Ontology loading using RdfService abstraction
 *
 * Loads ontology from file, parses using RdfService, and extracts classes/properties
 * using RdfService queries. Backend-agnostic: works with any RDF engine.
 *
 * @since 2.0.0
 * @category Services
 */
export class OntologyService extends Effect.Service<OntologyService>()(
  "OntologyService",
  {
    effect: (path: string | undefined) =>
      Effect.gen(function*() {
        const config = yield* ConfigService

        const ontologyPath = path || config.ontology.path

        const fs = yield* FileSystem.FileSystem
        const rdf = yield* RdfBuilder
        const nlp = yield* NlpService

        // Load ontology file using FileSystem layer
        const turtleContent = yield* fs.readFileString(ontologyPath).pipe(
          Effect.mapError(
            (error) =>
              new OntologyFileNotFound({
                message: `Ontology file not found at ${ontologyPath}`,
                path: ontologyPath,
                cause: error
              })
          )
        )

        // Parse turtle content into RDF store using RdfService
        const store = yield* rdf.parseTurtle(turtleContent)

        const { classes, properties } = yield* parseOntologyFromStore(
          rdf,
          store,
          ontologyPath
        )

        const ontology = new OntologyContext({
          classes: Chunk.toReadonlyArray(classes),
          properties: Chunk.toReadonlyArray(properties)
        })

        const index = yield* nlp.createOntologyIndex(ontology)

        // Extract classes and properties from store using RdfService queries

        return {
          /**
           * Get the ontology context
           *
           * @returns OntologyContext object
           */
          ontology: Effect.succeed(ontology),

          /**
           * Search for classes matching the query using BM25
           *
           * Creates a BM25 index from the ontology and searches for matching classes.
           * Returns top-k classes ranked by relevance score.
           *
           * @param query - Search query string
           * @param limit - Maximum number of results (default: 10)
           * @returns Chunk of ClassDefinition objects matching the query
           *
           * @example
           * ```typescript
           * const classes = yield* OntologyService.searchClasses("person entity", 5)
           * ```
           */
          searchClasses: (query: string, limit: number = 10) =>
            Effect.gen(function*() {
              // Create index from ontology

              // Search - get raw results (both Classes and Properties)
              const results = yield* nlp.searchOntologyIndex(index, query, limit)

              // Map to Classes, handling Property -> Domain resolution
              const validClasses = new Map<string, ClassDefinition>()

              for (const result of results) {
                // A. Direct Class Match
                if (result.class) {
                  validClasses.set(result.class.id, result.class)
                }

                // B. Property Match -> Resolve Domain Classes
                if (result.property) {
                  for (const domainLocalName of result.property.domain) {
                    // Find class by matching local name
                    const domainClass = ontology.classes.find(
                      (c) => extractLocalName(c.id) === domainLocalName
                    )
                    if (domainClass) {
                      validClasses.set(domainClass.id, domainClass)
                    }
                  }
                }
              }

              return Chunk.fromIterable(validClasses.values())
            }),

          /**
           * Search for properties matching the query using BM25
           *
           * Creates a BM25 index from the ontology and searches for matching properties.
           * Returns top-k properties ranked by relevance score.
           *
           * @param query - Search query string
           * @param limit - Maximum number of results (default: 10)
           * @returns Chunk of PropertyDefinition objects matching the query
           *
           * @example
           * ```typescript
           * const properties = yield* OntologyService.searchProperties("name field", 5)
           * ```
           */
          searchProperties: (query: string, limit: number = 10) =>
            Effect.gen(function*() {
              const nlp = yield* NlpService

              // Create index from ontology
              const index = yield* nlp.createOntologyIndex(ontology)

              // Search
              const results = yield* nlp.searchOntologyIndex(index, query, limit)

              // Filter to properties only and return as Chunk
              return Chunk.fromIterable(
                results
                  .filter((r) => r.property !== undefined)
                  .map((r) => r.property!)
              )
            }),

          /**
           * Get properties for given class IRIs
           *
           * Returns all properties whose domain includes any of the provided class IRIs.
           *
           * @param classIris - Array of class IRIs to get properties for
           * @returns Chunk of PropertyDefinition objects
           *
           * @example
           * ```typescript
           * const properties = yield* OntologyService.getPropertiesFor(["http://schema.org/Person"])
           * ```
           */
          getPropertiesFor: (classIris: ReadonlyArray<string>) =>
            Effect.sync(() => {
              const properties: Array<PropertyDefinition> = []
              for (const classIri of classIris) {
                const classProps = ontology.getPropertiesForClass(classIri)
                for (const prop of classProps) {
                  properties.push(prop)
                }
              }
              // Remove duplicates (same property might be in multiple classes)
              const uniqueProps = new Map<string, PropertyDefinition>()
              for (const prop of properties) {
                uniqueProps.set(prop.id, prop)
              }
              return Chunk.fromIterable(uniqueProps.values())
            }),

          /**
           * Search for classes matching the query using semantic embeddings
           *
           * Creates a semantic index from the ontology and searches for matching classes
           * using cosine similarity of word embeddings. More robust to paraphrasing than BM25.
           * Returns top-k classes ranked by semantic similarity score.
           *
           * @param query - Search query string
           * @param limit - Maximum number of results (default: 10)
           * @returns Chunk of ClassDefinition objects matching the query
           *
           * @example
           * ```typescript
           * const classes = yield* OntologyService.searchClassesSemantic("athlete person", 5)
           * ```
           */
          searchClassesSemantic: (query: string, limit: number = 10) =>
            Effect.gen(function*() {
              const nlp = yield* NlpService

              // Create semantic index from ontology
              const index = yield* nlp.createOntologySemanticIndex(ontology)

              // Search - get raw results (both Classes and Properties)
              const results = yield* nlp.searchOntologySemanticIndex(
                index,
                query,
                limit
              )

              // Map to Classes, handling Property -> Domain resolution
              const validClasses = new Map<string, ClassDefinition>()

              for (const result of results) {
                // A. Direct Class Match
                if (result.class) {
                  validClasses.set(result.class.id, result.class)
                }

                // B. Property Match -> Resolve Domain Classes
                if (result.property) {
                  for (const domainLocalName of result.property.domain) {
                    // Find class by matching local name
                    const domainClass = ontology.classes.find(
                      (c) => extractLocalName(c.id) === domainLocalName
                    )
                    if (domainClass) {
                      validClasses.set(domainClass.id, domainClass)
                    }
                  }
                }
              }

              return Chunk.fromIterable(validClasses.values())
            }),

          /**
           * Search for properties matching the query using semantic embeddings
           *
           * Creates a semantic index from the ontology and searches for matching properties
           * using cosine similarity of word embeddings. More robust to paraphrasing than BM25.
           * Returns top-k properties ranked by semantic similarity score.
           *
           * @param query - Search query string
           * @param limit - Maximum number of results (default: 10)
           * @returns Chunk of PropertyDefinition objects matching the query
           *
           * @example
           * ```typescript
           * const properties = yield* OntologyService.searchPropertiesSemantic("name identifier", 5)
           * ```
           */
          searchPropertiesSemantic: (query: string, limit: number = 10) =>
            Effect.gen(function*() {
              const nlp = yield* NlpService

              // Create semantic index from ontology
              const index = yield* nlp.createOntologySemanticIndex(ontology)

              // Search
              const results = yield* nlp.searchOntologySemanticIndex(
                index,
                query,
                limit
              )

              // Filter to properties only and return as Chunk
              return Chunk.fromIterable(
                results
                  .filter((r) => r.property !== undefined)
                  .map((r) => r.property!)
              )
            })
        }
      }),
    dependencies: [
      RdfBuilder.Default,
      ConfigService.Default,
      NlpService.Default
    ],
    accessors: true
  }
) {}

================
File: src/Service/Rdf.ts
================
/**
 * Service: RDF Services
 *
 * RDF abstraction layer using N3.js as the backend.
 * Provides backend-agnostic RDF operations for parsing, querying, and serialization.
 *
 * @since 2.0.0
 * @module Service/Rdf
 */

import { Chunk, Effect } from "effect"
import * as N3 from "n3"
import { ParsingFailed, RdfError, SerializationFailed } from "../Domain/Error/Rdf.js"
import type { Entity, Relation } from "../Domain/Model/Entity.js"
import { type BlankNode as BlankNodeType, type IRI, Literal, Quad, type RdfTerm } from "../Domain/Rdf/Types.js"
import { createN3Builders, entityToQuads, relationToQuad } from "../Utils/Rdf.js"
import { ConfigService } from "./Config.js"

/**
 * N3Store type (from n3 library) - internal use only
 */
type N3Store = N3.Store

/**
 * RdfStore - Abstract RDF store type
 *
 * Opaque wrapper around N3.Store to hide backend implementation.
 * All N3-specific code stays within RdfService.
 *
 * @since 2.0.0
 */
export interface RdfStore {
  readonly _tag: "RdfStore"
  readonly _store: N3Store
}

/**
 * QuadPattern - Query pattern for store queries
 *
 * null values act as wildcards (match anything).
 *
 * @since 2.0.0
 */
export interface QuadPattern {
  readonly subject?: IRI | BlankNodeType | null
  readonly predicate?: IRI | null
  readonly object?: RdfTerm | null
  readonly graph?: IRI | null
}

/**
 * Internal: Convert N3 Term to domain RdfTerm
 */
const n3TermToDomainTerm = (term: N3.Term): RdfTerm => {
  if (term.termType === "NamedNode") {
    return term.value as IRI
  } else if (term.termType === "BlankNode") {
    return (`_:${term.value}` as const) as BlankNodeType
  } else if (term.termType === "Literal") {
    return new Literal({
      value: term.value,
      language: term.language || undefined,
      datatype: term.datatype ? (term.datatype.value as IRI) : undefined
    })
  } else {
    throw new Error(`Unsupported term type: ${term.termType}`)
  }
}

/**
 * Internal: Convert N3 Quad to domain Quad
 */
const n3QuadToDomainQuad = (n3Quad: N3.Quad): Quad => {
  const subject = n3Quad.subject.termType === "NamedNode"
    ? (n3Quad.subject.value as IRI)
    : (`_:${n3Quad.subject.value}` as const) as BlankNodeType

  const predicate = n3Quad.predicate.value as IRI

  const object = n3TermToDomainTerm(n3Quad.object)

  const graph = n3Quad.graph.termType === "NamedNode"
    ? (n3Quad.graph.value as IRI)
    : undefined

  return new Quad({
    subject,
    predicate,
    object,
    graph
  })
}

/**
 * Internal: Convert domain term to N3 Term for querying
 */
const domainTermToN3Term = (term: IRI | BlankNodeType | RdfTerm | null | undefined): N3.Term | null => {
  if (term === null || term === undefined) {
    return null
  }
  if (typeof term === "string") {
    if (term.startsWith("_:")) {
      return N3.DataFactory.blankNode(term.slice(2))
    } else {
      return N3.DataFactory.namedNode(term)
    }
  }
  if (term instanceof Literal) {
    return term.datatype
      ? N3.DataFactory.literal(term.value, N3.DataFactory.namedNode(term.datatype))
      : term.language
      ? N3.DataFactory.literal(term.value, term.language)
      : N3.DataFactory.literal(term.value)
  }
  throw new Error(`Cannot convert term to N3 term: ${term}`)
}

/**
 * RdfBuilder - RDF graph construction service
 *
 * Manages N3.Store lifecycle with automatic cleanup.
 * Provides capability-oriented API for RDF operations.
 *
 * **Capabilities**:
 * - `makeStore`: Create scoped N3.Store with cleanup
 * - `addEntities`: Convert Entity domain objects to RDF
 * - `addRelations`: Convert Relation domain objects to RDF
 * - `toTurtle`: Serialize to Turtle with prefixes
 * - `validate`: SHACL validation placeholder
 *
 * @example
 * ```typescript
 * Effect.gen(function*() {
 *   const store = yield* RdfBuilder.makeStore
 *   yield* RdfBuilder.addEntities(store, entities)
 *   yield* RdfBuilder.addRelations(store, relations)
 *   const turtle = yield* RdfBuilder.toTurtle(store)
 *   return turtle
 * }).pipe(Effect.scoped, Effect.provide(RdfBuilder.Default))
 * ```
 *
 * @since 2.0.0
 * @category Services
 */
export class RdfBuilder extends Effect.Service<RdfBuilder>()(
  "RdfBuilder",
  {
    scoped: Effect.gen(function*() {
      const config = yield* ConfigService

      // Create N3 term builders with IRI validation
      const builders = createN3Builders(N3.DataFactory, true)

      const baseNs = config.rdf.baseNamespace
      const prefixes = config.rdf.prefixes

      return {
        /**
         * Create scoped RDF store with automatic cleanup
         *
         * Store is managed within Effect.Scope and cleaned up automatically.
         *
         * @returns Scoped RdfStore instance
         */
        makeStore: Effect.acquireRelease(
          Effect.sync(() => {
            const n3Store = new N3.Store()
            return { _tag: "RdfStore" as const, _store: n3Store } satisfies RdfStore
          }),
          (store) =>
            Effect.sync(() => {
              // Cleanup: ensure store is finalized
              void store._store.size
            })
        ),

        /**
         * Create a new RDF store (non-scoped)
         *
         * For use cases where store lifecycle is managed externally.
         *
         * @returns RdfStore instance
         */
        createStore: Effect.sync(() => {
          const n3Store = new N3.Store()
          return { _tag: "RdfStore" as const, _store: n3Store } satisfies RdfStore
        }),

        /**
         * Parse Turtle string to RDF store
         *
         * Parses RDF Turtle syntax into an abstract RdfStore.
         * All N3-specific parsing logic is encapsulated here.
         *
         * @param turtle - Turtle RDF string
         * @returns Effect yielding RdfStore or ParsingFailed
         */
        parseTurtle: (turtle: string) =>
          Effect.try({
            try: () => {
              const parser = new N3.Parser()
              const quads = parser.parse(turtle)
              const n3Store = new N3.Store()
              n3Store.addQuads(quads)
              return { _tag: "RdfStore" as const, _store: n3Store } satisfies RdfStore
            },
            catch: (error) =>
              new ParsingFailed({
                message: `Failed to parse Turtle: ${error}`,
                cause: error,
                format: "Turtle"
              })
          }),

        /**
         * Query RDF store with pattern
         *
         * Queries the store using a pattern where null values act as wildcards.
         * Returns domain Quad objects, not N3 types.
         *
         * @param store - RdfStore to query
         * @param pattern - Query pattern
         * @returns Effect yielding Chunk of Quad objects
         */
        queryStore: (store: RdfStore, pattern: QuadPattern) =>
          Effect.try({
            try: () => {
              const n3Store = store._store

              // Convert domain terms to N3 terms for querying
              const n3Subject = domainTermToN3Term(pattern.subject ?? null)
              const n3Predicate = domainTermToN3Term(pattern.predicate ?? null)
              const n3Object = domainTermToN3Term(pattern.object ?? null)
              const n3Graph = domainTermToN3Term(pattern.graph ?? null)

              // Query N3 store
              const n3Quads = n3Store.getQuads(
                n3Subject as N3.Term | null,
                n3Predicate as N3.Term | null,
                n3Object as N3.Term | null,
                n3Graph as N3.Term | null
              )

              // Convert N3 quads to domain quads
              return Chunk.fromIterable(n3Quads.map(n3QuadToDomainQuad))
            },
            catch: (error) =>
              new RdfError({
                message: `Failed to query store: ${error}`,
                cause: error
              })
          }),

        /**
         * Create IRI from string
         *
         * Validates and creates a domain IRI type.
         *
         * @param iri - IRI string
         * @returns IRI domain type
         */
        createIri: (iri: string): IRI => iri as IRI,

        /**
         * Add entities to store
         *
         * Converts Entity domain objects to N3 quads using pure utils.
         *
         * @param store - RdfStore to add to
         * @param entities - Entities to convert to RDF
         * @returns Effect completing when entities are added
         */
        addEntities: (store: RdfStore, entities: Iterable<Entity>) =>
          Effect.try({
            try: () => {
              const n3Store = store._store
              for (const entity of entities) {
                // Use pure util function for transformation
                const quads = entityToQuads(entity, baseNs, prefixes, builders)
                for (const quad of quads) {
                  n3Store.addQuad(quad)
                }
              }
            },
            catch: (error) =>
              new RdfError({
                message: `Failed to add entities to RDF store: ${error}`,
                cause: error
              })
          }),

        /**
         * Add relations to store
         *
         * Converts Relation domain objects to N3 quads using pure utils.
         *
         * @param store - RdfStore to add to
         * @param relations - Relations to convert to RDF
         * @returns Effect completing when relations are added
         */
        addRelations: (store: RdfStore, relations: Iterable<Relation>) =>
          Effect.try({
            try: () => {
              const n3Store = store._store
              for (const rel of relations) {
                // Use pure util function for transformation
                const quad = relationToQuad(rel, baseNs, prefixes, builders)
                n3Store.addQuad(quad)
              }
            },
            catch: (error) =>
              new RdfError({
                message: `Failed to add relations to RDF store: ${error}`,
                cause: error
              })
          }),

        /**
         * Serialize store to Turtle with prefixes
         *
         * Uses prefixes from ConfigService for clean output.
         * Async operation via N3.Writer.
         *
         * @param store - RdfStore to serialize
         * @returns Turtle string
         */
        toTurtle: (store: RdfStore) =>
          Effect.async<string, SerializationFailed>((resume) => {
            const n3Store = store._store
            const writer = new N3.Writer({
              format: "Turtle",
              prefixes: config.rdf.prefixes
            })

            // Add all quads from store
            n3Store.forEach((q) => writer.addQuad(q))

            writer.end((error, result) => {
              if (error) {
                resume(Effect.fail(
                  new SerializationFailed({
                    message: `Turtle serialization failed: ${error}`,
                    cause: error,
                    format: "Turtle"
                  })
                ))
              } else {
                resume(Effect.succeed(result))
              }
            })
          }),

        /**
         * SHACL validation placeholder
         *
         * Future: Integrate SHACL validator
         *
         * @param store - RdfStore to validate
         * @param shapesGraph - SHACL shapes as Turtle string
         * @returns Validation result
         */
        validate: (_store: RdfStore, _shapesGraph: string) =>
          Effect.succeed({
            conforms: true,
            report: "SHACL validation not yet implemented"
          })
      }
    }),
    dependencies: [ConfigService.Default],
    accessors: true
  }
) {}

================
File: src/Service/Retry.ts
================
/**
 * Service: Retry Policy Factory
 *
 * Provides shared retry policy with exponential backoff, jitter, and logging.
 * Used by all LLM-calling services for consistent retry behavior.
 *
 * @since 2.0.0
 * @module Service/Retry
 */

import { Duration, Effect, Schedule } from "effect"

/**
 * Options for creating a retry policy
 *
 * @since 2.0.0
 */
export interface RetryPolicyOptions {
  /**
   * Initial delay before first retry (milliseconds)
   */
  readonly initialDelayMs: number
  /**
   * Maximum delay between retries (milliseconds).
   * Caps exponential growth to prevent excessively long waits.
   * Defaults to 30000ms (30s) if not specified.
   */
  readonly maxDelayMs?: number
  /**
   * Maximum number of retry attempts
   */
  readonly maxAttempts: number
  /**
   * Service name for logging
   */
  readonly serviceName: string
}

/**
 * Default maximum delay between retries (30 seconds)
 */
const DEFAULT_MAX_DELAY_MS = 30_000

/**
 * Create a retry policy with exponential backoff, jitter, and logging
 *
 * Features:
 * - Exponential backoff starting from initialDelayMs
 * - Maximum delay cap to prevent excessively long waits (default 30s)
 * - Jitter to avoid thundering herd
 * - Logs each retry attempt with service name and attempt number
 * - Respects maxAttempts limit
 *
 * @param opts - Retry policy options
 * @returns Schedule for use with Effect.retry
 *
 * @example
 * ```typescript
 * const retryPolicy = makeRetryPolicy({
 *   initialDelayMs: 2000,
 *   maxDelayMs: 30000,
 *   maxAttempts: 5,
 *   serviceName: "EntityExtractor"
 * })
 *
 * yield* myEffect.pipe(Effect.retry(retryPolicy))
 * ```
 *
 * @since 2.0.0
 */
export const makeRetryPolicy = (opts: RetryPolicyOptions) => {
  const maxDelayMs = opts.maxDelayMs ?? DEFAULT_MAX_DELAY_MS
  const maxDelay = Duration.millis(maxDelayMs)

  return Schedule.exponential(Duration.millis(opts.initialDelayMs)).pipe(
    Schedule.intersect(Schedule.recurs(opts.maxAttempts - 1)),
    // Cap max delay to prevent excessively long waits (e.g. 192s → 30s)
    Schedule.delayed((d) => Duration.min(d, maxDelay)),
    Schedule.jittered,
    Schedule.tapOutput((attempt) => {
      // Calculate actual delay (capped)
      const rawDelayMs = Math.pow(2, attempt[1]) * opts.initialDelayMs
      const cappedDelayMs = Math.min(rawDelayMs, maxDelayMs)
      return Effect.logWarning("LLM retry attempt", {
        service: opts.serviceName,
        attempt: attempt[1] + 1,
        maxAttempts: opts.maxAttempts,
        nextDelayMs: cappedDelayMs,
        delayCapped: rawDelayMs > maxDelayMs
      })
    })
  )
}

================
File: src/Telemetry/CostCalculator.ts
================
/**
 * LLM Cost Calculator
 *
 * Calculates estimated costs based on token usage and model pricing.
 *
 * @module Telemetry/CostCalculator
 * @since 2.0.0
 */

/** Pricing per 1M tokens (as of Nov 2024) */
const PRICING: Record<string, { input: number; output: number }> = {
  // Anthropic
  "claude-3-5-sonnet-20241022": { input: 3.0, output: 15.0 },
  "claude-3-5-haiku-20241022": { input: 0.8, output: 4.0 },
  "claude-haiku-4-5": { input: 0.8, output: 4.0 },
  "claude-3-opus-20240229": { input: 15.0, output: 75.0 },

  // OpenAI
  "gpt-4o": { input: 2.5, output: 10.0 },
  "gpt-4o-mini": { input: 0.15, output: 0.6 },
  "gpt-4-turbo": { input: 10.0, output: 30.0 },

  // Google
  "gemini-2.0-flash": { input: 0.1, output: 0.4 },
  "gemini-1.5-pro": { input: 1.25, output: 5.0 },
  "gemini-1.5-flash": { input: 0.075, output: 0.3 }
}

/**
 * Get pricing for a model
 *
 * @param model - Model identifier
 * @returns Pricing info or undefined if unknown
 *
 * @since 2.0.0
 * @category pricing
 */
export const getPricing = (
  model: string
): { input: number; output: number } | undefined => PRICING[model]

/**
 * Calculate estimated cost for an LLM call
 *
 * @param model - Model identifier
 * @param inputTokens - Number of input tokens
 * @param outputTokens - Number of output tokens
 * @returns Estimated cost in USD (0 if model unknown)
 *
 * @since 2.0.0
 * @category pricing
 */
export const calculateCost = (
  model: string,
  inputTokens: number,
  outputTokens: number
): number => {
  const pricing = PRICING[model]
  if (!pricing) return 0

  const inputCost = (inputTokens / 1_000_000) * pricing.input
  const outputCost = (outputTokens / 1_000_000) * pricing.output
  return inputCost + outputCost
}

================
File: src/Telemetry/index.ts
================
/**
 * Telemetry Module Exports
 *
 * OpenTelemetry tracing, LLM attributes, and cost calculation.
 *
 * @since 2.0.0
 * @module Telemetry
 */

export * from "./CostCalculator.js"
export * from "./LlmAttributes.js"
export * from "./Tracing.js"
export * from "./TracingContext.js"

================
File: src/Telemetry/LlmAttributes.ts
================
/**
 * LLM Span Attributes
 *
 * Semantic conventions for LLM tracing following OpenTelemetry GenAI specs.
 *
 * @module Telemetry/LlmAttributes
 * @since 2.0.0
 */

import { Effect } from "effect"
import { calculateCost } from "./CostCalculator.js"

/**
 * Semantic conventions for LLM spans (OpenTelemetry GenAI)
 *
 * @since 2.0.0
 * @category constants
 */
export const LlmAttributes = {
  // Provider info (OpenTelemetry GenAI conventions)
  MODEL: "gen_ai.request.model",
  PROVIDER: "gen_ai.system",

  // Token counts
  INPUT_TOKENS: "gen_ai.usage.input_tokens",
  OUTPUT_TOKENS: "gen_ai.usage.output_tokens",
  TOTAL_TOKENS: "gen_ai.usage.total_tokens",

  // Cost tracking (custom)
  ESTIMATED_COST_USD: "llm.cost.usd",

  // Request details
  PROMPT_LENGTH: "gen_ai.prompt.length",
  PROMPT_TEXT: "gen_ai.prompt.text",
  RESPONSE_TEXT: "gen_ai.response.text",

  // Schema (custom - JSON Schema for structured output)
  REQUEST_SCHEMA: "gen_ai.request.schema",

  // Extraction-specific (custom)
  ENTITY_COUNT: "extraction.entity_count",
  RELATION_COUNT: "extraction.relation_count",
  MENTION_COUNT: "extraction.mention_count",
  CHUNK_INDEX: "extraction.chunk_index",
  CHUNK_TEXT_LENGTH: "extraction.chunk_text_length",
  CANDIDATE_CLASS_COUNT: "extraction.candidate_class_count",

  // Rate limiter (custom)
  RATE_LIMITER_WAIT_MS: "rate_limiter.wait_ms",
  LLM_CALL_ID: "llm.call_id",
  LLM_METHOD: "llm.method",

  // Retry tracking (custom)
  RETRY_COUNT: "retry.count",
  RETRY_MAX_ATTEMPTS: "retry.max_attempts",

  // Error tracking (OpenTelemetry semantic conventions)
  ERROR_TYPE: "error.type",
  ERROR_MESSAGE: "error.message"
} as const

/**
 * Annotate current span with LLM call metadata
 *
 * @param attrs - LLM call attributes
 * @returns Effect that annotates the current span
 *
 * @since 2.0.0
 * @category annotation
 */
export const annotateLlmCall = (attrs: {
  model: string
  provider: string
  promptLength: number
  inputTokens?: number
  outputTokens?: number
  promptText?: string
  responseText?: string
  schemaJson?: string
}): Effect.Effect<void> =>
  Effect.gen(function*() {
    yield* Effect.annotateCurrentSpan(LlmAttributes.MODEL, attrs.model)
    yield* Effect.annotateCurrentSpan(LlmAttributes.PROVIDER, attrs.provider)
    yield* Effect.annotateCurrentSpan(LlmAttributes.PROMPT_LENGTH, attrs.promptLength)

    if (attrs.inputTokens !== undefined) {
      yield* Effect.annotateCurrentSpan(LlmAttributes.INPUT_TOKENS, attrs.inputTokens)
    }
    if (attrs.outputTokens !== undefined) {
      yield* Effect.annotateCurrentSpan(LlmAttributes.OUTPUT_TOKENS, attrs.outputTokens)
    }
    if (attrs.inputTokens !== undefined && attrs.outputTokens !== undefined) {
      yield* Effect.annotateCurrentSpan(
        LlmAttributes.TOTAL_TOKENS,
        attrs.inputTokens + attrs.outputTokens
      )
      const cost = calculateCost(attrs.model, attrs.inputTokens, attrs.outputTokens)
      yield* Effect.annotateCurrentSpan(LlmAttributes.ESTIMATED_COST_USD, cost)
    }
    if (attrs.promptText !== undefined) {
      // Truncate prompt text to avoid huge spans
      yield* Effect.annotateCurrentSpan(
        LlmAttributes.PROMPT_TEXT,
        attrs.promptText.slice(0, 1000)
      )
    }
    if (attrs.responseText !== undefined) {
      yield* Effect.annotateCurrentSpan(
        LlmAttributes.RESPONSE_TEXT,
        attrs.responseText.slice(0, 1000)
      )
    }
    if (attrs.schemaJson !== undefined) {
      yield* Effect.annotateCurrentSpan(LlmAttributes.REQUEST_SCHEMA, attrs.schemaJson)
    }
  })

/**
 * Annotate current span with retry metadata
 *
 * @param attrs - Retry attributes
 * @returns Effect that annotates the current span
 *
 * @since 2.0.0
 * @category annotation
 */
export const annotateRetry = (attrs: {
  retryCount: number
  maxAttempts: number
}): Effect.Effect<void> =>
  Effect.all([
    Effect.annotateCurrentSpan(LlmAttributes.RETRY_COUNT, attrs.retryCount),
    Effect.annotateCurrentSpan(LlmAttributes.RETRY_MAX_ATTEMPTS, attrs.maxAttempts)
  ]).pipe(Effect.asVoid)

/**
 * Annotate current span with error metadata
 *
 * @param attrs - Error attributes
 * @returns Effect that annotates the current span
 *
 * @since 2.0.0
 * @category annotation
 */
export const annotateError = (attrs: {
  errorType: string
  errorMessage?: string
}): Effect.Effect<void> =>
  Effect.gen(function*() {
    yield* Effect.annotateCurrentSpan(LlmAttributes.ERROR_TYPE, attrs.errorType)
    if (attrs.errorMessage !== undefined) {
      // Truncate error message to avoid huge spans
      yield* Effect.annotateCurrentSpan(
        LlmAttributes.ERROR_MESSAGE,
        attrs.errorMessage.slice(0, 500)
      )
    }
  })

/**
 * Annotate current span with extraction metadata
 *
 * @param attrs - Extraction attributes
 * @returns Effect that annotates the current span
 *
 * @since 2.0.0
 * @category annotation
 */
export const annotateExtraction = (attrs: {
  chunkIndex?: number
  chunkTextLength?: number
  entityCount?: number
  relationCount?: number
  mentionCount?: number
  candidateClassCount?: number
}): Effect.Effect<void> =>
  Effect.gen(function*() {
    if (attrs.chunkIndex !== undefined) {
      yield* Effect.annotateCurrentSpan(LlmAttributes.CHUNK_INDEX, attrs.chunkIndex)
    }
    if (attrs.chunkTextLength !== undefined) {
      yield* Effect.annotateCurrentSpan(LlmAttributes.CHUNK_TEXT_LENGTH, attrs.chunkTextLength)
    }
    if (attrs.entityCount !== undefined) {
      yield* Effect.annotateCurrentSpan(LlmAttributes.ENTITY_COUNT, attrs.entityCount)
    }
    if (attrs.relationCount !== undefined) {
      yield* Effect.annotateCurrentSpan(LlmAttributes.RELATION_COUNT, attrs.relationCount)
    }
    if (attrs.mentionCount !== undefined) {
      yield* Effect.annotateCurrentSpan(LlmAttributes.MENTION_COUNT, attrs.mentionCount)
    }
    if (attrs.candidateClassCount !== undefined) {
      yield* Effect.annotateCurrentSpan(LlmAttributes.CANDIDATE_CLASS_COUNT, attrs.candidateClassCount)
    }
  })

================
File: src/Telemetry/Tracing.ts
================
/**
 * OpenTelemetry Tracing Layer
 *
 * Creates OTLP tracer layer using Effect's built-in OtlpTracer.
 * This avoids OpenTelemetry SDK version compatibility issues.
 *
 * @module Telemetry/Tracing
 * @since 2.0.0
 */

import { OtlpTracer } from "@effect/opentelemetry"
import type { HttpClient } from "@effect/platform/HttpClient"
import { Layer } from "effect"

/**
 * Tracing configuration
 *
 * @since 2.0.0
 * @category config
 */
export interface TracingConfig {
  /** Service name for traces */
  readonly serviceName: string
  /** OTLP endpoint URL (defaults to http://localhost:4318/v1/traces for Jaeger OTLP) */
  readonly otlpEndpoint?: string
  /** Enable/disable tracing (defaults to true) */
  readonly enabled?: boolean
}

/**
 * Create OpenTelemetry tracing layer using Effect's OtlpTracer.
 *
 * Uses Effect's built-in OTLP implementation which:
 * - Uses Effect's HttpClient for HTTP requests
 * - Has built-in batching and shutdown handling
 * - Avoids OpenTelemetry JS SDK version compatibility issues
 *
 * @param config - Tracing configuration
 * @returns Layer that provides tracing (requires HttpClient)
 *
 * @since 2.0.0
 * @category constructors
 */
export const makeTracingLayer = (
  config: TracingConfig
): Layer.Layer<never, never, HttpClient> => {
  if (config.enabled === false) {
    return Layer.empty as Layer.Layer<never, never, HttpClient>
  }

  // Default to Jaeger's OTLP endpoint (Jaeger supports OTLP natively)
  // For Jaeger: http://localhost:4318/v1/traces (OTLP HTTP)
  const otlpEndpoint = config.otlpEndpoint ?? "http://localhost:4318/v1/traces"

  return OtlpTracer.layer({
    url: otlpEndpoint,
    resource: {
      serviceName: config.serviceName
    },
    exportInterval: "1 seconds", // Export every second for faster feedback
    shutdownTimeout: "5 seconds"
  })
}

/**
 * Test layer (no-op)
 *
 * Use in tests to avoid OpenTelemetry setup overhead.
 *
 * @since 2.0.0
 * @category layers
 */
export const TracingTestLayer: Layer.Layer<never> = Layer.empty

================
File: src/Telemetry/TracingContext.ts
================
/**
 * Tracing Context Service
 *
 * Provides model and provider information for span annotations.
 * Thread this through your layer composition to enable LLM tracing.
 *
 * @module Telemetry/TracingContext
 * @since 2.0.0
 */

import { Context, Layer } from "effect"

/**
 * Tracing context interface
 *
 * @since 2.0.0
 * @category models
 */
export interface TracingContextShape {
  readonly model: string
  readonly provider: string
}

const TracingContextTag = Context.GenericTag<TracingContextShape>("TracingContext")

/**
 * TracingContext tag and utilities
 *
 * Provides model/provider info for LLM span annotations.
 *
 * @since 2.0.0
 * @category services
 */
export const TracingContext = Object.assign(TracingContextTag, {
  /**
   * Default layer with unknown model/provider
   *
   * @since 2.0.0
   * @category layers
   */
  Default: Layer.succeed(TracingContextTag, {
    model: "unknown",
    provider: "unknown"
  }),

  /**
   * Create a TracingContext layer with specific model/provider
   *
   * @param model - Model identifier
   * @param provider - Provider name
   * @returns Layer providing TracingContext
   *
   * @since 2.0.0
   * @category constructors
   */
  make: (model: string, provider: string) =>
    Layer.succeed(TracingContextTag, {
      model,
      provider
    })
})

================
File: src/Utils/index.ts
================
/**
 * Utility Module Exports
 *
 * @since 2.0.0
 * @module Utils
 */

export * from "./Iri.js"
export * from "./Rdf.js"
export * from "./String.js"

================
File: src/Utils/Iri.ts
================
/**
 * IRI Utilities
 *
 * Provides case-insensitive IRI matching and normalization utilities.
 * Used to handle casing mismatches between ontology IRI local names (PascalCase)
 * and rdfs:label values (camelCase) that cause LLM extraction failures.
 *
 * @since 2.0.0
 * @module Utils/Iri
 */

/**
 * Build a case-insensitive lookup map from IRIs.
 *
 * Creates a Map where keys are lowercase IRIs and values are the original canonical IRIs.
 * This allows case-insensitive matching while preserving the canonical form.
 *
 * @param iris - Array of canonical IRIs
 * @returns Map from lowercase IRI to canonical IRI
 *
 * @example
 * ```typescript
 * const map = buildCaseInsensitiveIriMap([
 *   "http://ontology/TeamRanking",
 *   "http://ontology/PlayerName"
 * ])
 * // map.get("http://ontology/teamranking") => "http://ontology/TeamRanking"
 * ```
 *
 * @since 2.0.0
 */
export const buildCaseInsensitiveIriMap = (
  iris: ReadonlyArray<string>
): Map<string, string> => new Map(iris.map((iri) => [iri.toLowerCase(), iri]))

/**
 * Normalize an IRI to its canonical form using case-insensitive matching.
 *
 * If the input IRI matches a canonical IRI (case-insensitively), returns the canonical form.
 * Otherwise, returns the input unchanged.
 *
 * @param input - IRI to normalize (potentially with wrong casing)
 * @param iriMap - Case-insensitive lookup map from buildCaseInsensitiveIriMap
 * @returns Canonical IRI if found, otherwise the input unchanged
 *
 * @example
 * ```typescript
 * const map = buildCaseInsensitiveIriMap(["http://ontology/TeamRanking"])
 * normalizeIri("http://ontology/teamranking", map) // => "http://ontology/TeamRanking"
 * normalizeIri("http://ontology/Unknown", map) // => "http://ontology/Unknown"
 * ```
 *
 * @since 2.0.0
 */
export const normalizeIri = (
  input: string,
  iriMap: Map<string, string>
): string => iriMap.get(input.toLowerCase()) ?? input

/**
 * Normalize an array of IRIs to their canonical forms.
 *
 * @param inputs - Array of IRIs to normalize
 * @param iriMap - Case-insensitive lookup map from buildCaseInsensitiveIriMap
 * @returns Array of normalized IRIs
 *
 * @since 2.0.0
 */
export const normalizeIris = (
  inputs: ReadonlyArray<string>,
  iriMap: Map<string, string>
): ReadonlyArray<string> => inputs.map((iri) => normalizeIri(iri, iriMap))

/**
 * Check if an IRI exists in the canonical set (case-insensitively).
 *
 * @param input - IRI to check
 * @param iriMap - Case-insensitive lookup map from buildCaseInsensitiveIriMap
 * @returns true if the IRI exists (case-insensitively)
 *
 * @since 2.0.0
 */
export const iriExistsCaseInsensitive = (
  input: string,
  iriMap: Map<string, string>
): boolean => iriMap.has(input.toLowerCase())

================
File: src/Utils/Rdf.ts
================
/**
 * RDF Utilities
 *
 * Pure utility functions for RDF operations:
 * - IRI validation and construction
 * - Datatype conversion (JS → RDF literals)
 * - N3 term builders with validation
 * - Entity/Relation transformations
 *
 * @since 2.0.0
 * @module Utils/Rdf
 */

import { Schema } from "effect"
import type * as N3 from "n3"
import type { Entity, Relation } from "../Domain/Model/Entity.js"

/**
 * IRI Schema - Validates IRI format
 *
 * Uses Schema.pattern with RFC 3987-compliant regex.
 * Ensures IRIs are well-formed before N3 operations.
 */
export const IriSchema = Schema.String.pipe(
  Schema.pattern(
    /^[a-z][a-z0-9+.-]*:[^\s]*$/i,
    {
      title: "IRI",
      description: "Internationalized Resource Identifier (RFC 3987)"
    }
  )
)

export type Iri = typeof IriSchema.Type

/**
 * Build IRI from base namespace and local name
 *
 * Validates the resulting IRI against IriSchema.
 *
 * @param baseNamespace - Base namespace (must end with / or #)
 * @param localName - Local part of the IRI
 * @returns Validated IRI string
 *
 * @example
 * ```typescript
 * buildIri("http://example.org/", "thing1")
 * // => "http://example.org/thing1"
 * ```
 */
export const buildIri = (baseNamespace: string, localName: string): Iri => {
  const iri = `${baseNamespace}${localName}`
  return Schema.decodeSync(IriSchema)(iri)
}

/**
 * Extract local name from IRI (part after last / or #)
 *
 * Pure function that extracts the local name portion of an IRI.
 * Handles both slash-separated and hash-separated IRIs.
 *
 * @param iri - Full IRI string
 * @returns Local name portion of the IRI
 *
 * @example
 * ```typescript
 * extractLocalName("http://example.org/Person")
 * // => "Person"
 *
 * extractLocalName("http://www.w3.org/2001/XMLSchema#string")
 * // => "string"
 * ```
 */
export const extractLocalName = (iri: string): string => {
  const lastSlash = iri.lastIndexOf("/")
  const lastHash = iri.lastIndexOf("#")
  const lastIndex = Math.max(lastSlash, lastHash)
  return lastIndex >= 0 ? iri.slice(lastIndex + 1) : iri
}

/**
 * Sync transform helper: Array of IRIs to array of local names
 *
 * Pure function that transforms an array of full IRIs to local names.
 * Can be composed with other transforms or used in Schema.transform.
 *
 * @param iris - Array of full IRI strings
 * @returns Array of local name strings
 *
 * @example
 * ```typescript
 * transformIriArrayToLocalNames([
 *   "http://example.org/Person",
 *   "http://example.org/Organization"
 * ])
 * // => ["Person", "Organization"]
 * ```
 */
export const transformIriArrayToLocalNames = (iris: ReadonlyArray<string>): ReadonlyArray<string> =>
  iris.map(extractLocalName)

/**
 * Sync transform helper: Array of local names to array of IRIs
 *
 * Pure function that transforms an array of local names to full IRIs.
 * Reverse of transformIriArrayToLocalNames.
 *
 * @param localNames - Array of local name strings
 * @param baseNamespace - Base namespace to prepend
 * @returns Array of full IRI strings
 *
 * @example
 * ```typescript
 * transformLocalNamesToIriArray(["Person", "Organization"], "http://example.org/")
 * // => ["http://example.org/Person", "http://example.org/Organization"]
 * ```
 */
export const transformLocalNamesToIriArray = (
  localNames: ReadonlyArray<string>,
  baseNamespace: string
): ReadonlyArray<string> => localNames.map((name) => `${baseNamespace}${name}`)

/**
 * Schema transform: Array of IRIs to array of local names
 *
 * Transforms an array of full IRIs to an array of local names.
 * Can be composed with other Schema transforms using Schema.compose.
 *
 * @param baseNamespace - Optional base namespace for encoding (reverse transform)
 * @returns Schema that transforms Array<IRI> <-> Array<localName>
 *
 * @example
 * ```typescript
 * const LocalNamesFromIris = iriArrayToLocalNameArrayTransform()
 * Schema.decodeUnknownSync(LocalNamesFromIris)([
 *   "http://example.org/Person",
 *   "http://example.org/Organization"
 * ])
 * // => ["Person", "Organization"]
 * ```
 *
 * @example
 * ```typescript
 * // Compose with other transforms
 * const schema = Schema.compose(
 *   Schema.Array(Schema.String), // Input: array of IRIs
 *   iriArrayToLocalNameArrayTransform() // Output: array of local names
 * )
 * ```
 */
export const iriArrayToLocalNameArrayTransform = (baseNamespace?: string) =>
  Schema.transform(
    Schema.Array(Schema.String),
    Schema.Array(Schema.String),
    {
      strict: true,
      decode: transformIriArrayToLocalNames,
      encode: baseNamespace
        ? (localNames) => transformLocalNamesToIriArray(localNames, baseNamespace)
        : (localNames) => localNames
    }
  )

/**
 * Schema transform: IRI string to local name string
 *
 * Transforms a full IRI to its local name portion.
 * Can be composed with other Schema transforms using Schema.compose.
 *
 * @param baseNamespace - Optional base namespace for encoding (reverse transform)
 * @returns Schema that transforms IRI <-> local name
 *
 * @example
 * ```typescript
 * const LocalNameFromIri = iriToLocalNameTransform("http://example.org/")
 * Schema.decodeUnknownSync(LocalNameFromIri)("http://example.org/Person")
 * // => "Person"
 * ```
 *
 * @example
 * ```typescript
 * // Compose with other transforms
 * const schema = Schema.compose(
 *   Schema.String, // Input: IRI
 *   iriToLocalNameTransform() // Output: local name
 * )
 * ```
 */
export const iriToLocalNameTransform = (baseNamespace?: string) =>
  Schema.transform(
    Schema.String,
    Schema.String,
    {
      strict: true,
      decode: extractLocalName,
      encode: baseNamespace
        ? (localName) => `${baseNamespace}${localName}`
        : (localName) => localName
    }
  )

/**
 * Datatype for RDF literals
 */
export type RdfDatatype = "string" | "decimal" | "boolean" | "dateTime" | "integer"

/**
 * Get XSD datatype IRI for value type
 *
 * @param value - JavaScript value
 * @returns XSD datatype IRI
 *
 * @example
 * ```typescript
 * getXsdDatatype(42)        // => "http://www.w3.org/2001/XMLSchema#decimal"
 * getXsdDatatype("hello")   // => undefined (plain literal)
 * getXsdDatatype(true)      // => "http://www.w3.org/2001/XMLSchema#boolean"
 * ```
 */
export const getXsdDatatype = (
  value: string | number | boolean,
  xsdPrefix: string = "http://www.w3.org/2001/XMLSchema#"
): string | undefined => {
  if (typeof value === "number") {
    return Number.isInteger(value)
      ? `${xsdPrefix}integer`
      : `${xsdPrefix}decimal`
  }

  if (typeof value === "boolean") {
    return `${xsdPrefix}boolean`
  }

  // Strings are plain literals (no datatype)
  return undefined
}

/**
 * N3 Term Builders
 *
 * Wrappers around N3.DataFactory with validation.
 */
export interface N3TermBuilders {
  readonly namedNode: (iri: string) => N3.NamedNode
  readonly literal: (value: string, languageOrDatatype?: string | N3.NamedNode) => N3.Literal
  readonly quad: (
    subject: N3.Quad_Subject,
    predicate: N3.Quad_Predicate,
    object: N3.Quad_Object,
    graph?: N3.Quad_Graph
  ) => N3.Quad
}

/**
 * Create N3 term builders with IRI validation
 *
 * @param dataFactory - N3.DataFactory instance
 * @param validateIris - Whether to validate IRIs (default: true)
 * @returns Term builders with optional validation
 */
export const createN3Builders = (
  dataFactory: typeof N3.DataFactory,
  validateIris: boolean = true
): N3TermBuilders => {
  const { literal: rawLiteral, namedNode: rawNamedNode, quad: rawQuad } = dataFactory

  return {
    namedNode: (iri: string) => {
      if (validateIris) {
        // Validate IRI format
        Schema.decodeSync(IriSchema)(iri)
      }
      return rawNamedNode(iri)
    },

    literal: rawLiteral,

    quad: rawQuad
  }
}

/**
 * Convert JavaScript value to N3 literal with appropriate datatype
 *
 * @param value - JavaScript value (string, number, boolean)
 * @param prefixes - RDF prefixes for datatype IRIs
 * @param builders - N3 term builders
 * @returns N3 Literal term
 *
 * @example
 * ```typescript
 * valueToLiteral(42, { xsd: "..." }, builders)
 * // => Literal("42", NamedNode("xsd:decimal"))
 *
 * valueToLiteral("hello", prefixes, builders)
 * // => Literal("hello")
 * ```
 */
export const valueToLiteral = (
  value: string | number | boolean,
  prefixes: Record<string, string>,
  builders: N3TermBuilders
): N3.Literal => {
  const valueStr = String(value)

  if (typeof value === "string") {
    return builders.literal(valueStr)
  }

  const datatypeIri = getXsdDatatype(value, prefixes.xsd)

  if (datatypeIri) {
    return builders.literal(valueStr, builders.namedNode(datatypeIri))
  }

  return builders.literal(valueStr)
}

/**
 * Build RDF type triple (rdf:type)
 *
 * @param subject - Subject IRI
 * @param typeIri - Class type IRI
 * @param prefixes - RDF prefixes
 * @param builders - N3 term builders
 * @returns N3 Quad
 */
export const buildTypeTriple = (
  subject: N3.NamedNode,
  typeIri: string,
  prefixes: Record<string, string>,
  builders: N3TermBuilders
): N3.Quad => {
  return builders.quad(
    subject,
    builders.namedNode(`${prefixes.rdf}type`),
    builders.namedNode(typeIri)
  )
}

/**
 * Build rdfs:label triple
 *
 * @param subject - Subject IRI
 * @param label - Label text
 * @param prefixes - RDF prefixes
 * @param builders - N3 term builders
 * @returns N3 Quad
 */
export const buildLabelTriple = (
  subject: N3.NamedNode,
  label: string,
  prefixes: Record<string, string>,
  builders: N3TermBuilders
): N3.Quad => {
  return builders.quad(
    subject,
    builders.namedNode(`${prefixes.rdfs}label`),
    builders.literal(label)
  )
}

/**
 * Split camelCase string into words
 *
 * Converts camelCase identifiers into space-separated words for better searchability.
 * Handles both camelCase and PascalCase.
 *
 * @param text - camelCase or PascalCase string
 * @returns Space-separated words
 *
 * @example
 * ```typescript
 * splitCamelCase("birthPlace")     // => "birth Place"
 * splitCamelCase("FirstName")       // => "First Name"
 * splitCamelCase("XMLHttpRequest") // => "XML Http Request"
 * splitCamelCase("already spaced") // => "already spaced"
 * ```
 */
export const splitCamelCase = (text: string): string => {
  return text
    .replace(/([a-z])([A-Z])/g, "$1 $2") // Insert space before capital letters
    .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2") // Handle consecutive capitals
    .trim()
}

/**
 * Generate n-grams from text
 *
 * Creates sliding window n-grams from tokenized text for improved search matching.
 * Useful for matching multi-word phrases and improving recall.
 *
 * @param tokens - Array of tokens
 * @param n - N-gram size (default: 2 for bigrams)
 * @returns Array of n-gram strings
 *
 * @example
 * ```typescript
 * generateNGrams(["birth", "place", "location"], 2)
 * // => ["birth place", "place location"]
 *
 * generateNGrams(["person", "name"], 3)
 * // => ["person name"] (only one trigram possible)
 * ```
 */
export const generateNGrams = (tokens: ReadonlyArray<string>, n: number = 2): ReadonlyArray<string> => {
  if (tokens.length < n) {
    return []
  }

  const ngrams: Array<string> = []
  for (let i = 0; i <= tokens.length - n; i++) {
    ngrams.push(tokens.slice(i, i + n).join(" "))
  }
  return ngrams
}

/**
 * Enhance text for search by splitting camelCase and adding n-grams
 *
 * Takes a text string, splits camelCase words, tokenizes, and generates n-grams.
 * This creates a richer representation for BM25 indexing.
 *
 * @param text - Input text
 * @param ngramSize - Size of n-grams to generate (default: 2)
 * @returns Enhanced text with camelCase split and n-grams
 *
 * @example
 * ```typescript
 * enhanceTextForSearch("birthPlace location")
 * // => "birthPlace location birth place location birth place place location"
 * ```
 */
export const enhanceTextForSearch = (text: string, ngramSize: number = 2): string => {
  // Split camelCase in the original text
  const camelCaseSplit = splitCamelCase(text)

  // Tokenize (split on whitespace and normalize)
  const tokens = camelCaseSplit
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 0)

  // Generate n-grams
  const ngrams = generateNGrams(tokens, ngramSize)

  // Combine original text, camelCase split, and n-grams
  const parts: Array<string> = [text, camelCaseSplit]
  if (ngrams.length > 0) {
    for (const ngram of ngrams) {
      parts.push(ngram)
    }
  }

  return parts.join(" ")
}

/**
 * RDF Prefixes configuration
 *
 * Standard prefixes: rdf, rdfs, xsd, plus any additional custom prefixes
 */
export type RdfPrefixes = Record<string, string>

/**
 * Convert Entity to RDF quads
 *
 * Pure transformation: Entity domain model → N3 quads
 *
 * Generates:
 * - rdf:type triples for each type
 * - rdfs:label for mention
 * - Attribute triples with proper datatypes
 *
 * @param entity - Entity domain object
 * @param baseNamespace - Base IRI namespace
 * @param prefixes - RDF prefixes
 * @param builders - N3 term builders
 * @returns Array of N3 quads
 *
 * @example
 * ```typescript
 * const entity = new Entity({
 *   id: "alice",
 *   mention: "Alice",
 *   types: ["http://schema.org/Person"],
 *   attributes: { "http://schema.org/age": 30 }
 * })
 *
 * const quads = entityToQuads(entity, "http://ex.org/", prefixes, builders)
 * // => [
 * //   Quad(:alice, rdf:type, schema:Person),
 * //   Quad(:alice, rdfs:label, "Alice"),
 * //   Quad(:alice, schema:age, "30"^^xsd:integer)
 * // ]
 * ```
 */
export const entityToQuads = (
  entity: Entity,
  baseNamespace: string,
  prefixes: RdfPrefixes,
  builders: N3TermBuilders
): ReadonlyArray<N3.Quad> => {
  const quads: Array<N3.Quad> = []

  // Create subject IRI
  const subjectIri = buildIri(baseNamespace, entity.id)
  const subject = builders.namedNode(subjectIri)

  // Add rdf:type triples
  for (const typeIri of entity.types) {
    quads.push(buildTypeTriple(subject, typeIri, prefixes, builders))
  }

  // Add rdfs:label
  quads.push(buildLabelTriple(subject, entity.mention, prefixes, builders))

  // Add attribute triples
  for (const [predicate, value] of Object.entries(entity.attributes)) {
    // Check if predicate is already a valid IRI
    let predicateIri: string
    try {
      // Try to validate as IRI - if it passes, use as-is
      Schema.decodeSync(IriSchema)(predicate)
      predicateIri = predicate
    } catch {
      // Not a valid IRI - try to convert using schema.org prefix or base namespace
      // First try schema.org (common for attributes)
      if (prefixes.schema) {
        predicateIri = `${prefixes.schema}${predicate}`
      } else {
        // Fall back to base namespace
        predicateIri = buildIri(baseNamespace, predicate)
      }
    }

    const objectTerm = valueToLiteral(value, prefixes, builders)
    quads.push(builders.quad(subject, builders.namedNode(predicateIri), objectTerm))
  }

  return quads
}

/**
 * Convert Relation to RDF quad
 *
 * Pure transformation: Relation domain model → N3 quad
 *
 * Handles both:
 * - Entity references (subject → predicate → object entity)
 * - Literal values (subject → predicate → literal)
 *
 * @param relation - Relation domain object
 * @param baseNamespace - Base IRI namespace
 * @param prefixes - RDF prefixes
 * @param builders - N3 term builders
 * @returns N3 Quad
 *
 * @example
 * ```typescript
 * const relation = new Relation({
 *   subjectId: "alice",
 *   predicate: "http://schema.org/knows",
 *   object: "bob"  // Entity reference
 * })
 *
 * const quad = relationToQuad(relation, "http://ex.org/", prefixes, builders)
 * // => Quad(:alice, schema:knows, :bob)
 * ```
 */
export const relationToQuad = (
  relation: Relation,
  baseNamespace: string,
  prefixes: RdfPrefixes,
  builders: N3TermBuilders
): N3.Quad => {
  // Build subject
  const subjectIri = buildIri(baseNamespace, relation.subjectId)
  const subject = builders.namedNode(subjectIri)

  // Build predicate
  const predicate = builders.namedNode(relation.predicate)

  // Build object (entity reference or literal)
  let objectTerm: N3.Quad_Object

  if (relation.isEntityReference) {
    // Object is an entity reference
    const objectIri = buildIri(baseNamespace, relation.object as string)
    objectTerm = builders.namedNode(objectIri)
  } else {
    // Object is a literal value
    objectTerm = valueToLiteral(relation.object, prefixes, builders)
  }

  return builders.quad(subject, predicate, objectTerm)
}

================
File: src/Utils/String.ts
================
/**
 * String Utilities
 *
 * Pure utility functions for string operations:
 * - Similarity calculations (Levenshtein, Jaccard, containment)
 * - Normalization and canonicalization
 * - Token-based operations
 *
 * @since 2.0.0
 * @module Utils/String
 */

/**
 * Normalize a string for comparison
 *
 * Converts to lowercase, trims whitespace, and normalizes internal spacing.
 *
 * @param text - Input string
 * @returns Normalized string
 *
 * @example
 * ```typescript
 * normalizeString("  Hello   World  ")
 * // => "hello world"
 * ```
 */
export const normalizeString = (text: string): string => text.toLowerCase().trim().replace(/\s+/g, " ")

/**
 * Calculate Levenshtein edit distance between two strings
 *
 * Uses dynamic programming for O(mn) time and O(min(m,n)) space.
 *
 * @param a - First string
 * @param b - Second string
 * @returns Number of edits (insertions, deletions, substitutions)
 *
 * @example
 * ```typescript
 * levenshteinDistance("kitten", "sitting")
 * // => 3
 * ```
 */
export const levenshteinDistance = (a: string, b: string): number => {
  // Optimize for common cases
  if (a === b) return 0
  if (a.length === 0) return b.length
  if (b.length === 0) return a.length

  // Ensure a is the shorter string for space optimization
  if (a.length > b.length) {
    ;[a, b] = [b, a]
  }

  // Use two rows instead of full matrix
  let prevRow = Array.from({ length: a.length + 1 }, (_, i) => i)
  let currRow = new Array<number>(a.length + 1)

  for (let j = 1; j <= b.length; j++) {
    currRow[0] = j
    for (let i = 1; i <= a.length; i++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      currRow[i] = Math.min(
        prevRow[i] + 1, // deletion
        currRow[i - 1] + 1, // insertion
        prevRow[i - 1] + cost // substitution
      )
    }
    ;[prevRow, currRow] = [currRow, prevRow]
  }

  return prevRow[a.length]
}

/**
 * Calculate normalized Levenshtein similarity (0.0 to 1.0)
 *
 * Returns 1.0 for identical strings, 0.0 for completely different strings.
 *
 * @param a - First string
 * @param b - Second string
 * @returns Similarity score between 0.0 and 1.0
 *
 * @example
 * ```typescript
 * levenshteinSimilarity("hello", "hallo")
 * // => 0.8 (1 edit out of 5 chars)
 * ```
 */
export const levenshteinSimilarity = (a: string, b: string): number => {
  if (a === b) return 1.0
  if (a.length === 0 || b.length === 0) return 0.0

  const maxLen = Math.max(a.length, b.length)
  const distance = levenshteinDistance(a.toLowerCase(), b.toLowerCase())
  return 1.0 - distance / maxLen
}

/**
 * Check if one string contains another (case-insensitive)
 *
 * @param text - Text to search in
 * @param substring - Substring to search for
 * @returns True if text contains substring
 *
 * @example
 * ```typescript
 * containsIgnoreCase("Eberechi Eze", "Eze")
 * // => true
 * ```
 */
export const containsIgnoreCase = (text: string, substring: string): boolean =>
  text.toLowerCase().includes(substring.toLowerCase())

/**
 * Check bidirectional containment between two strings
 *
 * Returns true if either string contains the other.
 * Useful for matching "Eze" with "Eberechi Eze".
 *
 * @param a - First string
 * @param b - Second string
 * @returns True if either contains the other
 *
 * @example
 * ```typescript
 * hasBidirectionalContainment("Eze", "Eberechi Eze")
 * // => true
 * ```
 */
export const hasBidirectionalContainment = (a: string, b: string): boolean =>
  containsIgnoreCase(a, b) || containsIgnoreCase(b, a)

/**
 * Calculate Jaccard similarity between two token sets
 *
 * Jaccard = |intersection| / |union|
 *
 * @param tokensA - First token set
 * @param tokensB - Second token set
 * @returns Similarity score between 0.0 and 1.0
 *
 * @example
 * ```typescript
 * jaccardSimilarity(["hello", "world"], ["hello", "there"])
 * // => 0.333 (1 common out of 3 unique)
 * ```
 */
export const jaccardSimilarity = (
  tokensA: ReadonlyArray<string>,
  tokensB: ReadonlyArray<string>
): number => {
  if (tokensA.length === 0 && tokensB.length === 0) return 1.0
  if (tokensA.length === 0 || tokensB.length === 0) return 0.0

  const setA = new Set(tokensA.map((t) => t.toLowerCase()))
  const setB = new Set(tokensB.map((t) => t.toLowerCase()))

  let intersectionSize = 0
  for (const token of setA) {
    if (setB.has(token)) {
      intersectionSize++
    }
  }

  const unionSize = setA.size + setB.size - intersectionSize
  return unionSize > 0 ? intersectionSize / unionSize : 0.0
}

/**
 * Tokenize a string into words (simple whitespace split)
 *
 * Splits on whitespace and filters empty tokens.
 * For more advanced tokenization, use NlpService.
 *
 * @param text - Input text
 * @returns Array of tokens
 *
 * @example
 * ```typescript
 * simpleTokenize("Hello, World!")
 * // => ["Hello,", "World!"]
 * ```
 */
export const simpleTokenize = (text: string): ReadonlyArray<string> => text.split(/\s+/).filter((t) => t.length > 0)

/**
 * Calculate token-based similarity using Jaccard
 *
 * Tokenizes both strings and computes Jaccard similarity.
 *
 * @param a - First string
 * @param b - Second string
 * @returns Similarity score between 0.0 and 1.0
 *
 * @example
 * ```typescript
 * tokenSimilarity("Arsenal FC", "Arsenal Football Club")
 * // => 0.333 (1 common token out of 4 unique)
 * ```
 */
export const tokenSimilarity = (a: string, b: string): number => jaccardSimilarity(simpleTokenize(a), simpleTokenize(b))

/**
 * Calculate combined similarity score
 *
 * Combines Levenshtein similarity and containment check
 * for robust entity matching.
 *
 * @param a - First string
 * @param b - Second string
 * @returns Similarity score between 0.0 and 1.0
 *
 * @example
 * ```typescript
 * combinedSimilarity("Eze", "Eberechi Eze")
 * // => 1.0 (containment match)
 *
 * combinedSimilarity("Ronaldo", "Ronald")
 * // => ~0.86 (high Levenshtein similarity)
 * ```
 */
export const combinedSimilarity = (a: string, b: string): number => {
  // Perfect match
  if (a.toLowerCase() === b.toLowerCase()) return 1.0

  // Containment check (one is substring of other)
  if (hasBidirectionalContainment(a, b)) return 1.0

  // Fall back to Levenshtein similarity
  return levenshteinSimilarity(a, b)
}

/**
 * Calculate overlap ratio between two arrays
 *
 * Returns the ratio of shared elements to the smaller array size.
 *
 * @param arrA - First array
 * @param arrB - Second array
 * @returns Overlap ratio between 0.0 and 1.0
 *
 * @example
 * ```typescript
 * overlapRatio(["Player", "Person"], ["Player", "Athlete"])
 * // => 0.5 (1 shared out of min(2, 2))
 * ```
 */
export const overlapRatio = <T>(
  arrA: ReadonlyArray<T>,
  arrB: ReadonlyArray<T>
): number => {
  if (arrA.length === 0 || arrB.length === 0) return 0.0

  const setB = new Set(arrB)
  const intersection = arrA.filter((item) => setB.has(item))

  const smallerSize = Math.min(arrA.length, arrB.length)
  return intersection.length / smallerSize
}

/**
 * Generate snake_case ID from human-readable text
 *
 * Converts text to lowercase snake_case identifier.
 *
 * @param text - Human-readable text
 * @returns snake_case identifier
 *
 * @example
 * ```typescript
 * toSnakeCase("Cristiano Ronaldo")
 * // => "cristiano_ronaldo"
 *
 * toSnakeCase("Arsenal F.C.")
 * // => "arsenal_fc"
 * ```
 */
export const toSnakeCase = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // Remove special chars except dash
    .replace(/\s+/g, "_") // Spaces to underscores
    .replace(/_+/g, "_") // Multiple underscores to single
    .replace(/^_|_$/g, "") // Trim leading/trailing underscores
    .replace(/^[0-9]/, "e$&") // Ensure starts with letter

================
File: src/Workflow/EntityResolution.ts
================
/**
 * Workflow: Entity Resolution
 *
 * Post-extraction entity resolution to merge duplicate/coreference entities.
 * Handles cases like "Eze" and "Eberechi Eze" being the same person.
 *
 * @since 2.0.0
 * @module Workflow/EntityResolution
 */

import { Effect } from "effect"
import { Entity, KnowledgeGraph, Relation } from "../Domain/Model/Entity.js"
import { combinedSimilarity, overlapRatio } from "../Utils/String.js"

/**
 * Configuration for entity resolution
 */
export interface EntityResolutionConfig {
  /**
   * Minimum string similarity threshold for mention matching (0.0 to 1.0)
   * Higher values require more similar mentions to be considered matches
   *
   * @default 0.7
   */
  readonly mentionSimilarityThreshold: number

  /**
   * Whether to require type overlap for entity merging
   *
   * @default true
   */
  readonly requireTypeOverlap: boolean

  /**
   * Minimum ratio of type overlap (0.0 to 1.0)
   * Only used if requireTypeOverlap is true
   *
   * @default 0.5
   */
  readonly typeOverlapRatio: number
}

const DEFAULT_CONFIG: EntityResolutionConfig = {
  mentionSimilarityThreshold: 0.7,
  requireTypeOverlap: true,
  typeOverlapRatio: 0.5
}

/**
 * Check if two entities should be merged based on similarity criteria
 *
 * @internal
 */
const shouldMerge = (
  entityA: Entity,
  entityB: Entity,
  config: EntityResolutionConfig
): boolean => {
  // Calculate mention similarity using combined approach
  const similarity = combinedSimilarity(entityA.mention, entityB.mention)

  if (similarity < config.mentionSimilarityThreshold) return false

  // Check type overlap if required
  if (config.requireTypeOverlap) {
    const overlap = overlapRatio(entityA.types, entityB.types)
    if (overlap < config.typeOverlapRatio) return false
  }

  return true
}

/**
 * Find clusters of entities that should be merged using union-find
 *
 * @internal
 */
const findEntityClusters = (
  entities: ReadonlyArray<Entity>,
  config: EntityResolutionConfig
): Map<string, Array<string>> => {
  const parent = new Map<string, string>()

  const find = (id: string): string => {
    if (!parent.has(id)) parent.set(id, id)
    if (parent.get(id) !== id) parent.set(id, find(parent.get(id)!))
    return parent.get(id)!
  }

  const union = (idA: string, idB: string): void => {
    const rootA = find(idA)
    const rootB = find(idB)
    if (rootA !== rootB) {
      // Prefer shorter ID as root (usually more canonical)
      parent.set(rootA.length <= rootB.length ? rootB : rootA, rootA.length <= rootB.length ? rootA : rootB)
    }
  }

  // Compare all pairs of entities
  for (let i = 0; i < entities.length; i++) {
    for (let j = i + 1; j < entities.length; j++) {
      if (shouldMerge(entities[i], entities[j], config)) {
        union(entities[i].id, entities[j].id)
      }
    }
  }

  // Build clusters
  const clusters = new Map<string, Array<string>>()
  for (const entity of entities) {
    const root = find(entity.id)
    if (!clusters.has(root)) clusters.set(root, [])
    clusters.get(root)!.push(entity.id)
  }

  return clusters
}

/**
 * Merge a cluster of entities into a single canonical entity
 *
 * @internal
 */
const mergeEntityCluster = (
  clusterIds: ReadonlyArray<string>,
  entityMap: Map<string, Entity>
): Entity => {
  const entities = clusterIds.map((id) => entityMap.get(id)!).filter(Boolean)

  if (entities.length === 0) throw new Error("Cannot merge empty cluster")
  if (entities.length === 1) return entities[0]

  // Select canonical entity (prefer longest mention - usually most complete)
  const sorted = [...entities].sort((a, b) => b.mention.length - a.mention.length)
  const canonical = sorted[0]

  // Merge types using frequency voting
  const typeFreq = new Map<string, number>()
  for (const entity of entities) {
    for (const type of entity.types) {
      typeFreq.set(type, (typeFreq.get(type) || 0) + 1)
    }
  }

  // Select types appearing in at least half the entities
  const threshold = Math.ceil(entities.length / 2)
  const mergedTypes = Array.from(typeFreq.entries())
    .filter(([_, count]) => count >= threshold)
    .map(([type]) => type)

  const finalTypes = mergedTypes.length > 0 ? mergedTypes : canonical.types

  // Merge attributes (prefer values from longer mentions)
  const mergedAttrs: Record<string, string | number | boolean> = {}
  for (const entity of sorted) {
    for (const [key, value] of Object.entries(entity.attributes)) {
      if (!(key in mergedAttrs)) mergedAttrs[key] = value
    }
  }

  return new Entity({
    id: canonical.id,
    mention: canonical.mention,
    types: finalTypes as Array<string>,
    attributes: mergedAttrs
  })
}

/**
 * Resolve entity coreferences in a knowledge graph
 *
 * Identifies and merges duplicate entities based on mention similarity
 * and type compatibility. Updates relations to point to canonical entities.
 *
 * @param graph - Input knowledge graph
 * @param config - Resolution configuration (optional)
 * @returns Effect yielding resolved knowledge graph
 *
 * @example
 * ```typescript
 * const resolved = yield* resolveEntities(graph, {
 *   mentionSimilarityThreshold: 0.7,
 *   requireTypeOverlap: true
 * })
 * ```
 *
 * @since 2.0.0
 * @category Workflows
 */
export const resolveEntities = (
  graph: KnowledgeGraph,
  config: Partial<EntityResolutionConfig> = {}
): Effect.Effect<KnowledgeGraph, never, never> =>
  Effect.gen(function*() {
    const cfg: EntityResolutionConfig = { ...DEFAULT_CONFIG, ...config }

    yield* Effect.logInfo("Starting entity resolution", {
      stage: "entity-resolution",
      entityCount: graph.entities.length,
      relationCount: graph.relations.length
    })

    // Build entity map
    const entityMap = new Map<string, Entity>()
    for (const entity of graph.entities) entityMap.set(entity.id, entity)

    // Find entity clusters
    const clusters = findEntityClusters(graph.entities, cfg)

    yield* Effect.logDebug("Entity clusters found", {
      stage: "entity-resolution",
      clusterCount: clusters.size,
      clusters: Array.from(clusters.entries()).map(([root, ids]) => ({
        canonical: root,
        members: ids
      }))
    })

    // Merge clusters
    const mergedEntities: Array<Entity> = []
    const idMapping = new Map<string, string>()

    for (const [_canonicalId, clusterIds] of clusters) {
      const merged = mergeEntityCluster(clusterIds, entityMap)
      mergedEntities.push(merged)
      for (const oldId of clusterIds) idMapping.set(oldId, merged.id)
    }

    // Update relations to use canonical entity IDs
    const updatedRelations: Array<Relation> = []
    for (const relation of graph.relations) {
      const newSubjectId = idMapping.get(relation.subjectId) || relation.subjectId
      let newObject = relation.object
      if (typeof relation.object === "string" && idMapping.has(relation.object)) {
        newObject = idMapping.get(relation.object)!
      }

      // Skip self-referential relations created by merging
      if (newSubjectId === newObject) continue

      updatedRelations.push(
        new Relation({
          subjectId: newSubjectId,
          predicate: relation.predicate,
          object: newObject
        })
      )
    }

    // Deduplicate relations
    const relationSet = new Set<string>()
    const deduped: Array<Relation> = []
    for (const rel of updatedRelations) {
      const key = `${rel.subjectId}|${rel.predicate}|${String(rel.object)}`
      if (!relationSet.has(key)) {
        relationSet.add(key)
        deduped.push(rel)
      }
    }

    yield* Effect.logInfo("Entity resolution complete", {
      stage: "entity-resolution",
      originalEntities: graph.entities.length,
      mergedEntities: mergedEntities.length,
      originalRelations: graph.relations.length,
      updatedRelations: deduped.length
    })

    return new KnowledgeGraph({
      entities: mergedEntities,
      relations: deduped
    })
  })

================
File: src/Workflow/index.ts
================
/**
 * Workflow Layer Exports
 *
 * @since 2.0.0
 * @module Workflow
 */

export * from "./Merge.js"
export * from "./StreamingExtraction.js"
export * from "./TwoStageExtraction.js"

================
File: src/Workflow/Merge.ts
================
/**
 * Graph Merge Utilities
 *
 * Pure functions for merging KnowledgeGraph fragments from multiple chunks.
 * Implements monoid operations for streaming reduction.
 *
 * @since 2.0.0
 * @module Workflow/Merge
 */

import { Chunk, HashMap, HashSet, Order } from "effect"
import type { Relation } from "../Domain/Model/Entity.js"
import { Entity, KnowledgeGraph } from "../Domain/Model/Entity.js"

/**
 * Merge conflict information
 *
 * Records conflicts detected during entity attribute merging.
 *
 * @since 2.0.0
 * @category Types
 */
export interface MergeConflict {
  /**
   * Entity ID with conflict
   */
  readonly entityId: string

  /**
   * Property key that conflicted
   */
  readonly property: string

  /**
   * Conflicting values
   */
  readonly values: ReadonlyArray<unknown>

  /**
   * Chunk indexes that contributed conflicting values
   */
  readonly chunkIndexes: ReadonlyArray<number>
}

/**
 * Order instance for Entity (by id)
 *
 * @internal
 */
const EntityOrder: Order.Order<Entity> = Order.mapInput(Order.string, (entity: Entity) => entity.id)

/**
 * Order instance for Relation (by subjectId, predicate, object)
 *
 * @internal
 */
const RelationOrder: Order.Order<Relation> = Order.combine(
  Order.mapInput(Order.string, (r: Relation) => r.subjectId),
  Order.combine(
    Order.mapInput(Order.string, (r: Relation) => r.predicate),
    Order.mapInput(
      Order.string,
      (r: Relation) => (typeof r.object === "string" ? r.object : String(r.object))
    )
  )
)

/**
 * Select best types using frequency voting
 *
 * Counts occurrences of each type and selects the most frequent ones.
 * Prefers types that appear in majority of occurrences.
 *
 * @param existingTypes - Types from existing entity
 * @param newTypes - Types from new entity occurrence
 * @returns Selected types (most frequent, up to 2-3 types)
 *
 * @internal
 */
const selectBestTypes = (
  existingTypes: ReadonlyArray<string>,
  newTypes: ReadonlyArray<string>
): ReadonlyArray<string> => {
  // Count type frequencies
  const typeFrequency = new Map<string, number>()

  // Count existing types (weighted as 1 occurrence)
  for (const type of existingTypes) {
    typeFrequency.set(type, (typeFrequency.get(type) || 0) + 1)
  }

  // Count new types (weighted as 1 occurrence)
  for (const type of newTypes) {
    typeFrequency.set(type, (typeFrequency.get(type) || 0) + 1)
  }

  // If only one type, return it
  if (typeFrequency.size === 1) {
    return Array.from(typeFrequency.keys())
  }

  // Sort by frequency (descending)
  const sortedTypes = Array.from(typeFrequency.entries()).sort((a, b) => b[1] - a[1])

  // Select top types:
  // - If highest frequency is >= 2, take all types with that frequency
  // - Otherwise, take top 2-3 types (but at least the most frequent)
  const maxFrequency = sortedTypes[0]![1]
  const selectedTypes: Array<string> = []

  if (maxFrequency >= 2) {
    // Majority voting: take all types that appear in majority
    for (const [type, freq] of sortedTypes) {
      if (freq >= maxFrequency) {
        selectedTypes.push(type)
      } else {
        break
      }
    }
    // Limit to top 3 even if multiple have same frequency
    return selectedTypes.slice(0, 3)
  } else {
    // No clear majority: take top 2-3 most frequent
    // Prefer keeping 1-2 types for clarity
    return sortedTypes.slice(0, 2).map(([type]) => type)
  }
}

/**
 * Merge two knowledge graphs
 *
 * Merges entities by `id` and relations by `(subjectId, predicate, object)` signature.
 * Enforces functional properties (at most one value per subject-predicate).
 * Detects and records attribute conflicts.
 *
 * This is a pure function suitable for `Stream.runFold` reduction.
 * The merge is associative and has an identity element (empty graph).
 *
 * @param a - First graph
 * @param b - Second graph
 * @returns Merged graph
 *
 * @example
 * ```typescript
 * const graph1 = new KnowledgeGraph({
 *   entities: [entity1],
 *   relations: [relation1]
 * })
 *
 * const graph2 = new KnowledgeGraph({
 *   entities: [entity2],
 *   relations: [relation2]
 * })
 *
 * const merged = mergeGraphs(graph1, graph2)
 * ```
 *
 * @category constructors
 * @since 2.0.0
 */
export const mergeGraphs = (a: KnowledgeGraph, b: KnowledgeGraph): KnowledgeGraph => {
  // Identity element: empty graph
  if (a.entities.length === 0 && a.relations.length === 0) {
    return b
  }
  if (b.entities.length === 0 && b.relations.length === 0) {
    return a
  }

  // Merge entities by ID using HashMap
  let entityMap = HashMap.empty<string, Entity>()

  // Add entities from a
  for (const entity of a.entities) {
    entityMap = HashMap.set(entityMap, entity.id, entity)
  }

  // Merge b's entities into the map
  for (const entity of b.entities) {
    const existing = HashMap.get(entityMap, entity.id)
    if (existing._tag === "Some") {
      // Merge attributes: union with preference for non-empty values
      const mergedAttributes = { ...existing.value.attributes, ...entity.attributes }
      // Select best types using frequency voting (instead of union)
      const mergedTypes = selectBestTypes(existing.value.types, entity.types)
      // Keep longest mention
      const mergedMention = entity.mention.length > existing.value.mention.length
        ? entity.mention
        : existing.value.mention

      entityMap = HashMap.set(
        entityMap,
        entity.id,
        new Entity({
          id: entity.id,
          mention: mergedMention,
          types: mergedTypes,
          attributes: mergedAttributes
        })
      )
    } else {
      entityMap = HashMap.set(entityMap, entity.id, entity)
    }
  }

  // Merge relations by (subjectId, predicate, object) signature using HashSet.union
  const relationsA = HashSet.fromIterable(a.relations)
  const relationsB = HashSet.fromIterable(b.relations)
  const relationSet = HashSet.union(relationsA, relationsB)

  // Convert to Chunk and sort for deterministic output
  const mergedEntities = Chunk.fromIterable(HashMap.toValues(entityMap)).pipe(
    Chunk.sort(EntityOrder)
  )

  const mergedRelations = Chunk.fromIterable(HashSet.toValues(relationSet)).pipe(
    Chunk.sort(RelationOrder)
  )

  return new KnowledgeGraph({
    entities: Array.from(mergedEntities),
    relations: Array.from(mergedRelations)
  })
}

/**
 * Merge graphs with conflict detection
 *
 * Returns both the merged graph and a list of conflicts detected during merging.
 * Useful for UI review tools and quality assurance.
 *
 * @param a - First graph
 * @param b - Second graph
 * @returns Tuple of [merged graph, conflicts]
 *
 * @category constructors
 * @since 2.0.0
 */
export const mergeGraphsWithConflicts = (
  a: KnowledgeGraph,
  b: KnowledgeGraph
): [KnowledgeGraph, ReadonlyArray<MergeConflict>] => {
  const conflicts: Array<MergeConflict> = []

  // Identity element: empty graph
  if (a.entities.length === 0 && a.relations.length === 0) {
    return [b, []]
  }
  if (b.entities.length === 0 && b.relations.length === 0) {
    return [a, []]
  }

  // Merge entities by ID with conflict detection using HashMap
  let entityMap = HashMap.empty<string, Entity>()

  // Add entities from a
  for (const entity of a.entities) {
    entityMap = HashMap.set(entityMap, entity.id, entity)
  }

  // Merge b's entities into the map, detecting conflicts
  for (const entity of b.entities) {
    const existing = HashMap.get(entityMap, entity.id)
    if (existing._tag === "Some") {
      // Check for attribute conflicts
      for (const [key, value] of Object.entries(entity.attributes)) {
        const existingValue = existing.value.attributes[key]
        if (existingValue !== undefined && existingValue !== value) {
          conflicts.push({
            entityId: entity.id,
            property: key,
            values: [existingValue, value],
            chunkIndexes: [] // TODO: track chunk indexes if provenance is added
          })
        }
      }

      // Merge attributes: union with preference for non-empty values
      const mergedAttributes = { ...existing.value.attributes, ...entity.attributes }
      // Select best types using frequency voting (instead of union)
      const mergedTypes = selectBestTypes(existing.value.types, entity.types)
      // Keep longest mention
      const mergedMention = entity.mention.length > existing.value.mention.length
        ? entity.mention
        : existing.value.mention

      entityMap = HashMap.set(
        entityMap,
        entity.id,
        new Entity({
          id: entity.id,
          mention: mergedMention,
          types: mergedTypes,
          attributes: mergedAttributes
        })
      )
    } else {
      entityMap = HashMap.set(entityMap, entity.id, entity)
    }
  }

  // Merge relations (same as mergeGraphs) using HashSet.union
  const relationsA = HashSet.fromIterable(a.relations)
  const relationsB = HashSet.fromIterable(b.relations)
  const relationSet = HashSet.union(relationsA, relationsB)

  // Convert to Chunk and sort for deterministic output
  const mergedEntities = Chunk.fromIterable(HashMap.toValues(entityMap)).pipe(
    Chunk.sort(EntityOrder)
  )

  const mergedRelations = Chunk.fromIterable(HashSet.toValues(relationSet)).pipe(
    Chunk.sort(RelationOrder)
  )

  const mergedGraph = new KnowledgeGraph({
    entities: Array.from(mergedEntities),
    relations: Array.from(mergedRelations)
  })

  return [mergedGraph, conflicts]
}

================
File: src/Workflow/StreamingExtraction.ts
================
/**
 * Workflow: Streaming Extraction
 *
 * Stream-based extraction workflow for large documents.
 * Implements the 6-phase pipeline: chunking, retrieval, entity extraction,
 * property scoping, relation extraction, and merge.
 *
 * @since 2.0.0
 * @module Workflow/StreamingExtraction
 */

import { Chunk, Effect, Either, HashMap, Stream } from "effect"
import { ExtractionError } from "../Domain/Error/Extraction.js"
import { KnowledgeGraph } from "../Domain/Model/Entity.js"
import type { ClassDefinition } from "../Domain/Model/Ontology.js"
import { EntityExtractor, MentionExtractor, RelationExtractor } from "../Service/Extraction.js"
import { Grounder } from "../Service/Grounder.js"
import { NlpService } from "../Service/Nlp.js"
import { OntologyService } from "../Service/Ontology.js"
import { annotateExtraction, LlmAttributes } from "../Telemetry/LlmAttributes.js"
import { mergeGraphs } from "./Merge.js"

const GROUNDER_CONFIDENCE_THRESHOLD = 0.8

/**
 * Streaming Extraction Workflow
 *
 * Processes text through a 6-phase pipeline:
 * 1. Chunk text using NlpService
 * 2. Retrieve relevant classes for each chunk
 * 3. Extract entities using EntityExtractor
 * 4. Scope properties for extracted entity types
 * 5. Extract relations using RelationExtractor
 * 6. Merge all graph fragments into final KnowledgeGraph
 *
 * Uses Stream.mapEffectPar for parallel processing with bounded concurrency.
 * Final merge uses Stream.runFold with mergeGraphs monoid.
 *
 * @param text - Source text to extract from
 * @param concurrency - Max parallel extraction tasks (default: 4)
 * @returns Effect yielding merged KnowledgeGraph
 *
 * @example
 * ```typescript
 * const graph = yield* streamingExtraction(text, 4)
 * ```
 *
 * @since 2.0.0
 * @category Workflows
 */
export const streamingExtraction = (
  text: string,
  concurrency: number = 4
): Effect.Effect<
  KnowledgeGraph,
  ExtractionError,
  EntityExtractor | MentionExtractor | RelationExtractor | Grounder | OntologyService | NlpService
> =>
  Effect.gen(function*() {
    const nlp = yield* NlpService
    const ontology = yield* OntologyService
    const mentionExtractor = yield* MentionExtractor
    const entityExtractor = yield* EntityExtractor
    const relationExtractor = yield* RelationExtractor
    const grounder = yield* Grounder

    yield* Effect.logInfo("Starting streaming extraction", {
      stage: "streaming-extraction",
      textLength: text.length,
      concurrency
    })

    // Phase 1: Chunk text
    const chunks = yield* nlp.chunkText(text, {
      maxChunkSize: 500,
      preserveSentences: true
    }).pipe(
      Effect.withLogSpan("chunking"),
      Effect.tap((chunks) =>
        Effect.logInfo("Text chunking complete", {
          stage: "chunking",
          chunkCount: chunks.length,
          avgChunkSize: chunks.length > 0
            ? Math.round(chunks.reduce((sum, c) => sum + c.text.length, 0) / chunks.length)
            : 0
        })
      )
    )

    // Short-circuit if no chunks
    if (chunks.length === 0) {
      yield* Effect.logWarning("No chunks generated from text", {
        stage: "chunking",
        textLength: text.length
      })
      return new KnowledgeGraph({
        entities: [],
        relations: []
      })
    }

    // Phase 2-5: Process chunks in parallel with bounded concurrency
    // Wrap each chunk in Effect.either to isolate failures - prevents fail-fast interruption
    const graphFragments = yield* Stream.fromIterable(chunks)
      .pipe(
        // Phase 2-5: Process each chunk through the full pipeline (wrapped in Either)
        Stream.mapEffect(
          (chunk) =>
            Effect.either(
              Effect.gen(function*() {
                yield* Effect.logDebug("Processing chunk", {
                  stage: "chunk-processing",
                  chunkIndex: chunk.index,
                  chunkLength: chunk.text.length,
                  chunkPreview: chunk.text.slice(0, 100)
                })

                // Phase 2a: Mention extraction - extract entity mentions without types
                const mentions = yield* mentionExtractor
                  .extract(chunk.text)
                  .pipe(
                    Effect.withLogSpan(`chunk-${chunk.index}-mention-extraction`),
                    Effect.tap((mentions) =>
                      Effect.logDebug("Mention extraction complete", {
                        stage: "mention-extraction",
                        chunkIndex: chunk.index,
                        mentionCount: Chunk.toReadonlyArray(mentions).length
                      })
                    ),
                    Effect.mapError(
                      (error) =>
                        new ExtractionError({
                          message: `Mention extraction failed for chunk ${chunk.index}`,
                          cause: error,
                          text: chunk.text
                        })
                    )
                  )

                const mentionArray = Chunk.toReadonlyArray(mentions)

                // Skip if no mentions found
                if (mentionArray.length === 0) {
                  yield* Effect.logWarning("No mentions found for chunk", {
                    stage: "mention-extraction",
                    chunkIndex: chunk.index
                  })
                  return new KnowledgeGraph({
                    entities: [],
                    relations: []
                  })
                }

                // Phase 2b: Entity-level semantic search - get classes per mention
                // Use mention text + context for better class retrieval
                const mentionClassResults = yield* Effect.all(
                  mentionArray.map((mention) => {
                    const searchText = mention.context
                      ? `${mention.mention}: ${mention.context}`
                      : mention.mention
                    return ontology.searchClassesSemantic(searchText, 5).pipe(
                      Effect.map((classes) => ({
                        mentionId: mention.id,
                        classes: Chunk.toReadonlyArray(classes)
                      })),
                      Effect.mapError(
                        (error) =>
                          new ExtractionError({
                            message: `Class retrieval failed for mention ${mention.id}`,
                            cause: error,
                            text: chunk.text
                          })
                      )
                    )
                  }),
                  { concurrency: 5 } // Limit concurrent semantic searches
                ).pipe(
                  Effect.withLogSpan(`chunk-${chunk.index}-entity-level-retrieval`),
                  Effect.tap((results) =>
                    Effect.logDebug("Entity-level class retrieval complete", {
                      stage: "entity-level-retrieval",
                      chunkIndex: chunk.index,
                      mentionCount: results.length,
                      totalClasses: results.reduce((sum, r) => sum + r.classes.length, 0)
                    })
                  )
                )

                // Build mention-to-classes map
                let mentionClasses = HashMap.empty<string, ReadonlyArray<ClassDefinition>>()
                for (const result of mentionClassResults) {
                  mentionClasses = HashMap.set(mentionClasses, result.mentionId, result.classes)
                }

                // Aggregate all unique classes across mentions for entity extraction
                const allClassesSet = new Set<string>()
                const allClassesMap = new Map<string, ClassDefinition>()
                for (const result of mentionClassResults) {
                  for (const cls of result.classes) {
                    if (!allClassesSet.has(cls.id)) {
                      allClassesSet.add(cls.id)
                      allClassesMap.set(cls.id, cls)
                    }
                  }
                }
                const classArray = Array.from(allClassesMap.values())

                // Skip if no classes found
                if (classArray.length === 0) {
                  yield* Effect.logWarning("No classes found for any mention", {
                    stage: "entity-level-retrieval",
                    chunkIndex: chunk.index
                  })
                  return new KnowledgeGraph({
                    entities: [],
                    relations: []
                  })
                }

                // Phase 3: Entity extraction with aggregated candidate classes
                // Pre-compute datatype properties allowed for these classes (attribute constraints)
                const candidateDatatypeProperties = yield* ontology
                  .getPropertiesFor(classArray.map((c) => c.id))
                  .pipe(
                    Effect.withLogSpan(`chunk-${chunk.index}-datatype-properties`),
                    Effect.tap((properties) =>
                      Effect.logDebug("Datatype properties scoped", {
                        stage: "datatype-properties",
                        chunkIndex: chunk.index,
                        propertyCount: Chunk.toReadonlyArray(properties).length
                      })
                    ),
                    Effect.map((properties) =>
                      Chunk.toReadonlyArray(properties).filter((p) => p.rangeType === "datatype")
                    ),
                    Effect.mapError(
                      (error) =>
                        new ExtractionError({
                          message: `Datatype property scoping failed for chunk ${chunk.index}`,
                          cause: error,
                          text: chunk.text
                        })
                    )
                  )

                const entities = yield* entityExtractor
                  .extract(chunk.text, classArray, candidateDatatypeProperties)
                  .pipe(
                    Effect.annotateLogs({ chunkIndex: chunk.index }),
                    Effect.withLogSpan(`chunk-${chunk.index}-entity-extraction`),
                    Effect.mapError(
                      (error) =>
                        new ExtractionError({
                          message: `Entity extraction failed for chunk ${chunk.index}`,
                          cause: error,
                          text: chunk.text
                        })
                    )
                  )

                const entityArray = Chunk.toReadonlyArray(entities)

                // Short-circuit if no entities
                if (entityArray.length === 0) {
                  yield* Effect.logWarning("No entities extracted from chunk", {
                    stage: "entity-extraction",
                    chunkIndex: chunk.index
                  })
                  return new KnowledgeGraph({
                    entities: [],
                    relations: []
                  })
                }

                // Phase 4: Property scoping - get properties for entity types
                // Collect all unique types from entities
                const typeSet = new Set<string>()
                for (const entity of entityArray) {
                  for (const type of entity.types) {
                    typeSet.add(type)
                  }
                }

                const typeArray = Array.from(typeSet)
                const properties = yield* ontology.getPropertiesFor(typeArray).pipe(
                  Effect.withLogSpan(`chunk-${chunk.index}-property-scoping`),
                  Effect.tap((properties) =>
                    Effect.logDebug("Property scoping complete", {
                      stage: "property-scoping",
                      chunkIndex: chunk.index,
                      typeCount: typeArray.length,
                      propertyCount: Chunk.toReadonlyArray(properties).length
                    })
                  ),
                  Effect.mapError(
                    (error) =>
                      new ExtractionError({
                        message: `Property scoping failed for chunk ${chunk.index}`,
                        cause: error,
                        text: chunk.text
                      })
                  )
                )

                const propertyArray = Chunk.toReadonlyArray(properties)

                // Phase 5: Relation extraction
                // Short-circuit if insufficient entities or properties
                if (entityArray.length < 2 || propertyArray.length === 0) {
                  yield* Effect.logDebug("Skipping relation extraction", {
                    stage: "relation-extraction",
                    chunkIndex: chunk.index,
                    reason: entityArray.length < 2 ? "insufficient entities" : "no properties",
                    entityCount: entityArray.length,
                    propertyCount: propertyArray.length
                  })
                  return new KnowledgeGraph({
                    entities: Array.from(entities),
                    relations: []
                  })
                }

                const relations = yield* relationExtractor.extract(chunk.text, entities, propertyArray).pipe(
                  Effect.annotateLogs({ chunkIndex: chunk.index }),
                  Effect.withLogSpan(`chunk-${chunk.index}-relation-extraction`),
                  Effect.mapError(
                    (error) =>
                      new ExtractionError({
                        message: `Relation extraction failed for chunk ${chunk.index}`,
                        cause: error,
                        text: chunk.text
                      })
                  )
                )

                const relationArray = Chunk.toReadonlyArray(relations)

                // Phase 5b: Grounding verification - filter relations by context alignment
                // Uses batched verification to reduce LLM API calls
                const verificationInputs = relationArray.map((relation) => {
                  const subject = entityArray.find((entity) => entity.id === relation.subjectId)
                  const objectEntity = typeof relation.object === "string"
                    ? entityArray.find((entity) => entity.id === relation.object)
                    : undefined
                  const predicate = propertyArray.find((property) => property.id === relation.predicate)

                  return {
                    context: chunk.text,
                    relation,
                    subject: subject && {
                      entityId: subject.id,
                      mention: subject.mention,
                      types: subject.types
                    },
                    predicate,
                    object: typeof relation.object === "string"
                      ? {
                        entityId: relation.object,
                        mention: objectEntity?.mention,
                        types: objectEntity?.types
                      }
                      : {
                        literal: relation.object
                      }
                  }
                })

                // Batch verify all relations in one LLM call (or skip if none)
                const verificationResults = verificationInputs.length > 0
                  ? yield* grounder.verifyRelationBatch(chunk.text, verificationInputs).pipe(
                    Effect.annotateLogs({ chunkIndex: chunk.index }),
                    Effect.withLogSpan(`chunk-${chunk.index}-grounding`),
                    Effect.mapError(
                      (error) =>
                        new ExtractionError({
                          message: `Grounder verification failed for chunk ${chunk.index}`,
                          cause: error,
                          text: chunk.text
                        })
                    )
                  )
                  : []

                // Filter to only grounded relations with sufficient confidence
                const verifiedRelationArray = verificationResults
                  .filter((result) => result.grounded && result.confidence >= GROUNDER_CONFIDENCE_THRESHOLD)
                  .map((result) => result.relation)

                yield* Effect.logInfo("Grounder verification complete", {
                  stage: "grounder",
                  chunkIndex: chunk.index,
                  inputRelations: relationArray.length,
                  verifiedRelations: verifiedRelationArray.length
                })

                // Build KnowledgeGraph fragment
                const fragment = new KnowledgeGraph({
                  entities: Array.from(entities),
                  relations: verifiedRelationArray
                })

                yield* Effect.all([
                  Effect.logDebug("Chunk processing complete", {
                    stage: "chunk-processing",
                    chunkIndex: chunk.index,
                    entityCount: fragment.entities.length,
                    relationCount: fragment.relations.length
                  }),
                  annotateExtraction({
                    chunkIndex: chunk.index,
                    chunkTextLength: chunk.text.length,
                    entityCount: fragment.entities.length,
                    relationCount: fragment.relations.length,
                    mentionCount: mentionArray.length,
                    candidateClassCount: classArray.length
                  })
                ])

                return fragment
              }).pipe(
                Effect.withSpan(`chunk-${chunk.index}-processing`, {
                  attributes: {
                    [LlmAttributes.CHUNK_INDEX]: chunk.index,
                    [LlmAttributes.CHUNK_TEXT_LENGTH]: chunk.text.length
                  }
                })
              )
            ), // Close Effect.either
          { concurrency }
        ),
        // Handle Either results - log failures, return empty graphs for failed chunks
        Stream.mapEffect((result) =>
          Either.match(result, {
            onLeft: (error) =>
              Effect.gen(function*() {
                yield* Effect.logError("Chunk processing failed (isolated)", {
                  stage: "chunk-processing",
                  error: error instanceof Error ? error.message : String(error),
                  errorType: error instanceof Error ? error.constructor.name : "Unknown"
                })
                yield* Effect.annotateCurrentSpan("chunk.failed", true)
                yield* Effect.annotateCurrentSpan(
                  "chunk.error_type",
                  error instanceof Error ? error.constructor.name : "Unknown"
                )
                // Return empty graph for failed chunks instead of failing the whole pipeline
                return new KnowledgeGraph({ entities: [], relations: [] })
              }),
            onRight: (graph) => Effect.succeed(graph)
          })
        ),
        // Phase 6: Merge all fragments using monoid operation
        Stream.runFold(
          new KnowledgeGraph({ entities: [], relations: [] }), // Identity element
          mergeGraphs
        )
      ).pipe(
        Effect.tap((graph) =>
          Effect.all([
            Effect.logInfo("Streaming extraction complete", {
              stage: "streaming-extraction",
              totalEntities: graph.entities.length,
              totalRelations: graph.relations.length,
              uniqueEntityTypes: Array.from(new Set(graph.entities.flatMap((e) => e.types))).length
            }),
            Effect.annotateCurrentSpan(LlmAttributes.ENTITY_COUNT, graph.entities.length),
            Effect.annotateCurrentSpan(LlmAttributes.RELATION_COUNT, graph.relations.length)
          ])
        ),
        Effect.withSpan("graph-merge")
      )

    return graphFragments
  }).pipe(
    Effect.withSpan("extraction-pipeline", {
      attributes: {
        "extraction.type": "streaming"
      }
    })
  )

================
File: src/Workflow/TwoStageExtraction.ts
================
/**
 * Workflow: Two-Stage Extraction
 *
 * End-to-end knowledge extraction using two-stage pipeline.
 * Chains streamingExtraction with RdfBuilder serialization.
 *
 * @since 2.0.0
 * @module Workflow/TwoStageExtraction
 */

import { Effect } from "effect"
import { ExtractionError } from "../Domain/Error/Extraction.js"
import type { EntityExtractor, MentionExtractor, RelationExtractor } from "../Service/Extraction.js"
import type { Grounder } from "../Service/Grounder.js"
import type { NlpService } from "../Service/Nlp.js"
import type { OntologyService } from "../Service/Ontology.js"
import { RdfBuilder } from "../Service/Rdf.js"
import { streamingExtraction } from "./StreamingExtraction.js"

/**
 * Two-Stage Extraction Workflow
 *
 * Orchestrates the complete extraction pipeline:
 * 1. Run streamingExtraction to extract KnowledgeGraph from text
 * 2. Convert KnowledgeGraph to RDF store using RdfBuilder
 * 3. Serialize RDF store to Turtle format
 *
 * @param text - Source text to extract from
 * @param concurrency - Max parallel extraction tasks (default: 4)
 * @returns Turtle RDF string
 *
 * @example
 * ```typescript
 * const turtle = yield* extractToTurtle("Cristiano Ronaldo plays for Al-Nassr")
 * ```
 *
 * @since 2.0.0
 * @category Workflows
 */
export const extractToTurtle = (
  text: string,
  concurrency: number = 4
): Effect.Effect<
  string,
  ExtractionError,
  EntityExtractor | MentionExtractor | RelationExtractor | Grounder | OntologyService | NlpService | RdfBuilder
> =>
  Effect.gen(function*() {
    yield* Effect.logInfo("Starting two-stage extraction", {
      stage: "two-stage-extraction",
      textLength: text.length,
      concurrency
    })

    // Phase 1: Extract knowledge graph from text
    const graph = yield* streamingExtraction(text, concurrency).pipe(
      Effect.withLogSpan("extraction-phase"),
      Effect.tap((graph) =>
        Effect.logInfo("Knowledge graph extracted", {
          stage: "extraction-phase",
          entityCount: graph.entities.length,
          relationCount: graph.relations.length
        })
      ),
      Effect.mapError(
        (error) =>
          new ExtractionError({
            message: `Streaming extraction failed: ${error.message}`,
            cause: error,
            text
          })
      )
    )

    const rdf = yield* RdfBuilder

    // Phase 2: Convert KnowledgeGraph to RDF and serialize to Turtle
    const turtle = yield* Effect.gen(function*() {
      yield* Effect.logDebug("Converting graph to RDF", {
        stage: "rdf-conversion",
        entityCount: graph.entities.length,
        relationCount: graph.relations.length
      })

      // Create scoped RDF store
      const store = yield* rdf.makeStore

      // Add entities to store
      yield* rdf.addEntities(store, graph.entities).pipe(
        Effect.withLogSpan("rdf-entity-conversion"),
        Effect.tap(() =>
          Effect.logDebug("Entities added to RDF store", {
            stage: "rdf-conversion",
            entityCount: graph.entities.length
          })
        ),
        Effect.mapError(
          (error) =>
            new ExtractionError({
              message: `Failed to add entities to RDF store: ${error.message}`,
              cause: error,
              text
            })
        )
      )

      // Add relations to store
      yield* rdf.addRelations(store, graph.relations).pipe(
        Effect.withLogSpan("rdf-relation-conversion"),
        Effect.tap(() =>
          Effect.logDebug("Relations added to RDF store", {
            stage: "rdf-conversion",
            relationCount: graph.relations.length
          })
        ),
        Effect.mapError(
          (error) =>
            new ExtractionError({
              message: `Failed to add relations to RDF store: ${error.message}`,
              cause: error,
              text
            })
        )
      )

      // Serialize to Turtle
      return yield* rdf.toTurtle(store).pipe(
        Effect.withLogSpan("turtle-serialization"),
        Effect.tap((turtle) =>
          Effect.logInfo("Turtle serialization complete", {
            stage: "turtle-serialization",
            turtleLength: turtle.length,
            lineCount: turtle.split("\n").length
          })
        ),
        Effect.mapError(
          (error) =>
            new ExtractionError({
              message: `Turtle serialization failed: ${error.message}`,
              cause: error,
              text
            })
        )
      )
    }).pipe(Effect.scoped)

    yield* Effect.logInfo("Two-stage extraction complete", {
      stage: "two-stage-extraction",
      finalTurtleLength: turtle.length
    })

    return turtle
  })

================
File: src/index.ts
================
/**
 * @effect-ontology/core-v2
 *
 * Effect-native knowledge extraction framework
 *
 * @since 2.0.0
 * @module index
 */

// Domain (pure types, no service dependencies)
export * as Domain from "./Domain/index.js"

// Services (Effect.Service classes with .Default layers)
export { ConfigService } from "./Service/Config.js"
export { EntityExtractor, RelationExtractor } from "./Service/Extraction.js"
export { NlpService } from "./Service/Nlp.js"
export { OntologyService } from "./Service/Ontology.js"
export { RdfBuilder } from "./Service/Rdf.js"

// Workflows (composable business logic)
export { streamingExtraction } from "./Workflow/StreamingExtraction.js"
export { extractToTurtle } from "./Workflow/TwoStageExtraction.js"

// Runtime (pre-composed layers)
export {
  ExtractionLayersLive,
  makeLanguageModelLayer,
  ProductionLayersWithTracing,
  RateLimitedLlmLayer,
  TracingLive
} from "./Runtime/ProductionRuntime.js"

// Telemetry (OpenTelemetry integration)
export * as Telemetry from "./Telemetry/index.js"

================
File: src/main.ts
================
import { BunContext, BunRuntime } from "@effect/platform-bun"
import { Effect, Layer } from "effect"
import { ProductionLayersWithTracing } from "./Runtime/ProductionRuntime.js"
import { OntologyService } from "./Service/Ontology.js"
import { extractToTurtle } from "./Workflow/TwoStageExtraction.js"

import { ConfigService } from "./Service/Config.js"
import { NlpService } from "./Service/Nlp.js"
import { RdfBuilder } from "./Service/Rdf.js"

const FootballOntologyLayer = OntologyService.Default(
  "/Users/pooks/Dev/effect-ontology/ontologies/football/ontology.ttl"
).pipe(Layer.provideMerge(BunContext.layer))

const Live = Layer.mergeAll(
  ProductionLayersWithTracing.pipe(Layer.provide(ConfigService.Default)),
  FootballOntologyLayer,
  NlpService.Default,
  RdfBuilder.Default
)

const program = Effect.gen(function*() {
  const result = yield* extractToTurtle(
    `Arsenal stretched their lead at the top of the Premier League table to six points by thrashing rivals Tottenham Hotspur 4-1 in the north London derby on Sunday at the Emirates Stadium.

The first half was conducted almost entirely as an attack versus defence experiment. Spurs boss Thomas Frank went with a back five and challenged Arsenal to break his side down — something they nearly did early on when an Eberechi Eze scoop to Declan Rice was well saved by Guglielmo Vicario. The visitors’ tactics weren’t pretty but did frustrate Arsenal for much of the opening period.

Advertisement


Such a defensive approach only looks wise if it works, though — and two well-constructed goals, from Leandro Trossard on 36 minutes and Eze five minutes later, put the hosts in the driving seat.

And within a minute of the second half starting, Arsenal were three up — Eze again, with a lovely left-footed finish. The scoring hadn’t finished there, either. Richarlison reduced the deficit with a sensational long-range goal that caught David Raya way off his line but this was Eze’s day, and he completed an excellent hat-trick on 76 minutes to cap off a memorable day for both him and his new team.

Art de Roché, Jay Harris and Dan Sheldon break down the key moments from the game.



A seismic weekend in the title race?
As rounds of Premier League matches go, this one could not have gone better for Arsenal.

With Manchester City and Liverpool both losing on Saturday, it created a significant opportunity for Arteta’s side to extend their lead at the top of the table. They are now seven points clear of third-place Manchester City and 11 ahead of Liverpool, whose title defence seems over before anyone has even had the chance to open the first door on their Advent calendars.


Ben Stansall/AFP via Getty Images
By playing a day later than City and Liverpool, and knowing they had both dropped points, it added an element of pressure on Arsenal to ensure they capitalised on the chance to further cement their status as this season’s team to beat.

And the fact they did this comfortably against Tottenham, who had not lost away from home in the league this season until losing at the Emirates on Sunday, will only make the weekend even sweeter.

Dan Sheldon

Where does this result leave Frank?
Tottenham enjoyed a relatively kind start to the season, which meant October and November was going to be the period when they were truly tested, with fixtures against Aston Villa, Chelsea, Manchester United and Arsenal. The fact they have failed to win any of those games only underlines the scale of the job on new head coach Frank’s hands.

Advertisement


What will be truly frustrating for the fanbase is that they failed to produce a good performance against any of those opponents. They had an impressive 10-minute spell at home against United but threw it away by allowing Matthijs de Ligt to snatch a draw in added time. Spurs offered barely any attacking threat against Chelsea and were torn apart today by Arsenal.


Julian Finney/Getty Images
They are struggling without injured attacking trio Dominic Solanke, James Maddison and Dejan Kulusevski, but still possess enough quality in their squad to pose Arsenal more problems than they did.

This result leaves Frank in a challenging position.

Supporters are becoming restless because this team seems to have plateaued over the past month. Frank needs to be bolder and more adventurous with his tactics. Awkward questions will be asked over how he started with a back five here, yet Spurs conceded four goals.

He cannot be blamed for everything, though. The squad lacks quality in key areas, and that was painfully clear when Eze, who Tottenham tried to sign from Crystal Palace in the summer, scored a hat-trick. If Spurs had been more clinical in the transfer market, he would have been playing for them in this one, instead of embarrassing them.

The worst thing is that things do not get any easier, as they are away at holders Paris Saint-Germain in the Champions League on Wednesday. Fans will be fearful that another chastening 90 minutes awaits.

Jay Harris

Just how good was Eze?
What an afternoon this was for Eze. Just like when he was presented on the pitch after signing from Palace in August, the 27-year-old’s face told the story after his second goal.

Arsenal’s No 10, a boyhood fan of the club, seemed in utter disbelief at what he had just done by putting them 3-0 up against their big local rivals, with two exceptional goals in his first north London derby as a player.


Justin Setterfield/Getty Images
For his first, the close control on the edge of the box to create the opening is exactly what Arsenal have been looking to open games up for in recent years. The clinical strike off his left foot for his second was just indicative of someone who was in a flow state. Sitting down yet another Spurs defender before completing his hat-trick was the icing on the cake.

Advertisement


Eze is the first player to score a hat-trick in the north London derby since Alan Sunderland did it for Arsenal in 1978.

Hat-tricks in the north London derby
Ted Drake
Arsenal
1934
Terry Dyson
Tottenham
1961
Alan Sunderland
Arsenal
1978
Eberechi Eze
Arsenal
2025
The backdrop of this game being the love triangle-like transfer saga that involved Eze and these two clubs in the summer will only make these goals sweeter.

While Spurs seemed to be in the driving seat, Eze’s last-minute phone call to Arsenal manager Mikel Arteta showed just how much he wanted to rejoin the club — 14 years after they released him as a kid.

He has since spoken openly about regularly asking whether Arsenal were interested in him when links to other clubs were brought to his attention, most recently with veteran striker turned podcaster Adebayo Akinfenwa earlier this week. He also spoke to actor Idris Elba for Sky Sports in the build-up to this game, so there’s no doubt the spotlight was on him.

Spurs boss Frank had replied “Who?” when asked about Eze in his pre-match press conference on Friday.

It’s fair to say he won’t need any reminders now.

Art de Roché



Was Spurs’ first-half approach too meek?
Tottenham set up in a 3-4-3 system which was all about frustrating Arteta’s side. It was the same game plan Frank used against them with previous club Brentford. The problem is that you have to show more bravery when you are in charge of Tottenham and playing away to their fiercest rivals.

There have been a few occasions this season when Frank’s pragmatic tactics have worked — the best examples being the 2-0 victory at Manchester City in August and the preceding UEFA Super Cup against Paris Saint-Germain. But Spurs took the lead in both of those games, which forced their opponents to push up higher and allowed them to play on the counter.

Tottenham’s game plan worked for the first half an hour on Sunday but it was in tatters from the moment Trossard put Arsenal in front. They did not have the right blend of players on the pitch to be more expansive and take control of the game. Eze’s first goal, Arsenal’s second, hammered that point home.

Advertisement


Spurs did not have a single shot in the first half and only registered two touches in Arsenal’s penalty area. Frank abandoned the back three at half-time by bringing on forward Xavi Simons for centre-back Kevin Danso. That plan self-destructed less than a minute into the second half as Eze scored the third.


Ben Stansall/AFP via Getty Images
Richarlison’s spectacular lob might have made the scoreline look slightly better but it was a freak goal, as opposed to something which came from Spurs exerting dominance.

Frank desperately needs to find a way to make this team more confident in possession. They have produced three meek Premier League performances in a row against Chelsea, Manchester United and Arsenal.

Jay Harris

How did Arsenal break through Spurs’ back five?
With Viktor Gyokeres out through injury, Arsenal could not rely on anyone to repeatedly stretch Tottenham’s back five through energy alone.

But they found another way to break it down: the scoop.

In only the third minute, Eze played in Rice with a beautiful lofted ball over the top, which led to Vicario making a good stop to prevent Arsenal taking an early lead.

However, when you have as many players as comfortable on the ball — and in tight spaces — as Arsenal do, then it is only ever going to be a matter of time before they try that move again. So, when Mikel Merino received the ball in front of the Spurs penalty area, looked up and spotted Trossard’s run, there was only going to be one outcome.



The Spaniard played a perfectly-weighed pass over the defence into Trossard’s path, with the Belgian taking a touch and spinning his body before directing a shot into the bottom corner for the opening goal of the game.

Dan Sheldon

How did Piero Hincapie get on?
With Gabriel now out for the foreseeable future, the biggest selection dilemma for Arteta would have been how to replace the Brazilian in central defence. He had three options in Piero Hincapie, Riccardo Calafiori and Cristhian Mosquera and opted for the most logical in Hincapie.

Advertisement


This was the 23-year-old Ecuador international’s first league start for Arsenal after signing from Bayer Leverkusen on loan late in the summer transfer window, but he stepped in without missing a beat.


Julian Finney/Getty Images
The William Saliba/Gabriel partnership is defined by their differences, as the latter tends to be the more aggressive defender of the two. That was the case with Hincapie in his place, as Saliba’s new partner was extremely comfortable defending in higher areas of the pitch.

Early on, his interventions helped Arsenal pin Spurs into their half of the pitch, stopping the visitors gaining any momentum in the game. It was his battle with Mohammed Kudus that was particularly impressive, as he continuously disrupted the Spurs forward, negating any chances for him to carry Tottenham upfield.

That combative approach was vital to setting the tone for Arsenal, and gave them a solid platform before they scored their two first-half goals.

Art de Roché

What did Mikel Arteta say?
The Arsenal manager was delighted by his team’s performance in a comprehensive win: “Well, a great day. I enjoyed every minute of it, from the preparation, since the moment that the players came back from international duty I sensed a feeling that they wanted to be together again, that they were ready for a fight, they were ready for a big week, and the preparation was top.

“Then you have to deliver it, obviously, with the energy that our people brought to the stadium. It makes a huge difference. I think, individually, the players were exceptional from the minute one. They were super-dominant in almost every phase of the play. So, yeah, a day to remember. You don’t win a derby 4-1 every time and hopefully we made a lot of Arsenal supporters very proud and happy.”

Arteta praised Eze after his three-goal display: “Things happen for a reason. And after the international duty, he had two days off, and after one day he wanted to train, and he wanted to improve, and he wanted to do extra practice and he was asking me questions about this and that. And when a player has such a talent, and his desire is at that level, then these things happen. And he fully deserves it. I’m so happy for him, because since the day that he came, he brought something else to the team. So it’s a joy, it’s an aura that this team needed and hopefully it will give him a lot of confidence, him and the team, that at any moment he can win us a game. And that’s the ability that he has, and he certainly needs to fulfil that talent.”


He was also asked about how much significance Arsenal going six points clear at the top of the table has: “In this league? Not much. We are doing really well. We’ve been really consistent, and that’s it. I mean, when you look at the results, whether they win or lose, the difference in the scoreline and actually what happens in games is really small.

“We know that. We need players back immediately today. We’ve got Noni (Madueke, who had been out since September with a knee injury) back on the pitch, which is great, but we’re still missing a lot of important players and we’re going to need all of them.”

What did Thomas Frank say?
The Tottenham coach was understandably upset at his side’s display on Sunday. “Where should I start? This is, of course, hugely disappointing that we didn’t perform better in the game against Arsenal, our biggest rivals. I can only apologise to the fans for that.

“I was very confident on Friday when we spoke (to the media) that we would be competitive today. We tried to come here and be aggressive and press high and, in spells, go after them. We didn’t succeed with that bit. We didn’t manage to get near enough to them in the situations we could. It means we got pushed back and got a little too passive. It looks like we are running after them. When we finally got on the ball, we were not good enough to get out of those situations.

“No matter how painful it is to admit, they are definitely six years down the line and we are four months down the line, but even with that I was still expecting much more from us today. Not that we could dominate over 90 minutes but that we could be as competitive as we were against Manchester City and PSG.”

Frank was also asked whether Tottenham’s lack of creativity this season (only three teams in the Premier League have a lower expected goals figure) was a concern: “It is, of course. We are working very hard to try to make that better, but sometimes it’s not only playing out and finding a nice pass but also in a game like this if you see some of the situations where they won it high, Arsenal, then there was a little bit more open space. We didn’t win it enough in those situations and then create from that.

“For me the creativity, I know it was very low, but it was not my biggest concern today.”`
  )
  console.log(result)
}).pipe(
  Effect.provide(Live)
)

BunRuntime.runMain(program)

================
File: src/playground.ts
================
import { FileSystem } from "@effect/platform"
import { BunContext } from "@effect/platform-bun"
import { Chunk, Console, Effect, Layer } from "effect"
import { ConfigService } from "./Service/Config.js"
import { NlpService } from "./Service/Nlp.js"
import { OntologyService } from "./Service/Ontology.js"
import { RdfBuilder } from "./Service/Rdf.js"

const liveLayer = Layer.mergeAll(
  OntologyService.Default("/Users/pooks/Dev/effect-ontology/ontologies/football/ontology.ttl"),
  NlpService.Default,
  RdfBuilder.Default,
  ConfigService.Default
).pipe(Layer.provideMerge(BunContext.layer))

const BASE_NS = "http://visualdataweb.org/newOntology/"

interface TestCase {
  readonly category: string
  readonly testName: string
  readonly query: string
  readonly expectedClasses: ReadonlyArray<string>
  readonly searchType: "BM25" | "Semantic" | "Both"
}

const testCases: ReadonlyArray<TestCase> = [
  // 1. Happy Path (Direct Keyword Matches)
  {
    category: "Happy Path",
    testName: "Find the player name",
    query: "Find the player name",
    expectedClasses: [`${BASE_NS}Player`],
    searchType: "Both"
  },
  {
    category: "Happy Path",
    testName: "List all teams",
    query: "List all teams in the dataset",
    expectedClasses: [`${BASE_NS}Team`],
    searchType: "Both"
  },
  {
    category: "Happy Path",
    testName: "Show stadium details",
    query: "Show me the stadium details",
    expectedClasses: [`${BASE_NS}Stadium`],
    searchType: "Both"
  },
  {
    category: "Happy Path",
    testName: "Who is the referee",
    query: "Who is the referee?",
    expectedClasses: [`${BASE_NS}Referee`],
    searchType: "Both"
  },
  {
    category: "Happy Path",
    testName: "What awards did he win",
    query: "What awards did he win?",
    expectedClasses: [`${BASE_NS}Award`],
    searchType: "Both"
  },

  // 2. Synonym Stress Test (Semantic Search)
  {
    category: "Synonym Test",
    testName: "Manager synonym for coach",
    query: "Who is the manager of this club?",
    expectedClasses: [`${BASE_NS}Coach`],
    searchType: "Semantic"
  },
  {
    category: "Synonym Test",
    testName: "Arena synonym for stadium",
    query: "What is the capacity of the arena?",
    expectedClasses: [`${BASE_NS}Stadium`],
    searchType: "Semantic"
  },
  {
    category: "Synonym Test",
    testName: "Officiated synonym for referee",
    query: "Who officiated the game?",
    expectedClasses: [`${BASE_NS}Referee`],
    searchType: "Semantic"
  },
  {
    category: "Synonym Test",
    testName: "Club synonym for team",
    query: "Which club plays here?",
    expectedClasses: [`${BASE_NS}Team`],
    searchType: "Semantic"
  },
  {
    category: "Synonym Test",
    testName: "Red card in performance stats",
    query: "Did he get a red card?",
    expectedClasses: [`${BASE_NS}PerformanceStats`],
    searchType: "Semantic"
  },

  // 3. Property-Implied Test
  {
    category: "Property-Implied",
    testName: "Goals property implies PerformanceStats",
    query: "How many goals did he score?",
    expectedClasses: [`${BASE_NS}PerformanceStats`],
    searchType: "Both"
  },
  {
    category: "Property-Implied",
    testName: "Formation property implies Team",
    query: "What formation do they play?",
    expectedClasses: [`${BASE_NS}Team`],
    searchType: "Both"
  },
  {
    category: "Property-Implied",
    testName: "Kickoff/Date implies Match",
    query: "When was the kickoff?",
    expectedClasses: [`${BASE_NS}Match`],
    searchType: "Both"
  },
  {
    category: "Property-Implied",
    testName: "Trophy associated league",
    query: "Which league is this trophy associated with?",
    expectedClasses: [`${BASE_NS}Trophy`],
    searchType: "Both"
  },
  {
    category: "Property-Implied",
    testName: "Height property implies Player",
    query: "How tall is he?",
    expectedClasses: [`${BASE_NS}Player`],
    searchType: "Both"
  },

  // 4. Ambiguity Test
  {
    category: "Ambiguity Test",
    testName: "Real Madrid vs Barcelona",
    query: "Real Madrid vs Barcelona",
    expectedClasses: [`${BASE_NS}Match`, `${BASE_NS}Team`],
    searchType: "Both"
  },
  {
    category: "Ambiguity Test",
    testName: "Champion",
    query: "Champion",
    expectedClasses: [`${BASE_NS}League`, `${BASE_NS}Tournament`],
    searchType: "Both"
  },
  {
    category: "Ambiguity Test",
    testName: "Yellow Card",
    query: "Yellow Card",
    expectedClasses: [`${BASE_NS}PerformanceStats`, `${BASE_NS}Referee`],
    searchType: "Both"
  },
  {
    category: "Ambiguity Test",
    testName: "Winner",
    query: "Winner",
    expectedClasses: [`${BASE_NS}Match`, `${BASE_NS}Trophy`],
    searchType: "Both"
  },

  // 5. Context Window Test
  {
    category: "Context Window",
    testName: "Ronaldo plays for Al-Nassr",
    query: "Ronaldo plays for Al-Nassr.",
    expectedClasses: [`${BASE_NS}Player`, `${BASE_NS}Team`],
    searchType: "Both"
  },
  {
    category: "Context Window",
    testName: "Match at Allianz Arena",
    query: "The match at Allianz Arena ended 2-0.",
    expectedClasses: [`${BASE_NS}Match`, `${BASE_NS}Stadium`],
    searchType: "Both"
  },
  {
    category: "Context Window",
    testName: "Messi won Ballon d'Or",
    query: "Messi won the Ballon d'Or in 2023.",
    expectedClasses: [`${BASE_NS}Player`, `${BASE_NS}Award`],
    searchType: "Both"
  }
]

interface TestResult {
  readonly category: string
  readonly testName: string
  readonly query: string
  readonly searchType: string
  readonly expectedClasses: string
  readonly foundClasses: string
  readonly allResults: string
  readonly passed: boolean
  readonly score: number
}

const runTest = (
  ontology: Awaited<ReturnType<typeof OntologyService.make>>,
  testCase: TestCase,
  searchType: "BM25" | "Semantic"
): Effect.Effect<TestResult, Error, NlpService> =>
  Effect.gen(function*() {
    const results = searchType === "BM25"
      ? yield* ontology.searchClasses(testCase.query, 10)
      : yield* ontology.searchClassesSemantic(testCase.query, 10)

    const resultIds = Chunk.toReadonlyArray(results).map((c) => c.id)
    const foundExpected = testCase.expectedClasses.filter((expected) => resultIds.includes(expected))
    const passed = foundExpected.length === testCase.expectedClasses.length
    const score = testCase.expectedClasses.length > 0 ? foundExpected.length / testCase.expectedClasses.length : 0

    return {
      category: testCase.category,
      testName: testCase.testName,
      query: testCase.query,
      searchType,
      expectedClasses: testCase.expectedClasses.join("; "),
      foundClasses: foundExpected.join("; "),
      allResults: resultIds.slice(0, 3).join("; "),
      passed,
      score
    }
  })

const escapeCsv = (value: string): string => {
  if (value.includes(",") || value.includes("\"") || value.includes("\n")) {
    return `"${value.replace(/"/g, "\"\"")}"`
  }
  return value
}

const formatCsvRow = (result: TestResult): string => {
  return [
    escapeCsv(result.category),
    escapeCsv(result.testName),
    escapeCsv(result.query),
    escapeCsv(result.searchType),
    escapeCsv(result.expectedClasses),
    escapeCsv(result.foundClasses),
    escapeCsv(result.allResults),
    result.passed ? "PASS" : "FAIL",
    result.score.toFixed(2)
  ].join(",")
}

const program = Effect.gen(function*() {
  const ontology = yield* OntologyService
  const fs = yield* FileSystem.FileSystem

  yield* Console.log("Running Search Quality Test Suite...\n")

  const allResults: Array<TestResult> = []

  for (const testCase of testCases) {
    if (testCase.searchType === "BM25" || testCase.searchType === "Both") {
      const result = yield* runTest(ontology, testCase, "BM25")
      allResults.push(result)
    }

    if (testCase.searchType === "Semantic" || testCase.searchType === "Both") {
      const result = yield* runTest(ontology, testCase, "Semantic")
      allResults.push(result)
    }
  }

  // Build CSV content
  const csvLines: Array<string> = []
  csvLines.push("Category,Test Name,Query,Search Type,Expected Classes,Found Classes,Top Results,Status,Score")

  for (const result of allResults) {
    csvLines.push(formatCsvRow(result))
  }

  const csvContent = csvLines.join("\n")

  // Write to file
  const csvPath = "search-quality-results.csv"
  yield* fs.writeFileString(csvPath, csvContent)

  yield* Console.log(`Results written to: ${csvPath}`)

  // Print summary to console
  const totalTests = allResults.length
  const passedTests = allResults.filter((r) => r.passed).length
  const avgScore = totalTests > 0 ? allResults.reduce((sum, r) => sum + r.score, 0) / totalTests : 0

  yield* Console.log("\n=== Summary ===")
  yield* Console.log(`Total Tests: ${totalTests}`)
  yield* Console.log(`Passed: ${passedTests}`)
  yield* Console.log(`Failed: ${totalTests - passedTests}`)
  yield* Console.log(`Average Score: ${avgScore.toFixed(2)}`)

  // Breakdown by search type
  const bm25Results = allResults.filter((r) => r.searchType === "BM25")
  const semanticResults = allResults.filter((r) => r.searchType === "Semantic")

  if (bm25Results.length > 0) {
    const bm25Passed = bm25Results.filter((r) => r.passed).length
    const bm25Avg = bm25Results.reduce((sum, r) => sum + r.score, 0) / bm25Results.length
    yield* Console.log(`\nBM25: ${bm25Passed}/${bm25Results.length} passed (avg: ${bm25Avg.toFixed(2)})`)
  }

  if (semanticResults.length > 0) {
    const semanticPassed = semanticResults.filter((r) => r.passed).length
    const semanticAvg = semanticResults.reduce((sum, r) => sum + r.score, 0) / semanticResults.length
    yield* Console.log(`Semantic: ${semanticPassed}/${semanticResults.length} passed (avg: ${semanticAvg.toFixed(2)})`)
  }
}).pipe(Effect.provide(liveLayer))

program.pipe(Effect.runPromise)

================
File: test/Schema/EntityFactory.test.ts
================
/**
 * Tests for Entity Schema Factory
 *
 * @module test/Schema/EntityFactory
 */

import { JSONSchema, Schema } from "effect"
import { describe, expect, it } from "vitest"
import { ClassDefinition } from "../../src/Domain/Model/Ontology.js"
import { EmptyVocabularyError, makeEntitySchema } from "../../src/Schema/EntityFactory.js"

describe("makeEntitySchema", () => {
  it("should create schema from ClassDefinition array", () => {
    const classes = [
      new ClassDefinition({
        id: "http://schema.org/Person",
        label: "Person",
        comment: "A person",
        properties: []
      }),
      new ClassDefinition({
        id: "http://schema.org/Organization",
        label: "Organization",
        comment: "An organization",
        properties: []
      })
    ]

    const schema = makeEntitySchema(classes)

    // Should be a valid schema
    expect(schema).toBeDefined()

    // Should generate JSON Schema
    const jsonSchema = JSONSchema.make(schema)
    expect(jsonSchema).toBeDefined()
    expect(jsonSchema).toHaveProperty("$ref")
  })

  it("should throw EmptyVocabularyError for empty class array", () => {
    expect(() => makeEntitySchema([])).toThrow(EmptyVocabularyError)
  })

  it("should create schema with correct structure matching Entity model", () => {
    const classes = [
      new ClassDefinition({
        id: "http://schema.org/Person",
        label: "Person",
        comment: "A person",
        properties: []
      })
    ]

    const schema = makeEntitySchema(classes)

    // Test that schema validates correct Entity structure
    const validEntity = {
      entities: [
        {
          id: "cristiano_ronaldo",
          mention: "Cristiano Ronaldo",
          types: ["http://schema.org/Person"],
          attributes: {
            "http://schema.org/age": 39
          }
        }
      ]
    }

    const result = Schema.decodeUnknownSync(schema)(validEntity)
    expect(result.entities).toHaveLength(1)
    expect(result.entities[0].id).toBe("cristiano_ronaldo")
    expect(result.entities[0].types).toEqual(["http://schema.org/Person"])
  })

  it("should reject entities with invalid types", () => {
    const classes = [
      new ClassDefinition({
        id: "http://schema.org/Person",
        label: "Person",
        comment: "A person",
        properties: []
      })
    ]

    const schema = makeEntitySchema(classes)

    const invalidEntity = {
      entities: [
        {
          id: "test_entity",
          mention: "Test",
          types: ["http://schema.org/InvalidClass"] // Not in allowed classes
        }
      ]
    }

    expect(() => Schema.decodeUnknownSync(schema)(invalidEntity)).toThrow()
  })

  it("should reject entities with invalid ID format", () => {
    const classes = [
      new ClassDefinition({
        id: "http://schema.org/Person",
        label: "Person",
        comment: "A person",
        properties: []
      })
    ]

    const schema = makeEntitySchema(classes)

    const invalidEntity = {
      entities: [
        {
          id: "Invalid-ID", // Not snake_case
          mention: "Test",
          types: ["http://schema.org/Person"]
        }
      ]
    }

    expect(() => Schema.decodeUnknownSync(schema)(invalidEntity)).toThrow()
  })

  it("should require at least one type", () => {
    const classes = [
      new ClassDefinition({
        id: "http://schema.org/Person",
        label: "Person",
        comment: "A person",
        properties: []
      })
    ]

    const schema = makeEntitySchema(classes)

    const invalidEntity = {
      entities: [
        {
          id: "test_entity",
          mention: "Test",
          types: [] // Empty types array
        }
      ]
    }

    expect(() => Schema.decodeUnknownSync(schema)(invalidEntity)).toThrow()
  })

  it("should support multiple types per entity", () => {
    const classes = [
      new ClassDefinition({
        id: "http://schema.org/Person",
        label: "Person",
        comment: "A person",
        properties: []
      }),
      new ClassDefinition({
        id: "http://schema.org/Athlete",
        label: "Athlete",
        comment: "An athlete",
        properties: []
      })
    ]

    const schema = makeEntitySchema(classes)

    const validEntity = {
      entities: [
        {
          id: "cristiano_ronaldo",
          mention: "Cristiano Ronaldo",
          types: ["http://schema.org/Person", "http://schema.org/Athlete"]
        }
      ]
    }

    const result = Schema.decodeUnknownSync(schema)(validEntity)
    expect(result.entities[0].types).toHaveLength(2)
  })

  it("should support optional attributes", () => {
    const classes = [
      new ClassDefinition({
        id: "http://schema.org/Person",
        label: "Person",
        comment: "A person",
        properties: []
      })
    ]

    const schema = makeEntitySchema(classes)

    // Entity without attributes
    const entityWithoutAttrs = {
      entities: [
        {
          id: "test_entity",
          mention: "Test",
          types: ["http://schema.org/Person"]
        }
      ]
    }

    const result1 = Schema.decodeUnknownSync(schema)(entityWithoutAttrs)
    expect(result1.entities[0].attributes).toBeUndefined()

    // Entity with attributes
    const entityWithAttrs = {
      entities: [
        {
          id: "test_entity",
          mention: "Test",
          types: ["http://schema.org/Person"],
          attributes: {
            "http://schema.org/age": 39,
            "http://schema.org/name": "Test Name",
            "http://schema.org/active": true
          }
        }
      ]
    }

    const result2 = Schema.decodeUnknownSync(schema)(entityWithAttrs)
    expect(result2.entities[0].attributes).toBeDefined()
    expect(result2.entities[0].attributes!["http://schema.org/age"]).toBe(39)
  })
})

================
File: test/Schema/RelationFactory.test.ts
================
/**
 * Tests for Relation Schema Factory
 *
 * @module test/Schema/RelationFactory
 */

import { JSONSchema, Schema } from "effect"
import { describe, expect, it } from "vitest"
import { PropertyDefinition } from "../../src/Domain/Model/Ontology.js"
import { EmptyVocabularyError, makeRelationSchema } from "../../src/Schema/RelationFactory.js"

describe("makeRelationSchema", () => {
  it("should create schema from entity IDs and PropertyDefinition array", () => {
    const validEntityIds = ["cristiano_ronaldo", "al_nassr"]
    const properties = [
      new PropertyDefinition({
        id: "http://schema.org/memberOf",
        label: "member of",
        comment: "Organization membership",
        domain: [],
        range: [],
        rangeType: "object"
      })
    ]

    const schema = makeRelationSchema(validEntityIds, properties)

    // Should be a valid schema
    expect(schema).toBeDefined()

    // Should generate JSON Schema
    const jsonSchema = JSONSchema.make(schema)
    expect(jsonSchema).toBeDefined()
    expect(jsonSchema).toHaveProperty("$ref")
  })

  it("should throw EmptyVocabularyError for empty entity IDs", () => {
    const properties = [
      new PropertyDefinition({
        id: "http://schema.org/memberOf",
        label: "member of",
        comment: "Organization membership",
        domain: [],
        range: [],
        rangeType: "object"
      })
    ]

    expect(() => makeRelationSchema([], properties)).toThrow(EmptyVocabularyError)
  })

  it("should throw EmptyVocabularyError for empty properties", () => {
    const validEntityIds = ["cristiano_ronaldo"]

    expect(() => makeRelationSchema(validEntityIds, [])).toThrow(EmptyVocabularyError)
  })

  it("should create schema with correct structure matching Relation model", () => {
    const validEntityIds = ["cristiano_ronaldo", "al_nassr"]
    const properties = [
      new PropertyDefinition({
        id: "http://schema.org/memberOf",
        label: "member of",
        comment: "Organization membership",
        domain: [],
        range: [],
        rangeType: "object"
      })
    ]

    const schema = makeRelationSchema(validEntityIds, properties)

    // Test that schema validates correct Relation structure
    const validRelation = {
      relations: [
        {
          subjectId: "cristiano_ronaldo",
          predicate: "http://schema.org/memberOf",
          object: "al_nassr" // Entity reference
        }
      ]
    }

    const result = Schema.decodeUnknownSync(schema)(validRelation)
    expect(result.relations).toHaveLength(1)
    expect(result.relations[0].subjectId).toBe("cristiano_ronaldo")
    expect(result.relations[0].predicate).toBe("http://schema.org/memberOf")
    expect(result.relations[0].object).toBe("al_nassr")
  })

  it("should reject relations with invalid subjectId", () => {
    const validEntityIds = ["cristiano_ronaldo"]
    const properties = [
      new PropertyDefinition({
        id: "http://schema.org/memberOf",
        label: "member of",
        comment: "Organization membership",
        domain: [],
        range: [],
        rangeType: "object"
      })
    ]

    const schema = makeRelationSchema(validEntityIds, properties)

    const invalidRelation = {
      relations: [
        {
          subjectId: "invalid_entity_id", // Not in validEntityIds
          predicate: "http://schema.org/memberOf",
          object: "cristiano_ronaldo"
        }
      ]
    }

    expect(() => Schema.decodeUnknownSync(schema)(invalidRelation)).toThrow()
  })

  it("should reject relations with invalid predicate", () => {
    const validEntityIds = ["cristiano_ronaldo", "al_nassr"]
    const properties = [
      new PropertyDefinition({
        id: "http://schema.org/memberOf",
        label: "member of",
        comment: "Organization membership",
        domain: [],
        range: [],
        rangeType: "object"
      })
    ]

    const schema = makeRelationSchema(validEntityIds, properties)

    const invalidRelation = {
      relations: [
        {
          subjectId: "cristiano_ronaldo",
          predicate: "http://schema.org/invalidProperty", // Not in allowed properties
          object: "al_nassr"
        }
      ]
    }

    expect(() => Schema.decodeUnknownSync(schema)(invalidRelation)).toThrow()
  })

  it("should support literal string objects", () => {
    const validEntityIds = ["cristiano_ronaldo"]
    const properties = [
      new PropertyDefinition({
        id: "http://schema.org/birthDate",
        label: "birth date",
        comment: "Date of birth",
        domain: [],
        range: [],
        rangeType: "datatype"
      })
    ]

    const schema = makeRelationSchema(validEntityIds, properties)

    const validRelation = {
      relations: [
        {
          subjectId: "cristiano_ronaldo",
          predicate: "http://schema.org/birthDate",
          object: "1985-02-05" // Literal string
        }
      ]
    }

    const result = Schema.decodeUnknownSync(schema)(validRelation)
    expect(result.relations[0].object).toBe("1985-02-05")
  })

  it("should support literal number objects", () => {
    const validEntityIds = ["cristiano_ronaldo"]
    const properties = [
      new PropertyDefinition({
        id: "http://schema.org/age",
        label: "age",
        comment: "Age in years",
        domain: [],
        range: [],
        rangeType: "datatype"
      })
    ]

    const schema = makeRelationSchema(validEntityIds, properties)

    const validRelation = {
      relations: [
        {
          subjectId: "cristiano_ronaldo",
          predicate: "http://schema.org/age",
          object: 39 // Literal number
        }
      ]
    }

    const result = Schema.decodeUnknownSync(schema)(validRelation)
    expect(result.relations[0].object).toBe(39)
  })

  it("should support literal boolean objects", () => {
    const validEntityIds = ["cristiano_ronaldo"]
    const properties = [
      new PropertyDefinition({
        id: "http://schema.org/active",
        label: "active",
        comment: "Whether the entity is active",
        domain: [],
        range: [],
        rangeType: "datatype"
      })
    ]

    const schema = makeRelationSchema(validEntityIds, properties)

    const validRelation = {
      relations: [
        {
          subjectId: "cristiano_ronaldo",
          predicate: "http://schema.org/active",
          object: true // Literal boolean
        }
      ]
    }

    const result = Schema.decodeUnknownSync(schema)(validRelation)
    expect(result.relations[0].object).toBe(true)
  })

  it("should support entity reference objects", () => {
    const validEntityIds = ["cristiano_ronaldo", "al_nassr"]
    const properties = [
      new PropertyDefinition({
        id: "http://schema.org/memberOf",
        label: "member of",
        comment: "Organization membership",
        domain: [],
        range: [],
        rangeType: "object"
      })
    ]

    const schema = makeRelationSchema(validEntityIds, properties)

    const validRelation = {
      relations: [
        {
          subjectId: "cristiano_ronaldo",
          predicate: "http://schema.org/memberOf",
          object: "al_nassr" // Entity reference (must be in validEntityIds)
        }
      ]
    }

    const result = Schema.decodeUnknownSync(schema)(validRelation)
    expect(result.relations[0].object).toBe("al_nassr")
  })

  it("should reject literal values for object properties", () => {
    const validEntityIds = ["cristiano_ronaldo", "al_nassr"]
    const properties = [
      new PropertyDefinition({
        id: "http://schema.org/memberOf",
        label: "member of",
        comment: "Organization membership",
        domain: [],
        range: [],
        rangeType: "object"
      })
    ]

    const schema = makeRelationSchema(validEntityIds, properties)

    // Object property should reject literal string (not entity ID)
    const invalidRelation = {
      relations: [
        {
          subjectId: "cristiano_ronaldo",
          predicate: "http://schema.org/memberOf",
          object: "1985-02-05" // Literal string, not entity ID - should be rejected
        }
      ]
    }

    expect(() => Schema.decodeUnknownSync(schema)(invalidRelation)).toThrow()
  })

  it("should accept any string for datatype properties (schema cannot distinguish entity IDs from literals)", () => {
    // Note: Schema validation cannot distinguish between entity IDs and literal strings
    // because both are strings. The schema enforces structure, not semantic meaning.
    // Entity ID validation happens at runtime via Relation.isEntityReference.
    const validEntityIds = ["cristiano_ronaldo", "al_nassr"]
    const properties = [
      new PropertyDefinition({
        id: "http://schema.org/birthDate",
        label: "birth date",
        comment: "Date of birth",
        domain: [],
        range: [],
        rangeType: "datatype"
      })
    ]

    const schema = makeRelationSchema(validEntityIds, properties)

    // Datatype property accepts any string (including strings that look like entity IDs)
    // The schema validates structure (string/number/boolean), not semantic meaning
    const relation = {
      relations: [
        {
          subjectId: "cristiano_ronaldo",
          predicate: "http://schema.org/birthDate",
          object: "al_nassr" // String literal - schema accepts it (can't distinguish from entity ID)
        }
      ]
    }

    const result = Schema.decodeUnknownSync(schema)(relation)
    expect(result.relations[0].object).toBe("al_nassr")
  })

  it("should enforce rangeType constraints with mixed properties", () => {
    const validEntityIds = ["cristiano_ronaldo", "al_nassr"]
    const properties = [
      new PropertyDefinition({
        id: "http://schema.org/memberOf",
        label: "member of",
        comment: "Organization membership",
        domain: [],
        range: [],
        rangeType: "object"
      }),
      new PropertyDefinition({
        id: "http://schema.org/birthDate",
        label: "birth date",
        comment: "Date of birth",
        domain: [],
        range: [],
        rangeType: "datatype"
      })
    ]

    const schema = makeRelationSchema(validEntityIds, properties)

    // Valid: object property with entity ID
    const validObjectRelation = {
      relations: [
        {
          subjectId: "cristiano_ronaldo",
          predicate: "http://schema.org/memberOf",
          object: "al_nassr" // Entity ID - valid for object property
        }
      ]
    }
    expect(() => Schema.decodeUnknownSync(schema)(validObjectRelation)).not.toThrow()

    // Valid: datatype property with literal
    const validDatatypeRelation = {
      relations: [
        {
          subjectId: "cristiano_ronaldo",
          predicate: "http://schema.org/birthDate",
          object: "1985-02-05" // Literal - valid for datatype property
        }
      ]
    }
    expect(() => Schema.decodeUnknownSync(schema)(validDatatypeRelation)).not.toThrow()

    // Invalid: object property with literal
    const invalidObjectRelation = {
      relations: [
        {
          subjectId: "cristiano_ronaldo",
          predicate: "http://schema.org/memberOf",
          object: "1985-02-05" // Literal - invalid for object property
        }
      ]
    }
    expect(() => Schema.decodeUnknownSync(schema)(invalidObjectRelation)).toThrow()

    // Note: Schema cannot reject entity IDs for datatype properties because
    // entity IDs are strings, and datatype properties accept strings.
    // The distinction is semantic, not structural, so schema validation passes.
    // Runtime validation (via Relation.isEntityReference) would catch this.
    const datatypeRelationWithEntityId = {
      relations: [
        {
          subjectId: "cristiano_ronaldo",
          predicate: "http://schema.org/birthDate",
          object: "al_nassr" // String that looks like entity ID - schema accepts as string literal
        }
      ]
    }
    // Schema accepts this because "al_nassr" is a valid string
    const result = Schema.decodeUnknownSync(schema)(datatypeRelationWithEntityId)
    expect(result.relations[0].object).toBe("al_nassr")
  })

  it("should handle all object properties correctly", () => {
    const validEntityIds = ["entity_a", "entity_b"]
    const properties = [
      new PropertyDefinition({
        id: "http://schema.org/knows",
        label: "knows",
        comment: "Knows relationship",
        domain: [],
        range: [],
        rangeType: "object"
      }),
      new PropertyDefinition({
        id: "http://schema.org/memberOf",
        label: "member of",
        comment: "Organization membership",
        domain: [],
        range: [],
        rangeType: "object"
      })
    ]

    const schema = makeRelationSchema(validEntityIds, properties)

    // Should accept entity IDs for all object properties
    const validRelation = {
      relations: [
        {
          subjectId: "entity_a",
          predicate: "http://schema.org/knows",
          object: "entity_b"
        },
        {
          subjectId: "entity_a",
          predicate: "http://schema.org/memberOf",
          object: "entity_b"
        }
      ]
    }

    const result = Schema.decodeUnknownSync(schema)(validRelation)
    expect(result.relations).toHaveLength(2)
  })

  it("should handle all datatype properties correctly", () => {
    const validEntityIds = ["entity_a"]
    const properties = [
      new PropertyDefinition({
        id: "http://schema.org/name",
        label: "name",
        comment: "Entity name",
        domain: [],
        range: [],
        rangeType: "datatype"
      }),
      new PropertyDefinition({
        id: "http://schema.org/age",
        label: "age",
        comment: "Age in years",
        domain: [],
        range: [],
        rangeType: "datatype"
      })
    ]

    const schema = makeRelationSchema(validEntityIds, properties)

    // Should accept literals for all datatype properties
    const validRelation = {
      relations: [
        {
          subjectId: "entity_a",
          predicate: "http://schema.org/name",
          object: "Alice"
        },
        {
          subjectId: "entity_a",
          predicate: "http://schema.org/age",
          object: 30
        }
      ]
    }

    const result = Schema.decodeUnknownSync(schema)(validRelation)
    expect(result.relations).toHaveLength(2)
  })
})

================
File: test/Workflow/Merge.test.ts
================
/**
 * Tests for Graph Merge Utilities
 *
 * Tests Relation deduplication using structural equality and hashing.
 *
 * @module test/Workflow/Merge
 */

import { Equal, Hash, HashSet } from "effect"
import { describe, expect, it } from "vitest"
import { Entity, KnowledgeGraph, Relation } from "../../src/Domain/Model/Entity.js"
import { mergeGraphs, mergeGraphsWithConflicts } from "../../src/Workflow/Merge.js"

describe("Relation Structural Equality", () => {
  describe("Equal.equals", () => {
    it("should return true for identical Relation instances", () => {
      const r1 = new Relation({
        subjectId: "entity_a",
        predicate: "http://schema.org/memberOf",
        object: "entity_b"
      })
      const r2 = new Relation({
        subjectId: "entity_a",
        predicate: "http://schema.org/memberOf",
        object: "entity_b"
      })

      expect(Equal.equals(r1, r2)).toBe(true)
    })

    it("should return false for Relations with different subjectId", () => {
      const r1 = new Relation({
        subjectId: "entity_a",
        predicate: "http://schema.org/memberOf",
        object: "entity_b"
      })
      const r2 = new Relation({
        subjectId: "entity_c",
        predicate: "http://schema.org/memberOf",
        object: "entity_b"
      })

      expect(Equal.equals(r1, r2)).toBe(false)
    })

    it("should return false for Relations with different predicate", () => {
      const r1 = new Relation({
        subjectId: "entity_a",
        predicate: "http://schema.org/memberOf",
        object: "entity_b"
      })
      const r2 = new Relation({
        subjectId: "entity_a",
        predicate: "http://schema.org/knows",
        object: "entity_b"
      })

      expect(Equal.equals(r1, r2)).toBe(false)
    })

    it("should return false for Relations with different object", () => {
      const r1 = new Relation({
        subjectId: "entity_a",
        predicate: "http://schema.org/memberOf",
        object: "entity_b"
      })
      const r2 = new Relation({
        subjectId: "entity_a",
        predicate: "http://schema.org/memberOf",
        object: "entity_c"
      })

      expect(Equal.equals(r1, r2)).toBe(false)
    })

    it("should handle string literal objects", () => {
      const r1 = new Relation({
        subjectId: "entity_a",
        predicate: "http://schema.org/birthDate",
        object: "1985-02-05"
      })
      const r2 = new Relation({
        subjectId: "entity_a",
        predicate: "http://schema.org/birthDate",
        object: "1985-02-05"
      })
      const r3 = new Relation({
        subjectId: "entity_a",
        predicate: "http://schema.org/birthDate",
        object: "1986-02-05"
      })

      expect(Equal.equals(r1, r2)).toBe(true)
      expect(Equal.equals(r1, r3)).toBe(false)
    })

    it("should handle number literal objects", () => {
      const r1 = new Relation({
        subjectId: "entity_a",
        predicate: "http://schema.org/age",
        object: 39
      })
      const r2 = new Relation({
        subjectId: "entity_a",
        predicate: "http://schema.org/age",
        object: 39
      })
      const r3 = new Relation({
        subjectId: "entity_a",
        predicate: "http://schema.org/age",
        object: 40
      })

      expect(Equal.equals(r1, r2)).toBe(true)
      expect(Equal.equals(r1, r3)).toBe(false)
    })

    it("should handle boolean literal objects", () => {
      const r1 = new Relation({
        subjectId: "entity_a",
        predicate: "http://schema.org/active",
        object: true
      })
      const r2 = new Relation({
        subjectId: "entity_a",
        predicate: "http://schema.org/active",
        object: true
      })
      const r3 = new Relation({
        subjectId: "entity_a",
        predicate: "http://schema.org/active",
        object: false
      })

      expect(Equal.equals(r1, r2)).toBe(true)
      expect(Equal.equals(r1, r3)).toBe(false)
    })

    it("should distinguish between entity reference and string literal", () => {
      // Entity reference (snake_case)
      const r1 = new Relation({
        subjectId: "entity_a",
        predicate: "http://schema.org/memberOf",
        object: "entity_b"
      })
      // String literal (not snake_case)
      const r2 = new Relation({
        subjectId: "entity_a",
        predicate: "http://schema.org/memberOf",
        object: "Entity B"
      })

      expect(Equal.equals(r1, r2)).toBe(false)
    })
  })

  describe("Hash consistency", () => {
    it("should produce same hash for identical Relation instances", () => {
      const r1 = new Relation({
        subjectId: "entity_a",
        predicate: "http://schema.org/memberOf",
        object: "entity_b"
      })
      const r2 = new Relation({
        subjectId: "entity_a",
        predicate: "http://schema.org/memberOf",
        object: "entity_b"
      })

      expect(Hash.hash(r1)).toBe(Hash.hash(r2))
    })

    it("should produce different hashes for different Relations", () => {
      const r1 = new Relation({
        subjectId: "entity_a",
        predicate: "http://schema.org/memberOf",
        object: "entity_b"
      })
      const r2 = new Relation({
        subjectId: "entity_c",
        predicate: "http://schema.org/memberOf",
        object: "entity_b"
      })
      const r3 = new Relation({
        subjectId: "entity_a",
        predicate: "http://schema.org/knows",
        object: "entity_b"
      })
      const r4 = new Relation({
        subjectId: "entity_a",
        predicate: "http://schema.org/memberOf",
        object: "entity_d"
      })

      expect(Hash.hash(r1)).not.toBe(Hash.hash(r2))
      expect(Hash.hash(r1)).not.toBe(Hash.hash(r3))
      expect(Hash.hash(r1)).not.toBe(Hash.hash(r4))
    })

    it("should handle different object types in hash", () => {
      const r1 = new Relation({
        subjectId: "entity_a",
        predicate: "http://schema.org/value",
        object: "string"
      })
      const r2 = new Relation({
        subjectId: "entity_a",
        predicate: "http://schema.org/value",
        object: 42
      })
      const r3 = new Relation({
        subjectId: "entity_a",
        predicate: "http://schema.org/value",
        object: true
      })

      expect(Hash.hash(r1)).not.toBe(Hash.hash(r2))
      expect(Hash.hash(r1)).not.toBe(Hash.hash(r3))
      expect(Hash.hash(r2)).not.toBe(Hash.hash(r3))
    })
  })
})

describe("HashSet Deduplication", () => {
  it("should deduplicate identical Relation instances from different chunks", () => {
    const r1 = new Relation({
      subjectId: "entity_a",
      predicate: "http://schema.org/memberOf",
      object: "entity_b"
    })
    const r2 = new Relation({
      subjectId: "entity_a",
      predicate: "http://schema.org/memberOf",
      object: "entity_b"
    })

    const set = HashSet.fromIterable([r1, r2])
    const values = HashSet.toValues(set)

    expect(values.length).toBe(1)
    expect(Equal.equals(values[0]!, r1)).toBe(true)
  })

  it("should preserve distinct Relations in HashSet", () => {
    const relations = [
      new Relation({
        subjectId: "entity_a",
        predicate: "http://schema.org/memberOf",
        object: "entity_b"
      }),
      new Relation({
        subjectId: "entity_a",
        predicate: "http://schema.org/knows",
        object: "entity_b"
      }),
      new Relation({
        subjectId: "entity_c",
        predicate: "http://schema.org/memberOf",
        object: "entity_b"
      })
    ]

    const set = HashSet.fromIterable(relations)
    const values = HashSet.toValues(set)

    expect(values.length).toBe(3)
  })

  it("should deduplicate Relations with string, number, and boolean objects", () => {
    const relations = [
      new Relation({
        subjectId: "entity_a",
        predicate: "http://schema.org/birthDate",
        object: "1985-02-05"
      }),
      new Relation({
        subjectId: "entity_a",
        predicate: "http://schema.org/birthDate",
        object: "1985-02-05" // Duplicate
      }),
      new Relation({
        subjectId: "entity_a",
        predicate: "http://schema.org/age",
        object: 39
      }),
      new Relation({
        subjectId: "entity_a",
        predicate: "http://schema.org/age",
        object: 39 // Duplicate
      }),
      new Relation({
        subjectId: "entity_a",
        predicate: "http://schema.org/active",
        object: true
      }),
      new Relation({
        subjectId: "entity_a",
        predicate: "http://schema.org/active",
        object: true // Duplicate
      })
    ]

    const set = HashSet.fromIterable(relations)
    const values = HashSet.toValues(set)

    expect(values.length).toBe(3)
  })
})

describe("mergeGraphs", () => {
  it("should deduplicate identical relations from different chunks", () => {
    const relation1 = new Relation({
      subjectId: "cristiano_ronaldo",
      predicate: "http://schema.org/memberOf",
      object: "al_nassr_fc"
    })
    const relation2 = new Relation({
      subjectId: "cristiano_ronaldo",
      predicate: "http://schema.org/memberOf",
      object: "al_nassr_fc"
    })

    const graph1 = new KnowledgeGraph({
      entities: [],
      relations: [relation1]
    })

    const graph2 = new KnowledgeGraph({
      entities: [],
      relations: [relation2]
    })

    const merged = mergeGraphs(graph1, graph2)

    expect(merged.relations.length).toBe(1)
    expect(Equal.equals(merged.relations[0]!, relation1)).toBe(true)
  })

  it("should preserve distinct relations from different chunks", () => {
    const relation1 = new Relation({
      subjectId: "cristiano_ronaldo",
      predicate: "http://schema.org/memberOf",
      object: "al_nassr_fc"
    })
    const relation2 = new Relation({
      subjectId: "cristiano_ronaldo",
      predicate: "http://schema.org/knows",
      object: "messi"
    })

    const graph1 = new KnowledgeGraph({
      entities: [],
      relations: [relation1]
    })

    const graph2 = new KnowledgeGraph({
      entities: [],
      relations: [relation2]
    })

    const merged = mergeGraphs(graph1, graph2)

    expect(merged.relations.length).toBe(2)
  })

  it("should handle complex real-world scenario with overlapping relations", () => {
    // Create entities
    const entity1 = new Entity({
      id: "cristiano_ronaldo",
      mention: "Cristiano Ronaldo",
      types: ["http://schema.org/Person"],
      attributes: {}
    })
    const entity2 = new Entity({
      id: "al_nassr_fc",
      mention: "Al-Nassr FC",
      types: ["http://schema.org/Organization"],
      attributes: {}
    })

    // Create relations - some duplicates across chunks
    const relation1 = new Relation({
      subjectId: "cristiano_ronaldo",
      predicate: "http://schema.org/memberOf",
      object: "al_nassr_fc"
    })
    const relation2 = new Relation({
      subjectId: "cristiano_ronaldo",
      predicate: "http://schema.org/memberOf",
      object: "al_nassr_fc" // Duplicate from different chunk
    })
    const relation3 = new Relation({
      subjectId: "cristiano_ronaldo",
      predicate: "http://schema.org/birthDate",
      object: "1985-02-05"
    })
    const relation4 = new Relation({
      subjectId: "cristiano_ronaldo",
      predicate: "http://schema.org/birthDate",
      object: "1985-02-05" // Duplicate from different chunk
    })
    const relation5 = new Relation({
      subjectId: "cristiano_ronaldo",
      predicate: "http://schema.org/age",
      object: 39
    })

    const graph1 = new KnowledgeGraph({
      entities: [entity1, entity2],
      relations: [relation1, relation3, relation5]
    })

    const graph2 = new KnowledgeGraph({
      entities: [entity1, entity2], // Same entities
      relations: [relation2, relation4] // Duplicates of relation1 and relation3
    })

    const merged = mergeGraphs(graph1, graph2)

    // Should have 3 unique relations (relation1/2 are same, relation3/4 are same)
    expect(merged.relations.length).toBe(3)

    // Verify all relations are present
    const hasMemberOf = merged.relations.some(
      (r) =>
        r.subjectId === "cristiano_ronaldo" &&
        r.predicate === "http://schema.org/memberOf" &&
        r.object === "al_nassr_fc"
    )
    const hasBirthDate = merged.relations.some(
      (r) =>
        r.subjectId === "cristiano_ronaldo" &&
        r.predicate === "http://schema.org/birthDate" &&
        r.object === "1985-02-05"
    )
    const hasAge = merged.relations.some(
      (r) =>
        r.subjectId === "cristiano_ronaldo" &&
        r.predicate === "http://schema.org/age" &&
        r.object === 39
    )

    expect(hasMemberOf).toBe(true)
    expect(hasBirthDate).toBe(true)
    expect(hasAge).toBe(true)
  })

  it("should produce deterministically sorted relations", () => {
    const relations = [
      new Relation({
        subjectId: "zebra",
        predicate: "http://schema.org/type",
        object: "animal"
      }),
      new Relation({
        subjectId: "apple",
        predicate: "http://schema.org/type",
        object: "fruit"
      }),
      new Relation({
        subjectId: "apple",
        predicate: "http://schema.org/color",
        object: "red"
      })
    ]

    const graph1 = new KnowledgeGraph({
      entities: [],
      relations: [relations[0]!, relations[1]!]
    })

    const graph2 = new KnowledgeGraph({
      entities: [],
      relations: [relations[2]!]
    })

    const merged1 = mergeGraphs(graph1, graph2)
    const merged2 = mergeGraphs(graph2, graph1) // Reverse order

    // Should produce same sorted order regardless of merge order
    expect(merged1.relations.length).toBe(3)
    expect(merged2.relations.length).toBe(3)

    // Relations should be sorted by (subjectId, predicate, object)
    expect(merged1.relations[0]!.subjectId).toBe("apple")
    expect(merged1.relations[1]!.subjectId).toBe("apple")
    expect(merged1.relations[2]!.subjectId).toBe("zebra")

    // Both merges should produce same order
    expect(merged1.relations.map((r) => r.subjectId)).toEqual(
      merged2.relations.map((r) => r.subjectId)
    )
  })
})

describe("mergeGraphsWithConflicts", () => {
  it("should deduplicate relations while detecting entity conflicts", () => {
    const entity1 = new Entity({
      id: "test_entity",
      mention: "Test",
      types: ["http://schema.org/Thing"],
      attributes: { "http://schema.org/name": "Value1" }
    })
    const entity2 = new Entity({
      id: "test_entity",
      mention: "Test",
      types: ["http://schema.org/Thing"],
      attributes: { "http://schema.org/name": "Value2" }
    })

    const relation1 = new Relation({
      subjectId: "test_entity",
      predicate: "http://schema.org/type",
      object: "thing"
    })
    const relation2 = new Relation({
      subjectId: "test_entity",
      predicate: "http://schema.org/type",
      object: "thing" // Duplicate
    })

    const graph1 = new KnowledgeGraph({
      entities: [entity1],
      relations: [relation1]
    })

    const graph2 = new KnowledgeGraph({
      entities: [entity2],
      relations: [relation2]
    })

    const [merged, conflicts] = mergeGraphsWithConflicts(graph1, graph2)

    // Should detect entity attribute conflict
    expect(conflicts.length).toBeGreaterThan(0)

    // Should deduplicate relations
    expect(merged.relations.length).toBe(1)
  })
})

================
File: test/Ontology.test.ts
================
/**
 * Tests: OntologyService - Production-ready with real ontology loading
 */

import { BunContext } from "@effect/platform-bun"
import { Effect, Layer } from "effect"
import * as path from "node:path"
import { describe, expect, it } from "vitest"
import { ConfigService, DEFAULT_CONFIG } from "../src/Service/Config.js"
import { NlpService } from "../src/Service/Nlp.js"
import { OntologyService } from "../src/Service/Ontology.js"
import { RdfBuilder } from "../src/Service/Rdf.js"

describe("OntologyService - Football Ontology", () => {
  // Configure to use football ontology - override only the path
  const TestConfig = Layer.succeed(ConfigService, {
    ...DEFAULT_CONFIG,
    ontology: {
      ...DEFAULT_CONFIG.ontology,
      path: path.join(process.cwd(), "../../../ontologies/football/ontology.ttl")
    }
  } as ConfigService)

  const TestLayer = Layer.mergeAll(
    OntologyService.Default("/Users/pooks/Dev/effect-ontology/ontologies/football/ontology.ttl"),
    NlpService.Default,
    RdfBuilder.Default,
    TestConfig
  ).pipe(Layer.provideMerge(BunContext.layer))

  describe("Entity-First Semantic Search", () => {
    it("should load football ontology and find Player class", () =>
      Effect.gen(function*() {
        const ontology = yield* OntologyService

        const results = yield* ontology.searchClasses("soccer player athlete", 5)

        expect(results.length).toBeGreaterThan(0)
        // Should find Player class
        const hasPlayer = Array.from(results).some((c) => c.label.toLowerCase().includes("player"))
        expect(hasPlayer).toBe(true)
      }).pipe(Effect.provide(TestLayer), Effect.runPromise))

    it("should find Team class when searching for team-related terms", () =>
      Effect.gen(function*() {
        const ontology = yield* OntologyService

        const results = yield* ontology.searchClasses("football team club squad", 5)

        expect(results.length).toBeGreaterThan(0)
        const hasTeam = Array.from(results).some((c) => c.label.toLowerCase().includes("team"))
        expect(hasTeam).toBe(true)
      }).pipe(Effect.provide(TestLayer), Effect.runPromise))

    it("should find Coach class", () =>
      Effect.gen(function*() {
        const ontology = yield* OntologyService

        const results = yield* ontology.searchClasses("manager coach trainer", 3)

        expect(results.length).toBeGreaterThan(0)
        const hasCoach = Array.from(results).some((c) => c.label.toLowerCase().includes("coach"))
        expect(hasCoach).toBe(true)
      }).pipe(Effect.provide(TestLayer), Effect.runPromise))

    it("should find Stadium class", () =>
      Effect.gen(function*() {
        const ontology = yield* OntologyService

        const results = yield* ontology.searchClasses("stadium arena venue", 3)

        expect(results.length).toBeGreaterThan(0)
        const hasStadium = Array.from(results).some((c) => c.label.toLowerCase().includes("stadium"))
        expect(hasStadium).toBe(true)
      }).pipe(Effect.provide(TestLayer), Effect.runPromise))

    it("should respect limit parameter", () =>
      Effect.gen(function*() {
        const ontology = yield* OntologyService

        const results = yield* ontology.searchClasses("football", 3)

        expect(results.length).toBeLessThanOrEqual(3)
      }).pipe(Effect.provide(TestLayer), Effect.runPromise))
  })

  describe("Property Retrieval (Domain Lookup)", () => {
    it("should get properties for Player class domain", () =>
      Effect.gen(function*() {
        const ontology = yield* OntologyService

        // Find Player class first
        const classes = yield* ontology.searchClasses("player", 5)
        const playerClass = Array.from(classes).find((c) => c.label.toLowerCase() === "player")

        if (!playerClass) {
          throw new Error("Player class not found")
        }

        // Get properties for Player
        const properties = yield* ontology.getPropertiesFor([playerClass.id])

        expect(properties.length).toBeGreaterThan(0)
        // Should have properties like playsFor, hasPosition, etc.
      }).pipe(Effect.provide(TestLayer), Effect.runPromise))

    it("should filter properties by domain correctly", () =>
      Effect.gen(function*() {
        const ontology = yield* OntologyService

        // Find Team class
        const classes = yield* ontology.searchClasses("team", 5)
        const teamClass = Array.from(classes).find((c) => c.label.toLowerCase() === "team")

        if (!teamClass) {
          throw new Error("Team class not found")
        }

        // Get properties for Team
        const teamProps = yield* ontology.getPropertiesFor([teamClass.id])

        expect(teamProps.length).toBeGreaterThan(0)
      }).pipe(Effect.provide(TestLayer), Effect.runPromise))
  })
})

================
File: test/RdfBuilder.test.ts
================
/**
 * RdfBuilder Tests
 *
 * Integration tests for RdfBuilder service with N3.js
 *
 * @since 2.0.0
 */

import { Effect, Layer } from "effect"
import { describe, expect, it } from "vitest"
import { Entity, Relation } from "../src/Domain/Model/Entity.js"
import { ConfigService, RdfBuilder } from "../src/index.js"

describe("RdfBuilder", () => {
  const testLayer = Layer.mergeAll(
    ConfigService.Default,
    RdfBuilder.Default
  )

  describe("Entity to RDF conversion", () => {
    it("should convert entities to Turtle RDF", () =>
      Effect.gen(function*() {
        // Create test entity
        const entity = new Entity({
          id: "test_entity",
          mention: "Test Entity",
          types: ["http://schema.org/Thing"],
          attributes: {
            "http://schema.org/name": "Test",
            "http://schema.org/age": 42,
            "http://schema.org/active": true
          }
        })

        // Build RDF in scoped context
        const turtle = yield* Effect.gen(function*() {
          const store = yield* RdfBuilder.makeStore
          yield* RdfBuilder.addEntities(store, [entity])
          return yield* RdfBuilder.toTurtle(store)
        }).pipe(Effect.scoped)

        // Verify Turtle output (uses prefixes)
        expect(turtle).toContain("test_entity")
        expect(turtle).toContain("schema:Thing") // Prefixed version
        expect(turtle).toContain("Test Entity")
        expect(turtle).toContain("Test")
        expect(turtle).toContain("42")
        expect(turtle).toContain("true")
      }).pipe(Effect.provide(testLayer), Effect.runPromise))

    it("should use prefixes from ConfigService", () =>
      Effect.gen(function*() {
        const entity = new Entity({
          id: "prefixed_entity",
          mention: "Prefixed",
          types: ["http://schema.org/Person"],
          attributes: {}
        })

        const turtle = yield* Effect.gen(function*() {
          const store = yield* RdfBuilder.makeStore
          yield* RdfBuilder.addEntities(store, [entity])
          return yield* RdfBuilder.toTurtle(store)
        }).pipe(Effect.scoped)

        // Should use prefixes (e.g., @prefix schema: <http://schema.org/>)
        expect(turtle).toMatch(/@prefix/)
      }).pipe(Effect.provide(testLayer), Effect.runPromise))
  })

  describe("Relation to RDF conversion", () => {
    it("should convert entity-reference relations to RDF", () =>
      Effect.gen(function*() {
        const entity1 = new Entity({
          id: "person1",
          mention: "Alice",
          types: ["http://schema.org/Person"],
          attributes: {}
        })

        const entity2 = new Entity({
          id: "person2",
          mention: "Bob",
          types: ["http://schema.org/Person"],
          attributes: {}
        })

        const relation = new Relation({
          subjectId: "person1",
          predicate: "http://schema.org/knows",
          object: "person2" // Entity reference (detected by getter)
        })

        const turtle = yield* Effect.gen(function*() {
          const store = yield* RdfBuilder.makeStore
          yield* RdfBuilder.addEntities(store, [entity1, entity2])
          yield* RdfBuilder.addRelations(store, [relation])
          return yield* RdfBuilder.toTurtle(store)
        }).pipe(Effect.scoped)

        expect(turtle).toContain("person1")
        expect(turtle).toContain("person2")
        expect(turtle).toContain("knows")
      }).pipe(Effect.provide(testLayer), Effect.runPromise))

    it("should convert literal-value relations to RDF", () =>
      Effect.gen(function*() {
        const entity = new Entity({
          id: "person",
          mention: "Alice",
          types: ["http://schema.org/Person"],
          attributes: {}
        })

        const relation = new Relation({
          subjectId: "person",
          predicate: "http://schema.org/age",
          object: 30 // Literal value (number)
        })

        const turtle = yield* Effect.gen(function*() {
          const store = yield* RdfBuilder.makeStore
          yield* RdfBuilder.addEntities(store, [entity])
          yield* RdfBuilder.addRelations(store, [relation])
          return yield* RdfBuilder.toTurtle(store)
        }).pipe(Effect.scoped)

        expect(turtle).toContain("person")
        expect(turtle).toContain("age")
        expect(turtle).toContain("30")
      }).pipe(Effect.provide(testLayer), Effect.runPromise))
  })

  describe("Resource management", () => {
    it("should clean up store after scope", () =>
      Effect.gen(function*() {
        let storeSize = 0

        yield* Effect.gen(function*() {
          const store = yield* RdfBuilder.makeStore
          yield* RdfBuilder.addEntities(store, [
            new Entity({
              id: "test",
              mention: "Test",
              types: ["http://schema.org/Thing"],
              attributes: {}
            })
          ])
          storeSize = store.size
        }).pipe(Effect.scoped)

        // Store should have had quads
        expect(storeSize).toBeGreaterThan(0)
        // Note: can't verify cleanup directly, but scope handles it
      }).pipe(Effect.provide(testLayer), Effect.runPromise))
  })

  describe("Validation placeholder", () => {
    it("should return validation result", () =>
      Effect.gen(function*() {
        const result = yield* Effect.gen(function*() {
          const store = yield* RdfBuilder.makeStore
          return yield* RdfBuilder.validate(store, "# shapes graph")
        }).pipe(Effect.scoped)

        expect(result.conforms).toBe(true)
        expect(result.report).toContain("not yet implemented")
      }).pipe(Effect.provide(testLayer), Effect.runPromise))
  })
})

================
File: package.json
================
{
    "name": "@effect-ontology/core-v2",
    "version": "0.0.0",
    "type": "module",
    "private": true,
    "description": "Effect-native knowledge extraction core - v2 migration",
    "exports": {
        ".": "./src/index.ts",
        "./Domain": "./src/Domain/index.ts",
        "./Service": "./src/Service/index.ts",
        "./Workflow": "./src/Workflow/index.ts",
        "./Schema": "./src/Schema/index.ts",
        "./Runtime": "./src/Runtime/index.ts"
    },
    "scripts": {
        "build": "tsc --skipLibCheck --project tsconfig.build.json",
        "test": "vitest --run",
        "test:watch": "vitest",
        "test:ui": "vitest --ui",
        "check": "tsc -b tsconfig.json"
    },
    "dependencies": {
        "@effect/opentelemetry": "^0.59.1",
        "@effect/platform-bun": "^0.84.0",
        "@effect/printer": "^0.47.0",
        "@effect/typeclass": "^0.38.0",
        "@opentelemetry/api": "^1.9.0",
        "@opentelemetry/exporter-trace-otlp-http": "^0.208.0",
        "@opentelemetry/sdk-logs": "^0.208.0",
        "@opentelemetry/sdk-metrics": "^2.2.0",
        "@opentelemetry/sdk-trace-base": "^2.2.0",
        "@opentelemetry/sdk-trace-node": "^2.2.0",
        "@opentelemetry/sdk-trace-web": "^2.2.0",
        "effect": "^3.19.6",
        "n3": "^1.26.0",
        "wink-bm25-text-search": "^3.1.2",
        "wink-embeddings-sg-100d": "^1.1.0",
        "wink-eng-lite-web-model": "^1.8.1",
        "wink-nlp": "^2.4.0",
        "wink-nlp-utils": "^2.1.0"
    },
    "devDependencies": {
        "@effect/vitest": "^0.25.1",
        "@fast-check/vitest": "^0.2.3",
        "@types/n3": "^1.26.1",
        "@types/node": "^22.5.2",
        "fast-check": "^4.3.0",
        "typescript": "^5.6.2",
        "vitest": "^3.2.0"
    }
}

================
File: search-quality-results.csv
================
Category,Test Name,Query,Search Type,Expected Classes,Found Classes,Top Results,Status,Score
Happy Path,Find the player name,Find the player name,BM25,http://visualdataweb.org/newOntology/Player,http://visualdataweb.org/newOntology/Player,http://visualdataweb.org/newOntology/Player,PASS,1.00
Happy Path,Find the player name,Find the player name,Semantic,http://visualdataweb.org/newOntology/Player,http://visualdataweb.org/newOntology/Player,http://visualdataweb.org/newOntology/Player,PASS,1.00
Happy Path,List all teams,List all teams in the dataset,BM25,http://visualdataweb.org/newOntology/Team,,http://visualdataweb.org/newOntology/League; http://visualdataweb.org/newOntology/Coach; http://visualdataweb.org/newOntology/Tournament,FAIL,0.00
Happy Path,List all teams,List all teams in the dataset,Semantic,http://visualdataweb.org/newOntology/Team,,,FAIL,0.00
Happy Path,Show stadium details,Show me the stadium details,BM25,http://visualdataweb.org/newOntology/Stadium,http://visualdataweb.org/newOntology/Stadium,http://visualdataweb.org/newOntology/Stadium,PASS,1.00
Happy Path,Show stadium details,Show me the stadium details,Semantic,http://visualdataweb.org/newOntology/Stadium,http://visualdataweb.org/newOntology/Stadium,http://visualdataweb.org/newOntology/Stadium,PASS,1.00
Happy Path,Who is the referee,Who is the referee?,BM25,http://visualdataweb.org/newOntology/Referee,http://visualdataweb.org/newOntology/Referee,http://visualdataweb.org/newOntology/Referee,PASS,1.00
Happy Path,Who is the referee,Who is the referee?,Semantic,http://visualdataweb.org/newOntology/Referee,http://visualdataweb.org/newOntology/Referee,http://visualdataweb.org/newOntology/Referee; http://visualdataweb.org/newOntology/Match,PASS,1.00
Happy Path,What awards did he win,What awards did he win?,BM25,http://visualdataweb.org/newOntology/Award,,,FAIL,0.00
Happy Path,What awards did he win,What awards did he win?,Semantic,http://visualdataweb.org/newOntology/Award,http://visualdataweb.org/newOntology/Award,http://visualdataweb.org/newOntology/Award; http://visualdataweb.org/newOntology/Trophy; http://visualdataweb.org/newOntology/Match,PASS,1.00
Synonym Test,Manager synonym for coach,Who is the manager of this club?,Semantic,http://visualdataweb.org/newOntology/Coach,http://visualdataweb.org/newOntology/Coach,http://visualdataweb.org/newOntology/Coach; http://visualdataweb.org/newOntology/Team; http://visualdataweb.org/newOntology/Stadium,PASS,1.00
Synonym Test,Arena synonym for stadium,What is the capacity of the arena?,Semantic,http://visualdataweb.org/newOntology/Stadium,http://visualdataweb.org/newOntology/Stadium,http://visualdataweb.org/newOntology/Stadium,PASS,1.00
Synonym Test,Officiated synonym for referee,Who officiated the game?,Semantic,http://visualdataweb.org/newOntology/Referee,http://visualdataweb.org/newOntology/Referee,http://visualdataweb.org/newOntology/Match; http://visualdataweb.org/newOntology/PerformanceStats; http://visualdataweb.org/newOntology/Referee,PASS,1.00
Synonym Test,Club synonym for team,Which club plays here?,Semantic,http://visualdataweb.org/newOntology/Team,http://visualdataweb.org/newOntology/Team,http://visualdataweb.org/newOntology/Player; http://visualdataweb.org/newOntology/Team; http://visualdataweb.org/newOntology/League,PASS,1.00
Synonym Test,Red card in performance stats,Did he get a red card?,Semantic,http://visualdataweb.org/newOntology/PerformanceStats,,,FAIL,0.00
Property-Implied,Goals property implies PerformanceStats,How many goals did he score?,BM25,http://visualdataweb.org/newOntology/PerformanceStats,http://visualdataweb.org/newOntology/PerformanceStats,http://visualdataweb.org/newOntology/PerformanceStats; http://visualdataweb.org/newOntology/Match,PASS,1.00
Property-Implied,Goals property implies PerformanceStats,How many goals did he score?,Semantic,http://visualdataweb.org/newOntology/PerformanceStats,http://visualdataweb.org/newOntology/PerformanceStats,http://visualdataweb.org/newOntology/PerformanceStats; http://visualdataweb.org/newOntology/Match; http://visualdataweb.org/newOntology/League,PASS,1.00
Property-Implied,Formation property implies Team,What formation do they play?,BM25,http://visualdataweb.org/newOntology/Team,http://visualdataweb.org/newOntology/Team,http://visualdataweb.org/newOntology/Coach; http://visualdataweb.org/newOntology/Team,PASS,1.00
Property-Implied,Formation property implies Team,What formation do they play?,Semantic,http://visualdataweb.org/newOntology/Team,,,FAIL,0.00
Property-Implied,Kickoff/Date implies Match,When was the kickoff?,BM25,http://visualdataweb.org/newOntology/Match,,,FAIL,0.00
Property-Implied,Kickoff/Date implies Match,When was the kickoff?,Semantic,http://visualdataweb.org/newOntology/Match,http://visualdataweb.org/newOntology/Match,http://visualdataweb.org/newOntology/PerformanceStats; http://visualdataweb.org/newOntology/Match; http://visualdataweb.org/newOntology/KnockOutTournament,PASS,1.00
Property-Implied,Trophy associated league,Which league is this trophy associated with?,BM25,http://visualdataweb.org/newOntology/Trophy,http://visualdataweb.org/newOntology/Trophy,http://visualdataweb.org/newOntology/Trophy; http://visualdataweb.org/newOntology/League,PASS,1.00
Property-Implied,Trophy associated league,Which league is this trophy associated with?,Semantic,http://visualdataweb.org/newOntology/Trophy,http://visualdataweb.org/newOntology/Trophy,http://visualdataweb.org/newOntology/Trophy; http://visualdataweb.org/newOntology/League; http://visualdataweb.org/newOntology/Team,PASS,1.00
Property-Implied,Height property implies Player,How tall is he?,BM25,http://visualdataweb.org/newOntology/Player,,,FAIL,0.00
Property-Implied,Height property implies Player,How tall is he?,Semantic,http://visualdataweb.org/newOntology/Player,,,FAIL,0.00
Ambiguity Test,Real Madrid vs Barcelona,Real Madrid vs Barcelona,BM25,http://visualdataweb.org/newOntology/Match; http://visualdataweb.org/newOntology/Team,,,FAIL,0.00
Ambiguity Test,Real Madrid vs Barcelona,Real Madrid vs Barcelona,Semantic,http://visualdataweb.org/newOntology/Match; http://visualdataweb.org/newOntology/Team,http://visualdataweb.org/newOntology/Match,http://visualdataweb.org/newOntology/Match; http://visualdataweb.org/newOntology/League; http://visualdataweb.org/newOntology/Stadium,FAIL,0.50
Ambiguity Test,Champion,Champion,BM25,http://visualdataweb.org/newOntology/League; http://visualdataweb.org/newOntology/Tournament,http://visualdataweb.org/newOntology/League; http://visualdataweb.org/newOntology/Tournament,http://visualdataweb.org/newOntology/League; http://visualdataweb.org/newOntology/Tournament,PASS,1.00
Ambiguity Test,Champion,Champion,Semantic,http://visualdataweb.org/newOntology/League; http://visualdataweb.org/newOntology/Tournament,http://visualdataweb.org/newOntology/League; http://visualdataweb.org/newOntology/Tournament,http://visualdataweb.org/newOntology/Tournament; http://visualdataweb.org/newOntology/Trophy; http://visualdataweb.org/newOntology/KnockOutTournament,PASS,1.00
Ambiguity Test,Yellow Card,Yellow Card,BM25,http://visualdataweb.org/newOntology/PerformanceStats; http://visualdataweb.org/newOntology/Referee,http://visualdataweb.org/newOntology/PerformanceStats,http://visualdataweb.org/newOntology/PerformanceStats,FAIL,0.50
Ambiguity Test,Yellow Card,Yellow Card,Semantic,http://visualdataweb.org/newOntology/PerformanceStats; http://visualdataweb.org/newOntology/Referee,http://visualdataweb.org/newOntology/PerformanceStats,http://visualdataweb.org/newOntology/PerformanceStats,FAIL,0.50
Ambiguity Test,Winner,Winner,BM25,http://visualdataweb.org/newOntology/Match; http://visualdataweb.org/newOntology/Trophy,http://visualdataweb.org/newOntology/Match; http://visualdataweb.org/newOntology/Trophy,http://visualdataweb.org/newOntology/Trophy; http://visualdataweb.org/newOntology/Match,PASS,1.00
Ambiguity Test,Winner,Winner,Semantic,http://visualdataweb.org/newOntology/Match; http://visualdataweb.org/newOntology/Trophy,http://visualdataweb.org/newOntology/Match; http://visualdataweb.org/newOntology/Trophy,http://visualdataweb.org/newOntology/Trophy; http://visualdataweb.org/newOntology/Award; http://visualdataweb.org/newOntology/Match,PASS,1.00
Context Window,Ronaldo plays for Al-Nassr,Ronaldo plays for Al-Nassr.,BM25,http://visualdataweb.org/newOntology/Player; http://visualdataweb.org/newOntology/Team,http://visualdataweb.org/newOntology/Player; http://visualdataweb.org/newOntology/Team,http://visualdataweb.org/newOntology/Player; http://visualdataweb.org/newOntology/Team,PASS,1.00
Context Window,Ronaldo plays for Al-Nassr,Ronaldo plays for Al-Nassr.,Semantic,http://visualdataweb.org/newOntology/Player; http://visualdataweb.org/newOntology/Team,http://visualdataweb.org/newOntology/Player; http://visualdataweb.org/newOntology/Team,http://visualdataweb.org/newOntology/Team; http://visualdataweb.org/newOntology/League; http://visualdataweb.org/newOntology/Player,PASS,1.00
Context Window,Match at Allianz Arena,The match at Allianz Arena ended 2-0.,BM25,http://visualdataweb.org/newOntology/Match; http://visualdataweb.org/newOntology/Stadium,http://visualdataweb.org/newOntology/Match,http://visualdataweb.org/newOntology/Match,FAIL,0.50
Context Window,Match at Allianz Arena,The match at Allianz Arena ended 2-0.,Semantic,http://visualdataweb.org/newOntology/Match; http://visualdataweb.org/newOntology/Stadium,http://visualdataweb.org/newOntology/Match; http://visualdataweb.org/newOntology/Stadium,http://visualdataweb.org/newOntology/KnockOutTournament; http://visualdataweb.org/newOntology/Match; http://visualdataweb.org/newOntology/Stadium,PASS,1.00
Context Window,Messi won Ballon d'Or,Messi won the Ballon d'Or in 2023.,BM25,http://visualdataweb.org/newOntology/Player; http://visualdataweb.org/newOntology/Award,http://visualdataweb.org/newOntology/Award,http://visualdataweb.org/newOntology/Trophy; http://visualdataweb.org/newOntology/Award,FAIL,0.50
Context Window,Messi won Ballon d'Or,Messi won the Ballon d'Or in 2023.,Semantic,http://visualdataweb.org/newOntology/Player; http://visualdataweb.org/newOntology/Award,http://visualdataweb.org/newOntology/Award,http://visualdataweb.org/newOntology/Trophy; http://visualdataweb.org/newOntology/Award; http://visualdataweb.org/newOntology/Tournament,FAIL,0.50

================
File: tsconfig.build.json
================
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "composite": true,
    "declaration": true,
    "declarationMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["test/**/*", "**/*.test.ts"]
}

================
File: tsconfig.json
================
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["ES2022"],
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": ".",
    "composite": true
  },
  "include": ["src/**/*", "test/**/*"],
  "exclude": ["node_modules", "dist"]
}

================
File: vitest.config.ts
================
import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    include: ["test/**/*.test.ts"],
    globals: true,

    // Process pool configuration to prevent orphaned processes
    // Use threads with Bun for better performance and cleanup
    pool: "threads",
    poolOptions: {
      threads: {
        singleThread: false,
        maxThreads: 4,
        minThreads: 1,
        isolate: true,
        useAtomics: true // Better for cleanup
      }
    },

    // Timeouts to prevent hanging processes
    testTimeout: 30_000, // 30 seconds per test
    hookTimeout: 10_000, // 10 seconds for hooks
    teardownTimeout: 10_000, // 10 seconds for teardown

    // Force cleanup of resources
    restoreMocks: true,
    clearMocks: true,
    mockReset: true,

    // Ensure tests exit cleanly
    forceRerunTriggers: [
      "**/vitest.config.*/**",
      "**/vite.config.*/**"
    ],

    // File watcher settings
    watchExclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/coverage/**"
    ]
  }
})



================================================================
End of Codebase
================================================================

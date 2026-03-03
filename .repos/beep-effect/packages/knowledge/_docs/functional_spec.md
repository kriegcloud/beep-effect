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

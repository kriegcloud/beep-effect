# BM25 Corpus + Entity/Pattern Tooling Plan

Date: 2026-02-09  
Repo: `effect-nlp` (+ integration notes for sibling `recursive-llm`)

## 1. Executive Summary

This plan adds a stateful corpus workflow and exposes currently hidden entity/pattern and similarity capabilities to the AI tool surface.

The highest-value change is a **session-based corpus manager** so the sandbox can:

1. Create a corpus once.
2. Learn documents incrementally across tool calls.
3. Query repeatedly without relearning on every query.
4. Inspect BM25 internals for debugging.

In parallel, it adds **custom entity learning** (Pattern DSL bracket strings), **advanced similarity** (Tversky + BOW cosine), and selected **WinkUtils capabilities** (N-grams + phonetic matching), then wires these through `ToolExport.ts` for recursive-llm.

## 2. Architecture Decisions

### Decision A: Introduce `WinkCorpusManager` service (new) instead of overloading `WinkVectorizer`

Rationale:

1. `WinkVectorizer` currently serves one shared vectorizer plus ephemeral `withFreshInstance`.
2. Stateful multi-corpus behavior (create/list/delete/query by id) is a separate concern.
3. Keeping existing `WinkVectorizer` behavior intact minimizes regressions for current 9 tools.

Impact:

1. New file: `src/NLP/Wink/WinkCorpusManager.ts`.
2. New layer export in `src/NLP/Wink/Layer.ts`.
3. Existing tools remain unchanged unless explicitly modified.

### Decision B: Handle BM25 “freeze after out/vectorOf” with lazy reindexing

Observed behavior from local source inspection: wink BM25 throws on `learn()` after `out()`/`vectorOf()` has been used.

Design:

1. Corpus sessions store canonical documents + vocabulary metadata.
2. Sessions also cache a compiled BM25 index.
3. Any `LearnCorpus` marks index stale.
4. `QueryCorpus`/`CorpusStats` rebuild only if stale; repeated queries without new learns reuse the cached index.

This preserves “learn once, query many” while supporting later incremental learns.

### Decision C: Per-corpus concurrency lock + manager lock

Design:

1. Manager lock protects session map create/delete operations.
2. Each corpus has its own semaphore (`Effect.makeSemaphore(1)`) for read/write consistency.
3. Concurrent calls on different corpora proceed independently.
4. Concurrent calls on the same corpus serialize safely.

### Decision D: Custom entity learning defaults to append semantics

Observed behavior from local runtime check: repeated `learnCustomEntities()` calls replace previous learnings in wink.

Design:

1. `LearnCustomEntities` tool accepts `mode: "append" | "replace"` (default `"append"`).
2. Append mode merges with current engine custom entity state, then re-learns merged set.
3. Replace mode preserves wink-native behavior.

### Decision E: Extend `ExtractEntities` additively

Design:

1. Keep current built-in entity fields for backward compatibility.
2. Add custom entity output fields in the same response object.
3. Reuse existing span-to-character-offset mapping logic for both built-in and custom entities.

### Decision F: Expose advanced similarity as separate tools

Design:

1. Keep existing `TextSimilarity` semantics stable (`vector.cosine` BM25).
2. Add `TverskySimilarity` and `BowCosineSimilarity` tools.

Rationale: clearer discoverability and lower risk than overloading `TextSimilarity` with method unions.

### Decision G: Model persistence is optional phase, not core phase

Research findings:

1. `recursive-llm` `__vars` persists across iterations within a call, not across completed calls.
2. Default sandbox frame limit is 32 MB.
3. Local BM25 model-size probes for 50-document corpora were typically < 1 MB.

Conclusion:

1. `ExportCorpus`/`LoadCorpus` are technically feasible.
2. They are useful for intra-call checkpoints or external persistence by the caller.
3. They are lower priority than core session/query/entity tools.

## 3. New Tools Specification

## 3.1 `CreateCorpus`

Description: Create a named or generated corpus session for incremental BM25 indexing.

Parameters schema:

```ts
const CreateCorpusParams = {
  corpusId: Schema.optional(Schema.String.pipe(Schema.minLength(1))),
  bm25Config: Schema.optional(
    Schema.Struct({
      k1: Schema.optional(Schema.Number),
      b: Schema.optional(Schema.Number),
      k: Schema.optional(Schema.Number),
      norm: Schema.optional(Schema.Literal("none", "l1", "l2"))
    })
  )
}
```

Return schema:

```ts
Schema.Struct({
  corpusId: Schema.String,
  documentCount: Schema.Number,
  vocabularySize: Schema.Number,
  createdAtMs: Schema.Number,
  config: Schema.Struct({
    k1: Schema.Number,
    b: Schema.Number,
    k: Schema.Number,
    norm: Schema.Literal("none", "l1", "l2")
  })
})
```

Services used: `WinkCorpusManager`.

Handler sketch:

```ts
CreateCorpus: ({ corpusId, bm25Config }) =>
  Effect.gen(function*() {
    return yield* corpusManager.createCorpus({ corpusId, bm25Config })
  }).pipe(Effect.orDie)
```

Usage examples:

```js
const c = await CreateCorpus()
const c2 = await CreateCorpus("product-docs")
```

## 3.2 `DeleteCorpus`

Description: Delete a corpus session and free memory.

Parameters schema:

```ts
const DeleteCorpusParams = {
  corpusId: Schema.String.pipe(Schema.minLength(1))
}
```

Return schema:

```ts
Schema.Struct({
  corpusId: Schema.String,
  deleted: Schema.Boolean
})
```

Services used: `WinkCorpusManager`.

Handler sketch:

```ts
DeleteCorpus: ({ corpusId }) =>
  Effect.gen(function*() {
    const deleted = yield* corpusManager.deleteCorpus(corpusId)
    return { corpusId, deleted }
  }).pipe(Effect.orDie)
```

Usage examples:

```js
await DeleteCorpus(corpusId)
```

## 3.3 `LearnCorpus`

Description: Add one or more documents to an existing corpus session.

Parameters schema:

```ts
const LearnCorpusParams = {
  corpusId: Schema.String.pipe(Schema.minLength(1)),
  documents: Schema.NonEmptyArray(
    Schema.Struct({
      id: Schema.optional(Schema.String.pipe(Schema.minLength(1))),
      text: Schema.String
    })
  ),
  dedupeById: Schema.optional(Schema.Boolean)
}
```

Return schema:

```ts
Schema.Struct({
  corpusId: Schema.String,
  learnedCount: Schema.Number,
  skippedCount: Schema.Number,
  totalDocuments: Schema.Number,
  vocabularySize: Schema.Number,
  reindexRequired: Schema.Boolean
})
```

Services used: `WinkCorpusManager`, `Tokenization`.

Handler sketch:

```ts
LearnCorpus: ({ corpusId, documents, dedupeById }) =>
  Effect.gen(function*() {
    const docs = yield* Effect.forEach(documents, (d, i) =>
      tokenization.document(d.text, d.id ?? `${corpusId}-doc-${Date.now()}-${i}`)
    )
    return yield* corpusManager.learnDocuments({
      corpusId,
      documents: Chunk.fromIterable(docs),
      dedupeById: dedupeById ?? true
    })
  }).pipe(Effect.orDie)
```

Usage examples:

```js
await LearnCorpus(corpusId, [{ id: "p1", text: "..." }, { id: "p2", text: "..." }])
```

## 3.4 `QueryCorpus`

Description: Rank corpus documents against a query without relearning.

Parameters schema:

```ts
const QueryCorpusParams = {
  corpusId: Schema.String.pipe(Schema.minLength(1)),
  query: Schema.String,
  topN: Schema.optional(Schema.Number),
  includeText: Schema.optional(Schema.Boolean)
}
```

Return schema:

```ts
Schema.Struct({
  corpusId: Schema.String,
  query: Schema.String,
  method: Schema.Literal("vector.cosine"),
  ranked: Schema.Array(
    Schema.Struct({
      index: Schema.Number,
      id: Schema.String,
      score: Schema.Number,
      text: Schema.optional(Schema.String)
    })
  ),
  totalDocuments: Schema.Number,
  returned: Schema.Number
})
```

Services used: `WinkCorpusManager`.

Handler sketch:

```ts
QueryCorpus: ({ corpusId, query, topN, includeText }) =>
  Effect.gen(function*() {
    return yield* corpusManager.query({
      corpusId,
      query,
      topN: topN ?? 10,
      includeText: includeText ?? false
    })
  }).pipe(Effect.orDie)
```

Usage examples:

```js
const r = await QueryCorpus(corpusId, "refund policy", 5)
```

## 3.5 `CorpusStats`

Description: Inspect corpus internals (vocabulary, optional IDF and optional document-term matrix).

Parameters schema:

```ts
const CorpusStatsParams = {
  corpusId: Schema.String.pipe(Schema.minLength(1)),
  includeIdf: Schema.optional(Schema.Boolean),
  includeMatrix: Schema.optional(Schema.Boolean),
  topIdfTerms: Schema.optional(Schema.Number)
}
```

Return schema:

```ts
Schema.Struct({
  corpusId: Schema.String,
  totalDocuments: Schema.Number,
  vocabularySize: Schema.Number,
  averageDocumentLength: Schema.Number,
  terms: Schema.Array(Schema.String),
  idfValues: Schema.Array(
    Schema.Struct({
      term: Schema.String,
      idf: Schema.Number
    })
  ),
  documentTermMatrix: Schema.Array(Schema.Array(Schema.Number)),
  matrixShape: Schema.Struct({
    rows: Schema.Number,
    cols: Schema.Number
  })
})
```

Services used: `WinkCorpusManager`.

Handler sketch:

```ts
CorpusStats: ({ corpusId, includeIdf, includeMatrix, topIdfTerms }) =>
  Effect.gen(function*() {
    return yield* corpusManager.getStats({
      corpusId,
      includeIdf: includeIdf ?? false,
      includeMatrix: includeMatrix ?? false,
      topIdfTerms: topIdfTerms ?? 50
    })
  }).pipe(Effect.orDie)
```

Usage examples:

```js
await CorpusStats(corpusId, true, false, 20)
```

## 3.6 `LearnCustomEntities`

Description: Learn domain-specific custom entity patterns via bracket-string DSL.

Parameters schema:

```ts
const LearnCustomEntitiesParams = {
  groupName: Schema.String.pipe(Schema.minLength(1)),
  mode: Schema.optional(Schema.Literal("append", "replace")),
  patterns: Schema.NonEmptyArray(
    Schema.Struct({
      name: Schema.String.pipe(Schema.minLength(1)),
      pattern: Schema.NonEmptyArray(Schema.String), // e.g. ["[PROPN]", "[PROPN]"]
      mark: Schema.optional(Schema.Tuple(Schema.Number, Schema.Number))
    })
  )
}
```

Return schema:

```ts
Schema.Struct({
  groupName: Schema.String,
  mode: Schema.Literal("append", "replace"),
  appliedPatternCount: Schema.Number,
  totalActivePatternCount: Schema.Number,
  activePatternNames: Schema.Array(Schema.String)
})
```

Services used: `WinkEngine`, `WinkEngineRef` (or a new helper on `WinkEngine`), `PatternParsers`.

Handler sketch:

```ts
LearnCustomEntities: ({ groupName, mode, patterns }) =>
  Effect.gen(function*() {
    // Validate bracket strings up-front.
    yield* Effect.forEach(patterns, (p) =>
      Effect.sync(() => PatternFromString(p.pattern))
    , { discard: true })

    const incoming = toWinkEngineCustomEntities(groupName, patterns)
    const merged = yield* mergeWithCurrentStateIfNeeded(incoming, mode ?? "append")
    yield* engine.learnCustomEntities(merged)

    return {
      groupName,
      mode: mode ?? "append",
      appliedPatternCount: patterns.length,
      totalActivePatternCount: merged.size(),
      activePatternNames: merged.toArray().map((p) => p.name)
    }
  }).pipe(Effect.orDie)
```

Usage examples:

```js
await LearnCustomEntities(
  "finance",
  "append",
  [{ name: "money_phrase", pattern: ["[MONEY]"] }]
)
```

## 3.7 `TverskySimilarity`

Description: Asymmetric set similarity for containment-style matching.

Parameters schema:

```ts
const TverskySimilarityParams = {
  text1: Schema.String,
  text2: Schema.String,
  alpha: Schema.optional(Schema.Number),
  beta: Schema.optional(Schema.Number),
  normalization: Schema.optional(Schema.Literal("normal", "lemma", "stem"))
}
```

Return schema:

```ts
Schema.Struct({
  score: Schema.Number,
  method: Schema.Literal("set.tversky"),
  alpha: Schema.Number,
  beta: Schema.Number,
  set1Size: Schema.Number,
  set2Size: Schema.Number,
  intersectionSize: Schema.Number
})
```

Services used: `Tokenization`, `WinkSimilarity`.

Handler sketch:

```ts
TverskySimilarity: ({ text1, text2, alpha, beta, normalization }) =>
  Effect.gen(function*() {
    const set1 = yield* toTermSet(text1, normalization ?? "normal", "set-a")
    const set2 = yield* toTermSet(text2, normalization ?? "normal", "set-b")

    const result = yield* sim.setTversky(
      TverskySimilarityRequest({
        set1,
        set2,
        params: TverskyParams({ alpha: alpha ?? 0.5, beta: beta ?? 0.5 })
      })
    )

    return enrichWithSetMetrics(result, set1, set2)
  }).pipe(Effect.orDie)
```

Usage examples:

```js
await TverskySimilarity("refund policy and exceptions", "refund policy", 0.8, 0.2)
```

## 3.8 `BowCosineSimilarity`

Description: Token-frequency cosine similarity without BM25 weighting.

Parameters schema:

```ts
const BowCosineSimilarityParams = {
  text1: Schema.String,
  text2: Schema.String,
  normalization: Schema.optional(Schema.Literal("normal", "lemma", "stem"))
}
```

Return schema:

```ts
Schema.Struct({
  score: Schema.Number,
  method: Schema.Literal("bow.cosine"),
  uniqueTerms1: Schema.Number,
  uniqueTerms2: Schema.Number,
  sharedTerms: Schema.Number
})
```

Services used: `Tokenization`, `WinkSimilarity`.

Handler sketch:

```ts
BowCosineSimilarity: ({ text1, text2, normalization }) =>
  Effect.gen(function*() {
    const bow1 = yield* toBow(text1, normalization ?? "normal", "bow-1")
    const bow2 = yield* toBow(text2, normalization ?? "normal", "bow-2")
    const result = yield* sim.bowCosine(BOWCosineSimilarityRequest({ bow1, bow2 }))
    return withBowMetrics(result, bow1, bow2)
  }).pipe(Effect.orDie)
```

Usage examples:

```js
await BowCosineSimilarity("cat cat dog", "cat dog dog")
```

## 3.9 `NGrams`

Description: Character n-gram extraction (`bag`, `edge`, `set`) for fingerprinting/search heuristics.

Parameters schema:

```ts
const NGramsParams = {
  text: Schema.String,
  size: Schema.Number,
  mode: Schema.optional(Schema.Literal("bag", "edge", "set")),
  topN: Schema.optional(Schema.Number)
}
```

Return schema:

```ts
Schema.Struct({
  mode: Schema.Literal("bag", "edge", "set"),
  size: Schema.Number,
  ngrams: Schema.Array(
    Schema.Struct({
      value: Schema.String,
      count: Schema.Number
    })
  ),
  totalNGrams: Schema.Number,
  uniqueNGrams: Schema.Number
})
```

Services used: `WinkUtils`.

Handler sketch:

```ts
NGrams: ({ text, size, mode, topN }) =>
  Effect.gen(function*() {
    const cfg = NGramConfig({ size: Math.max(1, Math.floor(size)) })
    const r = yield* pickNGramMethod(utils, mode ?? "bag", TextInput({ text }), cfg)
    const entries = Object.entries(r.ngrams)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, topN ?? 100)
      .map(([value, count]) => ({ value, count }))
    return { mode: mode ?? "bag", size: cfg.size, ngrams: entries, totalNGrams: r.totalNGrams, uniqueNGrams: r.uniqueNGrams }
  }).pipe(Effect.orDie)
```

Usage examples:

```js
await NGrams("internationalization", 3, "edge", 20)
```

## 3.10 `PhoneticMatch`

Description: Fuzzy phonetic overlap for names/terms using Soundex or phonetization.

Parameters schema:

```ts
const PhoneticMatchParams = {
  text1: Schema.String,
  text2: Schema.String,
  algorithm: Schema.optional(Schema.Literal("soundex", "phonetize")),
  minTokenLength: Schema.optional(Schema.Number)
}
```

Return schema:

```ts
Schema.Struct({
  algorithm: Schema.Literal("soundex", "phonetize"),
  score: Schema.Number,
  sharedCodes: Schema.Array(Schema.String),
  leftCodes: Schema.Array(Schema.String),
  rightCodes: Schema.Array(Schema.String)
})
```

Services used: `Tokenization`, `WinkUtils`, `WinkSimilarity` (optional for score).

Handler sketch:

```ts
PhoneticMatch: ({ text1, text2, algorithm, minTokenLength }) =>
  Effect.gen(function*() {
    const left = yield* toPhoneticCodes(text1, algorithm ?? "soundex", minTokenLength ?? 2)
    const right = yield* toPhoneticCodes(text2, algorithm ?? "soundex", minTokenLength ?? 2)
    const score = jaccard(left, right)
    return { algorithm: algorithm ?? "soundex", score, sharedCodes: intersect(left, right), leftCodes: left, rightCodes: right }
  }).pipe(Effect.orDie)
```

Usage examples:

```js
await PhoneticMatch("Stephen Hawking", "Steven Hocking", "soundex", 2)
```

## 3.11 `ExportCorpus` (Phase 4, optional)

Description: Export corpus model + metadata snapshot.

Parameters schema:

```ts
const ExportCorpusParams = {
  corpusId: Schema.String.pipe(Schema.minLength(1)),
  includeDocuments: Schema.optional(Schema.Boolean)
}
```

Return schema:

```ts
Schema.Struct({
  corpusId: Schema.String,
  modelJson: Schema.String,
  modelBytes: Schema.Number,
  documentCount: Schema.Number,
  vocabularySize: Schema.Number,
  documents: Schema.Array(
    Schema.Struct({
      id: Schema.String,
      text: Schema.String
    })
  )
})
```

Services used: `WinkCorpusManager`.

## 3.12 `LoadCorpus` (Phase 4, optional)

Description: Create/load corpus from exported model snapshot.

Parameters schema:

```ts
const LoadCorpusParams = {
  corpusId: Schema.optional(Schema.String.pipe(Schema.minLength(1))),
  modelJson: Schema.String,
  documents: Schema.optional(
    Schema.Array(
      Schema.Struct({
        id: Schema.String,
        text: Schema.String
      })
    )
  ),
  overwrite: Schema.optional(Schema.Boolean)
}
```

Return schema:

```ts
Schema.Struct({
  corpusId: Schema.String,
  loaded: Schema.Boolean,
  totalDocuments: Schema.Number,
  vocabularySize: Schema.Number
})
```

Services used: `WinkCorpusManager`.

## 4. Modifications To Existing Tools

## 4.1 `ExtractEntities`

Changes:

1. Add optional parameter `includeCustom` (default `true`).
2. Keep existing `entities/entityCount/entityTypes` for built-in entities.
3. Add `customEntities/customEntityCount/customEntityTypes`.
4. Add `allEntities/allEntityCount` for merged output convenience.

Handler notes:

1. Reuse common mapper for `{detail, span} -> AI entity`.
2. Map `winkDoc.customEntities().out(its.detail)` + `out(its.span)` exactly like built-ins.
3. Add optional `source: "builtin" | "custom"` on output entities.

## 4.2 `TextSimilarity`

No behavioral change in core implementation.  
Documentation update only: position it as BM25 cosine baseline and direct users to:

1. `TverskySimilarity` for asymmetric containment.
2. `BowCosineSimilarity` for plain token-frequency cosine.

## 4.3 `RankByRelevance`

No immediate behavior change.  
Documentation update: this remains one-shot ranking; `QueryCorpus` is the stateful multi-call workflow.

## 5. New Services / Extensions

## 5.1 New `WinkCorpusManager` service

Proposed location: `src/NLP/Wink/WinkCorpusManager.ts`.

Core state:

```ts
interface CorpusSessionState {
  readonly corpusId: string
  readonly documents: ReadonlyArray<Document>
  readonly vocabulary: ReadonlySet<string>
  readonly compiled: Option.Option<{
    readonly vectorizer: BM25VectorizerInstance
    readonly terms: ReadonlyArray<string>
    readonly builtAtMs: number
  }>
  readonly config: BM25Config
  readonly createdAtMs: number
  readonly updatedAtMs: number
}
```

Service methods:

```ts
readonly createCorpus: (...)
readonly deleteCorpus: (...)
readonly learnDocuments: (...)
readonly query: (...)
readonly getStats: (...)
readonly exportCorpus: (...)
readonly loadCorpus: (...)
readonly resetAllForTests: (...)
```

Error type:

```ts
class CorpusManagerError extends Data.TaggedError("CorpusManagerError")<{
  readonly message: string
  readonly corpusId?: string
  readonly cause?: unknown
}> {}
```

Implementation details:

1. Use map-level lock for create/delete/lookups.
2. Use per-session lock for document/index mutation.
3. `ensureCompiled(session)` rebuilds vectorizer from `session.documents` iff compiled cache is missing/stale.
4. Token normalization mirrors `WinkVectorizer` behavior (`token.normal` fallback to `token.text`).

## 5.2 `WinkEngine` extension

Add read helper for append mode:

```ts
readonly getCurrentCustomEntities: Effect.Effect<Option.Option<WinkEngineCustomEntities>, WinkError>
```

This avoids pulling `WinkEngineRef` directly into tool handlers and keeps entity-state logic in the engine module.

## 5.3 Layer composition updates

Update:

1. `src/NLP/Wink/Layer.ts` to provide `WinkCorpusManagerLive`.
2. `src/NLP/Wink/index.ts` export new manager.
3. `NlpToolkitLive` dependencies include `WinkCorpusManager`.

## 6. Schema Definitions (`src/NLP/Tools/_schemas.ts`)

Add:

1. `AiCorpusSummarySchema`
2. `AiCorpusRankedDocumentSchema`
3. `AiCorpusIdfSchema`
4. `AiCorpusStatsSchema`
5. `AiCustomPatternSchema`
6. `AiNGramSchema`
7. `AiPhoneticMatchSchema`
8. `AiSimilarityBreakdownSchema`
9. `AiEntitySchema` optional `source` field (backward-compatible additive change)

Example additions:

```ts
export const AiCorpusRankedDocumentSchema = Schema.Struct({
  index: Schema.Number,
  id: Schema.String,
  score: Schema.Number,
  text: Schema.optional(Schema.String)
})

export const AiCorpusIdfSchema = Schema.Struct({
  term: Schema.String,
  idf: Schema.Number
})
```

## 7. Test Plan

## 7.1 Unit tests (effect-nlp)

New file suggestions:

1. `test/unit/WinkCorpusManager.test.ts`
2. `test/unit/NlpToolkit.corpus-tools.test.ts`
3. `test/unit/NlpTools.custom-entities.test.ts`
4. `test/unit/NlpTools.similarity-advanced.test.ts`

Cases:

1. Create corpus, duplicate create failure, delete corpus.
2. Learn then query returns deterministic ranking.
3. Learn after query invalidates cache and includes new docs on next query.
4. `CorpusStats` term ordering + matrix shape matches docs/terms.
5. `LearnCustomEntities append` preserves prior patterns; `replace` clears prior.
6. `ExtractEntities` returns built-in and custom channels correctly.
7. `TverskySimilarity` defaults to alpha/beta 0.5.
8. `BowCosineSimilarity` finite score in [0, 1].
9. `NGrams` mode behavior (`bag`, `edge`, `set`) with expected counts.
10. `PhoneticMatch` matches Soundex-equal names (`Smith`/`Smyth`).

## 7.2 Concurrency tests

Extend `test/unit/NlpTools.concurrent.test.ts` with:

1. Concurrent `LearnCorpus` calls on same corpus are serialized and final doc count is exact.
2. Concurrent `QueryCorpus` + `LearnCorpus` on same corpus has no corruption/throw.
3. Concurrent operations on different corpora do not bleed state.

## 7.3 Property tests

Extend `test/unit/NlpTools.property.test.ts` with:

1. `QueryCorpus.ranked` always sorted descending score.
2. `TverskySimilarity` output always finite and in [0, 1].
3. `NGrams.uniqueNGrams <= totalNGrams`.

## 7.4 Tool export tests

Update `test/unit/ToolExport.test.ts`:

1. Tool count and expected names include new tools.
2. Positional argument mapping for each new tool.
3. Usage examples exist for each new tool.
4. Parameter/return schema richness checks for corpus/custom-entity tools.

## 7.5 Integration smoke (manual)

In recursive-llm sandbox with `--nlp-tools`:

1. Create corpus -> learn 50 chunks -> query multiple times without relearning.
2. Learn custom entities -> verify `ExtractEntities` custom outputs.
3. Export/load model within same invocation.

## 8. Integration Notes (recursive-llm)

## 8.1 `SystemPrompt.ts`

Update `nlpToolNames` set to include:

1. `CreateCorpus`
2. `DeleteCorpus`
3. `LearnCorpus`
4. `QueryCorpus`
5. `CorpusStats`
6. `LearnCustomEntities`
7. `TverskySimilarity`
8. `BowCosineSimilarity`
9. `NGrams`
10. `PhoneticMatch`
11. `ExportCorpus` (if enabled)
12. `LoadCorpus` (if enabled)

Add guidance bullets for the recommended corpus workflow:

1. Create once.
2. Learn incrementally.
3. Query repeatedly.
4. Inspect stats only when needed due payload size.

## 8.2 `ToolDescriptor` compatibility

No structural changes required; existing fields already cover:

1. JSON parameter schema.
2. JSON return schema.
3. Usage examples.

## 8.3 `Scheduler.ts` bridge behavior

No mandatory logic change required.  
Recommended guardrails:

1. Keep `Effect.orDie` in effect-nlp handlers (toolkit contract).
2. Because defects are rendered via `Cause.pretty`, ensure tool errors remain concise and actionable.
3. For large outputs (`CorpusStats` matrix, model JSON), rely on flags (`includeMatrix`, etc.) to avoid frame-limit failures.

## 9. Implementation Order (Dependency Ordered)

## Phase 0: Foundations

1. Add/extend schemas in `src/NLP/Tools/_schemas.ts`.
2. Add tool stubs (`Tool.make`) for all planned tools.
3. Add export plumbing skeleton in `src/NLP/Tools/index.ts`.

Acceptance:

1. `bun run lint:fix`
2. `bun run typecheck`

## Phase 1: Corpus service

1. Implement `WinkCorpusManager`.
2. Add layer wiring in `src/NLP/Wink/Layer.ts` and export in `src/NLP/Wink/index.ts`.
3. Add manager unit tests.

Acceptance:

1. Corpus create/learn/query/stats tests pass.

## Phase 2: Core corpus tools

1. Implement handlers in `src/NLP/Tools/NlpToolkit.ts` for:
   - `CreateCorpus`
   - `DeleteCorpus`
   - `LearnCorpus`
   - `QueryCorpus`
   - `CorpusStats`
2. Register tools in `NlpToolkit` bundle.
3. Add usage examples in `ToolExport.ts`.

Acceptance:

1. Toolkit and ToolExport tests updated and passing.

## Phase 3: Custom entities + entity extraction integration

1. Implement `LearnCustomEntities` handler.
2. Extend `WinkEngine` with custom-entity state read helper.
3. Extend `ExtractEntities` output additively for custom entities.

Acceptance:

1. New custom-entity tests and ExtractEntities regression tests pass.

## Phase 4: Similarity tools

1. Add `TverskySimilarity`.
2. Add `BowCosineSimilarity`.
3. Add tests for defaults/ranges/asymmetry.

Acceptance:

1. Similarity tests + property tests pass.

## Phase 5: WinkUtils tools

1. Add `NGrams`.
2. Add `PhoneticMatch`.
3. Add deterministic output ordering in handlers.

Acceptance:

1. WinkUtils tool tests pass.

## Phase 6: Model persistence (optional)

1. Add `ExportCorpus` and `LoadCorpus`.
2. Add export/load roundtrip tests.
3. Add payload-size smoke checks against sandbox frame constraints.

Acceptance:

1. Roundtrip and large-payload tests pass.

## Phase 7: recursive-llm integration

1. Update `SystemPrompt.ts` NLP tool names and guidance.
2. Validate bridge dispatch with new tools.
3. End-to-end smoke run with `--nlp-tools`.

Acceptance:

1. Sandbox can complete full corpus lifecycle in a single run.

## Quality Gates (for each file edit per repo rules)

1. Run `bun run lint:fix` immediately after edits.
2. Run `bun run typecheck` immediately after edits.
3. Do not proceed with additional implementation until both are clean.

## File Change Map (planned)

Effect-nlp:

1. `src/NLP/Wink/WinkCorpusManager.ts` (new)
2. `src/NLP/Wink/Layer.ts`
3. `src/NLP/Wink/index.ts`
4. `src/NLP/Wink/WinkEngine.ts`
5. `src/NLP/Tools/CreateCorpus.ts` (new)
6. `src/NLP/Tools/DeleteCorpus.ts` (new)
7. `src/NLP/Tools/LearnCorpus.ts` (new)
8. `src/NLP/Tools/QueryCorpus.ts` (new)
9. `src/NLP/Tools/CorpusStats.ts` (new)
10. `src/NLP/Tools/LearnCustomEntities.ts` (new)
11. `src/NLP/Tools/TverskySimilarity.ts` (new)
12. `src/NLP/Tools/BowCosineSimilarity.ts` (new)
13. `src/NLP/Tools/NGrams.ts` (new)
14. `src/NLP/Tools/PhoneticMatch.ts` (new)
15. `src/NLP/Tools/ExportCorpus.ts` (new, optional phase)
16. `src/NLP/Tools/LoadCorpus.ts` (new, optional phase)
17. `src/NLP/Tools/NlpToolkit.ts`
18. `src/NLP/Tools/_schemas.ts`
19. `src/NLP/Tools/index.ts`
20. `src/NLP/Tools/ToolExport.ts`
21. `src/NLP/Tools/ExtractEntities.ts`
22. `test/unit/*` updates listed in test plan

Recursive-llm:

1. `/Users/pooks/Dev/recursive-llm/src/SystemPrompt.ts`
2. Optional test updates under `/Users/pooks/Dev/recursive-llm/test` for prompt/tool-surface assertions.

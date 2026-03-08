# effect-langextract Port Specification

A complete specification for porting [google/langextract](https://github.com/google/langextract) from Python to Effect TypeScript.

---

## 0. Current Implementation Status (2026-02-17)

The repository currently enforces these Effect-native decisions:

1. Core remains runtime-neutral; runtime-specific composition lives under `src/runtime/*`.
2. Extract command config is resolved through a single `ExtractionConfig` decode path (`Effect.Config`) using `CLI > env > defaults` precedence.
3. Runtime concurrency control uses a provider-aware permit wrapper: `RuntimeControl.withProviderPermit(provider, effect)`, backed by a partitioned semaphore layer.
4. Provider stream paths are native streaming paths (`@effect/ai` stream API for cloud providers, HTTP streaming for Ollama) and do not use primed-cache read/write paths.
5. Service tests use canonical `Effect.Service` APIs (`Test`, `testLayer(...)`, and `DefaultWithoutDependencies` overrides where applicable).
6. Visualization parity work is intentionally tracked separately from this hardening pass.

---

## 1. Module Map

Every Python module maps to a TypeScript module under `src/`. Backward-compatibility shims (e.g., `langextract/data.py`, `langextract/tokenizer.py`, `langextract/schema.py`, `langextract/inference.py`, `langextract/registry.py`, `langextract/exceptions.py`) are omitted -- the Effect port uses a clean module layout without legacy re-exports.

```
langextract/core/types.py          -> src/FormatType.ts         (FormatType, ScoredOutput, Constraint enums/schemas)
langextract/core/data.py           -> src/Data.ts               (Extraction, Document, AnnotatedDocument, ExampleData, CharInterval, AlignmentStatus)
langextract/data_lib.py            -> src/DataLib.ts             (AnnotatedDocument <-> JSON serialization; mostly replaced by Schema.encode/decode)
langextract/core/exceptions.py     -> src/Errors.ts             (All TaggedError types)
langextract/core/tokenizer.py      -> src/Tokenizer.ts          (Token, TokenInterval, TokenizedText, Tokenizer service, RegexTokenizer, UnicodeTokenizer)
langextract/core/schema.py         -> src/ProviderSchema.ts     (BaseSchema, FormatModeSchema, Constraint re-exports)
langextract/core/format_handler.py -> src/FormatHandler.ts      (FormatHandler class for parsing/formatting model output)
langextract/core/base_model.py     -> src/LanguageModel.ts      (LanguageModel service interface)
langextract/cache.py               -> src/PrimedCache.ts        (Primed cache keying, lookup/store, invalidation)
langextract/providers/patterns.py  -> src/providers/Patterns.ts (Provider regex pattern constants)
langextract/providers/router.py    -> (eliminated -- replaced by Effect Layer composition)
langextract/providers/builtin_registry.py -> (eliminated -- replaced by Effect Layer composition)
langextract/providers/__init__.py  -> (eliminated -- replaced by Effect Layer composition)
langextract/providers/gemini.py    -> src/providers/Gemini.ts   (GeminiLanguageModel Layer)
langextract/providers/gemini_batch.py -> (eliminated -- clean-break; provider adapters are unified via src/providers/AiAdapters.ts)
langextract/providers/openai.py    -> src/providers/OpenAI.ts   (OpenAILanguageModel Layer)
langextract/providers/ollama.py    -> src/providers/Ollama.ts   (OllamaLanguageModel Layer)
langextract/providers/schemas/gemini.py -> src/providers/GeminiSchema.ts (Gemini JSON schema generation)
langextract/prompting.py           -> src/Prompting.ts          (PromptTemplate, QAPromptGenerator, ContextAwarePromptBuilder)
langextract/chunking.py            -> src/Chunking.ts           (TextChunk, ChunkIterator, SentenceIterator, batching)
langextract/resolver.py            -> src/Resolver.ts           (Resolver service, WordAligner, alignment algorithms)
langextract/annotation.py          -> src/Annotator.ts          (Annotator service, orchestration, multi-pass merging)
langextract/extraction.py          -> src/api/Extraction.ts     (Top-level library extraction API: extractStream/extract)
langextract/prompt_validation.py   -> src/PromptValidation.ts   (Validation of few-shot examples)
langextract/io.py                  -> src/IO.ts                 (Dataset loading, JSONL I/O, URL download)
langextract/visualization.py       -> src/Visualization.ts      (HTML visualization generation)
langextract/rate_limits.py         -> src/RuntimeControl.ts     (Provider-partitioned permit control via withProviderPermit)
(new)                              -> src/AlignmentExecutor.ts  (Alignment execution service abstraction for local/worker-backed alignment)
langextract/progress.py            -> (eliminated -- replaced by Effect logging)
langextract/factory.py             -> (eliminated -- replaced by Effect Layer composition + Config)
langextract/plugins.py             -> (eliminated -- no plugin system needed; use Layer composition)
langextract/__init__.py            -> src/index.ts              (Public API re-exports)
(new)                              -> src/Cli.ts                (@effect/cli command definitions, thin adapter wiring)
(new)                              -> src/api/ExecutionLayer.ts (Provider/runtime Layer composition for extraction)
(new)                              -> src/api/Render.ts         (Rendering API for json/jsonl/html output)
(new)                              -> src/cli/ExtractAdapter.ts (CLI extract adapter to library APIs)
(new)                              -> src/cli/VisualizeAdapter.ts (CLI visualize adapter to library APIs)
(new)                              -> src/providers/AiAdapters.ts (@effect/ai provider adapters for infer())
(new)                              -> src/runtime/BunAlignmentWorker.ts (Bun worker-backed alignment layer)
(new)                              -> src/runtime/workers/*     (alignment worker protocol + worker entrypoint)
```

---

## 2. Data Model Specifications

All data types use `Schema.Struct` from `effect/Schema`. Fields use exact `Schema` types. Python `None` becomes `Schema.optional(...)` with the `exact` modifier (matching `exactOptionalPropertyTypes` in tsconfig).

### 2.1 FormatType

```typescript
// src/FormatType.ts
import { Schema } from "effect"

export const FormatType = Schema.Literal("json", "yaml")
export type FormatType = typeof FormatType.Type
```

### 2.2 AlignmentStatus

```typescript
// src/Data.ts
import { Schema } from "effect"

export const AlignmentStatus = Schema.Literal(
  "match_exact",
  "match_greater",
  "match_lesser",
  "match_fuzzy"
)
export type AlignmentStatus = typeof AlignmentStatus.Type
```

### 2.3 CharInterval

```typescript
export class CharInterval extends Schema.Class<CharInterval>("CharInterval")({
  startPos: Schema.optionalWith(Schema.Int, { exact: true }),
  endPos: Schema.optionalWith(Schema.Int, { exact: true })
}) {}
```

### 2.4 TokenInterval

```typescript
// src/Tokenizer.ts
export class TokenInterval extends Schema.Class<TokenInterval>("TokenInterval")({
  startIndex: Schema.Int.pipe(Schema.withDefault(() => 0)),
  endIndex: Schema.Int.pipe(Schema.withDefault(() => 0))
}) {}
```

### 2.5 TokenType

```typescript
export const TokenType = Schema.Literal("word", "number", "punctuation")
export type TokenType = typeof TokenType.Type
```

### 2.6 Token

```typescript
export class Token extends Schema.Class<Token>("Token")({
  index: Schema.Int,
  tokenType: TokenType,
  charInterval: CharInterval,
  firstTokenAfterNewline: Schema.Boolean.pipe(Schema.withDefault(() => false))
}) {}
```

### 2.7 TokenizedText

```typescript
export class TokenizedText extends Schema.Class<TokenizedText>("TokenizedText")({
  text: Schema.String,
  tokens: Schema.Array(Token).pipe(Schema.withDefault(() => []))
}) {}
```

### 2.8 ScoredOutput

```typescript
// src/FormatType.ts
export class ScoredOutput extends Schema.Class<ScoredOutput>("ScoredOutput")({
  score: Schema.optionalWith(Schema.Number, { exact: true }),
  output: Schema.optionalWith(Schema.String, { exact: true }),
  provider: Schema.optionalWith(Schema.String, { exact: true }),
  cacheStatus: Schema.optionalWith(Schema.Literal("miss", "hit"), { exact: true }),
  cacheKey: Schema.optionalWith(Schema.String, { exact: true })
}) {}
```

### 2.9 Extraction

```typescript
// src/Data.ts
export class Extraction extends Schema.Class<Extraction>("Extraction")({
  extractionClass: Schema.String,
  extractionText: Schema.String,
  charInterval: Schema.optionalWith(CharInterval, { exact: true }),
  alignmentStatus: Schema.optionalWith(AlignmentStatus, { exact: true }),
  extractionIndex: Schema.optionalWith(Schema.Int, { exact: true }),
  groupIndex: Schema.optionalWith(Schema.Int, { exact: true }),
  description: Schema.optionalWith(Schema.String, { exact: true }),
  attributes: Schema.optionalWith(
    Schema.Record({ key: Schema.String, value: Schema.Union(Schema.String, Schema.Array(Schema.String)) }),
    { exact: true }
  ),
  tokenInterval: Schema.optionalWith(TokenInterval, { exact: true })
}) {}
```

### 2.10 Document

```typescript
export class Document extends Schema.Class<Document>("Document")({
  text: Schema.String,
  documentId: Schema.optionalWith(Schema.String, { exact: true }),
  additionalContext: Schema.optionalWith(Schema.String, { exact: true })
}) {}
```

Note: In the Python version, `Document.document_id` auto-generates a UUID if not set. In the Effect port, we handle this with a smart constructor:

```typescript
export const makeDocumentEffect = (args: {
  readonly text: string
  readonly documentId?: string | undefined
  readonly additionalContext?: string | undefined
}): Effect.Effect<Document, never, DocumentIdGenerator> =>
  Effect.gen(function* () {
    const generator = yield* DocumentIdGenerator
    const documentId = args.documentId ?? (yield* generator.next)
    return new Document({
      text: args.text,
      documentId,
      ...(args.additionalContext !== undefined
        ? { additionalContext: args.additionalContext }
        : {})
    })
  })
```

### 2.11 AnnotatedDocument

```typescript
export class AnnotatedDocument extends Schema.Class<AnnotatedDocument>("AnnotatedDocument")({
  documentId: Schema.optionalWith(Schema.String, { exact: true }),
  extractions: Schema.optionalWith(Schema.Array(Extraction), { exact: true }),
  text: Schema.optionalWith(Schema.String, { exact: true })
}) {}
```

### 2.12 ExampleData

```typescript
export class ExampleData extends Schema.Class<ExampleData>("ExampleData")({
  text: Schema.String,
  extractions: Schema.Array(Extraction).pipe(Schema.withDefault(() => []))
}) {}
```

### 2.13 TextChunk

```typescript
// src/Chunking.ts
export class TextChunk extends Schema.Class<TextChunk>("TextChunk")({
  tokenInterval: TokenInterval,
  documentId: Schema.optionalWith(Schema.String, { exact: true }),
  chunkText: Schema.String,
  sanitizedChunkText: Schema.String,
  charInterval: CharInterval,
  additionalContext: Schema.optionalWith(Schema.String, { exact: true })
}) {}
```

Note: Unlike the Python version which lazily computes `chunk_text` from the document, the Effect port pre-computes these at construction time. This eliminates mutable state and `ValueError` possibilities.

### 2.14 PromptTemplateStructured

```typescript
// src/Prompting.ts
export class PromptTemplateStructured extends Schema.Class<PromptTemplateStructured>("PromptTemplateStructured")({
  description: Schema.String,
  examples: Schema.Array(ExampleData).pipe(Schema.withDefault(() => []))
}) {}
```

### 2.15 ModelConfig

```typescript
// src/LanguageModel.ts
export class ModelConfig extends Schema.Class<ModelConfig>("ModelConfig")({
  modelId: Schema.optionalWith(Schema.String, { exact: true }),
  provider: Schema.optionalWith(Schema.String, { exact: true }),
  providerKwargs: Schema.Record({ key: Schema.String, value: Schema.Unknown }).pipe(
    Schema.withDefault(() => ({}))
  )
}) {}
```

### 2.16 FormatHandler

```typescript
// src/FormatHandler.ts
export class FormatHandlerConfig extends Schema.Class<FormatHandlerConfig>("FormatHandlerConfig")({
  formatType: FormatType.pipe(Schema.withDefault(() => "json" as const)),
  useWrapper: Schema.Boolean.pipe(Schema.withDefault(() => true)),
  wrapperKey: Schema.optionalWith(Schema.String, { exact: true }),
  useFences: Schema.Boolean.pipe(Schema.withDefault(() => true)),
  attributeSuffix: Schema.String.pipe(Schema.withDefault(() => "_attributes")),
  strictFences: Schema.Boolean.pipe(Schema.withDefault(() => false)),
  allowTopLevelList: Schema.Boolean.pipe(Schema.withDefault(() => true))
}) {}
```

### 2.17 Validation Types

```typescript
// src/PromptValidation.ts
export const PromptValidationLevel = Schema.Literal("off", "warning", "error")
export type PromptValidationLevel = typeof PromptValidationLevel.Type

export class AlignmentPolicy extends Schema.Class<AlignmentPolicy>("AlignmentPolicy")({
  enableFuzzyAlignment: Schema.Boolean.pipe(Schema.withDefault(() => true)),
  fuzzyAlignmentThreshold: Schema.Number.pipe(Schema.withDefault(() => 0.75)),
  acceptMatchLesser: Schema.Boolean.pipe(Schema.withDefault(() => true))
}) {}

export class ValidationIssue extends Schema.Class<ValidationIssue>("ValidationIssue")({
  exampleIndex: Schema.Int,
  exampleId: Schema.optionalWith(Schema.String, { exact: true }),
  extractionClass: Schema.String,
  extractionTextPreview: Schema.String,
  alignmentStatus: Schema.optionalWith(AlignmentStatus, { exact: true }),
  issueKind: Schema.Literal("failed", "non_exact"),
  charInterval: Schema.optionalWith(Schema.Tuple(Schema.Int, Schema.Int), { exact: true }),
  tokenInterval: Schema.optionalWith(Schema.Tuple(Schema.Int, Schema.Int), { exact: true })
}) {}

export class ValidationReport extends Schema.Class<ValidationReport>("ValidationReport")({
  issues: Schema.Array(ValidationIssue)
}) {
  get hasFailed(): boolean {
    return this.issues.some((i) => i.issueKind === "failed")
  }
  get hasNonExact(): boolean {
    return this.issues.some((i) => i.issueKind === "non_exact")
  }
}
```

### 2.18 Primed Cache Key

```typescript
// src/PrimedCache.ts
export class PrimedCacheKey extends Schema.Class<PrimedCacheKey>("PrimedCacheKey")({
  provider: Schema.String,
  modelId: Schema.String,
  promptFingerprint: Schema.String,
  schemaFingerprint: Schema.optionalWith(Schema.String, { exact: true }),
  temperature: Schema.optionalWith(Schema.Number, { exact: true }),
  formatType: Schema.optionalWith(FormatType, { exact: true }),
  promptVersion: Schema.String
}) {}
```

### 2.19 Primed Cache Policy

```typescript
// src/PrimedCache.ts
export class PrimedCachePolicy extends Schema.Class<PrimedCachePolicy>("PrimedCachePolicy")({
  enabled: Schema.Boolean.pipe(Schema.withDefault(() => true)),
  ttlSeconds: Schema.Int.pipe(Schema.withDefault(() => 60 * 60 * 24)),
  namespace: Schema.String.pipe(Schema.withDefault(() => "langextract")),
  deterministicOnly: Schema.Boolean.pipe(Schema.withDefault(() => true)),
  allowStreamingWrites: Schema.Boolean.pipe(Schema.withDefault(() => false)),
  maxEntries: Schema.Int.pipe(Schema.withDefault(() => 10_000))
}) {}
```

---

## 3. Service Definitions

Each service is defined as a `Context.Tag` with an interface specifying methods, input types, and return types (including the Effect error channel).

Testing requirement: every service contract in this section must have a matching test-layer implementation for `@effect/vitest` (`Layer.succeed` or `Layer.effect`) so contract tests can run with deterministic dependencies.

Design rule: implementation modules MAY add helper functions, but exported runtime dependencies must always be service interfaces (`Context.Tag`) backed by Layers.

Contract rule: service interfaces define capabilities only. They MUST NOT expose environment lookups, layer wiring, global mutable state, or provider SDK objects directly.

### 3.1 Tokenizer Service

```typescript
// src/Tokenizer.ts
import { Context, Effect } from "effect"

export interface TokenizerService {
  readonly tokenize: (text: string) => TokenizedText
  readonly tokensText: (tokenizedText: TokenizedText, interval: TokenInterval) => string
  readonly findSentenceRange: (
    text: string,
    tokens: ReadonlyArray<Token>,
    startTokenIndex: number
  ) => TokenInterval
}

export class Tokenizer extends Context.Tag("Tokenizer")<Tokenizer, TokenizerService>() {}
```

### 3.2 LanguageModel Service

```typescript
// src/LanguageModel.ts
import { Context, Effect, Stream } from "effect"

export interface InferOptions {
  readonly cachePolicy?: PrimedCachePolicy | undefined
  readonly providerConcurrency?: number | undefined
  readonly providerOptions?: Record<string, unknown> | undefined
  readonly passNumber?: number | undefined
  readonly contextWindowChars?: number | undefined
  readonly additionalContextHash?: string | undefined
  readonly preferStructuredOutput?: boolean | undefined
  readonly stream?: boolean | undefined
}

export interface LanguageModelService {
  /** Run inference on a batch of prompts. Returns one ScoredOutput[] per prompt. */
  readonly infer: (
    batchPrompts: ReadonlyArray<string>,
    options?: InferOptions
  ) => Effect.Effect<ReadonlyArray<ReadonlyArray<ScoredOutput>>, InferenceRuntimeError>

  /** Native Effect AI text path for providers that support it */
  readonly generateText: (
    prompt: string,
    options?: InferOptions
  ) => Effect.Effect<ScoredOutput, InferenceRuntimeError>

  /** Native Effect AI structured path for schema-constrained extraction */
  readonly generateObject: (
    prompt: string,
    options?: InferOptions
  ) => Effect.Effect<Record<string, unknown>, InferenceRuntimeError>

  /** Optional stream path for progressive UI/debug output */
  readonly streamText: (
    prompt: string,
    options?: InferOptions
  ) => Stream.Stream<string, InferenceRuntimeError>

  /** The model identifier */
  readonly modelId: string

  /** Whether this model requires fence output for parsing */
  readonly requiresFenceOutput: boolean

  /** The current schema instance, if any */
  readonly schema: ProviderSchema | undefined
}

export class LanguageModel extends Context.Tag("LanguageModel")<LanguageModel, LanguageModelService>() {}
```

### 3.3 FormatHandler Service

```typescript
// src/FormatHandler.ts
import { Context, Effect } from "effect"

export interface FormatHandlerService {
  /** Format extractions for a prompt example */
  readonly formatExtractionExample: (extractions: ReadonlyArray<Extraction>) => string

  /** Parse model output to extract data */
  readonly parseOutput: (
    text: string,
    options?: { strict?: boolean }
  ) => Effect.Effect<ReadonlyArray<Record<string, unknown>>, FormatParseError>

  /** Configuration accessors */
  readonly config: FormatHandlerConfig
}

export class FormatHandler extends Context.Tag("FormatHandler")<FormatHandler, FormatHandlerService>() {}
```

### 3.4 Resolver Service

```typescript
// src/Resolver.ts
import { Context, Effect } from "effect"

export interface ResolverService {
  /** Parse LLM output text into unaligned Extractions */
  readonly resolve: (
    inputText: string,
    options?: { suppressParseErrors?: boolean }
  ) => Effect.Effect<ReadonlyArray<Extraction>, ResolverParsingError>

  /** Align extractions to source text, computing char/token intervals */
  readonly align: (
    extractions: ReadonlyArray<Extraction>,
    sourceText: string,
    tokenOffset: number,
    charOffset: number,
    options?: {
      enableFuzzyAlignment?: boolean
      fuzzyAlignmentThreshold?: number
      acceptMatchLesser?: boolean
    }
  ) => Effect.Effect<ReadonlyArray<Extraction>, AlignmentError>
}

export class Resolver extends Context.Tag("Resolver")<Resolver, ResolverService>() {}
```

### 3.5 PromptBuilder Service

```typescript
// src/Prompting.ts
import { Context, Effect } from "effect"

export interface PromptBuilderService {
  /** Build a prompt for the given chunk text */
  readonly buildPrompt: (
    chunkText: string,
    documentId: string,
    additionalContext?: string | undefined
  ) => string

  /** Get the underlying prompt template */
  readonly template: PromptTemplateStructured
}

export class PromptBuilder extends Context.Tag("PromptBuilder")<PromptBuilder, PromptBuilderService>() {}
```

### 3.6 Annotator Service

```typescript
// src/Annotator.ts
import { Context, Effect, Stream } from "effect"

export interface AnnotatorService {
  /** Annotate a stream of documents, producing annotated documents */
  readonly annotateDocuments: (
    documents: ReadonlyArray<Document>,
    options: AnnotateOptions
  ) => Stream.Stream<AnnotatedDocument, LangExtractError, LanguageModel | Resolver | Tokenizer>

  /** Annotate a single text string */
  readonly annotateText: (
    text: string,
    options: AnnotateOptions
  ) => Effect.Effect<AnnotatedDocument, LangExtractError, LanguageModel | Resolver | Tokenizer>
}

export interface AnnotateOptions {
  readonly maxCharBuffer: number
  readonly batchLength: number
  readonly batchConcurrency: number
  readonly providerConcurrency: number
  readonly passNumber?: number | undefined
  readonly extractionPasses: number
  readonly contextWindowChars?: number | undefined
  readonly additionalContext?: string | undefined
  readonly maxBatchInputTokens?: number | undefined
  readonly cachePolicy?: PrimedCachePolicy | undefined
}

export class Annotator extends Context.Tag("Annotator")<Annotator, AnnotatorService>() {}
```

### 3.7 Visualizer Service

```typescript
// src/Visualization.ts
import { Context, Effect } from "effect"

export interface VisualizerService {
  /** Generate HTML visualization for an annotated document */
  readonly visualize: (
    doc: AnnotatedDocument,
    options?: {
      animationSpeed?: number
      showLegend?: boolean
    }
  ) => Effect.Effect<string, VisualizationError>
}

export class Visualizer extends Context.Tag("Visualizer")<Visualizer, VisualizerService>() {}
```

### 3.8 PromptValidator Service

```typescript
// src/PromptValidation.ts
import { Context, Effect } from "effect"

export interface PromptValidatorService {
  /** Validate few-shot examples for alignment quality */
  readonly validatePromptAlignment: (
    examples: ReadonlyArray<ExampleData>,
    policy?: AlignmentPolicy
  ) => Effect.Effect<ValidationReport, never, Tokenizer>

  /** Handle validation report based on level */
  readonly handleAlignmentReport: (
    report: ValidationReport,
    level: PromptValidationLevel,
    options?: { strictNonExact?: boolean }
  ) => Effect.Effect<void, PromptAlignmentError>
}

export class PromptValidator extends Context.Tag("PromptValidator")<
  PromptValidator,
  PromptValidatorService
>() {}
```

### 3.9 PrimedCache Service

```typescript
// src/PrimedCache.ts
import { Context, Effect } from "effect"

export interface PrimedCacheService {
  readonly get: (
    key: PrimedCacheKey
  ) => Effect.Effect<ReadonlyArray<ScoredOutput> | undefined, PrimedCacheError>

  readonly put: (
    key: PrimedCacheKey,
    value: ReadonlyArray<ScoredOutput>
  ) => Effect.Effect<void, PrimedCacheError>

  readonly invalidate: (
    key: PrimedCacheKey
  ) => Effect.Effect<void, PrimedCacheError>

  readonly clearNamespace: (
    namespace: string
  ) => Effect.Effect<void, PrimedCacheError>
}

export class PrimedCache extends Context.Tag("PrimedCache")<PrimedCache, PrimedCacheService>() {}
```

---

## 4. Layer Definitions

Each service has one or more Layer implementations. Layers are constructed with `Layer.effect` or `Layer.succeed` and composed with `Layer.provide`.

### 4.0 Live/Test Layer Pattern

Every service must ship with two layer entry points:

- `<Service>Live` in `src/**` for production/runtime composition.
- `<Service>Test` in `test/layers/**` for deterministic service substitution in `@effect/vitest`.

Layer rules:

- `Live` layers can depend on platform services (`HttpClient`, `FileSystem`, `KeyValueStore`, provider SDK adapters).
- `Test` layers must avoid network and filesystem unless the test explicitly requests an integration profile.
- Shared resources (cache stores, rate limiters, worker pools) must be wrapped with `Layer.memoize` to avoid duplicate initialization.
- Test suites should compose with `layer(...)` and `it.layer(...)`, replacing only the services under test while preserving the remaining dependency graph.

### 4.1 Tokenizer Layers

```typescript
// src/Tokenizer.ts

/** Regex-based tokenizer (default, fast for English) */
export const RegexTokenizerLive: Layer.Layer<Tokenizer> =
  Layer.succeed(Tokenizer, {
    tokenize: regexTokenize,
    tokensText: tokensTextImpl,
    findSentenceRange: findSentenceRangeImpl
  })

/** Unicode-aware tokenizer (better for CJK, Thai, etc.) */
export const UnicodeTokenizerLive: Layer.Layer<Tokenizer> =
  Layer.succeed(Tokenizer, {
    tokenize: unicodeTokenize,
    tokensText: tokensTextImpl,
    findSentenceRange: findSentenceRangeImpl
  })
```

### 4.2 LanguageModel Layers

```typescript
// src/providers/AiAdapters.ts
import { Effect, Layer, Stream } from "effect"
import * as AiLanguageModel from "@effect/ai/LanguageModel"
import { OpenAiLanguageModel } from "@effect/ai-openai"
import { GoogleLanguageModel } from "@effect/ai-google"

const inferWithPrimedCache = (
  provider: string,
  modelId: string,
  defaultProviderConcurrency: number,
  cache: PrimedCacheService,
  policy: PrimedCachePolicy,
  run: (prompt: string, options?: InferOptions) => Effect.Effect<ScoredOutput, InferenceRuntimeError>
) =>
  (prompts: ReadonlyArray<string>, options?: InferOptions) =>
    // Provider concurrency is separate from pipeline batch concurrency.
    // This avoids accidental fan-out (batchConcurrency x providerConcurrency).
    Effect.forEach(
      prompts,
      (prompt) => {
        const key = makePrimedCacheKey({ provider, modelId, prompt, options, policy })
        return cache.get(key).pipe(
          Effect.flatMap((hit) =>
            hit !== undefined
              ? Effect.succeed(hit.map((o) => ({ ...o, cacheStatus: "hit", cacheKey: key.promptFingerprint })))
              : run(prompt, options).pipe(
                  Effect.tap((value) => cache.put(key, [{ ...value, cacheStatus: "miss", cacheKey: key.promptFingerprint }])),
                  Effect.map((value) => [value])
                )
          )
        )
      },
      { concurrency: options?.providerConcurrency ?? defaultProviderConcurrency }
    )

export const GeminiLanguageModelLive: Layer.Layer<LanguageModel, InferenceConfigError, GeminiConfig | PrimedCache> =
  Layer.effect(LanguageModel, Effect.gen(function* () {
    const config = yield* GeminiConfig
    const cache = yield* PrimedCache
    const model = GoogleLanguageModel.model(config.modelId)
    const policy = config.primedCachePolicy

    const generateText = (prompt: string, options?: InferOptions) =>
      AiLanguageModel.generateText(model, { prompt, providerOptions: options?.providerOptions }).pipe(
        Effect.map((r) => new ScoredOutput({ output: r.text, provider: "gemini" })),
        Effect.mapError((error) => new InferenceRuntimeError({ message: String(error), provider: "gemini" }))
      )

    return {
      modelId: config.modelId,
      requiresFenceOutput: false,
      schema: undefined,
      infer: inferWithPrimedCache(
        "gemini",
        config.modelId,
        config.providerConcurrency,
        cache,
        policy,
        generateText
      ),
      generateText,
      generateObject: (prompt, options) =>
        AiLanguageModel.generateObject(model, { prompt, providerOptions: options?.providerOptions }),
      streamText: (prompt, options) =>
        AiLanguageModel.streamText(model, { prompt, providerOptions: options?.providerOptions }).pipe(
          Stream.map((part) => part._tag === "TextDelta" ? part.delta : "")
        )
    } satisfies LanguageModelService
  }))

export const OpenAILanguageModelLive: Layer.Layer<LanguageModel, InferenceConfigError, OpenAIConfig | PrimedCache> =
  Layer.effect(LanguageModel, Effect.gen(function* () {
    const config = yield* OpenAIConfig
    const cache = yield* PrimedCache
    const model = OpenAiLanguageModel.model(config.modelId)
    const policy = config.primedCachePolicy

    const generateText = (prompt: string, options?: InferOptions) =>
      AiLanguageModel.generateText(model, { prompt, providerOptions: options?.providerOptions }).pipe(
        Effect.map((r) => new ScoredOutput({ output: r.text, provider: "openai" })),
        Effect.mapError((error) => new InferenceRuntimeError({ message: String(error), provider: "openai" }))
      )

    return {
      modelId: config.modelId,
      requiresFenceOutput: config.formatType !== "json",
      schema: undefined,
      infer: inferWithPrimedCache(
        "openai",
        config.modelId,
        config.providerConcurrency,
        cache,
        policy,
        generateText
      ),
      generateText,
      generateObject: (prompt, options) =>
        AiLanguageModel.generateObject(model, { prompt, providerOptions: options?.providerOptions }),
      streamText: (prompt, options) =>
        AiLanguageModel.streamText(model, { prompt, providerOptions: options?.providerOptions }).pipe(
          Stream.map((part) => part._tag === "TextDelta" ? part.delta : "")
        )
    } satisfies LanguageModelService
  }))

// Ollama keeps a custom adapter over HttpClient, but MUST use the same inferWithPrimedCache path
// so primed cache semantics are provider-agnostic.
```

Provider requirements:

- Primed caching is mandatory in all providers through `PrimedCache`; providers MUST not bypass it.
- Cache keys MUST include provider, model ID, prompt fingerprint, schema fingerprint, temperature, prompt version, and execution context (`passNumber`, `contextWindowChars`, `additionalContextHash`).
- If `deterministicOnly = true`, providers bypass cache writes when sampling is non-deterministic (e.g., `temperature` unset/high).
- Provider concurrency defaults to provider config (`*_PROVIDER_CONCURRENCY`) and can be overridden per call via `InferOptions.providerConcurrency`.
- Provider-specific metadata MUST be part of key derivation:
  - Gemini: include `vertexai`, `project`, `location`, and safety/tool configuration.
  - OpenAI: include `baseUrl`, `organization`, response format mode, and tool-choice mode.
  - Ollama: include `baseUrl`, model digest/tag, and timeout profile.
  - Anthropic (when enabled through `@effect/ai-anthropic`): propagate prompt/message `cacheControl` metadata as part of priming strategy.

### 4.3 FormatHandler Layer

```typescript
// src/FormatHandler.ts

export const FormatHandlerLive: Layer.Layer<FormatHandler> =
  Layer.effect(
    FormatHandler,
    Effect.gen(function* () {
      // Defaults: JSON, wrapper, fences
      return makeFormatHandler(new FormatHandlerConfig({}))
    })
  )

/** Create a FormatHandler Layer from explicit config */
export const makeFormatHandlerLayer = (
  config: FormatHandlerConfig
): Layer.Layer<FormatHandler> =>
  Layer.succeed(FormatHandler, makeFormatHandler(config))
```

### 4.4 Resolver Layer

```typescript
// src/Resolver.ts

export const ResolverLive: Layer.Layer<Resolver, never, FormatHandler | Tokenizer> =
  Layer.effect(
    Resolver,
    Effect.gen(function* () {
      const formatHandler = yield* FormatHandler
      const tokenizer = yield* Tokenizer
      return {
        resolve: (inputText, options) => resolveImpl(formatHandler, inputText, options),
        align: (extractions, sourceText, tokenOffset, charOffset, options) =>
          alignImpl(tokenizer, extractions, sourceText, tokenOffset, charOffset, options)
      }
    })
  )
```

### 4.5 Annotator Layer

```typescript
// src/Annotator.ts

export const AnnotatorLive: Layer.Layer<Annotator, never, LanguageModel | Resolver | Tokenizer | PromptBuilder> =
  Layer.effect(
    Annotator,
    Effect.gen(function* () {
      const lm = yield* LanguageModel
      const resolver = yield* Resolver
      const tokenizer = yield* Tokenizer
      const promptBuilder = yield* PromptBuilder
      return {
        annotateDocuments: (docs, opts) =>
          annotateDocumentsImpl(lm, resolver, tokenizer, promptBuilder, docs, opts),
        annotateText: (text, opts) =>
          annotateTextImpl(lm, resolver, tokenizer, promptBuilder, text, opts)
      }
    })
  )
```

### 4.6 Visualizer Layer

```typescript
// src/Visualization.ts

export const VisualizerLive: Layer.Layer<Visualizer> =
  Layer.succeed(Visualizer, {
    visualize: (doc, options) => visualizeImpl(doc, options)
  })
```

### 4.7 PrimedCache + Runtime Control Layers

```typescript
// src/PrimedCache.ts
import { Layer } from "effect"
import * as PersistedCache from "@effect/experimental/PersistedCache"
import * as Persistence from "@effect/experimental/Persistence"
import * as BunKeyValueStore from "@effect/platform-bun/BunKeyValueStore"

// Durable store backing on Bun filesystem.
export const PrimedCachePersistenceLive =
  Persistence.layerResult(Persistence.ResultPersistence, BunKeyValueStore.layerFileSystem)

// Two-tier cache: in-memory fast path + persisted backing.
export const PrimedCacheLive: Layer.Layer<PrimedCache, PrimedCacheError> =
  PersistedCache.layer({
    timeToLive: "24 hours",
    capacity: 10_000
  }).pipe(Layer.provide(PrimedCachePersistenceLive))
```

```typescript
// src/RuntimeControl.ts
import * as RateLimiter from "@effect/experimental/RateLimiter"
import * as RequestResolver from "@effect/experimental/RequestResolver"

// Provider-scoped limiter. Use one layer per provider when quotas differ.
export const ProviderRateLimiterLive = RateLimiter.layer({
  algorithm: "token-bucket",
  limit: 60,
  window: "1 minute"
})

// Optional request coalescing for identical in-flight prompts.
export const PromptRequestResolverLive = RequestResolver.dataLoader(/* batched prompt resolver */)
```

Runtime requirements:

- `PrimedCacheLive` is required by all `LanguageModel` layers in production.
- `Layer.memoize` MUST be used for cache/rate-limiter layers to avoid duplicate initialization per command.
- Cache, limiter, and resolver layers MUST be independently swappable in tests.
- Test suites MUST provide these dependencies via `@effect/vitest` `layer(...)` / `it.layer(...)` helpers rather than ad-hoc globals.

---

## 5. Error Model

Python exceptions map to `Schema.TaggedError` types. Each error has a `_tag` discriminant for pattern matching and carries structured data.

```typescript
// src/Errors.ts
import { Schema } from "effect"

/** Base error -- all langextract errors extend this */
export class LangExtractError extends Schema.TaggedError<LangExtractError>()(
  "LangExtractError",
  { message: Schema.String }
) {}

/** Configuration errors (missing API keys, invalid model IDs) */
export class InferenceConfigError extends Schema.TaggedError<InferenceConfigError>()(
  "InferenceConfigError",
  { message: Schema.String }
) {}

/** Runtime inference errors (API failures, timeouts) */
export class InferenceRuntimeError extends Schema.TaggedError<InferenceRuntimeError>()(
  "InferenceRuntimeError",
  {
    message: Schema.String,
    provider: Schema.optionalWith(Schema.String, { exact: true })
  }
) {}

/** No scored outputs from the language model */
export class InferenceOutputError extends Schema.TaggedError<InferenceOutputError>()(
  "InferenceOutputError",
  { message: Schema.String }
) {}

/** Invalid document input (duplicate IDs, malformed) */
export class InvalidDocumentError extends Schema.TaggedError<InvalidDocumentError>()(
  "InvalidDocumentError",
  { message: Schema.String }
) {}

/** Internal invariant violations (bugs in the library) */
export class InternalError extends Schema.TaggedError<InternalError>()(
  "InternalError",
  { message: Schema.String }
) {}

/** Provider/backend specific errors */
export class ProviderError extends Schema.TaggedError<ProviderError>()(
  "ProviderError",
  { message: Schema.String }
) {}

/** Primed cache read/write/invalidation errors */
export class PrimedCacheError extends Schema.TaggedError<PrimedCacheError>()(
  "PrimedCacheError",
  {
    message: Schema.String,
    key: Schema.optionalWith(Schema.String, { exact: true })
  }
) {}

/** Provider rate-limit breaches */
export class ProviderRateLimitError extends Schema.TaggedError<ProviderRateLimitError>()(
  "ProviderRateLimitError",
  {
    message: Schema.String,
    provider: Schema.optionalWith(Schema.String, { exact: true })
  }
) {}

/** Schema validation errors */
export class SchemaValidationError extends Schema.TaggedError<SchemaValidationError>()(
  "SchemaValidationError",
  { message: Schema.String }
) {}

/** Base format handling error */
export class FormatError extends Schema.TaggedError<FormatError>()(
  "FormatError",
  { message: Schema.String }
) {}

/** Format parsing failures (fences, JSON/YAML decode, structure) */
export class FormatParseError extends Schema.TaggedError<FormatParseError>()(
  "FormatParseError",
  { message: Schema.String }
) {}

/** Resolver cannot parse model output */
export class ResolverParsingError extends Schema.TaggedError<ResolverParsingError>()(
  "ResolverParsingError",
  { message: Schema.String }
) {}

/** Alignment failed */
export class AlignmentError extends Schema.TaggedError<AlignmentError>()(
  "AlignmentError",
  { message: Schema.String }
) {}

/** Tokenizer errors */
export class TokenizerError extends Schema.TaggedError<TokenizerError>()(
  "TokenizerError",
  { message: Schema.String }
) {}

export class InvalidTokenIntervalError extends Schema.TaggedError<InvalidTokenIntervalError>()(
  "InvalidTokenIntervalError",
  { message: Schema.String }
) {}

export class SentenceRangeError extends Schema.TaggedError<SentenceRangeError>()(
  "SentenceRangeError",
  { message: Schema.String }
) {}

/** Chunking errors */
export class TokenUtilError extends Schema.TaggedError<TokenUtilError>()(
  "TokenUtilError",
  { message: Schema.String }
) {}

/** Prompt building errors */
export class PromptBuilderError extends Schema.TaggedError<PromptBuilderError>()(
  "PromptBuilderError",
  { message: Schema.String }
) {}

/** Prompt template parse error */
export class PromptParseError extends Schema.TaggedError<PromptParseError>()(
  "PromptParseError",
  { message: Schema.String }
) {}

/** Prompt alignment validation failed */
export class PromptAlignmentError extends Schema.TaggedError<PromptAlignmentError>()(
  "PromptAlignmentError",
  { message: Schema.String }
) {}

/** Dataset/IO errors */
export class InvalidDatasetError extends Schema.TaggedError<InvalidDatasetError>()(
  "InvalidDatasetError",
  { message: Schema.String }
) {}

/** Visualization errors */
export class VisualizationError extends Schema.TaggedError<VisualizationError>()(
  "VisualizationError",
  { message: Schema.String }
) {}
```

---

## 6. Config Model

All configuration is expressed via `Config` from the `effect` package. API keys resolve from environment variables. Provider-specific config uses `Schema.Class` with `Config.all` for construction.

### 6.1 Extraction Config

```typescript
// src/ExtractionConfig.ts
import { Config } from "effect"

export const ExtractionConfig = Config.all({
  modelId: Config.string("MODEL_ID").pipe(Config.withDefault("gemini-2.5-flash")),
  maxCharBuffer: Config.integer("MAX_CHAR_BUFFER").pipe(Config.withDefault(1000)),
  temperature: Config.number("TEMPERATURE").pipe(Config.option),
  batchLength: Config.integer("BATCH_LENGTH").pipe(Config.withDefault(10)),
  batchConcurrency: Config.integer("BATCH_CONCURRENCY").pipe(Config.withDefault(1)),
  providerConcurrency: Config.integer("PROVIDER_CONCURRENCY").pipe(Config.withDefault(8)),
  maxBatchInputTokens: Config.integer("MAX_BATCH_INPUT_TOKENS").pipe(Config.option),
  extractionPasses: Config.integer("EXTRACTION_PASSES").pipe(Config.withDefault(1)),
  contextWindowChars: Config.integer("CONTEXT_WINDOW_CHARS").pipe(Config.option),
  formatType: Config.literal("json", "yaml")("FORMAT_TYPE").pipe(Config.withDefault("json" as const)),
  useFences: Config.boolean("USE_FENCES").pipe(Config.option),
  useSchemaConstraints: Config.boolean("USE_SCHEMA_CONSTRAINTS").pipe(Config.withDefault(true)),
  primedCacheEnabled: Config.boolean("PRIMED_CACHE_ENABLED").pipe(Config.withDefault(true)),
  primedCacheDir: Config.string("PRIMED_CACHE_DIR").pipe(Config.withDefault(".cache/langextract")),
  primedCacheNamespace: Config.string("PRIMED_CACHE_NAMESPACE").pipe(Config.withDefault("langextract")),
  primedCacheTtlSeconds: Config.integer("PRIMED_CACHE_TTL_SECONDS").pipe(Config.withDefault(86400)),
  primedCacheDeterministicOnly: Config.boolean("PRIMED_CACHE_DETERMINISTIC_ONLY").pipe(
    Config.withDefault(true)
  ),
  clearPrimedCacheOnStart: Config.boolean("CLEAR_PRIMED_CACHE_ON_START").pipe(Config.withDefault(false)),
  debug: Config.boolean("DEBUG").pipe(Config.withDefault(false))
})
```

### 6.2 Provider Configs

```typescript
// src/providers/Gemini.ts
export class GeminiConfig extends Context.Tag("GeminiConfig")<
  GeminiConfig,
  {
    readonly modelId: string
    readonly apiKey: string
    readonly temperature: number
    readonly providerConcurrency: number
    readonly vertexai: boolean
    readonly project?: string | undefined
    readonly location?: string | undefined
    readonly primedCacheScope: "request" | "session"
    readonly primedCachePolicy: PrimedCachePolicy
  }
>() {}

export const GeminiConfigLive: Layer.Layer<GeminiConfig> = Layer.effect(
  GeminiConfig,
  Config.all({
    modelId: Config.string("GEMINI_MODEL_ID").pipe(Config.withDefault("gemini-2.5-flash")),
    apiKey: Config.string("GEMINI_API_KEY").pipe(
      Config.orElse(() => Config.string("LANGEXTRACT_API_KEY"))
    ),
    temperature: Config.number("GEMINI_TEMPERATURE").pipe(Config.withDefault(0.0)),
    providerConcurrency: Config.integer("GEMINI_PROVIDER_CONCURRENCY").pipe(Config.withDefault(8)),
    vertexai: Config.boolean("GEMINI_VERTEXAI").pipe(Config.withDefault(false)),
    project: Config.string("GOOGLE_CLOUD_PROJECT").pipe(Config.option),
    location: Config.string("GEMINI_LOCATION").pipe(Config.option),
    primedCacheScope: Config.literal("request", "session")("GEMINI_PRIMED_CACHE_SCOPE").pipe(
      Config.withDefault("session" as const)
    ),
    primedCachePolicy: Config.all({
      enabled: Config.boolean("GEMINI_PRIMED_CACHE_ENABLED").pipe(Config.withDefault(true)),
      ttlSeconds: Config.integer("GEMINI_PRIMED_CACHE_TTL_SECONDS").pipe(Config.withDefault(86400)),
      namespace: Config.string("GEMINI_PRIMED_CACHE_NAMESPACE").pipe(Config.withDefault("gemini")),
      deterministicOnly: Config.boolean("GEMINI_PRIMED_CACHE_DETERMINISTIC_ONLY").pipe(
        Config.withDefault(true)
      ),
      allowStreamingWrites: Config.boolean("GEMINI_PRIMED_CACHE_ALLOW_STREAM_WRITES").pipe(
        Config.withDefault(false)
      ),
      maxEntries: Config.integer("GEMINI_PRIMED_CACHE_MAX_ENTRIES").pipe(Config.withDefault(10000))
    })
  }).pipe(
    Effect.map((c) => ({
      ...c,
      project: c.project.pipe(Option.getOrUndefined),
      location: c.location.pipe(Option.getOrUndefined)
    }))
  )
)
```

```typescript
// src/providers/OpenAI.ts
export class OpenAIConfig extends Context.Tag("OpenAIConfig")<
  OpenAIConfig,
  {
    readonly modelId: string
    readonly apiKey: string
    readonly baseUrl?: string | undefined
    readonly organization?: string | undefined
    readonly temperature?: number | undefined
    readonly providerConcurrency: number
    readonly formatType: FormatType
    readonly primedCacheScope: "request" | "session"
    readonly primedCachePolicy: PrimedCachePolicy
  }
>() {}

export const OpenAIConfigLive: Layer.Layer<OpenAIConfig> = Layer.effect(
  OpenAIConfig,
  Config.all({
    modelId: Config.string("OPENAI_MODEL_ID").pipe(Config.withDefault("gpt-4o-mini")),
    apiKey: Config.string("OPENAI_API_KEY").pipe(
      Config.orElse(() => Config.string("LANGEXTRACT_API_KEY"))
    ),
    baseUrl: Config.string("OPENAI_BASE_URL").pipe(Config.option),
    organization: Config.string("OPENAI_ORGANIZATION").pipe(Config.option),
    temperature: Config.number("OPENAI_TEMPERATURE").pipe(Config.option),
    providerConcurrency: Config.integer("OPENAI_PROVIDER_CONCURRENCY").pipe(Config.withDefault(8)),
    formatType: Config.literal("json", "yaml")("OPENAI_FORMAT_TYPE").pipe(Config.withDefault("json" as const)),
    primedCacheScope: Config.literal("request", "session")("OPENAI_PRIMED_CACHE_SCOPE").pipe(
      Config.withDefault("session" as const)
    ),
    primedCachePolicy: Config.all({
      enabled: Config.boolean("OPENAI_PRIMED_CACHE_ENABLED").pipe(Config.withDefault(true)),
      ttlSeconds: Config.integer("OPENAI_PRIMED_CACHE_TTL_SECONDS").pipe(Config.withDefault(86400)),
      namespace: Config.string("OPENAI_PRIMED_CACHE_NAMESPACE").pipe(Config.withDefault("openai")),
      deterministicOnly: Config.boolean("OPENAI_PRIMED_CACHE_DETERMINISTIC_ONLY").pipe(
        Config.withDefault(true)
      ),
      allowStreamingWrites: Config.boolean("OPENAI_PRIMED_CACHE_ALLOW_STREAM_WRITES").pipe(
        Config.withDefault(false)
      ),
      maxEntries: Config.integer("OPENAI_PRIMED_CACHE_MAX_ENTRIES").pipe(Config.withDefault(10000))
    })
  }).pipe(Effect.map((c) => ({
    ...c,
    baseUrl: c.baseUrl.pipe(Option.getOrUndefined),
    organization: c.organization.pipe(Option.getOrUndefined),
    temperature: c.temperature.pipe(Option.getOrUndefined)
  })))
)
```

```typescript
// src/providers/Ollama.ts
export class OllamaConfig extends Context.Tag("OllamaConfig")<
  OllamaConfig,
  {
    readonly modelId: string
    readonly baseUrl: string
    readonly formatType: FormatType
    readonly timeout: number
    readonly providerConcurrency: number
    readonly primedCacheScope: "request" | "session"
    readonly primedCachePolicy: PrimedCachePolicy
  }
>() {}

export const OllamaConfigLive: Layer.Layer<OllamaConfig> = Layer.effect(
  OllamaConfig,
  Config.all({
    modelId: Config.string("OLLAMA_MODEL_ID"),
    baseUrl: Config.string("OLLAMA_BASE_URL").pipe(Config.withDefault("http://localhost:11434")),
    formatType: Config.literal("json", "yaml")("OLLAMA_FORMAT_TYPE").pipe(Config.withDefault("json" as const)),
    timeout: Config.integer("OLLAMA_TIMEOUT").pipe(Config.withDefault(120)),
    providerConcurrency: Config.integer("OLLAMA_PROVIDER_CONCURRENCY").pipe(Config.withDefault(8)),
    primedCacheScope: Config.literal("request", "session")("OLLAMA_PRIMED_CACHE_SCOPE").pipe(
      Config.withDefault("session" as const)
    ),
    primedCachePolicy: Config.all({
      enabled: Config.boolean("OLLAMA_PRIMED_CACHE_ENABLED").pipe(Config.withDefault(true)),
      ttlSeconds: Config.integer("OLLAMA_PRIMED_CACHE_TTL_SECONDS").pipe(Config.withDefault(86400)),
      namespace: Config.string("OLLAMA_PRIMED_CACHE_NAMESPACE").pipe(Config.withDefault("ollama")),
      deterministicOnly: Config.boolean("OLLAMA_PRIMED_CACHE_DETERMINISTIC_ONLY").pipe(
        Config.withDefault(true)
      ),
      allowStreamingWrites: Config.boolean("OLLAMA_PRIMED_CACHE_ALLOW_STREAM_WRITES").pipe(
        Config.withDefault(false)
      ),
      maxEntries: Config.integer("OLLAMA_PRIMED_CACHE_MAX_ENTRIES").pipe(Config.withDefault(10000))
    })
  })
)
```

Cache policy rules:

- `*_PRIMED_CACHE_NAMESPACE` isolates provider cache entries to avoid cross-provider collisions.
- `*_PRIMED_CACHE_SCOPE=request` allows per-command ephemeral priming; `session` enables persistent reuse across runs.
- `*_PRIMED_CACHE_DETERMINISTIC_ONLY=true` is the default safety guard and should only be disabled explicitly for recall-driven workflows.
- `BATCH_CONCURRENCY` and `*_PROVIDER_CONCURRENCY` are independent controls. Effective request fan-out is bounded by `batchConcurrency × providerConcurrency`.

---

## 7. CLI Specification

The CLI is implemented with typed `@effect/cli` commands in `src/Cli.ts`.

### 7.1 Command Structure

```
effect-langextract extract [options]
effect-langextract visualize --input <annotated-document.json> [options]
```

### 7.2 Extract Command

`extract` accepts one unified input source (`--input`) with explicit format hints (`--input-format`) and supports:

- Input/ingestion knobs: `--input`, `--input-format auto|text|json|jsonl|csv|url|stdin`, `--text-field`, `--id-field`, repeated `--context-field`, `--csv-delimiter`, `--csv-header`, `--row-error-mode`
- Provider selection: `gemini | openai | anthropic | ollama`
- Model/runtime knobs: `--model-id`, `--temperature`, `--provider-concurrency`
- Pipeline knobs: `--max-char-buffer`, `--batch-length`, `--batch-concurrency`, `--extraction-passes`, `--context-window-chars`, `--max-batch-input-tokens`
- Output knobs: `--output json|jsonl|html`, optional `--output-path`
- Primed-cache knobs: namespace, ttl, deterministic-only, and clear-on-start

Config precedence is strictly:

`CLI > env > defaults`

### 7.3 Visualize Command

`visualize` is intentionally clean-break and accepts **annotated JSON** only:

- Required: `--input <annotated-document.json>`
- Optional: `--output-path <html-file>`
- Optional: `--animation-speed <float>`
- Optional: `--show-legend true|false`

Implementation path:

1. Read JSON file via `FileSystem`
2. Decode `AnnotatedDocument` via schema JSON codec
3. Render HTML via `Visualizer`
4. Write to file or stdout

### 7.4 Root Command

Root command exposes both subcommands and no legacy compatibility shims:

- `extract`
- `visualize`

---

## 8. Pipeline Flow (Effect Style)

### 8.0 Shared Helpers

```typescript
// src/Annotator.ts
import { Effect } from "effect"

type BatchBuildOptions = {
  readonly targetBatchLength: number
  readonly maxBatchInputTokens?: number | undefined
  readonly estimateTokens: (chunk: TextChunk) => number
}

const hashText = (text: string): string => {
  let hash = 0x811c9dc5
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index)
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24)
  }
  return (hash >>> 0).toString(16).padStart(8, "0")
}

const estimatePromptTokens = (
  promptBuilder: PromptBuilderService,
  chunk: TextChunk
): number => {
  // Heuristic estimate; implementation can swap in provider tokenizer.
  const prompt = promptBuilder.buildPrompt(
    chunk.chunkText,
    chunk.documentId ?? "",
    chunk.additionalContext
  )
  return Math.ceil(prompt.length / 4)
}

const makeBatches = (
  chunks: ReadonlyArray<TextChunk>,
  options: BatchBuildOptions
): ReadonlyArray<ReadonlyArray<TextChunk>> => {
  const batches: Array<Array<TextChunk>> = []
  let current: Array<TextChunk> = []
  let currentTokenCount = 0

  const flush = () => {
    if (current.length > 0) {
      batches.push(current)
      current = []
      currentTokenCount = 0
    }
  }

  for (const chunk of chunks) {
    const estimated = options.estimateTokens(chunk)
    const wouldExceedLength = current.length >= options.targetBatchLength
    const wouldExceedTokens = options.maxBatchInputTokens !== undefined &&
      currentTokenCount + estimated > options.maxBatchInputTokens

    if (wouldExceedLength || wouldExceedTokens) {
      flush()
    }

    current.push(chunk)
    currentTokenCount += estimated
  }

  flush()
  return batches
}

declare const annotateDocumentsSinglePassFromPlan: (
  batchPlan: ReadonlyArray<ReadonlyArray<TextChunk>>,
  options: AnnotateOptions
) => Effect.Effect<
  ReadonlyArray<AnnotatedDocument>,
  LangExtractError,
  LanguageModel | Resolver | Tokenizer | PromptBuilder
>
```

### 8.1 Main Extraction Pipeline

```typescript
// src/api/Extraction.ts
export const extract = (options: ExtractOptions) =>
  Effect.gen(function* () {
    const { text, promptDescription, examples, ...opts } = options

    // 1. Validate examples
    if (examples.length === 0) {
      return yield* Effect.fail(
        new InferenceConfigError({ message: "Examples are required for reliable extraction." })
      )
    }

    // 2. Optional prompt validation
    if (opts.promptValidationLevel !== "off") {
      const validator = yield* PromptValidator
      const report = yield* validator.validatePromptAlignment(examples)
      yield* validator.handleAlignmentReport(report, opts.promptValidationLevel)
    }

    // 3. Build prompt template
    const template = new PromptTemplateStructured({
      description: promptDescription,
      examples
    })

    // 4. Fetch URL if needed
    const inputText = opts.fetchUrls && isUrl(text)
      ? yield* downloadText(text)
      : text

    // 5. Optional cache clear
    const primedCache = yield* PrimedCache
    if (opts.clearPrimedCacheOnStart) {
      yield* primedCache.clearNamespace(opts.primedCacheNamespace)
    }

    // 6. Run annotation
    const annotator = yield* Annotator
    const result = yield* annotator.annotateText(inputText, {
      maxCharBuffer: opts.maxCharBuffer,
      batchLength: opts.batchLength,
      batchConcurrency: opts.batchConcurrency,
      providerConcurrency: opts.providerConcurrency,
      maxBatchInputTokens: opts.maxBatchInputTokens,
      extractionPasses: opts.extractionPasses,
      contextWindowChars: opts.contextWindowChars,
      additionalContext: opts.additionalContext,
      cachePolicy: new PrimedCachePolicy({
        enabled: opts.primedCacheEnabled,
        namespace: opts.primedCacheNamespace,
        ttlSeconds: opts.primedCacheTtlSeconds,
        deterministicOnly: opts.primedCacheDeterministicOnly
      })
    })

    return result
  })
```

### 8.2 Single-Pass Document Annotation

```typescript
// src/Annotator.ts
const annotateDocumentsSinglePass = (
  documents: ReadonlyArray<Document>,
  options: AnnotateOptions
) =>
  Effect.gen(function* () {
    const lm = yield* LanguageModel
    const resolver = yield* Resolver
    const tokenizer = yield* Tokenizer
    const promptBuilder = yield* PromptBuilder

    // 1. Chunk all documents
    const chunks = yield* chunkDocuments(documents, options.maxCharBuffer, tokenizer)

    // 2. Build token-aware batches (chunk size + prompt overhead)
    const batches = makeBatches(chunks, {
      targetBatchLength: options.batchLength,
      maxBatchInputTokens: options.maxBatchInputTokens,
      estimateTokens: (chunk) => estimatePromptTokens(promptBuilder, chunk)
    })

    // 3. Process batches with bounded concurrency
    const perDoc = new Map<string, Array<Extraction>>()
    const alignmentMemo = new Map<string, ReadonlyArray<Extraction>>()

    yield* Effect.forEach(batches, (batch) =>
      Effect.gen(function* () {
        // Build prompts for batch
        const prompts = batch.map((chunk) =>
          promptBuilder.buildPrompt(
            chunk.chunkText,
            chunk.documentId ?? "",
            chunk.additionalContext
          )
        )

        // LLM inference (cache-aware; provider layer owns get/put behavior)
        const outputs = yield* lm.infer(prompts, {
          cachePolicy: options.cachePolicy,
          passNumber: options.passNumber ?? 1,
          contextWindowChars: options.contextWindowChars,
          additionalContextHash: options.additionalContext
            ? hashText(options.additionalContext)
            : undefined,
          providerConcurrency: options.providerConcurrency,
          providerOptions: {
            providerConcurrency: options.providerConcurrency
          }
        })

        // Resolve and align each chunk's output
        yield* Effect.forEach(
          Array.zip(batch, outputs),
          ([chunk, scoredOutputs]) =>
            Effect.gen(function* () {
              const firstOutput = scoredOutputs[0]
              if (!firstOutput?.output) {
                return yield* Effect.fail(
                  new InferenceOutputError({ message: "No scored outputs from language model." })
                )
              }

              const alignmentKey = `${hashText(chunk.chunkText)}:${hashText(firstOutput.output)}`
              const aligned = alignmentMemo.get(alignmentKey) ?? (yield* Effect.gen(function* () {
                const resolved = yield* resolver.resolve(firstOutput.output)
                const freshAligned = yield* resolver.align(
                  resolved,
                  chunk.chunkText,
                  chunk.tokenInterval.startIndex,
                  chunk.charInterval.startPos ?? 0
                )
                alignmentMemo.set(alignmentKey, freshAligned)
                return freshAligned
              }))

              const docId = chunk.documentId ?? ""
              const existing = perDoc.get(docId) ?? []
              perDoc.set(docId, [...existing, ...aligned])
            }),
          { concurrency: options.providerConcurrency }
        )
      }),
      { concurrency: options.batchConcurrency } // pipeline-level parallelism; provider layer applies prompt-level limits
    )

    // 4. Emit annotated documents in order
    return documents.map((doc) => {
      const docId = doc.documentId ?? ""
      return new AnnotatedDocument({
        documentId: docId,
        extractions: perDoc.get(docId) ?? [],
        text: doc.text
      })
    })
  })
```

### 8.3 Multi-Pass Extraction with Merge

```typescript
const annotateDocumentsMultiPass = (
  documents: ReadonlyArray<Document>,
  options: AnnotateOptions
) =>
  Effect.gen(function* () {
    const passResults = new Map<string, Array<Array<Extraction>>>()
    const documentTexts = new Map<string, string>()
    const tokenizer = yield* Tokenizer
    const promptBuilder = yield* PromptBuilder

    // Build chunk/batch plan once; reuse it for each pass.
    const chunks = yield* chunkDocuments(documents, options.maxCharBuffer, tokenizer)
    const batchPlan = makeBatches(chunks, {
      targetBatchLength: options.batchLength,
      maxBatchInputTokens: options.maxBatchInputTokens,
      estimateTokens: (chunk) => estimatePromptTokens(promptBuilder, chunk)
    })

    for (const doc of documents) {
      const docId = doc.documentId ?? ""
      documentTexts.set(docId, doc.text)
      passResults.set(docId, [])
    }

    // Run each pass sequentially
    for (let pass = 0; pass < options.extractionPasses; pass++) {
      const passAnnotations = yield* annotateDocumentsSinglePassFromPlan(batchPlan, {
        ...options,
        passNumber: pass + 1,
        cachePolicy: options.cachePolicy && new PrimedCachePolicy({
          ...options.cachePolicy,
          // Keep cache keys pass-aware to avoid context collisions.
          namespace: `${options.cachePolicy.namespace}:pass-${pass + 1}`
        })
      })

      for (const annotatedDoc of passAnnotations) {
        const docId = annotatedDoc.documentId ?? ""
        const existing = passResults.get(docId) ?? []
        existing.push(annotatedDoc.extractions ?? [])
        passResults.set(docId, existing)
      }
    }

    // Merge non-overlapping extractions (first-pass wins)
    return documents.map((doc) => {
      const docId = doc.documentId ?? ""
      const allPassExtractions = passResults.get(docId) ?? []
      const merged = mergeNonOverlappingExtractions(allPassExtractions)
      return new AnnotatedDocument({
        documentId: docId,
        extractions: merged,
        text: documentTexts.get(docId)
      })
    })
  })
```

Efficiency rule for feature parity:

- Multi-pass runs must reuse chunk and batch plans derived from identical input text.
- Only inference and resolver/alignment steps re-run per pass.
- This preserves Python behavior while removing redundant tokenization/chunking overhead.

### 8.4 Layer Composition Example

```typescript
// Composing the full application layer for Gemini extraction
const AppLayer = AnnotatorLive.pipe(
  Layer.provide(ResolverLive),
  Layer.provide(PromptBuilderLive),
  Layer.provide(FormatHandlerLive),
  Layer.provide(ProviderRateLimiterLive),
  Layer.provide(PrimedCacheLive),
  Layer.provide(GeminiLanguageModelLive),
  Layer.provide(GeminiConfigLive),
  Layer.provide(RegexTokenizerLive)
)

// Running an extraction
const program = extract({
  text: "Marie Curie was a physicist...",
  promptDescription: "Extract person names",
  examples: [myExample],
  maxCharBuffer: 1000,
  batchLength: 10,
  batchConcurrency: 1,
  providerConcurrency: 8,
  primedCacheEnabled: true,
  primedCacheTtlSeconds: 86400,
  primedCacheDeterministicOnly: true,
  extractionPasses: 1
})

const result = Effect.runPromise(
  program.pipe(Effect.provide(AppLayer))
)
```

### 8.5 Efficiency Checklist (Parity-Safe)

- Build chunk/token plans once per extraction run and reuse them across passes.
- Use token-aware batching (`maxBatchInputTokens`) instead of fixed-size-only batching.
- Keep pipeline and provider concurrency separate to prevent multiplicative request spikes.
- Memoize alignment for identical `(chunkText, modelOutput)` pairs within a run.
- Use `RequestResolver`/queue-based coalescing for identical in-flight prompts.
- Keep cache keys context-aware (`passNumber`, `contextWindowChars`, additional context hash).

---

## 9. Implementation Order

A bottom-up implementation order that ensures each phase can be tested independently.

### Phase 1: Foundation (Data Models + Errors) — Status: Complete

**Files**: `src/Errors.ts`, `src/FormatType.ts`, `src/Data.ts`, `src/DataLib.ts`

- All `Schema.TaggedError` types
- All `Schema.Class` data models (CharInterval, TokenInterval, Extraction, Document, AnnotatedDocument, ExampleData, ScoredOutput)
- FormatType literal union
- JSON serialization helpers (though Schema.encode/decode handles most of this)

**Dependencies**: None
**Tests**: Schema roundtrip tests, construction tests, serialization

### Phase 2: Tokenizer + Alignment Core — Status: Complete

**Files**: `src/Tokenizer.ts`

- Token, TokenInterval, TokenizedText schemas
- Tokenizer service interface
- `RegexTokenizer` implementation (port the regex patterns from Python)
- `UnicodeTokenizer` implementation (port the Unicode grapheme clustering)
- `tokensText` function
- `findSentenceRange` function
- Sentence boundary detection

**Dependencies**: Phase 1 (CharInterval, errors)
**Tests**: Port tokenizer_test.py -- verify identical tokenization behavior

### Phase 3: Format Handler — Status: Complete

**Files**: `src/FormatHandler.ts`

- FormatHandlerConfig schema
- FormatHandler service interface and implementation
- Fence detection/extraction regex
- JSON/YAML parsing with fallback (think-tag stripping)
- Extraction example formatting
- Wrapper key handling

**Dependencies**: Phase 1 (data models, FormatType, errors)
**Tests**: Port format_handler_test.py

### Phase 4: Resolver + Word Alignment — Status: In Progress (parity hardening)

**Files**: `src/Resolver.ts`

- Resolver service interface
- `resolve()` -- parse LLM output into Extractions via FormatHandler
- `extractOrderedExtractions()` -- index sorting, attribute extraction
- WordAligner class (port the difflib SequenceMatcher alignment)
- `alignExtractions()` -- exact matching via matching blocks
- `fuzzyAlignExtraction()` -- sliding window fuzzy alignment
- `tokenizeWithLowercase()` helper
- `normalizeToken()` light stemming

**Dependencies**: Phase 1, Phase 2 (Tokenizer), Phase 3 (FormatHandler)
**Tests**: Port resolver_test.py -- this is the most critical test suite

**Remaining parity gates to close Phase 4:**
1. Complete resolver/aligner parity fixtures covering SequenceMatcher-style edge behavior (token repeats, punctuation boundaries, overlapping near-matches).
2. Match reference behavior for non-exact statuses (`match_greater`, `match_lesser`, `match_fuzzy`) under configured fuzzy thresholds.
3. Verify extraction ordering and interval assignment parity across multi-extraction outputs.
4. Document final parity evidence and move status to `Complete`.

**Note on difflib port**: TypeScript does not have a built-in `difflib.SequenceMatcher`. Options:
1. Port the core SequenceMatcher algorithm (recommended -- it is ~200 lines)
2. Use an npm package like `difflib` or `diff-match-patch`
The port should implement `set_seqs()`, `get_matching_blocks()`, and `ratio()`.

### Phase 5: Prompting System — Status: Complete

**Files**: `src/Prompting.ts`

- PromptTemplateStructured schema
- QAPromptGenerator -- render prompts with examples
- PromptBuilder service interface
- ContextAwarePromptBuilder -- cross-chunk context tracking

**Dependencies**: Phase 1, Phase 3 (FormatHandler)
**Tests**: Port prompting_test.py

### Phase 6: Chunking System — Status: Complete

**Files**: `src/Chunking.ts`

- TextChunk schema
- SentenceIterator -- iterate through sentences using Tokenizer
- ChunkIterator -- break documents into chunks respecting maxCharBuffer
- `makeBatches()` -- token-aware batching with prompt-overhead estimation
- Character interval computation from token intervals
- Reusable chunk/batch plans for multi-pass extraction (build once, consume across passes)

**Dependencies**: Phase 1, Phase 2 (Tokenizer)
**Tests**: Port chunking_test.py + token-budget batching tests

### Phase 7: Provider System — Status: Complete (runtime control + observability hardening complete)

**Files**: `src/LanguageModel.ts`, `src/PrimedCache.ts`, `src/RuntimeControl.ts`, `src/ProviderSchema.ts`, `src/providers/AiAdapters.ts`, `src/providers/Gemini.ts`, `src/providers/OpenAI.ts`, `src/providers/Ollama.ts`, `src/providers/GeminiSchema.ts`

- LanguageModel service interface
- PrimedCache service interface + key derivation utilities
- ProviderSchema base (BaseSchema, FormatModeSchema)
- GeminiSchema -- generate JSON schema from examples
- Gemini/OpenAI provider layers via `@effect/ai-google` and `@effect/ai-openai`
- Ollama provider layer via `HttpClient` adapter implementing the same service contract
- Optional Anthropic provider integration via `@effect/ai-anthropic`
- Runtime control layers (`RateLimiter`, optional `RequestResolver.dataLoader`)
- Each provider implements `infer()/generateText()/generateObject()/streamText()` with primed-cache read/write behavior
- Provider-level concurrency is explicitly separate from pipeline concurrency
- Provider permit handling is enforced across infer/text/object paths, including object fallback behavior

**Dependencies**: Phase 1 (errors, ScoredOutput), Phase 6 (Config)
**Tests**: `@effect/vitest` layer-driven provider tests + mock/integration API tests

### Phase 8: Prompt Validation — Status: Complete

**Files**: `src/PromptValidation.ts`

- ValidationIssue, ValidationReport schemas
- AlignmentPolicy schema
- PromptValidationLevel
- `validatePromptAlignment()` -- run alignment on examples
- `handleAlignmentReport()` -- log or raise based on level

**Dependencies**: Phase 1, Phase 2, Phase 4 (Resolver/WordAligner)
**Tests**: Port prompt_validation_test.py

### Phase 9: Annotation Orchestration — Status: Complete

**Files**: `src/Annotator.ts`

- Annotator service interface + Layer
- Single-pass annotation pipeline
- Multi-pass annotation with non-overlapping merge and chunk-plan reuse
- Document chunk iteration
- Batch processing with Effect concurrency and bounded fan-out (`batchConcurrency × providerConcurrency`)
- Prompt/token preparation is computed once per chunk before batching
- Alignment execution is delegated through `AlignmentExecutor` with deterministic fallback to local resolver alignment

**Dependencies**: Phase 1-8 (all previous phases)
**Tests**: Port annotation_test.py + multi-pass plan-reuse parity tests

### Phase 10: Top-Level API + I/O — Status: Complete

**Files**: `src/api/Extraction.ts`, `src/IO.ts`

- `extractStream()` / `extract()` -- the main library entry points combining ingestion + annotation
- URL detection and download
- Dataset loading from CSV (using `@effect/platform` file system)
- JSONL reading/writing
- Progress logging via Effect logger

**Dependencies**: Phase 1-9
**Tests**: Port integration tests

### Phase 11: Visualization — Status: In Progress (renderer parity hardening)

**Files**: `src/Visualization.ts`

- HTML generation with color-coded highlights
- Span nesting algorithm
- Legend generation
- Animated visualization with JavaScript
- Tooltip construction

**Dependencies**: Phase 1 (data models)
**Tests**: Port visualization_test.py

**Remaining parity gates to close Phase 11:**
1. Add fixture parity tests for nested/overlapping spans and legend semantics.
2. Verify deterministic HTML structure for identical inputs (stable class ordering and marker output).
3. Confirm tooltip/annotation rendering parity with reference expectations.
4. Document final parity evidence and move status to `Complete`.

### Phase 12: CLI — Status: Complete

**Files**: `src/Cli.ts`, `src/index.ts`

- `@effect/cli` command definitions
- Extract command with all options
- Visualize command
- Layer composition based on CLI options
- Entry point that wires everything together
- Runtime options allow injection of alignment execution layers without changing command surface

**Dependencies**: All previous phases
**Tests**: CLI integration tests

### Phase 13: Effect Service Tests (Vitest + Test Layers) — Status: Complete

**Files**: `test/**/*.test.ts`, `test/layers/*.ts`, `vitest.config.ts`

- Use `@effect/vitest` as the default test API (`describe`, `it`, `expect`) for all Effect programs.
- Service-level tests MUST use `Context.Tag` interfaces with explicit test layers (`Layer.succeed` / `Layer.effect`).
- Each service exports `<Service>Live` and `<Service>Test` so tests can swap dependencies without changing call sites.
- Prefer `it.effect` for deterministic tests (built-in `TestContext`, `TestClock`, `TestRandom`).
- Use `it.live` only when testing real time/network semantics.
- Use `layer(...)` and `it.layer(...)` to share test services per suite while preserving layer composition semantics.
- Provider and cache tests MUST run with in-memory `PrimedCache` test layers and deterministic model stubs.
- Integration tests can swap to filesystem-backed cache layers to verify persistence/invalidation behavior.

**Dependencies**: Phase 1-12
**Tests**: Contract tests for each `Context.Tag` service + end-to-end extraction tests with layered fixtures

---

## 10. Differences from Python

### 10.1 Service/Layer Pattern Replaces Factory/Registry

**Python**: Uses a global mutable registry (`router.py`) with regex-based model ID matching. Providers register themselves at import time using decorators. A factory function (`factory.py`) resolves model IDs to provider classes.

**Effect**: The provider is selected at Layer composition time. No global registry. Users compose their Layer stack explicitly:

```typescript
// Instead of:  factory.create_model(ModelConfig(model_id="gemini-2.5-flash"))
// Do:
const layer = GeminiLanguageModelLive.pipe(Layer.provide(GeminiConfigLive))
```

This eliminates runtime registration, import-order dependencies, and global mutable state. The CLI maps the `--provider` flag to the appropriate Layer.

### 10.2 Immutable Data Instead of Mutable Dataclasses

**Python**: Uses mutable dataclasses with property setters (e.g., `Extraction._token_interval`, `Document._tokenized_text`). State is mutated during alignment.

**Effect**: Uses `Schema.Class` which produces immutable objects. Alignment creates new `Extraction` instances with updated fields rather than mutating in place. This makes the code more predictable and thread-safe.

```typescript
// Instead of: extraction.token_interval = TokenInterval(...)
// Do:
const aligned = new Extraction({
  ...extraction,
  tokenInterval: new TokenInterval({ startIndex: i, endIndex: j }),
  charInterval: new CharInterval({ startPos: s, endPos: e }),
  alignmentStatus: "match_exact"
})
```

### 10.3 Effect Error Channel Instead of Exceptions

**Python**: Uses `try/except` with a class hierarchy (LangExtractError -> InferenceError -> InferenceConfigError, etc.). Errors are sometimes silently logged and swallowed (e.g., `suppress_parse_errors`).

**Effect**: Errors appear in the type signature via `Effect<A, E, R>`. The error channel `E` is a union of `Schema.TaggedError` types. This makes error handling explicit and exhaustive. "Suppress" behavior uses `Effect.catchTag`:

```typescript
// Python: if suppress_parse_errors: logging.exception(...); return []
// Effect:
resolver.resolve(text).pipe(
  Effect.catchTag("ResolverParsingError", (e) =>
    Effect.logWarning(`Parse error: ${e.message}`).pipe(Effect.as([]))
  )
)
```

### 10.4 Effect Concurrency Instead of ThreadPoolExecutor

**Python**: Uses `concurrent.futures.ThreadPoolExecutor` for parallel API calls in Gemini/OpenAI providers.

**Effect**: Uses Effect fibers with bounded concurrency:

```typescript
// Python: concurrent.futures.ThreadPoolExecutor(max_workers=10)
// Effect:
Effect.forEach(prompts, (prompt) =>
  callApi(prompt),
  { concurrency: 10 }
)
```

This integrates with Effect's structured concurrency model, providing proper cancellation, resource cleanup, and error propagation.

### 10.5 Config from Environment via Effect Config

**Python**: Reads environment variables inline with `os.getenv()`. API key resolution is scattered across factory.py and provider constructors.

**Effect**: Uses `Config` for all environment variable access, with type-safe defaults and composition. Failed config resolution produces a `ConfigError` automatically. No manual `os.getenv()` calls.

### 10.6 Lazy Computation Becomes Upfront Computation

**Python**: `TextChunk` lazily computes `chunk_text`, `char_interval`, and `sanitized_chunk_text` from the document reference, raising `ValueError` if the document is missing.

**Effect**: `TextChunk` is constructed with all fields pre-computed. The construction function is effectful (can fail) but the resulting value is a plain immutable record. This eliminates runtime surprises from lazy property access.

### 10.7 Stream Instead of Iterator/Generator

**Python**: Uses Python generators (`yield from`) and iterators extensively for lazy document processing.

**Effect**: Uses `Stream` from Effect for lazy sequences with proper resource management:

```typescript
// Python: yield from self._annotate_documents_single_pass(...)
// Effect:
Stream.fromIterable(documents).pipe(
  Stream.flatMap((doc) => chunkDocument(doc, maxCharBuffer)),
  Stream.grouped(batchLength),
  Stream.mapEffect((batch) => processBatch(batch))
)
```

### 10.8 No Backward-Compatibility Shims

**Python**: Has many compatibility modules (`langextract/data.py`, `langextract/tokenizer.py`, `langextract/schema.py`, `langextract/inference.py`, `langextract/registry.py`, `langextract/exceptions.py`, `langextract/_compat/`) for v1.x migration.

**Effect**: Clean slate. No deprecated parameters, no legacy re-exports, no `v2.0.0 removal` warnings. The API is designed fresh using Effect idioms.

### 10.9 No Plugin System

**Python**: Has an entry-point-based plugin system (`plugins.py`, `load_plugins_once()`) for third-party providers.

**Effect**: Extensibility is natural via Layers. Third-party providers simply implement the `LanguageModel` service interface and provide a Layer. No discovery mechanism needed:

```typescript
// Third-party provider
export const MyCustomModelLive: Layer.Layer<LanguageModel, InferenceConfigError, MyConfig> = ...

// User code
const AppLayer = AnnotatorLive.pipe(
  Layer.provide(MyCustomModelLive),
  ...
)
```

### 10.10 TypeScript Regex Instead of Python `regex` Module

**Python**: Uses the `regex` module (not `re`) for Unicode property support (`\p{Is_Han}`, `\p{Script=Latin}`, `\X` grapheme clusters).

**Effect**: TypeScript's built-in regex supports Unicode categories via `/\p{...}/u` flag (ES2018+). For grapheme cluster iteration, use `Intl.Segmenter` (available in all modern runtimes including Bun):

```typescript
// Python: regex.finditer(r"\X", text)
// TypeScript:
const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" })
for (const { segment } of segmenter.segment(text)) { ... }

// Python: regex.compile(r"\p{Is_Han}")
// TypeScript: /\p{Script=Han}/u
```

### 10.11 JSON/YAML Parsing

**Python**: Uses `json` (stdlib) and `yaml` (PyYAML) for parsing.

**Effect**: Uses schema/effect codec paths for JSON (`Schema.parseJson`) and `yaml` package parsing for YAML, with strict/non-strict fallback behavior in `FormatHandler`. Core source paths should avoid direct `JSON.parse`/`JSON.stringify` usage.

### 10.12 HTTP Requests

**Python**: Uses `requests` for HTTP (URL downloads, Ollama API).

**Effect**: Uses `@effect/platform`'s `HttpClient` service for all HTTP, providing proper error handling, timeouts, and resource management through the Effect ecosystem.

### 10.13 Effect AI Provider Abstraction

**Python**: Provider clients are mostly direct SDK calls with provider-specific response handling.

**Effect**: Provider clients use `@effect/ai` abstractions (`generateText`, `generateObject`, `streamText`) with provider adapters from `@effect/ai-openai`, `@effect/ai-google`, and optional `@effect/ai-anthropic`. The langextract `LanguageModel` service remains the stable contract, while adapters normalize provider-specific behavior.

### 10.14 Primed Cache as a First-Class Service

**Python**: Cache behavior exists but is not modeled as an explicit typed service boundary.

**Effect**: Primed caching is a required `Context.Tag` service (`PrimedCache`) with typed key/policy models, provider-aware key derivation, and swappable layer implementations (in-memory, persisted, test). This keeps cache semantics explicit in signatures and testable via layer substitution.

### 10.15 Optimization Guardrails for Parity

Performance optimizations are allowed only when the following behaviors remain unchanged:

- Alignment semantics: exact/match_lesser/fuzzy status selection and threshold handling must match Python resolver behavior.
- Merge semantics: multi-pass merge remains first-pass-wins for overlapping intervals.
- Error semantics: invalid token intervals, parse failures, and inference failures remain surfaced through typed errors at equivalent decision points.
- Prompt context semantics: context-window and additional-context changes must invalidate cache hits through key derivation.
- Concurrency semantics: failures in parallel inference still fail the enclosing effect (no silent drops).

### 10.16 Alignment Execution Abstraction

Alignment execution is now routed through a dedicated service boundary:

- `src/AlignmentExecutor.ts` defines `alignChunk(...)`.
- Default implementation delegates to `Resolver.align`.
- Runtime modules can provide alternate implementations (for example worker-backed alignment) without modifying core orchestration.
- Annotator falls back to local resolver alignment if the injected executor fails, preserving extraction continuity.

### 10.17 Performance Harness

Performance verification is report-based (no hard fail threshold in CI by default):

- `scripts/perf/annotator-throughput.ts` runs deterministic fixture benchmarks.
- Reports are emitted under `.cache/perf`.
- Scripts:
  - `bun run perf:annotator`
  - `bun run perf:annotator:report`

## 11. Platform-Bun Integration

The runtime split is explicit:

- Bun default entrypoint: `src/runtime/BunMain.ts`
- Node-ready entrypoint: `src/runtime/NodeMain.ts`
- Shared Node composition helper: `src/runtime/NodeRuntime.ts`

### 11.1 Bun Runtime Composition

The Bun main path composes:

- `BunContext.layer`
- `FetchHttpClient.layer`
- Filesystem-backed `KeyValueStore` via `BunKeyValueStore.layerFileSystem`

Optional Bun worker-backed alignment is supported behind runtime env flags:

- `LANGEXTRACT_ENABLE_BUN_WORKERS=true`
- `LANGEXTRACT_BUN_WORKER_POOL_SIZE=<n>` (optional, default: resolved `batch-concurrency`, clamp `1..16`)

Worker path wiring is runtime-only:

- `src/runtime/BunAlignmentWorker.ts` builds the Bun worker pool layer.
- `src/runtime/workers/AlignmentWorkerProtocol.ts` defines serialized request/response schema.
- `src/runtime/workers/AlignmentWorkerMain.ts` hosts the worker runner entrypoint.

### 11.2 Node Runtime Composition

The Node main path composes:

- `NodeFileSystem.layer`
- `FetchHttpClient.layer`
- Node filesystem-backed `KeyValueStore`
- Node terminal/path/command layers for CLI runtime requirements

This keeps core services platform-neutral while allowing runtime-specific outer layering only in runtime modules.

### 11.3 Provider and IO Surfaces

Provider and IO code paths remain on `@effect/platform` abstractions:

- `HttpClient` for network calls
- `FileSystem` for file IO
- `KeyValueStore` for persisted primed cache

No core production module should rely on runtime globals for IO behavior.

### 11.4 Clean-Break Runtime Policy

This port is clean-break by design:

- No legacy fake-provider runtime path in production exports
- No backward-compatibility runtime shims
- Runtime-specific provisioning isolated to entry/runtime composition modules
- If Bun worker runtime is unavailable, alignment execution falls back through the local resolver path in annotator orchestration

---

## Appendix A: Constants

These constants should be defined alongside their relevant modules:

```typescript
// src/Data.ts
export const EXTRACTIONS_KEY = "extractions" as const
export const ATTRIBUTE_SUFFIX = "_attributes" as const

// src/Resolver.ts
export const FUZZY_ALIGNMENT_MIN_THRESHOLD = 0.75
export const DEFAULT_INDEX_SUFFIX = "_index"

// src/Tokenizer.ts
export const KNOWN_ABBREVIATIONS = new Set(["Mr.", "Mrs.", "Ms.", "Dr.", "Prof.", "St."])
export const CLOSING_PUNCTUATION = new Set(['"', "'", "\u201D", "\u2019", "\u00BB", ")", "]", "}"])
```

## Appendix B: SequenceMatcher Port

The core alignment algorithm depends on Python's `difflib.SequenceMatcher`. This needs to be ported to TypeScript. The key methods needed are:

1. `setSeqs(a: string[], b: string[])` -- set the two sequences
2. `getMatchingBlocks(): Array<[number, number, number]>` -- find all matching blocks
3. `ratio(): number` -- compute similarity ratio

The algorithm uses a hash-map of element positions for fast lookup, then finds the longest common subsequences. A faithful port should be approximately 150-200 lines of TypeScript.

## Appendix C: File Tree

```
src/
  index.ts              -- Public API re-exports
  Errors.ts             -- All TaggedError types
  FormatType.ts         -- FormatType, ScoredOutput, Constraint
  Data.ts               -- Extraction, Document, AnnotatedDocument, ExampleData, CharInterval, AlignmentStatus
  DataLib.ts            -- JSON serialization helpers
  Tokenizer.ts          -- Token types, Tokenizer service, RegexTokenizer, UnicodeTokenizer
  FormatHandler.ts      -- FormatHandler service, parsing, formatting
  ProviderSchema.ts     -- BaseSchema, FormatModeSchema
  LanguageModel.ts      -- LanguageModel service interface, ModelConfig
  PrimedCache.ts        -- PrimedCache service, key derivation, persistence wiring
  RuntimeControl.ts     -- Rate limiter and request coalescing layers
  AlignmentExecutor.ts  -- Alignment execution service abstraction (local / worker-backed)
  Prompting.ts          -- PromptTemplate, QAPromptGenerator, ContextAwarePromptBuilder
  Chunking.ts           -- TextChunk, ChunkIterator, SentenceIterator, batching
  Resolver.ts           -- Resolver service, WordAligner, SequenceMatcher
  Annotator.ts          -- Annotator service, orchestration, multi-pass merge
  ExtractionConfig.ts   -- Shared Effect Config model for extract runtime settings
  PromptValidation.ts   -- Prompt alignment validation
  IO.ts                 -- Dataset loading, JSONL I/O, URL download
  Visualization.ts      -- HTML visualization generation
  Cli.ts                -- @effect/cli command definitions (thin command layer)
  api/
    Extraction.ts       -- Library extractStream/extract APIs
    Render.ts           -- Library rendering API (json/jsonl/html)
    ExecutionLayer.ts   -- Provider/runtime composition API
  cli/
    ExtractAdapter.ts   -- CLI -> library extract mapping
    VisualizeAdapter.ts -- CLI -> library visualize mapping
    index.ts            -- CLI model types (provider/input/output/runtime config)
  runtime/
    BunRuntime.ts       -- Bun runtime layer composition
    BunMain.ts          -- Bun CLI entrypoint
    NodeRuntime.ts      -- Node runtime layer composition helpers
    NodeMain.ts         -- Node CLI entrypoint
    BunAlignmentWorker.ts -- Bun worker-backed alignment layer
    workers/
      AlignmentWorkerProtocol.ts -- Serialized worker request schema
      AlignmentWorkerMain.ts -- Worker runner entrypoint for alignment
  providers/
    AiAdapters.ts       -- @effect/ai adapters that implement LanguageModel service
    Patterns.ts         -- Provider regex patterns (for CLI model-to-provider mapping)
    Gemini.ts           -- Gemini provider Layer + Config
    GeminiSchema.ts     -- Gemini JSON schema generation from examples
    OpenAI.ts           -- OpenAI provider Layer + Config
    Ollama.ts           -- Ollama provider Layer + Config
scripts/
  perf/
    annotator-throughput.ts -- Deterministic perf harness and JSON report output
test/
  layers/               -- TestLayer implementations for Context.Tag services
  providers/            -- Provider + cache contract tests with @effect/vitest
  runtime/              -- Runtime composition and worker-alignment parity tests
```

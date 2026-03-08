# Full Code Review: effect-langextract

**Date:** 2026-02-17
**Scope:** End-to-end review of all 36 source files, 23 test files, and project configuration
**Branch:** `main` at `f698978`
**Reviewer focus:** Idiomatic Effect usage, schema correctness, error handling, streaming, concurrency safety, performance, and type safety

---

## Executive Summary

This is a well-structured Effect TypeScript port of [google/langextract](https://github.com/google/langextract). The project demonstrates strong architectural decisions:

- Proper use of `Schema.Class`, `Schema.TaggedError`, and `Schema.TaggedRequest`
- Clean service/layer decomposition with consistent `Effect.Service` patterns
- Good use of `@effect/ai` adapters for multi-provider support
- The codebase compiles cleanly under strict TypeScript with zero `any` types in production code

The review identified **3 critical**, **8 important**, and **9 suggestion-level** findings.

---

## Findings

### Critical

These must be fixed before the project can be considered production-ready.

---

#### C1. Test suite broken: `@effect/vitest` incompatible with `vitest`

**Files:** `package.json`, all test files using `it.effect()`
**Impact:** 61 of 67 tests fail; no Effect-based tests can be validated

The test suite crashes with:

```
TypeError: ctx?.onTestFinished is not a function
```

`@effect/vitest@^0.27.0` expects a `ctx.onTestFinished()` API that does not exist in `vitest@^3.2.4`. Only the 6 tests using plain synchronous `it()` pass.

**Recommendation:** Pin compatible versions. Either downgrade `vitest` or upgrade `@effect/vitest` so the `onTestFinished` callback is present.

---

#### C2. Bare `throw new Error()` in Resolver escapes the Effect error channel

**File:** `src/Resolver.ts`
**Lines:** 191, 199, 209, 221, 372, 640, 651, 665, 699, 707

The functions `extractOrderedExtractions` and `alignExtractions` use `throw new Error(...)` directly. They are wrapped in `Effect.try` at the call sites (lines 787-796, 811-825), but this coupling is fragile: if called outside `Effect.try`, the thrown errors become untyped defects that bypass the Effect error channel entirely.

```typescript
// Resolver.ts:191 — one of 10 occurrences
if (!Number.isInteger(extractionValue)) {
  throw new Error("Index must be an integer.")
}
```

**Recommendation:** Convert to Effect-returning functions using `Effect.gen` + `Effect.fail` with typed errors:

```typescript
const extractOrderedExtractions = (
  extractionData: ReadonlyArray<Record<string, unknown>>,
  extractionIndexSuffix: string | undefined,
  attributeSuffix: string | undefined
): Effect.Effect<ReadonlyArray<Extraction>, ResolverParsingError> =>
  Effect.gen(function* () {
    // ... validation logic using yield* Effect.fail(...) instead of throw
  })
```

---

#### C3. `hashString` (FNV-1a) duplicated identically in 3 files

**Files:**
- `src/PrimedCache.ts` (lines 103-110)
- `src/providers/AiAdapters.ts` (lines 17-24)
- `src/providers/Ollama.ts` (lines 54-61)

All three contain the exact same FNV-1a hash implementation. A bug fix or improvement would need to be applied in three places.

**Recommendation:** Extract to a shared utility module and import from all three locations.

---

### Important

These should be fixed to improve robustness, safety, and maintainability.

---

#### I1. Race condition: mutable array mutation in concurrent Annotator

**File:** `src/Annotator.ts` (lines 217, 293-299)

```typescript
const perDocument: Array<Array<Extraction>> = documents.map(() => [])
// ...
Effect.tap((aligned) =>
  Effect.sync(() => {
    const docIndex = chunk.documentIndex
    if (perDocument[docIndex] === undefined) {
      perDocument[docIndex] = []
    }
    perDocument[docIndex]?.push(...aligned)
  })
),
```

`perDocument` is a mutable array mutated via `push` inside `Effect.sync`, while the outer `Stream.mapEffect` runs with `{ concurrency: options.batchConcurrency }`. When `batchConcurrency > 1`, multiple fibers can push to the same `perDocument[docIndex]` concurrently, creating a data race.

**Recommendation:** Use `Ref` for atomic updates:

```typescript
const perDocumentRef = yield* Ref.make(
  documents.map(() => [] as Array<Extraction>)
)
// ...
Effect.tap((aligned) =>
  Ref.update(perDocumentRef, (state) => {
    const next = [...state]
    next[chunk.documentIndex] = [
      ...(next[chunk.documentIndex] ?? []),
      ...aligned
    ]
    return next
  })
)
```

---

#### I2. Ollama provider duplicates ~200 lines of cache/inference logic from AiAdapters

**File:** `src/providers/Ollama.ts` (lines 54-287)

The Ollama provider re-implements: `hashString`, `makeCacheFingerprint`, `normalizeNamespace`, `isDeterministicRequest`, `cacheKeyForPrompt`, `withCacheMetadata`, `toInferenceRuntimeError`, `logProviderEvent`, and the entire `runPromptInference` function. All are nearly identical to the versions in `AiAdapters.ts`. The other three providers (OpenAI, Gemini, Anthropic) all delegate to `makeProviderLanguageModelService` from `AiAdapters.ts`.

**Recommendation:** Create a thin `NativeLanguageModel.Service`-compatible adapter around Ollama's HTTP client calls and delegate to `makeProviderLanguageModelService`. This eliminates ~200 lines of duplication and ensures consistent caching, logging, and error handling across all providers.

---

#### I3. `try/catch` silently swallows Schema encoding failures

**Files:**
- `src/FormatHandler.ts` (lines 286-292)
- `src/Prompting.ts` (lines 25-31)
- `src/Annotator.ts` (lines 81-87)

All three use bare `try/catch` to encode extractions:

```typescript
const encodeExtractionExample = (
  extractions: ReadonlyArray<Extraction>
): string => {
  try {
    return Schema.encodeSync(JsonString)(extractions)
  } catch {
    return "[]"
  }
}
```

An encoding failure indicates a data model bug, not a recoverable condition. Silently returning `"[]"` hides it and bypasses the Effect error channel entirely.

**Recommendation:** Return `Effect.Effect<string, ...>` using `Schema.encode` with proper `Effect.mapError`. At minimum, log a warning when falling back to `"[]"`.

---

#### I4. `asRecord` utility duplicated in two files

**Files:**
- `src/Resolver.ts` (line 58-61)
- `src/FormatHandler.ts` (line 40-43)

Both contain identical `asRecord` functions with `as Record<string, unknown>` casts:

```typescript
const asRecord = (value: unknown): Record<string, unknown> | undefined =>
  typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined
```

**Recommendation:** Extract to a shared utility module. Consider using `Schema.decodeUnknown(Schema.Record(...))` at critical boundaries for stricter validation.

---

#### I5. `UnicodeTokenizerLive` is misleadingly named

**File:** `src/Tokenizer.ts` (lines 143-155)

`UnicodeTokenizerLive` uses the exact same `regexTokenize` implementation as `RegexTokenizerLive`. The name implies Unicode-aware tokenization but the behavior is identical.

```typescript
export const RegexTokenizerLive: Layer.Layer<Tokenizer> = Tokenizer.Default

export const UnicodeTokenizerLive: Layer.Layer<Tokenizer> =
  Layer.succeed(
    Tokenizer,
    Tokenizer.make({
      tokenize: regexTokenize,       // <-- same implementation
      tokensText: tokensTextImpl,
      findSentenceRange: findSentenceRangeImpl
    } satisfies TokenizerService)
  )
```

**Recommendation:** Either implement a proper Unicode tokenizer (e.g., `Intl.Segmenter`) or remove the `UnicodeTokenizerLive` export.

---

#### I6. Fuzzy alignment: no early termination, O(n^3) worst case

**File:** `src/Resolver.ts` (lines 560-598)

The nested loops iterate over window sizes (outer) and start positions (inner), calling `sumMatchedTokenCount` (itself O(n*m)) for each candidate. The `minOverlap` pre-check provides early pruning, but there is no early termination when a perfect or near-perfect match is found.

```typescript
for (
  let windowSize = extractionLength;
  windowSize <= sourceTokens.length;
  windowSize += 1
) {
  for (
    let startIndex = 0;
    startIndex + windowSize <= sourceTokens.length;
    startIndex += 1
  ) {
    // O(n*m) sequence matching per candidate
  }
}
```

**Recommendation:**
1. Add early termination: `if (bestRatio >= 1.0) break`
2. Cap maximum window expansion: `windowSize <= Math.min(sourceTokens.length, extractionLength * 3)`

---

#### I7. Error message extraction pattern duplicated 5+ times

**Files:** `Annotator.ts:58`, `BunAlignmentWorker.ts:37`, `Ollama.ts:116`, `AiAdapters.ts:81`, `PrimedCache.ts:140`

This identical pattern appears throughout the codebase:

```typescript
typeof error === "object" && error !== null && "message" in error
  ? String((error as { message: unknown }).message)
  : String(error)
```

**Recommendation:** Extract to a shared utility:

```typescript
export const errorMessage = (error: unknown): string =>
  typeof error === "object" && error !== null && "message" in error
    ? String((error as { readonly message: unknown }).message)
    : String(error)
```

---

#### I8. Provider configs don't use `effect/Config` for environment resolution

**Files:** `src/providers/OpenAI.ts`, `Gemini.ts`, `Anthropic.ts`, `Ollama.ts`

Per the project architecture (`CLAUDE.md`), providers should use `effect/Config` for API keys and model settings. `Extract.ts` demonstrates this with `ExtractionConfig` using `Config.all`. However, all four provider config services use hardcoded defaults with `testLayer` overrides. `Cli.ts` manually bridges environment variables to provider configs.

**Recommendation:** Create `Config`-based layers for each provider:

```typescript
export const OpenAIConfigFromEnv: Layer.Layer<OpenAIConfig> = Layer.effect(
  OpenAIConfig,
  Config.all({
    apiKey: Config.redacted("OPENAI_API_KEY"),
    modelId: Config.string("OPENAI_MODEL_ID").pipe(
      Config.withDefault("gpt-4o-mini")
    ),
    // ...
  }).pipe(Effect.map((cfg) => OpenAIConfig.make({ ... })))
)
```

This simplifies `Cli.ts` and makes providers independently usable without the CLI.

---

### Suggestions

Lower priority improvements for code quality and idiom alignment.

---

#### S1. `DocumentIdGenerator` uses mutable `let` counter instead of `Ref`

**File:** `src/Data.ts` (lines 52-59)

The `let sequence = 0` counter inside `Effect.sync` is technically safe for single-fiber access, but `Ref` is more idiomatic and safe under concurrent `DocumentIdGenerator` usage:

```typescript
const makeDefaultDocumentIdGenerator = Effect.gen(function* () {
  const counter = yield* Ref.make(0)
  return {
    next: Ref.getAndUpdate(counter, (n) => n + 1).pipe(
      Effect.map((n) => `doc_${(n + 1).toString(16).padStart(8, "0")}`)
    )
  }
})
```

---

#### S2. `annotateDocuments` buffers everything before "streaming"

**File:** `src/Annotator.ts` (lines 366-375)

The service returns `Stream.Stream<AnnotatedDocument>` but the implementation calls `annotateDocumentsMerged` (returns all results as a single array) and then wraps it with `Stream.fromIterable`. No actual streaming or backpressure benefit is provided.

**Improvement:** Emit each `AnnotatedDocument` as it completes rather than buffering all results.

---

#### S3. `copyExtraction` / `stripAlignment` manually spread optional fields

**File:** `src/Resolver.ts` (lines 304-361)

60+ lines of conditional spreading to copy/strip `Extraction` fields. Since `Extraction` is a `Schema.Class` with `{ exact: true }` optionals, `new Extraction({...extraction})` handles undefined fields correctly.

**Simplify to:**

```typescript
const copyExtraction = (e: Extraction): Extraction =>
  new Extraction({ ...e })

const stripAlignment = (e: Extraction): Extraction =>
  new Extraction({
    extractionClass: e.extractionClass,
    extractionText: e.extractionText,
    extractionIndex: e.extractionIndex,
    groupIndex: e.groupIndex,
    description: e.description,
    attributes: e.attributes
  })
```

---

#### S4. `catchAll` in Annotator discards the original error

**File:** `src/Annotator.ts` (line 270)

The alignment fallback logs the fallback event but not the error that triggered it:

```typescript
Effect.catchAll(() =>
  logAnnotatorEvent("langextract.annotator.alignment_fallback", {
    passNumber,
    documentIndex: chunk.documentIndex
  })
```

**Fix:** Capture the error in the log:

```typescript
Effect.catchAll((alignError) =>
  logAnnotatorEvent("langextract.annotator.alignment_fallback", {
    passNumber,
    documentIndex: chunk.documentIndex,
    originalError: alignError.message
  })
```

---

#### S5. `toTextDelta` in AiAdapters duck-types stream parts with `as` casts

**File:** `src/providers/AiAdapters.ts` (lines 92-105)

Uses structural duck-typing with `as` casts to extract text deltas from stream parts. Could use `Schema.is` for type-safe parsing:

```typescript
const TextDeltaPart = Schema.Struct({
  type: Schema.Literal("text-delta"),
  delta: Schema.String
})
const isTextDelta = Schema.is(TextDeltaPart)

const toTextDelta = (part: unknown): string | undefined =>
  isTextDelta(part) ? part.delta : undefined
```

---

#### S6. Unnecessary `as const` on empty array defaults

**Files:** Multiple locations in `Data.ts`, `Prompting.ts`

```typescript
default: () => [] as const
```

`as const` on `[]` produces `readonly []` (empty tuple) but the schema type is `ReadonlyArray<T>`. Simply `() => []` suffices.

---

#### S7. Potentially unused `Cause` import in RuntimeControl

**File:** `src/RuntimeControl.ts` (line 1)

`Cause` is imported but may only be used implicitly through type inference in `withProviderPermitStream`. Worth verifying.

---

#### S8. Duplicated test helpers across CLI test files

**Files:** `test/cli/cli.extract.test.ts`, `cli.visualize.test.ts`, `effect-cli.subcommands.test.ts`

All three duplicate: `tempPath`, `withBunFileSystem`, `writeExamplesFile`, `readTextFile`, `removeFile`, and `writeAnnotatedDocument`.

**Fix:** Extract to a shared `test/helpers/cli.ts` module.

---

#### S9. `isUrl` uses `try/catch` inside an Effect context

**File:** `src/IO.ts` (lines 22-29)

`isUrl` is a pure function using `try/catch` for URL validation. It is called from `Extract.ts:74` inside `Effect.gen`. Low priority, but `Option.try` would be more idiomatic.

---

## Positive Observations

1. **Schema modeling is excellent.** `Schema.Class`, `Schema.TaggedError`, `Schema.TaggedRequest`, and `Schema.Literal` are all used correctly. `exactOptionalPropertyTypes` is enforced and all optional fields use `Schema.optionalWith` with `{ exact: true }` or `{ default: () => ... }` as appropriate.

2. **Service architecture is clean and consistent.** Every service follows the same `Effect.Service` pattern with `Default`, `Test`, `testLayer`, and `DefaultWithoutDependencies` for composable testing. The `dependencies: [...]` arrays are correct.

3. **Typed error handling is thorough.** 22 distinct `TaggedError` classes cover all failure domains. Error types are properly propagated through service interfaces.

4. **Worker-based alignment is well-architected.** `Schema.TaggedRequest` protocol, pool-based worker management, and graceful fallback to in-process alignment.

5. **Concurrency control via `PartitionedSemaphore` is solid.** `RuntimeControl` properly gates provider requests with per-provider partitioned permits and good logging at acquisition, release, and failure points.

6. **The caching layer is production-grade.** Two-tier request/session caching with TTL expiration, namespace isolation, max-entries eviction, and proper index maintenance.

7. **CLI configuration resolution is comprehensive.** Three-tier precedence (CLI > env > default) with typed validation through `Config.all`.

8. **Test structure is well-organized.** Tests categorized into `contracts/`, `foundation/`, `pipeline/`, `providers/`, `runtime/`, and `parity/`, each targeting appropriate abstraction levels. Live provider tests are gated behind environment variables.

---

## Summary

| Priority | Count | Key Actions |
|----------|-------|-------------|
| Critical | 3 | Fix vitest compatibility; convert bare throws to Effect errors; deduplicate `hashString` |
| Important | 8 | Use `Ref` for concurrent state; deduplicate Ollama provider; replace `try/catch` with `Effect.try`; centralize `asRecord`; remove misleading `UnicodeTokenizerLive`; add early termination to fuzzy alignment; centralize error message utility; add `Config`-based provider layers |
| Suggestion | 9 | Use `Ref` for `DocumentIdGenerator`; implement true streaming; simplify `copyExtraction`; add error context to `catchAll` logs; type-safe stream part parsing; shared test helpers; centralize error message extraction; clean up `as const`; verify unused imports |

---

## Implementation Closure (2026-02-17)

### Validation Baseline

- `bun run test` (`vitest run`): passing (`77/77`).
- `bun test`: unsupported for this suite because Bun runner semantics do not provide the Vitest test context callback used by `@effect/vitest` (`ctx.onTestFinished`).

| Finding | Status | Notes |
|---|---|---|
| C1 | Resolved | Standardized on `bun run test` (`vitest run`) and documented supported test entrypoint (`bun test` remains unsupported for Effect/Vitest tests). |
| C2 | Resolved | `Resolver` throw paths moved to typed `Effect` failures (`ResolverParsingError` / `AlignmentError`), and `Effect.try` wrappers removed from service methods. |
| C3 | Resolved | FNV-1a hash implementation centralized in `src/internal/hash.ts`. |
| I1 | Resolved | `Annotator` per-document extraction state moved to `Ref` updates for concurrency safety. |
| I2 | Resolved | Ollama now uses a native adapter + shared `makeProviderLanguageModelService` path; duplicated cache/inference logic removed. |
| I3 | Resolved | Encoding fallback paths now emit explicit warning logs before fallback output. |
| I4 | Resolved | `asRecord` centralized in `src/internal/records.ts`. |
| I5 | Resolved | `UnicodeTokenizerLive` now uses `Intl.Segmenter` with regex fallback. |
| I6 | Resolved | Fuzzy alignment now has early termination (`bestRatio >= 1`) and bounded window expansion. |
| I7 | Resolved | Error-message extraction centralized in `src/internal/errorMessage.ts`. |
| I8 | Resolved | Provider config layers now support `effect/Config` environment resolution. |
| S1 | Resolved | `DocumentIdGenerator` now uses a `Ref`-backed counter. |
| S2 | Resolved | `annotateDocuments` now emits stream results as documents complete on the active pass instead of full-array buffering. |
| S3 | Resolved | Resolver copy/strip helpers simplified. |
| S4 | Resolved | Annotator fallback logs now include the original alignment error context. |
| S5 | Resolved | `AiAdapters` stream-part parsing uses schema-based guard logic. |
| S6 | Resolved | Unnecessary `[] as const` defaults removed in core schema defaults. |
| S7 | Resolved | `Cause` import in `RuntimeControl` retained and validated as used (`withProviderPermitStream`). |
| S8 | Resolved | CLI test helper duplication removed via `test/helpers/cli.ts`. |
| S9 | Resolved | `IO.isUrl` now uses an `Option` throwable-lift idiom instead of local `try/catch`. |

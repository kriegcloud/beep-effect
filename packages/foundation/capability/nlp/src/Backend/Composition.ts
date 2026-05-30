/**
 * Backend composition - combinators that treat {@link NLPBackend}s as composable
 * morphisms.
 *
 * - {@link withFallback}: try a primary backend, fall back to a secondary on
 *   failure (per operation); the composed capabilities are the union.
 * - {@link withCaching}: memoize each text-keyed operation behind an `effect/Cache`
 *   with a capacity bound and TTL.
 * - {@link selectByCapability}: pick the first backend supporting a capability.
 *
 * Ported from the `adjunct` repo (Effect v3) to Effect v4 / `@beep/nlp`:
 * adjunct's `withCaching` was a no-op stub; here it is a real per-operation
 * `effect/Cache`. `backends.find(...)` becomes `effect/Array` `A.findFirst`
 * (returning `Option`).
 *
 * @since 0.0.0
 * @packageDocumentation
 */

import { A } from "@beep/utils";
import { Cache, Duration, Effect } from "effect";
import { NLPBackend } from "./NLPBackend.ts";
import type * as O from "effect/Option";
import type { BackendCapabilities, NLPBackendShape } from "./NLPBackend.ts";

/**
 * Compose two backends so each operation falls back to a secondary backend.
 *
 * @remarks
 * The wrapper catches any failure from the primary operation and retries the
 * same operation on the secondary backend. Advertised capabilities are the
 * boolean union of both inputs, so capability selection can see the composed
 * surface.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { withFallback } from "@beep/nlp/Backend/Composition"
 * import { notSupported } from "@beep/nlp/Backend/NLPBackend"
 * import type { NLPBackendShape } from "@beep/nlp/Backend/NLPBackend"
 *
 * const capabilities = {
 *   constituencyParsing: false,
 *   coreferenceResolution: false,
 *   dependencyParsing: false,
 *   lemmatization: false,
 *   ner: false,
 *   posTagging: false,
 *   relationExtraction: false,
 *   sentencization: false,
 *   tokenization: true
 * }
 * const primary: NLPBackendShape = {
 *   name: "primary",
 *   capabilities,
 *   tokenize: () => Effect.fail(notSupported("primary", "tokenize")),
 *   sentencize: () => Effect.succeed([]),
 *   posTag: () => Effect.succeed([]),
 *   lemmatize: () => Effect.succeed([]),
 *   extractEntities: () => Effect.succeed([]),
 *   parseDependencies: () => Effect.succeed([]),
 *   extractRelations: () => Effect.succeed([])
 * }
 * const secondary: NLPBackendShape = { ...primary, name: "secondary", tokenize: (text) => Effect.succeed([text]) }
 * console.log(withFallback(primary, secondary).name) // "primary+secondary"
 * ```
 *
 * @category combinators
 * @since 0.0.0
 */
export const withFallback = (primary: NLPBackendShape, secondary: NLPBackendShape): NLPBackendShape => {
  const capabilities: BackendCapabilities = {
    constituencyParsing: primary.capabilities.constituencyParsing || secondary.capabilities.constituencyParsing,
    coreferenceResolution: primary.capabilities.coreferenceResolution || secondary.capabilities.coreferenceResolution,
    dependencyParsing: primary.capabilities.dependencyParsing || secondary.capabilities.dependencyParsing,
    lemmatization: primary.capabilities.lemmatization || secondary.capabilities.lemmatization,
    ner: primary.capabilities.ner || secondary.capabilities.ner,
    posTagging: primary.capabilities.posTagging || secondary.capabilities.posTagging,
    relationExtraction: primary.capabilities.relationExtraction || secondary.capabilities.relationExtraction,
    sentencization: primary.capabilities.sentencization || secondary.capabilities.sentencization,
    tokenization: primary.capabilities.tokenization || secondary.capabilities.tokenization,
  };

  return NLPBackend.of({
    capabilities,
    name: `${primary.name}+${secondary.name}`,
    tokenize: Effect.fn("FallbackBackend.tokenize")(function* (text: string) {
      return yield* Effect.catch(primary.tokenize(text), () => secondary.tokenize(text));
    }),
    sentencize: Effect.fn("FallbackBackend.sentencize")(function* (text: string) {
      return yield* Effect.catch(primary.sentencize(text), () => secondary.sentencize(text));
    }),
    posTag: Effect.fn("FallbackBackend.posTag")(function* (text: string) {
      return yield* Effect.catch(primary.posTag(text), () => secondary.posTag(text));
    }),
    lemmatize: Effect.fn("FallbackBackend.lemmatize")(function* (text: string) {
      return yield* Effect.catch(primary.lemmatize(text), () => secondary.lemmatize(text));
    }),
    extractEntities: Effect.fn("FallbackBackend.extractEntities")(function* (text: string) {
      return yield* Effect.catch(primary.extractEntities(text), () => secondary.extractEntities(text));
    }),
    parseDependencies: Effect.fn("FallbackBackend.parseDependencies")(function* (sentence: string) {
      return yield* Effect.catch(primary.parseDependencies(sentence), () => secondary.parseDependencies(sentence));
    }),
    extractRelations: Effect.fn("FallbackBackend.extractRelations")(function* (text: string) {
      return yield* Effect.catch(primary.extractRelations(text), () => secondary.extractRelations(text));
    }),
  });
};

/**
 * Cache settings for memoized backend composition.
 *
 * @example
 * ```ts
 * import { Duration } from "effect"
 * import type { CachingOptions } from "@beep/nlp/Backend/Composition"
 *
 * const options: CachingOptions = { capacity: 64, timeToLive: Duration.minutes(5) }
 * console.log(options.capacity) // 64
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export interface CachingOptions {
  readonly capacity?: number;
  readonly timeToLive?: Duration.Duration;
}

/**
 * Wrap a backend with per-operation `effect/Cache` memoization.
 *
 * @remarks
 * Each backend operation gets its own cache keyed by the input text or sentence.
 * The wrapper preserves the backend's capability bitmap and renames it as
 * `cached(<name>)`.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { withCaching } from "@beep/nlp/Backend/Composition"
 * import type { NLPBackendShape } from "@beep/nlp/Backend/NLPBackend"
 *
 * const backend: NLPBackendShape = {
 *   name: "minimal",
 *   capabilities: {
 *     constituencyParsing: false,
 *     coreferenceResolution: false,
 *     dependencyParsing: false,
 *     lemmatization: false,
 *     ner: false,
 *     posTagging: false,
 *     relationExtraction: false,
 *     sentencization: true,
 *     tokenization: true
 *   },
 *   tokenize: (text) => Effect.succeed(text.split(" ")),
 *   sentencize: (text) => Effect.succeed([text]),
 *   posTag: () => Effect.succeed([]),
 *   lemmatize: () => Effect.succeed([]),
 *   extractEntities: () => Effect.succeed([]),
 *   parseDependencies: () => Effect.succeed([]),
 *   extractRelations: () => Effect.succeed([])
 * }
 * const program = Effect.flatMap(withCaching(backend, { capacity: 16 }), (cached) => cached.tokenize("typed effects"))
 * Effect.runPromise(program).then(console.log) // ["typed", "effects"]
 * ```
 *
 * @effects Allocates per-operation `effect/Cache` instances when the wrapper
 * effect runs; operations on the returned backend read and populate those
 * caches through `Cache.get`.
 *
 * @category combinators
 * @since 0.0.0
 */
export const withCaching = Effect.fn("withCaching")(function* (
  backend: NLPBackendShape,
  options?: CachingOptions
): Effect.fn.Return<NLPBackendShape> {
  const capacity = options?.capacity ?? 1024;
  const timeToLive = options?.timeToLive ?? Duration.minutes(10);
  const tokenizeCache = yield* Cache.make({ capacity, lookup: backend.tokenize, timeToLive });
  const sentencizeCache = yield* Cache.make({ capacity, lookup: backend.sentencize, timeToLive });
  const posTagCache = yield* Cache.make({ capacity, lookup: backend.posTag, timeToLive });
  const lemmatizeCache = yield* Cache.make({ capacity, lookup: backend.lemmatize, timeToLive });
  const entitiesCache = yield* Cache.make({ capacity, lookup: backend.extractEntities, timeToLive });
  const dependenciesCache = yield* Cache.make({ capacity, lookup: backend.parseDependencies, timeToLive });
  const relationsCache = yield* Cache.make({ capacity, lookup: backend.extractRelations, timeToLive });

  return NLPBackend.of({
    capabilities: backend.capabilities,
    name: `cached(${backend.name})`,
    tokenize: Effect.fn("CachedBackend.tokenize")(function* (text: string) {
      return yield* Cache.get(tokenizeCache, text);
    }),
    sentencize: Effect.fn("CachedBackend.sentencize")(function* (text: string) {
      return yield* Cache.get(sentencizeCache, text);
    }),
    posTag: Effect.fn("CachedBackend.posTag")(function* (text: string) {
      return yield* Cache.get(posTagCache, text);
    }),
    lemmatize: Effect.fn("CachedBackend.lemmatize")(function* (text: string) {
      return yield* Cache.get(lemmatizeCache, text);
    }),
    extractEntities: Effect.fn("CachedBackend.extractEntities")(function* (text: string) {
      return yield* Cache.get(entitiesCache, text);
    }),
    parseDependencies: Effect.fn("CachedBackend.parseDependencies")(function* (sentence: string) {
      return yield* Cache.get(dependenciesCache, sentence);
    }),
    extractRelations: Effect.fn("CachedBackend.extractRelations")(function* (text: string) {
      return yield* Cache.get(relationsCache, text);
    }),
  });
});

/**
 * Select the first backend whose capability bitmap enables a requested feature.
 *
 * @remarks
 * The input order is the preference order. This is useful before building a
 * layer when a caller has several concrete engines but only one operation
 * requires a specialized capability.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import * as O from "effect/Option"
 * import { selectByCapability } from "@beep/nlp/Backend/Composition"
 * import type { NLPBackendShape } from "@beep/nlp/Backend/NLPBackend"
 *
 * const backend: NLPBackendShape = {
 *   name: "tokenizer",
 *   capabilities: {
 *     constituencyParsing: false,
 *     coreferenceResolution: false,
 *     dependencyParsing: false,
 *     lemmatization: false,
 *     ner: false,
 *     posTagging: false,
 *     relationExtraction: false,
 *     sentencization: true,
 *     tokenization: true
 *   },
 *   tokenize: (text) => Effect.succeed(text.split(" ")),
 *   sentencize: (text) => Effect.succeed([text]),
 *   posTag: () => Effect.succeed([]),
 *   lemmatize: () => Effect.succeed([]),
 *   extractEntities: () => Effect.succeed([]),
 *   parseDependencies: () => Effect.succeed([]),
 *   extractRelations: () => Effect.succeed([])
 * }
 * console.log(O.map(selectByCapability("tokenization", [backend]), (selected) => selected.name))
 * ```
 *
 * @category combinators
 * @since 0.0.0
 */
export const selectByCapability = (
  capability: keyof BackendCapabilities,
  backends: ReadonlyArray<NLPBackendShape>
): O.Option<NLPBackendShape> => A.findFirst(backends, (backend) => backend.capabilities[capability]);

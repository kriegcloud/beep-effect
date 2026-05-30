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
import type * as O from "effect/Option";
import type { BackendCapabilities, NLPBackendShape } from "./NLPBackend.ts";
import { NLPBackend } from "./NLPBackend.ts";

/**
 * Compose two backends so each operation tries `primary` first, then `secondary`
 * on failure. Capabilities are the union of both.
 *
 * @example
 * ```ts
 * import { withFallback } from "@beep/nlp/Backend/Composition"
 *
 * console.log(typeof withFallback)
 * ```
 *
 * @since 0.0.0
 * @category combinators
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
 * Options controlling {@link withCaching}.
 *
 * @since 0.0.0
 * @category models
 */
export interface CachingOptions {
  readonly capacity?: number;
  readonly timeToLive?: Duration.Duration;
}

/**
 * Wrap a backend so each text-keyed operation is memoized behind an `effect/Cache`
 * with a capacity bound and time-to-live.
 *
 * @example
 * ```ts
 * import { withCaching } from "@beep/nlp/Backend/Composition"
 *
 * console.log(typeof withCaching)
 * ```
 *
 * @since 0.0.0
 * @category combinators
 */
export const withCaching = (backend: NLPBackendShape, options?: CachingOptions): Effect.Effect<NLPBackendShape> =>
  Effect.gen(function* () {
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
 * Select the first backend that supports a given capability.
 *
 * @example
 * ```ts
 * import { selectByCapability } from "@beep/nlp/Backend/Composition"
 *
 * console.log(typeof selectByCapability)
 * ```
 *
 * @since 0.0.0
 * @category combinators
 */
export const selectByCapability = (
  capability: keyof BackendCapabilities,
  backends: ReadonlyArray<NLPBackendShape>
): O.Option<NLPBackendShape> => A.findFirst(backends, (backend) => backend.capabilities[capability]);

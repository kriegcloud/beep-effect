/**
 * Effect service for Drizzle cache integration.
 *
 * @since 0.0.0
 * @module \@beep/shared-server/factories/effect-drizzle/cache-effect
 */

import { $SharedServerId } from "@beep/identity";
import type { Cache, MutationOption } from "drizzle-orm/cache/core/cache";
import { NoopCache } from "drizzle-orm/cache/core/cache";
import type { CacheConfig } from "drizzle-orm/cache/core/types";
import { Context, Effect, Layer } from "effect";
import { type EffectDrizzleError, effectDrizzleErrorFromUnknown } from "./Errors.js";

const $I = $SharedServerId.create("factories/effect-drizzle/cache-effect");

/**
 * Effect cache contract used by the Drizzle adapter.
 *
 * @since 0.0.0
 * @category Services
 */
export interface DrizzleEffectCacheShape {
  readonly get: (
    key: string,
    tables: ReadonlyArray<string>,
    isTag: boolean,
    autoInvalidate?: boolean
  ) => Effect.Effect<ReadonlyArray<unknown> | undefined, EffectDrizzleError>;
  readonly onMutate: (params: MutationOption) => Effect.Effect<void, EffectDrizzleError>;
  readonly put: (
    key: string,
    response: ReadonlyArray<unknown>,
    tables: ReadonlyArray<string>,
    isTag: boolean,
    config?: CacheConfig
  ) => Effect.Effect<void, EffectDrizzleError>;
  readonly strategy: () => "all" | "explicit";
}

/**
 * Effect service that adapts a Drizzle cache instance.
 *
 * @since 0.0.0
 * @category Services
 */
export class DrizzleEffectCache extends Context.Service<DrizzleEffectCache, DrizzleEffectCacheShape>()(
  $I`DrizzleEffectCache`
) {
  /**
   * Adapt a standard Drizzle cache instance into an Effect service shape.
   *
   * @since 0.0.0
   * @category Constructors
   */
  static fromDrizzle = (cache: Cache): DrizzleEffectCacheShape => ({
    strategy: () => cache.strategy(),
    get: Effect.fn("DrizzleEffectCache.get")(
      (key: string, tables: ReadonlyArray<string>, isTag: boolean, autoInvalidate?: boolean) =>
        Effect.tryPromise({
          try: () => cache.get(key, [...tables], isTag, autoInvalidate),
          catch: (cause) => effectDrizzleErrorFromUnknown(cause, "Failed to read Drizzle cache entry."),
        })
    ),
    put: Effect.fn("DrizzleEffectCache.put")(
      (
        key: string,
        response: ReadonlyArray<unknown>,
        tables: ReadonlyArray<string>,
        isTag: boolean,
        config?: CacheConfig
      ) =>
        Effect.tryPromise({
          try: () => cache.put(key, response, [...tables], isTag, config),
          catch: (cause) => effectDrizzleErrorFromUnknown(cause, "Failed to write Drizzle cache entry."),
        })
    ),
    onMutate: Effect.fn("DrizzleEffectCache.onMutate")((params: MutationOption) =>
      Effect.tryPromise({
        try: () => cache.onMutate(params),
        catch: (cause) => effectDrizzleErrorFromUnknown(cause, "Failed to invalidate Drizzle cache entries."),
      })
    ),
  });

  /**
   * Default no-op cache layer.
   *
   * @since 0.0.0
   * @category Layers
   */
  static readonly Default = Layer.succeed(
    DrizzleEffectCache,
    DrizzleEffectCache.of(DrizzleEffectCache.fromDrizzle(new NoopCache()))
  );

  /**
   * Layer adapter for a standard Drizzle cache instance.
   *
   * @since 0.0.0
   * @category Layers
   */
  static readonly layerFromDrizzle = (cache: Cache) =>
    Layer.succeed(DrizzleEffectCache, DrizzleEffectCache.of(DrizzleEffectCache.fromDrizzle(cache)));
}

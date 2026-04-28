/**
 * Native Drizzle Effect interop helpers.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import type { Effect } from "effect";
import { Effectable } from "effect";
import * as A from "effect/Array";

let installed: ReadonlyArray<DrizzleEffectYieldableBase> = [];

/**
 * Constructor-like base accepted by {@link installDrizzleEffectYieldables}.
 *
 * @example
 * ```ts
 * import type { DrizzleEffectYieldableBase } from "@beep/drizzle/interop"
 *
 * class QueryBase {}
 *
 * const base: DrizzleEffectYieldableBase = QueryBase
 * void base.prototype
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type DrizzleEffectYieldableBase = {
  readonly prototype: object;
};

type DrizzleExecutable = {
  readonly execute: () => Effect.Effect<unknown>;
};

const executeAsEffect = (self: object): Effect.Effect<unknown> =>
  Reflect.apply(Reflect.get(self, "execute") as DrizzleExecutable["execute"], self, []) as Effect.Effect<unknown>;

const queryEffectPrototype = Effectable.Prototype<Effect.Effect<unknown>>({
  label: "DrizzleQueryEffect",
  evaluate() {
    return executeAsEffect(this);
  },
});

const isInstalled = (baseClass: DrizzleEffectYieldableBase): boolean =>
  A.some(installed, (candidate) => candidate === baseClass);

/**
 * Idempotently install Drizzle's native Effect yieldability on a query base class.
 *
 * @example
 * ```ts
 * import { installDrizzleEffectYieldables } from "@beep/drizzle/interop"
 *
 * class QueryBase {}
 * installDrizzleEffectYieldables(QueryBase)
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const installDrizzleEffectYieldables = (baseClass: DrizzleEffectYieldableBase): void => {
  if (isInstalled(baseClass)) {
    return;
  }

  const hasExistingCommit = Reflect.has(baseClass.prototype, "commit");

  Object.defineProperties(baseClass.prototype, Object.getOwnPropertyDescriptors(queryEffectPrototype));
  if (!hasExistingCommit) {
    Object.defineProperty(baseClass.prototype, "commit", {
      configurable: true,
      value(this: object) {
        return executeAsEffect(this);
      },
    });
  }
  installed = A.append(installed, baseClass);
};

/**
 * Native Drizzle Effect cache types.
 *
 * @example
 * ```ts
 * import type { EffectCache } from "@beep/drizzle/interop"
 * import type { Layer } from "effect"
 *
 * type CacheLayer = Layer.Layer<EffectCache>
 *
 * const useCacheLayer = (_layer: CacheLayer) => undefined
 * void useCacheLayer
 * ```
 *
 * @since 0.0.0
 * @category exports
 */
export type { EffectCache } from "drizzle-orm/cache/core/cache-effect";
/**
 * Native Drizzle Effect error types.
 *
 * @example
 * ```ts
 * import type {
 *   EffectDrizzleError,
 *   EffectDrizzleQueryError,
 *   EffectTransactionRollbackError,
 *   MigratorInitError
 * } from "@beep/drizzle/interop"
 *
 * const handleNativeErrors = (
 *   _drizzleError: EffectDrizzleError,
 *   _queryError: EffectDrizzleQueryError,
 *   _rollbackError: EffectTransactionRollbackError,
 *   _migratorError: MigratorInitError
 * ) => undefined
 *
 * void handleNativeErrors
 * ```
 *
 * @since 0.0.0
 * @category exports
 */
export type {
  EffectDrizzleError,
  EffectDrizzleQueryError,
  EffectTransactionRollbackError,
  MigratorInitError,
} from "drizzle-orm/effect-core/errors";
/**
 * Native Drizzle Effect logger types.
 *
 * @example
 * ```ts
 * import type { EffectLogger } from "@beep/drizzle/interop"
 * import type { Layer } from "effect"
 *
 * type LoggerLayer = Layer.Layer<EffectLogger>
 *
 * const useLoggerLayer = (_layer: LoggerLayer) => undefined
 * void useLoggerLayer
 * ```
 *
 * @since 0.0.0
 * @category exports
 */
export type { EffectLogger } from "drizzle-orm/effect-core/logger";
/**
 * Native Drizzle Effect query types.
 *
 * @example
 * ```ts
 * import type { QueryEffectHKTBase, QueryEffectKind } from "@beep/drizzle/interop"
 *
 * type QueryEffect<A> = QueryEffectKind<QueryEffectHKTBase, A>
 *
 * const useQueryEffect = <A>(_effect: QueryEffect<A>) => undefined
 * void useQueryEffect
 * ```
 *
 * @since 0.0.0
 * @category exports
 */
export type { QueryEffectHKTBase, QueryEffectKind } from "drizzle-orm/effect-core/query-effect";

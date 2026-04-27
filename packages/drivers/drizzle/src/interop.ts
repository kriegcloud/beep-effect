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
 * declare const base: DrizzleEffectYieldableBase
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
  if (A.contains(installed, baseClass)) {
    return;
  }

  Object.defineProperties(baseClass.prototype, Object.getOwnPropertyDescriptors(queryEffectPrototype));
  Object.defineProperty(baseClass.prototype, "commit", {
    configurable: true,
    value(this: object) {
      return executeAsEffect(this);
    },
  });
  installed = A.append(installed, baseClass);
};

/**
 * Native Drizzle Effect cache types.
 *
 * @since 0.0.0
 * @category exports
 */
export type { EffectCache } from "drizzle-orm/cache/core/cache-effect";
/**
 * Native Drizzle Effect error types.
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
 * @since 0.0.0
 * @category exports
 */
export type { EffectLogger } from "drizzle-orm/effect-core/logger";
/**
 * Native Drizzle Effect query types.
 *
 * @since 0.0.0
 * @category exports
 */
export type { QueryEffectHKTBase, QueryEffectKind } from "drizzle-orm/effect-core/query-effect";

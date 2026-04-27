/**
 * Native Drizzle Effect interop exports.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { applyEffectWrapper } from "drizzle-orm/effect-core/query-effect";

const installed = new WeakSet<DrizzleEffectYieldableBase>();

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
  if (installed.has(baseClass)) {
    return;
  }

  applyEffectWrapper(baseClass);
  installed.add(baseClass);
};

/**
 * Native Drizzle Effect cache exports.
 *
 * @since 0.0.0
 * @category exports
 */
export * from "drizzle-orm/cache/core/cache-effect";
/**
 * Native Drizzle Effect core exports.
 *
 * @since 0.0.0
 * @category exports
 */
export * from "drizzle-orm/effect-core";
/**
 * Native Drizzle Effect error exports.
 *
 * @since 0.0.0
 * @category exports
 */
export * from "drizzle-orm/effect-core/errors";
/**
 * Native Drizzle Effect logger exports.
 *
 * @since 0.0.0
 * @category exports
 */
export * from "drizzle-orm/effect-core/logger";
/**
 * Native Drizzle Effect query exports.
 *
 * @since 0.0.0
 * @category exports
 */
export * from "drizzle-orm/effect-core/query-effect";

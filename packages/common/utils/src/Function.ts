/**
 * @module @beep/utils/Function
 *
 */
import type { TUnsafe } from "@beep/types";
import { identity } from "effect";

/**
 * @since 0.0.0
 */
export * from "effect/Function";
/**
 * Casts the result to the specified type.
 *
 * @example
 * ```ts
 * import { cast, identity } from "effect/Function"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(cast, identity)
 * ```
 *
 * @category type utils
 * @since 2.0.0
 */
export const cast: <A, B>(a: A) => B = identity as TUnsafe.Any;

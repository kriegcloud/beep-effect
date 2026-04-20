/**
 * Extended Function utilities built on `effect/Function`.
 *
 * @module \@beep/utils/Function
 * @since 0.0.0
 */
import type { TUnsafe } from "@beep/types";
import { identity } from "effect";

/**
 * Re-export of all helpers from `effect/Function`.
 *
 * @category utilities
 * @since 0.0.0
 */
export * from "effect/Function";
/**
 * Casts the result to the specified type.
 *
 * @example
 * ```ts
 * import { identity } from "effect/Function"
 * import { cast } from "@beep/utils/Function"
 *
 * const same = cast === identity
 * void same
 * ```
 *
 * @category utility
 * @since 0.0.0
 */
export const cast: <A, B>(a: A) => B = identity as TUnsafe.Any;

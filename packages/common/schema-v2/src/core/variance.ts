/**
 * Tagged variance markers shared by schema-v2 factories.
 *
 * Consumers use these phantom functions to preserve encode/decode variance when defining complex helpers.
 *
 * @example
 * import { variance } from "@beep/schema-v2/core/variance";
 *
 * interface Tagged<A, I, R> {
 *   readonly _A: typeof variance._A;
 *   readonly _I: typeof variance._I;
 *   readonly _R: typeof variance._R;
 * }
 *
 * @category Core/Variance
 * @since 0.1.0
 */
import type { UnsafeTypes } from "@beep/types";

/**
 * Phantom variance helpers used when defining schemas that preserve decode/encode channels.
 *
 * @example
 * import { variance } from "@beep/schema-v2/core/variance";
 *
 * type Tagged<A, I> = { readonly _A: typeof variance._A; readonly _I: typeof variance._I };
 *
 * @category Core/Variance
 * @since 0.1.0
 */
export const variance = {
  /* c8 ignore next */
  _A: (_: UnsafeTypes.UnsafeAny) => _,
  /* c8 ignore next */
  _I: (_: UnsafeTypes.UnsafeAny) => _,
  /* c8 ignore next */
  _R: (_: never) => _,
};

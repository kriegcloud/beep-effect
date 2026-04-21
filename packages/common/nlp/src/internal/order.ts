/**
 * Shared order helpers for NLP ranking and sorting.
 *
 * @since 0.0.0
 * @module
 */

import { Order } from "effect";

/**
 * Build a descending numeric order from a projection.
 *
 * @example
 * ```ts
 * import { descendingNumber } from "./order"
 *
 * const byScore = descendingNumber((value: { readonly score: number }) => value.score)
 * console.log(byScore)
 * ```
 *
 * @since 0.0.0
 * @category utilities
 */
export const descendingNumber = <A>(f: (value: A) => number): Order.Order<A> =>
  Order.mapInput(Order.Number, (value: A) => -f(value));

/**
 * Build an ascending numeric order from a projection.
 *
 * @example
 * ```ts
 * import { ascendingNumber } from "./order"
 *
 * const byIndex = ascendingNumber((value: { readonly index: number }) => value.index)
 * console.log(byIndex)
 * ```
 *
 * @since 0.0.0
 * @category utilities
 */
export const ascendingNumber = <A>(f: (value: A) => number): Order.Order<A> => Order.mapInput(Order.Number, f);

/**
 * Build an ascending string order from a projection.
 *
 * @example
 * ```ts
 * import { ascendingString } from "./order"
 *
 * const byName = ascendingString((value: { readonly name: string }) => value.name)
 * console.log(byName)
 * ```
 *
 * @since 0.0.0
 * @category utilities
 */
export const ascendingString = <A>(f: (value: A) => string): Order.Order<A> => Order.mapInput(Order.String, f);

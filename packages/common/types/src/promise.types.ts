/**
 * Represents either a direct value or a `Promise` resolving to that value.
 *
 * Handy for effect-style adapters that accept synchronous and asynchronous
 * implementations while keeping a single type parameter.
 *
 * @example
 * import type { Awaitable } from "@beep/types/promise.types";
 *
 * type MaybeAsyncNumber = Awaitable<number>;
 * const compute = (): MaybeAsyncNumber => 42;
 * void compute;
 *
 * @category Types/Async
 * @since 0.1.0
 */
export type Awaitable<T> = Promise<T> | T;

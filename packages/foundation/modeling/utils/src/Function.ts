/**
 * Function utilities built on top of `effect/Function`.
 *
 * @example
 * ```ts
 * import { tuple, reverseCurry } from "@beep/utils/Function"
 *
 * const pair = tuple("beep", 5)
 * const render = (right: number) => (left: string) => `${left}:${right}`
 * const rendered = reverseCurry(render)("beep")(5)
 *
 * void pair
 * void rendered
 * ```
 *
 * @packageDocumentation
 * @since 0.0.0
 */

/**
 * Re-export the standard Effect function helpers.
 *
 * @example
 * ```ts
 * import { pipe } from "@beep/utils/Function"
 *
 * const doubled = pipe(2, (value) => value * 2)
 *
 * void doubled
 * ```
 *
 * @category interop
 * @since 0.0.0
 */
export * from "effect/Function";

/**
 * Construct a readonly tuple from the provided elements.
 *
 * @example
 * ```ts
 * import { tuple } from "@beep/utils/Function"
 *
 * const pair = tuple("id", 123)
 * const first = pair[0]
 * const second = pair[1]
 *
 * void first
 * void second
 * ```
 *
 * @template T - The tuple element list captured from the argument list.
 * @param {...unknown} elements - The values to preserve in tuple order.
 * @returns {Readonly<T>} The provided elements typed as a readonly tuple.
 * @category constructors
 * @since 0.0.0
 */
export function tuple<const T extends ReadonlyArray<unknown>>(...elements: T): Readonly<T> {
  return elements;
}

/**
 * Convert a curried two-argument function into a tuple-consuming function.
 *
 * @example
 * ```ts
 * import { tupledCurry } from "@beep/utils/Function"
 *
 * const join = (left: string) => (right: string) => `${left}:${right}`
 * const joinTuple = tupledCurry(join)
 * const result = joinTuple(["beep", "effect"])
 *
 * void result
 * ```
 *
 * @template A - The first argument type.
 * @template B - The second argument type.
 * @template C - The return type.
 * @param {function(A): function(B): C} fn - The curried function to call with tuple elements.
 * @returns {function([A, B]): C} A function that applies `[a, b]` as `fn(a)(b)`.
 * @category combinators
 * @since 0.0.0
 */
export function tupledCurry<A, B, C>(fn: (a: A) => (b: B) => C): (arg0: [A, B]) => C {
  return ([a, b]: readonly [A, B]) => fn(a)(b);
}

/**
 * Reverse the argument order of a two-argument curried function.
 *
 * @example
 * ```ts
 * import { reverseCurry } from "@beep/utils/Function"
 *
 * const append = (suffix: string) => (value: string) => `${value}${suffix}`
 * const appendTo = reverseCurry(append)
 * const result = appendTo("beep")("-effect")
 *
 * void result
 * ```
 *
 * @template A - The first argument type after reversal.
 * @template B - The second argument type after reversal.
 * @template C - The return type.
 * @param {function(B): function(A): C} fn - The curried function whose argument order should be reversed.
 * @returns {function(A): function(B): C} A curried function that applies arguments as `fn(b)(a)`.
 * @category combinators
 * @since 0.0.0
 */
export function reverseCurry<A, B, C>(fn: (b: B) => (a: A) => C) {
  return (a: A) => (b: B) => fn(b)(a);
}

/**
 * Convert a two-argument function into a curried function.
 *
 * @example
 * ```ts
 * import { curry } from "@beep/utils/Function"
 *
 * const join = (left: string, right: string) => `${left}:${right}`
 * const result = curry(join)("beep")("effect")
 *
 * void result
 * ```
 *
 * @template A - The first argument type.
 * @template B - The second argument type.
 * @template C - The return type.
 * @param {function(A, B): C} fn - The two-argument function to curry.
 * @returns {function(A): function(B): C} A curried function that applies arguments as `fn(a, b)`.
 * @category combinators
 * @since 0.0.0
 */
export function curry<A, B, C>(fn: (a: A, b: B) => C) {
  return (a: A) => (b: B) => fn(a, b);
}

/**
 * Convert a curried two-argument function into an uncurried function.
 *
 * @example
 * ```ts
 * import { uncurry } from "@beep/utils/Function"
 *
 * const join = (left: string) => (right: string) => `${left}:${right}`
 * const result = uncurry(join)("beep", "effect")
 *
 * void result
 * ```
 *
 * @template A - The first argument type.
 * @template B - The second argument type.
 * @template C - The return type.
 * @param {function(A): function(B): C} fn - The curried function to call with two arguments.
 * @returns {function(A, B): C} An uncurried function that applies arguments as `fn(a)(b)`.
 * @category combinators
 * @since 0.0.0
 */
export function uncurry<A, B, C>(fn: (a: A) => (b: B) => C): (arg0: A, arg1: B) => C {
  return (a: A, b: B) => fn(a)(b);
}

/**
 * Memoize a nullary function and return the cached result after the first call.
 *
 * @example
 * ```ts
 * import { lazy } from "@beep/utils/Function"
 *
 * let calls = 0
 * const readOnce = lazy(() => {
 *   calls += 1
 *   return calls
 * })
 *
 * const first = readOnce()
 * const second = readOnce()
 *
 * void first
 * void second
 * ```
 *
 * @template A - The value produced by the thunk.
 * @param {function(): A} fn - The nullary function to evaluate at most once.
 * @returns {function(): A} A nullary function that returns the cached value after the first successful call.
 * @category constructors
 * @since 0.0.0
 */
export function lazy<A>(fn: () => A): () => A {
  let cache: { readonly value: A } | undefined;

  return () => {
    if (cache === undefined) {
      cache = { value: fn() };
    }

    return cache.value;
  };
}

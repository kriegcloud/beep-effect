/**
 * Algebraic structures (monoids) for NLP aggregation operations.
 *
 * @since 0.0.0
 * @packageDocumentation
 */

/**
 * Monoid type class plus concrete instances and law checkers.
 *
 * @example
 * ```typescript
 * import { Monoid } from "@beep/nlp/Algebra"
 *
 * console.log(Monoid.fold(Monoid.NumberSum)([1, 2, 3])) // 6
 * ```
 *
 * @since 0.0.0
 * @category combinators
 */
export * as Monoid from "./Monoid.ts";
/**
 * NLP-specific monoid instances (tokens, sentences, documents, corpus, TF-IDF).
 *
 * @example
 * ```typescript
 * import { NLPMonoid } from "@beep/nlp/Algebra"
 *
 * console.log(NLPMonoid.TokenConcat.combine("hello", "world")) // "hello world"
 * ```
 *
 * @since 0.0.0
 * @category combinators
 */
export * as NLPMonoid from "./NLPMonoid.ts";

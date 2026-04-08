/**
 * Deterministic query-text normalization helpers.
 *
 * @since 0.0.0
 * @module @beep/nlp/QueryText
 */
import * as Str from "@beep/utils/Str";
import { pipe } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";

const firstCapture = (pattern: RegExp, input: string): O.Option<string> =>
  pipe(pattern.exec(input), O.fromNullishOr, O.flatMap(A.get(1)), O.map(normalizePhrase));

/**
 * Collapse user question whitespace without changing punctuation or content.
 *
 * @example
 * ```typescript
 * import * as QueryText from "@beep/nlp/QueryText"
 *
 * const normalized = QueryText.normalizeQuestion("  hello   world  ")
 * console.log(normalized) // "hello world"
 * ```
 *
 * @since 0.0.0
 * @category normalization
 */
export const normalizeQuestion = (input: string): string => pipe(input, Str.trim, Str.replace(/\s+/g, " "));

/**
 * Normalize a short extracted phrase by trimming boundary punctuation and
 * collapsing whitespace around path separators.
 *
 * @example
 * ```typescript
 * import * as QueryText from "@beep/nlp/QueryText"
 *
 * const normalized = QueryText.normalizePhrase('"hello / world"')
 * console.log(normalized) // "hello/world"
 * ```
 *
 * @since 0.0.0
 * @category normalization
 */
export const normalizePhrase = (input: string): string =>
  pipe(
    input,
    normalizeQuestion,
    Str.replace(/^[`"'([{]+/g, ""),
    Str.replace(/[!?.,;:'"`)\]}]+$/g, ""),
    Str.replace(/\s*([/._-])\s*/g, "$1"),
    normalizeQuestion
  );

/**
 * Extract the first value enclosed in backticks from a user question.
 *
 * @example
 * ```typescript
 * import { Option } from "effect"
 * import * as QueryText from "@beep/nlp/QueryText"
 *
 * const result = QueryText.extractBacktickValue("What is `Effect.gen`?")
 * console.log(Option.getOrElse(result, () => "none")) // "Effect.gen"
 * ```
 *
 * @since 0.0.0
 * @category extraction
 */
export const extractBacktickValue = (input: string): O.Option<string> =>
  pipe(firstCapture(/`([^`]+)`/, input), O.filter(Str.isNonEmpty));

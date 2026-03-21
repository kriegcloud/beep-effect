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
  (() => {
    const match = pattern.exec(input);
    return match === null ? O.none() : pipe(match, A.get(1), O.map(normalizePhrase));
  })();

/**
 * Collapse user question whitespace without changing punctuation or content.
 *
 * @since 0.0.0
 * @category Normalization
 */
export const normalizeQuestion = (input: string): string => pipe(input, Str.trim, Str.replace(/\s+/g, " "));

/**
 * Normalize a short extracted phrase by trimming boundary punctuation and
 * collapsing whitespace around path separators.
 *
 * @since 0.0.0
 * @category Normalization
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
 * @since 0.0.0
 * @category Extraction
 */
export const extractBacktickValue = (input: string): O.Option<string> =>
  pipe(firstCapture(/`([^`]+)`/, input), O.filter(Str.isNonEmpty));

/**
 * Deterministic identifier tokenization and variant helpers.
 *
 * @since 0.0.0
 * @module @beep/nlp/IdentifierText
 */
import * as Str from "@beep/utils/Str";
import { pipe } from "effect";
import * as A from "effect/Array";
import * as QueryText from "./QueryText.ts";
import * as VariantText from "./VariantText.ts";

const normalizeIdentifierWords = (input: string): string =>
  pipe(
    input,
    QueryText.normalizePhrase,
    Str.replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2"),
    Str.replace(/([a-z0-9])([A-Z])/g, "$1 $2"),
    Str.replace(/[_-]+/g, " "),
    QueryText.normalizeQuestion
  );

/**
 * Convert a candidate identifier phrase into lowercase word tokens.
 *
 * @since 0.0.0
 * @category Tokenization
 */
export const tokens = (input: string): ReadonlyArray<string> =>
  pipe(input, normalizeIdentifierWords, Str.split(" "), A.map(Str.toLowerCase), A.filter(Str.isNonEmpty));

/**
 * Generate deterministic identifier variants for symbol lookup.
 *
 * @since 0.0.0
 * @category Variants
 */
export const variants = (input: string): ReadonlyArray<string> => {
  const normalized = QueryText.normalizePhrase(input);
  const tokenized = tokens(input);
  const spaced = A.isReadonlyArrayNonEmpty(tokenized) ? A.join(tokenized, " ") : normalized;

  return VariantText.orderedDedupe(
    A.make(
      normalized,
      spaced,
      Str.camelCase(spaced),
      Str.pascalCase(spaced),
      Str.snakeCase(spaced),
      Str.kebabCase(spaced),
      A.isReadonlyArrayNonEmpty(tokenized) ? A.join(tokenized, "") : ""
    )
  );
};

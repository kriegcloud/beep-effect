/**
 * Deterministic identifier tokenization and variant helpers.
 *
 * @since 0.0.0
 * @module @beep/nlp/IdentifierText
 */
import * as Str from "@beep/utils/Str";
import { flow, pipe } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as QueryText from "./QueryText.ts";
import * as VariantText from "./VariantText.ts";

const normalizeIdentifierWords = flow(
  QueryText.normalizePhrase,
  Str.replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2"),
  Str.replace(/([a-z0-9])([A-Z])/g, "$1 $2"),
  Str.replace(/[_-]+/g, " "),
  QueryText.normalizeQuestion
);

/**
 * Convert a candidate identifier phrase into lowercase word tokens.
 *
 * @example
 * ```typescript
 * import * as IdentifierText from "@beep/nlp/IdentifierText"
 *
 * const result = IdentifierText.tokens("myVariableName")
 * console.log(result) // ["my", "variable", "name"]
 * ```
 *
 * @since 0.0.0
 * @category tokenization
 */
export const tokens = flow(normalizeIdentifierWords, Str.split(" "), A.map(Str.toLowerCase), A.filter(Str.isNonEmpty));

/**
 * Generate deterministic identifier variants for symbol lookup.
 *
 * @example
 * ```typescript
 * import * as IdentifierText from "@beep/nlp/IdentifierText"
 *
 * const result = IdentifierText.variants("user name")
 * // Produces camelCase, PascalCase, snake_case, kebab-case, and joined variants
 * console.log(result.includes("userName")) // true
 * console.log(result.includes("UserName")) // true
 * console.log(result.includes("user_name")) // true
 * ```
 *
 * @since 0.0.0
 * @category variants
 */
export const variants = (input: string): ReadonlyArray<string> => {
  const normalized = QueryText.normalizePhrase(input);
  const tokenized = tokens(input);
  const spaced = pipe(
    tokenized,
    A.match({
      onEmpty: () => normalized,
      onNonEmpty: (nonEmptyTokens) => A.join(nonEmptyTokens, " "),
    })
  );
  const joined = pipe(
    A.get(tokenized, 0),
    O.match({
      onNone: () => Str.empty,
      onSome: () => A.join(tokenized, Str.empty),
    })
  );

  return VariantText.orderedDedupe(
    A.make(
      normalized,
      spaced,
      Str.camelCase(spaced),
      Str.pascalCase(spaced),
      Str.snakeCase(spaced),
      Str.kebabCase(spaced),
      joined
    )
  );
};

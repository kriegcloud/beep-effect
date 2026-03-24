/**
 * Core Token Model
 *
 * Effect-native data type with unique symbol typeId and formal dual API + pipeable interface
 *
 *
 * @since 0.0.0
 * @module @beep/nlp/Token
 */

import { $NlpId } from "@beep/identity";
import { NonNegativeInt } from "@beep/schema";
import { O, thunkFalse, thunkTrue } from "@beep/utils";
import { Brand } from "effect";
import { dual, identity } from "effect/Function";
import * as S from "effect/Schema";

const $I = $NlpId.create("Token");

/**
 * Branded number type for token indices.
 * @see {@link Brand.Branded}
 * @see {@link NonNegativeInt}
 *
 * @since 0.0.0
 * @category DomainModel
 * @type {Brand.Branded<NonNegativeInt, "TokenIndex">}
 */
export type TokenIndex = Brand.Branded<NonNegativeInt, "TokenIndex">;

/**
 * Checks whether the provided value is a valid `TokenIndex`.
 *
 * A `TokenIndex` is defined as a positive integer. This function uses
 * a combination of schema predicates to ensure both conditions are met:
 * - The value must be a positive number.
 * - The value must be an integer.
 *
 * ## Key Characteristics
 * - **Type Guard**: Narrows the type of the input to `TokenIndex` when the function
 *   returns `true`.
 * - Relies on composition of built-in numeric predicates from `effect/Schema` for
 *   safety and immutability.
 *
 * @example
 * ```typescript
 * import { isTokenIndex } from "effect/Token";
 * import { Effect } from "effect";
 *
 * // Example usage
 * const value1 = 5;
 * const value2 = -3;
 * const value3 = 3.5;
 *
 * console.log(isTokenIndex(value1)); // true
 * console.log(isTokenIndex(value2)); // false
 * console.log(isTokenIndex(value3)); // false
 * ```
 *
 * @example
 * ```typescript
 * import { isTokenIndex } from "effect/Token";
 * import { Effect } from "effect";
 *
 * // Use with Effect
 * const checkIndex = (value: unknown) =>
 *   Effect.gen(function* () {
 *     if (isTokenIndex(value)) {
 *       yield* Effect.log(`Value ${value} is a valid TokenIndex.`);
 *       return value;
 *     } else {
 *       throw new Error(`Invalid TokenIndex: ${value}`);
 *     }
 *   });
 *
 * const program = checkIndex(42).pipe(
 *   Effect.provideLayer(Effect.defaultRuntime)
 * );
 * ```
 *
 * @param u - The value to be tested.
 * @returns `true` if the value is a valid `TokenIndex`, otherwise `false`.
 *
 * @since 0.0.0
 * @category Validation
 */
export const isTokenIndex = (u: unknown): u is TokenIndex => S.is(NonNegativeInt)(u);

/**
 * Represents the index of a token in a sequence, ensuring type safety through branding.
 *
 * `tokenIndex` is constructed using a `Brand` which applies a filter to validate
 * that the provided value conforms to the `TokenIndex` structure. This ensures
 * type safety without requiring runtime checks at every point of use.
 *
 * ## Key Features
 *
 * - Ensures that only values passing the `isTokenIndex` filter can be used as a `TokenIndex`.
 * - Leverages the `Brand` utility to provide a branded type, preventing accidental misuse.
 * - Compatible with Effect's type-safe functionality, integrating seamlessly with other Effect utilities.
 *
 * @example
 * ```typescript
 * import { Brand } from "effect/Brand";
 * import * as S from "effect/Schema";
 *
 * // Define a schema and a validation function for TokenIndex
 * const isTokenIndex = (value: unknown): value is TokenIndex =>
 *   typeof value === "number" && value >= 0;
 *
 * type TokenIndex = Brand.Brand<number, "TokenIndex">;
 *
 * const tokenIndex: Brand.Constructor<TokenIndex> = Brand.check<TokenIndex>(
 *   S.makeFilter(isTokenIndex)
 * );
 *
 * // Safe usage
 * const index: TokenIndex = tokenIndex(5); // Valid index
 * console.log(index); // Outputs: 5
 *
 * // Invalid usage
 * const invalidIndex: TokenIndex = tokenIndex(-1); // Fails filter
 * ```
 *
 * @since 0.1.0
 * @category DomainModel
 * @type {Brand.Constructor<TokenIndex>}
 */
export const tokenIndex: Brand.Constructor<TokenIndex> = Brand.check<TokenIndex>(S.makeFilter(S.is(NonNegativeInt)));

/**
 * Schema for a `TokenIndex` value.
 *
 * @since 0.0.0
 * @category Validation
 */
export const TokenIndex = NonNegativeInt.pipe(S.fromBrand("TokenIndex", tokenIndex));

/**
 * Branded number type for character positions.
 *
 * @since 0.0.0
 * @category DomainModel
 * @type {Brand.Branded<NonNegativeInt, "CharPosition">}
 */
export type CharPosition = Brand.Branded<NonNegativeInt, "CharPosition">;

/**
 * Checks whether the provided value is a valid `CharPosition`.
 *
 * @category Validation
 * @param u
 * @returns {u is CharPosition}
 * @since 0.0.0
 */
export const isCharPosition = (u: unknown): u is CharPosition => S.is(NonNegativeInt)(u);

/**
 * CharPosition constructor
 *
 * @category Utility
 * @type {Constructor<CharPosition>}
 * @since 0.0.0
 */
export const charPosition: Brand.Constructor<CharPosition> = Brand.check<CharPosition>(
  S.makeFilter(S.is(NonNegativeInt))
);

/**
 * Schema for a `CharPosition` value.
 *
 * @since 0.0.0
 * @category Validation
 */
export const CharPosition = NonNegativeInt.pipe(S.fromBrand("CharPosition", charPosition));

/**
 * Represents a token with various linguistic and positional metadata.
 *
 * This `Token` class is a versatile container for textual elements extracted
 * during processing, providing rich metadata such as shape, part of speech,
 * positional indexing, stemming, and more. It is equipped with a set of utility
 * methods to support common operations like checking for punctuation, verifying
 * if it is a stop word, and updating properties immutably.
 *
 * ## Features
 * - Immutable metadata management
 * - Supports both data-first and data-last functional programming styles
 * - Rich utility methods for text processing pipelines
 *
 * @example
 * ```typescript
 * import { Token } from "effect/Token";
 * import * as O from "effect/Option";
 *
 * const token = new Token({
 *   text: "example",
 *   index: 0,
 *   start: 0,
 *   end: 7,
 *   pos: O.some("noun"),
 *   tags: ["keyword", "highlight"],
 * });
 *
 * console.log(token.length); // 7
 * console.log(Token.isWord(token)); // true
 * ```
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class Token extends S.Class<Token>($I`Token`)(
  {
    text: S.String,
    index: TokenIndex,
    start: CharPosition,
    end: CharPosition,
    pos: S.OptionFromOptionalKey(S.String),
    lemma: S.OptionFromOptionalKey(S.String),
    stem: S.OptionFromOptionalKey(S.String),
    normal: S.OptionFromOptionalKey(S.String),
    shape: S.OptionFromOptionalKey(S.String),
    prefix: S.OptionFromOptionalKey(S.String),
    suffix: S.OptionFromOptionalKey(S.String),
    case: S.OptionFromOptionalKey(S.String),
    uniqueId: S.OptionFromOptionalKey(S.Number),
    abbrevFlag: S.OptionFromOptionalKey(S.Boolean),
    contractionFlag: S.OptionFromOptionalKey(S.Boolean),
    stopWordFlag: S.OptionFromOptionalKey(S.Boolean),
    negationFlag: S.OptionFromOptionalKey(S.Boolean),
    precedingSpaces: S.OptionFromOptionalKey(S.String),
    tags: S.Array(S.String),
  },
  $I.annote("Token", {
    description: "Token type with unique symbol typeId and pipeable interface",
  })
) {
  /**
   * The length of the token in characters
   *
   * @category Utility
   * @returns {number}
   * @since 0.0.0
   */
  get length(): number {
    return this.end - this.start;
  }

  /**
   * Check if a position is contained within the token's range
   *
   * @category Utility
   * @param {number} pos - The position to check
   * @returns {boolean} - True if the position is within the token's range, false otherwise
   * @since 0.0.0
   */
  static readonly containsPosition: {
    (pos: number): (self: Token) => boolean;
    (self: Token, pos: number): boolean;
  } = dual(2, (token, pos) => pos >= token.start && pos < token.end);

  /**
   * Determines if the given token is a punctuation character based on its shape.
   *
   * This utility function analyzes the shape of a provided token and evaluates
   * whether it can be categorized as punctuation. Tokens with shapes matching
   * specific characters (e.g., 'X', 'x', or 'd') are excluded.
   *
   * ## Behavior
   * - Tokens without a defined shape (`None`) are treated as non-punctuation and return `false`.
   * - Tokens with a shape that does not match the regular expression `/[Xxd]/` are classified as punctuation.
   *
   * @example
   * ```typescript
   * import { isPunctuation } from "effect/String";
   *
   * // Example 1: Token with shape defined
   * const tokenA = { shape: Option.some(",") } // represents a shape ","
   * console.log(isPunctuation(tokenA)) // true (punctuation)
   *
   * // Example 2: Token with excluded shape
   * const tokenB = { shape: Option.some("X*/
  static readonly isPunctuation = (token: Token): boolean =>
    O.match(token.shape, {
      onNone: thunkFalse,
      onSome: (shape) => !/[Xxd]/.test(shape),
    });

  /**
   * Checks whether the given token represents a word based on its shape.
   *
   * This function inspects the `shape` property of the provided `Token` and determines
   * if it matches word-like patterns. If the `shape` is absent (`None`), it defaults
   * to returning `true`. If the `shape` is present (`Some`), the function evaluates
   * a specific regex pattern on it.
   *
   * ## Important Notes
   * - A `Token` is expected to have a `shape` property, which is an `Option<string>`.
   * - The function matches the presence of the letters "X" or "x" in the `shape` string.
   *
   * ## Behavior
   * - **When `shape` is `None`**: Returns `true`.
   * - **When `shape` is `Some`**: Returns `true` if "X" or "x" exists in the string, otherwise `false`.
   *
   * @example
   * ```typescript
   * import { isWord } from "your-module";
   * import * as O from "effect/Option";
   *
   * const token1 = { shape: O.some("Xray") };
   * const token2 = { shape: O.some("example") };
   * const token3 = { shape: O.none() };
   *
   * console.log(isWord(token1));*/
  static readonly isWord = (token: Token): boolean =>
    O.match(token.shape, {
      onNone: thunkTrue,
      onSome: (shape) => /[Xx]/.test(shape as string),
    });

  /**
   * Determines if a given token is a stop word.
   *
   * A stop word is typically a common word (e.g., "the", "is", "at") filtered out during
   * text processing or analysis. This function evaluates the token's `stopWordFlag`
   * to decide whether it is a stop word.
   *
   * ## Behavior
   * - If the `stopWordFlag` is `None`, the function returns `false`.
   * - If the `stopWordFlag` contains a value, the function returns that value directly.
   *
   * ## Performance Notes
   * - Efficient handling of optional flags to minimize processing overhead.
   * - Designed for use in high-performance text-processing pipelines.
   *
   * ## Example Usage
   *
   * @example
   * ```typescript
   * import { isStopWord } from "effect/TextProcessing";
   * import { Token } from "effect/Token";
   * import * as O from "effect/Option";
   *
   * // Define a token marked as a stop word
   * const stopWordToken: Token = {
   *   value: "the",
   *   stopWordFlag: O.some(true)
   * };
   *
   * // Define a token not marked as a stop word
   * const regularToken: Token = {
   *   value: "algorithm",
   *   stopWordFlag: O.none
   * };
   *
   * // Evaluate tokens
   * console.log(isStopWord(stopWordToken)); // true
   * console.log(isStopWord(regularToken));  // false
   * ```
   *
   * @example
   * ```typescript
   * import { isStopWord } from "effect/TextProcessing";
   * import { Token } from "effect/Token";
   * import * as O from "effect/Option";
   *
   * // Example with dynamic stop word evaluation
   * const token: Token = {
   *   value: "example",
   *   stopWordFlag: O.some(false)
   * };
   *
   * const result = isStopWord(token);
   * console.log(result); // false
   * ```
   *
   * @since 0.0.0
   * @category TextProcessing
   */
  static readonly isStopWord = (token: Token): boolean =>
    O.match(token.stopWordFlag, {
      onNone: thunkFalse,
      onSome: identity,
    });

  /**
   * Augments a `Token` with the provided `text` content, allowing either data-first or data-last usage.
   *
   * The `withText` function offers two signature variants:
   *
   * 1. **Curried Form** (data-last): Pass the `text` argument first, resulting in a function that expects a `Token`.
   * 2. **Standard Form** (data-first): Pass both the `Token` and `text` arguments directly.
   *
   * This function adheres to immutability principles by creating a new `Token` instance with the updated `text`.
   *
   * @example
   * ```typescript
   * import { Token } from "effect/Token";
   * import { withText } from "effect/Token/Modifiers";
   *
   * // Data-last usage
   * const addText = withText("example text");
   * const updatedToken = addText(originalToken); // Produces a new token with `text` set to "example text"
   *
   * // Data-first usage
   * const updatedToken = withText(originalToken, "example text");
   * ```
   *
   * @param {string} text - The text to associate with the `Token`.
   *
   * @param {Token} self - The `Token` instance to augment.
   *
   * @returns {Token} A new `Token` instance with the added or updated `text` property.
   *
   * @since 1.0.0
   * @category Utility
   */
  static readonly withText: {
    (text: string): (self: Token) => Token;
    (self: Token, text: string): Token;
  } = dual(2, (token, text) => Token.makeUnsafe({ ...token, text }));

  /**
   * Updates or sets the `pos` property of a `Token` object, supporting both data-first and data-last call styles.
   *
   * `withPos` is a curried function which either takes a position
   * first (returning a function to apply the `Token`), or takes the `Token`
   * first and the position second. This provides flexibility for different
   * programming styles.
   *
   * @example
   * ```typescript
   * import { withPos } from "effect/Token";
   *
   * const initialToken = Token.makeUnsafe({ value: "example", pos: 0 });
   *
   * // Data-first usage
   * const updatedToken = withPos(initialToken, 42);
   * console.log(updatedToken.pos); // 42
   *
   * // Data-last usage
   * const applyNewPosition = withPos(42);
   * const curriedUpdatedToken = applyNewPosition(initialToken);
   * console.log(curriedUpdatedToken.pos); // 42
   * ```
   *
   * @param pos - The new position value to set on the `Token`.
   * @param self - The `Token` object whose `pos` property is to be updated.
   * @returns A new `Token` object with the updated `pos` property.
   *
   * @since 0.0.0
   * @category Utility
   */
  static readonly withPos: {
    (pos: number): (self: Token) => Token;
    (self: Token, pos: number): Token;
  } = dual(2, (token, pos) => Token.makeUnsafe({ ...token, pos }));

  /**
   * Associates a lemma (a canonical form of a word) with the given `Token`. This function supports
   * both curried and non-curried usage patterns for flexibility.
   *
   * ## Use Case
   * Use this utility to update or assign the lemma property of a `Token`, ensuring immutability
   * by creating a new `Token` instance with the updated `lemma` while preserving other properties.
   *
   * ## Features
   * - Supports both curried and regular invocation
   * - Ensures immutability by not modifying the original `Token`
   *
   * @example
   * ```typescript
   * import { Token, withLemma } from "effect";
   *
   * // Example Token object
   * const token = Token.makeUnsafe({ text: "running", lemma: undefined });
   *
   * // Using non-curried version
   * const updatedToken = withLemma(token, "run");
   * console.log(updatedToken); // { text: "running", lemma: "run" }
   *
   * // Using curried version
   * const addLemma = withLemma("run");
   * const curriedUpdatedToken = addLemma(token);
   * console.log(curriedUpdatedToken); // { text: "running", lemma: "run" }
   * ```
   *
   * @param lemma - The desired canonical form of the word (lemma).
   * @param self - The original token to be updated (non-curried usage).
   * @returns A new `Token` with the updated `lemma` property.
   *
   * @since 0.0.0
   * @category Utility
   */
  static readonly withLemma: {
    (lemma: string): (self: Token) => Token;
    (self: Token, lemma: string): Token;
  } = dual(2, (token, lemma) => Token.makeUnsafe({ ...token, lemma }));

  /**
   * Updates or sets the `stopWordFlag` property of a `Token` object.
   *
   * This utility function supports dual-call signature patterns for ergonomic usage:
   * - Pass `flag` first, then partially apply the result to a `Token` instance.
   * - Pass both `Token` and `flag` together for immediate transformation.
   *
   * The `stopWordFlag` is commonly used to indicate whether a token is a stop word.
   * This can be used in natural language processing or tokenization pipelines.
   *
   * @example
   * ```typescript
   * import { Token, withStopWordFlag } from "effect";
   *
   * const token = Token.makeUnsafe({ value: "example", stopWordFlag: O.none });
   *
   * // Usage with flag first, then token
   * const setFlag = withStopWordFlag(true);
   * const updatedToken1 = setFlag(token);
   *
   * // Usage with both token and flag
   * const updatedToken2 = withStopWordFlag(token, false);
   *
   * console.log(updatedToken1.stopWordFlag); // Some(true)
   * console.log(updatedToken2.stopWordFlag); // Some(false)
   * ```
   *
   * @param flag {boolean} - The boolean value to set for the `stopWordFlag` property.
   * @param self {Token} - (Optional) The `Token` to update. If provided, the function immediately applies the transformation.
   * @returns {Token} A partially applied function if only `flag` is provided, otherwise the updated `Token`.
   *
   * @since 0.0.0
   * @category Utility
   */
  static readonly withStopWordFlag: {
    (flag: boolean): (self: Token) => Token;
    (self: Token, flag: boolean): Token;
  } = dual(2, (token, flag) => Token.makeUnsafe({ ...token, stopWordFlag: O.some(flag) }));
}

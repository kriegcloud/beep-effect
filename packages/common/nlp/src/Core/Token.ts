/**
 * Core token model for NLP runtime services.
 *
 * @since 0.0.0
 * @module
 */

import { $NlpId } from "@beep/identity";
import { NonNegativeInt } from "@beep/schema";
import { Brand } from "effect";
import { dual } from "effect/Function";
import * as O from "effect/Option";
import * as S from "effect/Schema";

const $I = $NlpId.create("Core/Token");

/**
 * Branded number type for token indices.
 *
 * @example
 * ```ts
 * import type { TokenIndex } from "@beep/nlp/Core/Token"
 *
 * type Example = TokenIndex
 * ```
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type TokenIndex = Brand.Branded<NonNegativeInt, "TokenIndex">;

/**
 * Predicate for {@link TokenIndex}.
 *
 * @example
 * ```ts
 * import { isTokenIndex } from "@beep/nlp/Core/Token"
 *
 * console.log(isTokenIndex)
 * ```
 *
 * @since 0.0.0
 * @category Validation
 */
export const isTokenIndex = (u: unknown): u is TokenIndex => S.is(NonNegativeInt)(u);

/**
 * Constructor for {@link TokenIndex}.
 *
 * @example
 * ```ts
 * import { tokenIndex } from "@beep/nlp/Core/Token"
 *
 * console.log(tokenIndex)
 * ```
 *
 * @since 0.0.0
 * @category Validation
 */
export const tokenIndex: Brand.Constructor<TokenIndex> = Brand.check<TokenIndex>(S.makeFilter(S.is(NonNegativeInt)));

/**
 * Schema for {@link TokenIndex}.
 *
 * @example
 * ```ts
 * import { TokenIndex } from "@beep/nlp/Core/Token"
 *
 * console.log(TokenIndex)
 * ```
 *
 * @since 0.0.0
 * @category Validation
 */
export const TokenIndex = NonNegativeInt.pipe(S.fromBrand("TokenIndex", tokenIndex));

/**
 * Branded number type for character positions.
 *
 * @example
 * ```ts
 * import type { CharPosition } from "@beep/nlp/Core/Token"
 *
 * type Example = CharPosition
 * ```
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type CharPosition = Brand.Branded<NonNegativeInt, "CharPosition">;

/**
 * Predicate for {@link CharPosition}.
 *
 * @example
 * ```ts
 * import { isCharPosition } from "@beep/nlp/Core/Token"
 *
 * console.log(isCharPosition)
 * ```
 *
 * @since 0.0.0
 * @category Validation
 */
export const isCharPosition = (u: unknown): u is CharPosition => S.is(NonNegativeInt)(u);

/**
 * Constructor for {@link CharPosition}.
 *
 * @example
 * ```ts
 * import { charPosition } from "@beep/nlp/Core/Token"
 *
 * console.log(charPosition)
 * ```
 *
 * @since 0.0.0
 * @category Validation
 */
export const charPosition: Brand.Constructor<CharPosition> = Brand.check<CharPosition>(
  S.makeFilter(S.is(NonNegativeInt))
);

/**
 * Schema for {@link CharPosition}.
 *
 * @example
 * ```ts
 * import { CharPosition } from "@beep/nlp/Core/Token"
 *
 * console.log(CharPosition)
 * ```
 *
 * @since 0.0.0
 * @category Validation
 */
export const CharPosition = NonNegativeInt.pipe(S.fromBrand("CharPosition", charPosition));

/**
 * Immutable NLP token model with lexical and positional metadata.
 *
 * @example
 * ```ts
 * import { Token } from "@beep/nlp/Core/Token"
 *
 * console.log(Token)
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
    description: "Immutable NLP token with lexical annotations, offsets, and optional wink metadata.",
  })
) {
  /**
   * Number of characters spanned by the token.
   */
  get length(): number {
    return this.end - this.start;
  }

  /**
   * Whether a character position falls inside the token range.
   */
  static readonly containsPosition: {
    (token: Token, pos: number): boolean;
    (pos: number): (token: Token) => boolean;
  } = dual(2, (token: Token, pos: number): boolean => pos >= token.start && pos < token.end);

  /**
   * Whether the token represents punctuation.
   */
  static readonly isPunctuation = (token: Token): boolean =>
    O.match(token.shape, {
      onNone: () => false,
      onSome: (shape) => !/[Xxd]/.test(shape),
    });

  /**
   * Whether the token is word-like.
   */
  static readonly isWord = (token: Token): boolean =>
    O.match(token.shape, {
      onNone: () => true,
      onSome: (shape) => /[Xx]/.test(shape),
    });

  /**
   * Whether the token is marked as a stop word.
   */
  static readonly isStopWord = (token: Token): boolean => O.getOrElse(token.stopWordFlag, () => false);

  /**
   * Return a copy of the token with new text.
   */
  static readonly withText: {
    (token: Token, text: string): Token;
    (text: string): (token: Token) => Token;
  } = dual(2, (token: Token, text: string): Token => Token.make({ ...token, text }));

  /**
   * Return a copy of the token with a new part-of-speech tag.
   */
  static readonly withPos: {
    (token: Token, pos: string): Token;
    (pos: string): (token: Token) => Token;
  } = dual(2, (token: Token, pos: string): Token => Token.make({ ...token, pos: O.some(pos) }));

  /**
   * Return a copy of the token with a new lemma.
   */
  static readonly withLemma: {
    (token: Token, lemma: string): Token;
    (lemma: string): (token: Token) => Token;
  } = dual(2, (token: Token, lemma: string): Token => Token.make({ ...token, lemma: O.some(lemma) }));

  /**
   * Return a copy of the token with an updated stop-word flag.
   */
  static readonly withStopWordFlag: {
    (token: Token, flag: boolean): Token;
    (flag: boolean): (token: Token) => Token;
  } = dual(2, (token: Token, flag: boolean): Token => Token.make({ ...token, stopWordFlag: O.some(flag) }));
}

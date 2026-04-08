/**
 * Core token model for NLP runtime services.
 *
 * @since 0.0.0
 * @module @beep/nlp/Core/Token
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
 * @since 0.0.0
 * @category DomainModel
 */
export type TokenIndex = Brand.Branded<NonNegativeInt, "TokenIndex">;

/**
 * Predicate for {@link TokenIndex}.
 *
 * @since 0.0.0
 * @category Validation
 */
export const isTokenIndex = (u: unknown): u is TokenIndex => S.is(NonNegativeInt)(u);

/**
 * Constructor for {@link TokenIndex}.
 *
 * @since 0.0.0
 * @category Validation
 */
export const tokenIndex: Brand.Constructor<TokenIndex> = Brand.check<TokenIndex>(S.makeFilter(S.is(NonNegativeInt)));

/**
 * Schema for {@link TokenIndex}.
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
 */
export type CharPosition = Brand.Branded<NonNegativeInt, "CharPosition">;

/**
 * Predicate for {@link CharPosition}.
 *
 * @since 0.0.0
 * @category Validation
 */
export const isCharPosition = (u: unknown): u is CharPosition => S.is(NonNegativeInt)(u);

/**
 * Constructor for {@link CharPosition}.
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
 * @since 0.0.0
 * @category Validation
 */
export const CharPosition = NonNegativeInt.pipe(S.fromBrand("CharPosition", charPosition));

/**
 * Immutable NLP token model with lexical and positional metadata.
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
  static readonly containsPosition = dual(
    2,
    (token: Token, pos: number): boolean => pos >= token.start && pos < token.end
  );

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
  static readonly withText = dual(2, (token: Token, text: string): Token => Token.make({ ...token, text }));

  /**
   * Return a copy of the token with a new part-of-speech tag.
   */
  static readonly withPos = dual(2, (token: Token, pos: string): Token => Token.make({ ...token, pos: O.some(pos) }));

  /**
   * Return a copy of the token with a new lemma.
   */
  static readonly withLemma = dual(
    2,
    (token: Token, lemma: string): Token => Token.make({ ...token, lemma: O.some(lemma) })
  );

  /**
   * Return a copy of the token with an updated stop-word flag.
   */
  static readonly withStopWordFlag = dual(
    2,
    (token: Token, flag: boolean): Token => Token.make({ ...token, stopWordFlag: O.some(flag) })
  );
}

/**
 * Core Token Model
 * Effect-native data type with unique symbol typeId and formal dual API + pipeable interface
 * @since 3.0.0
 */

import { Schema, type Brand, Option, Data, Function } from "effect";

/**
 * Branded token index for type safety
 */
export type TokenIndex = number & Brand.Brand<"TokenIndex">;
export const TokenIndex = Schema.Number.pipe(Schema.brand("TokenIndex"));

/**
 * Branded character position for type safety
 */
export type CharPosition = number & Brand.Brand<"CharPosition">;
export const CharPosition = Schema.Number.pipe(Schema.brand("CharPosition"));

/**
 * Token type with unique symbol typeId and pipeable interface
 */
export interface Token {
  readonly text: string;
  readonly index: TokenIndex;
  readonly start: CharPosition;
  readonly end: CharPosition;
  readonly pos: Option.Option<string | undefined>;
  readonly lemma: Option.Option<string | undefined>;
  readonly stem: Option.Option<string | undefined>;
  readonly normal: Option.Option<string | undefined>;
  readonly shape: Option.Option<string | undefined>;
  readonly prefix: Option.Option<string | undefined>;
  readonly suffix: Option.Option<string | undefined>;
  readonly case: Option.Option<string | undefined>;
  readonly uniqueId: Option.Option<number | undefined>;
  readonly abbrevFlag: Option.Option<boolean | undefined>;
  readonly contractionFlag: Option.Option<boolean | undefined>;
  readonly stopWordFlag: Option.Option<boolean | undefined>;
  readonly negationFlag: Option.Option<boolean | undefined>;
  readonly precedingSpaces: Option.Option<string | undefined>;
  readonly tags: ReadonlyArray<string>;
}

/**
 * Token namespace with typeId, constructor, and dual API functions
 */
export namespace Token {
  /**
   * Token constructor using Data.case for simple, pipeable API
   */
  export const make = Data.case<Token>();

  /**
   * Token schema for validation and serialization
   */
  export const schema = Schema.Struct({
    text: Schema.String,
    index: TokenIndex,
    start: CharPosition,
    end: CharPosition,
    pos: Schema.Option(Schema.String),
    lemma: Schema.Option(Schema.String),
    stem: Schema.Option(Schema.String),
    normal: Schema.Option(Schema.String),
    shape: Schema.Option(Schema.String),
    prefix: Schema.Option(Schema.String),
    suffix: Schema.Option(Schema.String),
    case: Schema.Option(Schema.String),
    uniqueId: Schema.Option(Schema.Number),
    abbrevFlag: Schema.Option(Schema.Boolean),
    contractionFlag: Schema.Option(Schema.Boolean),
    stopWordFlag: Schema.Option(Schema.Boolean),
    negationFlag: Schema.Option(Schema.Boolean),
    precedingSpaces: Schema.Option(Schema.String),
    tags: Schema.Array(Schema.String),
  });

  /**
   * Get token length - dual API (data-first and data-last)
   */
  export const length = (token: Token): number => token.end - token.start;

  /**
   * Check if token contains position - dual API (data-first and data-last)
   */
  export const containsPosition = Function.dual<
    (pos: number) => (self: Token) => boolean,
    (self: Token, pos: number) => boolean
  >(
    2,
    (token: Token, pos: number): boolean =>
      pos >= token.start && pos < token.end
  );

  /**
   * Check if token is punctuation (based on shape) - dual API (data-first and data-last)
   */
  export const isPunctuation = (token: Token): boolean =>
    Option.match(token.shape, {
      onNone: () => false,
      onSome: (shape) => !/[Xxd]/.test(shape as string),
    });

  /**
   * Check if token is word (has letters) - dual API (data-first and data-last)
   */
  export const isWord = (token: Token): boolean =>
    Option.match(token.shape, {
      onNone: () => true,
      onSome: (shape) => /[Xx]/.test(shape as string),
    });

  /**
   * Check if token is stop word - dual API (data-first and data-last)
   */
  export const isStopWord = (token: Token): boolean =>
    Option.match(token.stopWordFlag, {
      onNone: () => false,
      onSome: (isStop) => isStop as boolean,
    });

  /**
   * Get token text - dual API (data-first and data-last)
   */
  export const text = (token: Token): string => token.text;

  /**
   * Get token POS tag - dual API (data-first and data-last)
   */
  export const pos = (token: Token): Option.Option<string | undefined> =>
    token.pos;

  /**
   * Get token lemma - dual API (data-first and data-last)
   */
  export const lemma = (token: Token): Option.Option<string | undefined> =>
    token.lemma;

  /**
   * Update token text - dual API (data-first and data-last)
   */
  export const withText = Function.dual<
    (text: string) => (self: Token) => Token,
    (self: Token, text: string) => Token
  >(2, (token: Token, text: string): Token => make({ ...token, text }));

  /**
   * Update token POS - dual API (data-first and data-last)
   */
  export const withPos = Function.dual<
    (pos: Option.Option<string>) => (self: Token) => Token,
    (self: Token, pos: Option.Option<string>) => Token
  >(
    2,
    (token: Token, pos: Option.Option<string>): Token => make({ ...token, pos })
  );

  /**
   * Update token lemma - dual API (data-first and data-last)
   */
  export const withLemma = Function.dual<
    (lemma: Option.Option<string>) => (self: Token) => Token,
    (self: Token, lemma: Option.Option<string>) => Token
  >(
    2,
    (token: Token, lemma: Option.Option<string>): Token =>
      make({ ...token, lemma })
  );

  /**
   * Update token stop word flag - dual API (data-first and data-last)
   */
  export const withStopWordFlag = Function.dual<
    (stopWordFlag: Option.Option<boolean>) => (self: Token) => Token,
    (self: Token, stopWordFlag: Option.Option<boolean>) => Token
  >(
    2,
    (token: Token, stopWordFlag: Option.Option<boolean>): Token =>
      make({ ...token, stopWordFlag })
  );
}

/**
 * Token helpers - kept for backward compatibility
 * @deprecated Use Token namespace functions instead
 */
export const TokenHelpers = {
  length: Token.length,
  containsPosition: (token: Token, pos: number) =>
    Token.containsPosition(pos)(token),
  isPunctuation: Token.isPunctuation,
  isWord: Token.isWord,
  isStopWord: Token.isStopWord,
  text: Token.text,
  pos: Token.pos,
  lemma: Token.lemma,
  withText: (token: Token, text: string) => Token.withText(text)(token),
  withPos: (token: Token, pos: Option.Option<string>) =>
    Token.withPos(pos)(token),
  withLemma: (token: Token, lemma: Option.Option<string>) =>
    Token.withLemma(lemma)(token),
  withStopWordFlag: (token: Token, stopWordFlag: Option.Option<boolean>) =>
    Token.withStopWordFlag(stopWordFlag)(token),
};

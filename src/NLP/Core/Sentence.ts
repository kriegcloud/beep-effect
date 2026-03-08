/**
 * Core Sentence Model
 * Effect-native data type with unique symbol typeId and formal dual API + pipeable interface
 * @since 3.0.0
 */

import { Schema, type Brand, Option, Chunk, Data, Function } from "effect";
import type { Token } from "./Token.js";
import { TokenIndex } from "./Token.js";

/**
 * Branded sentence index
 */
export type SentenceIndex = number & Brand.Brand<"SentenceIndex">;
export const SentenceIndex = Schema.Number.pipe(Schema.brand("SentenceIndex"));

/**
 * Sentence type with unique symbol typeId and pipeable interface
 */
export interface Sentence {
  readonly [Sentence.TypeId]?: Sentence.TypeId;
  readonly text: string;
  readonly index: SentenceIndex;
  readonly tokens: Chunk.Chunk<Token>;
  readonly start: TokenIndex;
  readonly end: TokenIndex;
  readonly sentiment: Option.Option<number>;
  readonly importance: Option.Option<number>;
  readonly negationFlag: Option.Option<boolean>;
  readonly markedUpText: Option.Option<string>;
}

/**
 * Sentence namespace with typeId, constructor, and dual API functions
 */
export namespace Sentence {
  export declare const TypeId: unique symbol;
  export type TypeId = typeof TypeId;

  /**
   * Sentence constructor using Data.case for simple, pipeable API
   */
  export const make = Data.case<Sentence>();

  /**
   * Sentence schema for validation and serialization
   */
  export const schema = Schema.Struct({
    text: Schema.String,
    index: SentenceIndex,
    tokens: Schema.Chunk(Schema.Unknown), // Will be properly typed when Token uses Schema.Class
    start: TokenIndex,
    end: TokenIndex,
    sentiment: Schema.Option(Schema.Number),
    importance: Schema.Option(Schema.Number),
    negationFlag: Schema.Option(Schema.Boolean),
    markedUpText: Schema.Option(Schema.String),
  });

  /**
   * Get sentence length in tokens - dual API (data-first and data-last)
   */
  export const tokenCount = (sentence: Sentence): number =>
    Chunk.size(sentence.tokens);

  /**
   * Get sentence length in characters - dual API (data-first and data-last)
   */
  export const characterCount = (sentence: Sentence): number =>
    sentence.text.length;

  /**
   * Get tokens in range - dual API (data-first and data-last)
   */
  export const getTokensInRange = Function.dual<
    (
      startIdx: number,
      endIdx: number
    ) => (self: Sentence) => Chunk.Chunk<Token>,
    (self: Sentence, startIdx: number, endIdx: number) => Chunk.Chunk<Token>
  >(
    3,
    (
      sentence: Sentence,
      startIdx: number,
      endIdx: number
    ): Chunk.Chunk<Token> =>
      Chunk.take(Chunk.drop(sentence.tokens, startIdx), endIdx - startIdx)
  );

  /**
   * Get sentence text - dual API (data-first and data-last)
   */
  export const text = (sentence: Sentence): string => sentence.text;

  /**
   * Get sentence sentiment - dual API (data-first and data-last)
   */
  export const sentiment = (
    sentence: Sentence
  ): Option.Option<number> => sentence.sentiment;

  /**
   * Get sentence importance - dual API (data-first and data-last)
   */
  export const importance = (
    sentence: Sentence
  ): Option.Option<number> => sentence.importance;

  /**
   * Check if sentence has sentiment - dual API (data-first and data-last)
   */
  export const hasSentiment = (sentence: Sentence): boolean =>
    Option.isSome(sentence.sentiment);

  /**
   * Check if sentence has negation flag - dual API (data-first and data-last)
   */
  export const hasNegation = (sentence: Sentence): boolean =>
    Option.match(sentence.negationFlag, {
      onNone: () => false,
      onSome: (hasNegation) => hasNegation,
    });

  /**
   * Get token by index - dual API (data-first and data-last)
   */
  export const getToken = Function.dual<
    (index: number) => (self: Sentence) => Option.Option<Token>,
    (self: Sentence, index: number) => Option.Option<Token>
  >(
    2,
    (sentence: Sentence, index: number): Option.Option<Token> =>
      Chunk.get(sentence.tokens, index)
  );

  /**
   * Get all token texts - dual API (data-first and data-last)
   */
  export const tokenTexts = (sentence: Sentence): Chunk.Chunk<string> =>
    Chunk.map(sentence.tokens, (token) => token.text);

  /**
   * Update sentence text - dual API (data-first and data-last)
   */
  export const withText = Function.dual<
    (text: string) => (self: Sentence) => Sentence,
    (self: Sentence, text: string) => Sentence
  >(
    2,
    (sentence: Sentence, text: string): Sentence => make({ ...sentence, text })
  );

  /**
   * Update sentence tokens - dual API (data-first and data-last)
   */
  export const withTokens = Function.dual<
    (tokens: Chunk.Chunk<Token>) => (self: Sentence) => Sentence,
    (self: Sentence, tokens: Chunk.Chunk<Token>) => Sentence
  >(
    2,
    (sentence: Sentence, tokens: Chunk.Chunk<Token>): Sentence =>
      make({ ...sentence, tokens })
  );

  /**
   * Update sentence sentiment - dual API (data-first and data-last)
   */
  export const withSentiment = Function.dual<
    (sentiment: Option.Option<number>) => (self: Sentence) => Sentence,
    (self: Sentence, sentiment: Option.Option<number>) => Sentence
  >(
    2,
    (sentence: Sentence, sentiment: Option.Option<number>): Sentence =>
      make({ ...sentence, sentiment })
  );

  /**
   * Update sentence importance - dual API (data-first and data-last)
   */
  export const withImportance = Function.dual<
    (importance: Option.Option<number>) => (self: Sentence) => Sentence,
    (self: Sentence, importance: Option.Option<number>) => Sentence
  >(
    2,
    (sentence: Sentence, importance: Option.Option<number>): Sentence =>
      make({ ...sentence, importance })
  );

  /**
   * Update sentence negation flag - dual API (data-first and data-last)
   */
  export const withNegationFlag = Function.dual<
    (negationFlag: Option.Option<boolean>) => (self: Sentence) => Sentence,
    (self: Sentence, negationFlag: Option.Option<boolean>) => Sentence
  >(
    2,
    (sentence: Sentence, negationFlag: Option.Option<boolean>): Sentence =>
      make({ ...sentence, negationFlag })
  );

  /**
   * Filter tokens by predicate - dual API (data-first and data-last)
   */
  export const filterTokens = Function.dual<
    (predicate: (token: Token) => boolean) => (self: Sentence) => Sentence,
    (self: Sentence, predicate: (token: Token) => boolean) => Sentence
  >(
    2,
    (sentence: Sentence, predicate: (token: Token) => boolean): Sentence =>
      make({
        ...sentence,
        tokens: Chunk.filter(sentence.tokens, predicate),
      })
  );
}

/**
 * Sentence helpers - kept for backward compatibility
 * @deprecated Use Sentence namespace functions instead
 */
export const SentenceHelpers = {
  tokenCount: Sentence.tokenCount,
  characterCount: Sentence.characterCount,
  getTokensInRange: (sentence: Sentence, startIdx: number, endIdx: number) =>
    Sentence.getTokensInRange(startIdx, endIdx)(sentence),
  text: Sentence.text,
  sentiment: Sentence.sentiment,
  importance: Sentence.importance,
  hasSentiment: Sentence.hasSentiment,
  hasNegation: Sentence.hasNegation,
  getToken: (sentence: Sentence, index: number) =>
    Sentence.getToken(index)(sentence),
  tokenTexts: Sentence.tokenTexts,
  withText: (sentence: Sentence, text: string) =>
    Sentence.withText(text)(sentence),
  withTokens: (sentence: Sentence, tokens: Chunk.Chunk<Token>) =>
    Sentence.withTokens(tokens)(sentence),
  withSentiment: (sentence: Sentence, sentiment: Option.Option<number>) =>
    Sentence.withSentiment(sentiment)(sentence),
  withImportance: (sentence: Sentence, importance: Option.Option<number>) =>
    Sentence.withImportance(importance)(sentence),
  withNegationFlag: (
    sentence: Sentence,
    negationFlag: Option.Option<boolean>
  ) => Sentence.withNegationFlag(negationFlag)(sentence),
  filterTokens: (sentence: Sentence, predicate: (token: Token) => boolean) =>
    Sentence.filterTokens(predicate)(sentence),
};

/**
 * Core sentence model for NLP runtime services.
 *
 * @since 0.0.0
 * @module
 */

import { $NlpId } from "@beep/identity";
import { NonNegativeInt } from "@beep/schema";
import { Brand, Chunk } from "effect";
import { dual } from "effect/Function";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { Token, TokenIndex } from "./Token.ts";

const $I = $NlpId.create("Core/Sentence");

/**
 * Branded index for sentences in ordered collections.
 *
 * @example
 * ```ts
 * import type { SentenceIndex } from "@beep/nlp/Core/Sentence"
 *
 * type Example = SentenceIndex
 * ```
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type SentenceIndex = Brand.Branded<NonNegativeInt, "SentenceIndex">;

/**
 * Constructor for {@link SentenceIndex}.
 *
 * @example
 * ```ts
 * import { sentenceIndex } from "@beep/nlp/Core/Sentence"
 *
 * console.log(sentenceIndex)
 * ```
 *
 * @since 0.0.0
 * @category Validation
 */
export const sentenceIndex: Brand.Constructor<SentenceIndex> = Brand.check<SentenceIndex>(
  S.makeFilter(S.is(NonNegativeInt))
);

/**
 * Schema for {@link SentenceIndex}.
 *
 * @example
 * ```ts
 * import { SentenceIndex } from "@beep/nlp/Core/Sentence"
 *
 * console.log(SentenceIndex)
 * ```
 *
 * @since 0.0.0
 * @category Validation
 */
export const SentenceIndex = NonNegativeInt.pipe(S.fromBrand("SentenceIndex", sentenceIndex));

/**
 * Immutable NLP sentence model.
 *
 * @example
 * ```ts
 * import { Sentence } from "@beep/nlp/Core/Sentence"
 *
 * console.log(Sentence)
 * ```
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class Sentence extends S.Class<Sentence>($I`Sentence`)(
  {
    text: S.String,
    index: SentenceIndex,
    tokens: S.Chunk(Token),
    start: TokenIndex,
    end: TokenIndex,
    sentiment: S.OptionFromOptionalKey(S.Number),
    importance: S.OptionFromOptionalKey(S.Number),
    negationFlag: S.OptionFromOptionalKey(S.Boolean),
    markedUpText: S.OptionFromOptionalKey(S.String),
  },
  $I.annote("Sentence", {
    description: "Immutable NLP sentence with token offsets and optional scoring metadata.",
  })
) {
  /**
   * Number of characters in the sentence text.
   */
  get characterCount(): number {
    return Str.length(this.text);
  }

  /**
   * Number of tokens in the sentence.
   */
  get tokenCount(): number {
    return Chunk.size(this.tokens);
  }

  /**
   * Whether the sentence has sentiment metadata.
   */
  get hasSentiment(): boolean {
    return O.isSome(this.sentiment);
  }

  /**
   * Get tokens between two inclusive document token offsets.
   */
  static readonly getTokensInRange = dual(
    3,
    (sentence: Sentence, startIdx: number, endIdx: number): Chunk.Chunk<Token> =>
      Chunk.filter(sentence.tokens, (token) => token.index >= startIdx && token.index <= endIdx)
  );

  /**
   * Safely get a token by zero-based index.
   */
  static readonly getToken = dual(
    2,
    (sentence: Sentence, index: number): O.Option<Token> => Chunk.get(sentence.tokens, index)
  );
}

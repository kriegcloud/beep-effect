/**
 * Core Sentence Model
 * Effect-native data type with unique symbol typeId and formal dual API + pipeable interface
 * @module @beep/nlp/Sentence
 * @since 0.0.0
 */
import { $SchemaId } from "@beep/identity/packages";
import { NonNegativeInt } from "@beep/schema";
import { Brand, Chunk } from "effect";
import { dual } from "effect/Function";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { Token, TokenIndex, tokenIndex } from "./Token.ts";

const $I = $SchemaId.create("Sentence");

/**
 * Represents the zero-based index of a sentence within a collection of text sentences, ensuring the index is a non-negative integer.
 *
 * This branded type is used to enforce type safety and prevent accidental misuse of raw numbers where a sentence index is expected.
 *
 * ## Key Characteristics
 * - **Non-negative**: The value must be greater than or equal to zero.
 * - **Typed Branding**: Uses branding to create a distinct type for `SentenceIndex`, avoiding accidental misinterpretation of regular numbers.
 * - **Common Usage**: Typically used to reference sentences in a list or array within text-processing utilities.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type SentenceIndex = Brand.Branded<NonNegativeInt, "SentenceIndex">;

/**
 * Represents a branded index for a token within a sentence.
 *
 * This is a branded type, leveraging `NonNegativeInt` to ensure the index is always a
 * non-negative integer. It adds further semantic meaning to the value by branding it
 * as a `SentenceIndex`, allowing stricter type safety in contexts where the index
 * refers to tokens within a sentence structure.
 *
 * @category Validation
 * @since 0.0.0
 */
export const sentenceIndex: Brand.Constructor<SentenceIndex> = Brand.check<SentenceIndex>(
  S.makeFilter(S.is(NonNegativeInt))
);

/**
 * Represents a branded `NonNegativeInt` value specifically marked as a `SentenceIndex`,
 * used for indexing sentences in a list or related contexts.
 *
 * This type ensures that any value designated as a `SentenceIndex` is:
 * - A non-negative integer
 * - Explicitly tagged with the "SentenceIndex" brand for type safety
 *
 * ## Key Use Cases
 *
 * - Used in contexts requiring clear differentiation of indices, ensuring that
 *   only valid, non-negative integers with the `SentenceIndex` brand are accepted.
 * - Prevents unintentional usage of plain numbers by enforcing the branded type at compile-time.
 *
 *
 * @category Validation
 * @since 0.0.0
 */
export const SentenceIndex = NonNegativeInt.pipe(S.fromBrand("SentenceIndex", tokenIndex));

/**
 * Represents a sentence with various attributes and utility functions for handling text,
 * tokenization, and metadata.
 *
 * @category DomainModel
 * @since 0.0.0
 **/
export class Sentence extends S.Class<Sentence>($I`Sentence`)(
  {
    text: S.String,
    index: SentenceIndex,
    tokens: S.Chunk(Token),
    start: TokenIndex,
    end: TokenIndex,
    sentiment: S.Option(S.Number),
    importance: S.Option(S.Number),
    negationFlag: S.Option(S.Boolean),
    markedUpText: S.Option(S.String),
  },
  $I.annote("Sentence", {
    description: "Sentence type with unique symbol typeId and pipeable interface",
  })
) {
  /**
   *
   * @returns {number}
   */
  get characterCount() {
    return this.text.length;
  }

  /**
   *
   * @returns {number}
   */
  get tokenCount() {
    return Chunk.size(this.tokens);
  }

  /**
   *
   * @type {{(startIdx: number, endIdx: number): (self: Sentence) => Chunk<Token>, (self: Sentence, startIdx: number, endIdx: number): Chunk<Token>}}
   */
  static readonly getTokensInRange: {
    (startIdx: number, endIdx: number): (self: Sentence) => Chunk.Chunk<Token>;
    (self: Sentence, startIdx: number, endIdx: number): Chunk.Chunk<Token>;
  } = dual(3, (sentence, startIdx, endIdx) => Chunk.take(Chunk.drop(sentence.tokens, startIdx), endIdx - startIdx));

  /**
   *
   * @returns {self is O.Some<unknown>}
   */
  get hasSentiment() {
    return O.isSome(this.sentiment);
  }

  /**
   *
   * @type {{(index: number): (self: Sentence) => O.Option<Token>, (self: Sentence, index: number): O.Option<Token>}}
   */
  static readonly getToken: {
    (index: number): (self: Sentence) => O.Option<Token>;
    (self: Sentence, index: number): O.Option<Token>;
  } = dual(2, (sentence: Sentence, index: number): O.Option<Token> => Chunk.get(sentence.tokens, index));
}

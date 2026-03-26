/**
 * Core Document Model
 * Effect-native data type with unique symbol typeId and formal dual API + pipeable interface
 * @module @beep/nlp/Document
 * @since 0.0.0
 */
import { $SchemaId } from "@beep/identity/packages";
import { NonNegativeInt } from "@beep/schema";
import { Brand, Chunk, pipe } from "effect";
import { dual } from "effect/Function";
import type * as O from "effect/Option";
import * as S from "effect/Schema";
import { Sentence, type SentenceIndex } from "./Sentence.ts";
import { Token, type TokenIndex, tokenIndex } from "./Token.ts";

const $I = $SchemaId.create("Document");

/**
 * Represents the zero-based index of a sentence within a collection of text sentences, ensuring the index is a non-negative integer.
 *
 * This branded type is used to enforce type safety and prevent accidental misuse of raw numbers where a sentence index is expected.
 *
 * ## Key Characteristics
 * - **Non-negative**: The value must be greater than or equal to zero.
 * - **Typed Branding**: Uses branding to create a distinct type for `DocumentIndex`, avoiding accidental misinterpretation of regular numbers.
 * - **Common Usage**: Typically used to reference sentences in a list or array within text-processing utilities.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type DocumentIndex = Brand.Branded<NonNegativeInt, "DocumentIndex">;

/**
 * Represents a branded index for a token within a sentence.
 *
 * @category Validation
 * @since 0.0.0
 */
export const documentIndex: Brand.Constructor<DocumentIndex> = Brand.check<DocumentIndex>(
  S.makeFilter(S.is(NonNegativeInt))
);

/**
 * Represents a branded `NonNegativeInt` value specifically marked as a `DocumentIndex`,
 * used for indexing sentences in a list or related contexts
 *
 *
 * @category Validation
 * @since 0.0.0
 */
export const DocumentIndex = NonNegativeInt.pipe(S.fromBrand("DocumentIndex", tokenIndex));

/**
 * Document type with unique symbol typeId and pipeable interface
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class Document extends S.Class<Document>($I`Document`)(
  {
    text: S.String,
    tokens: S.Chunk(Token),
    sentences: S.Chunk(Sentence),
    sentiment: S.Option(S.Number),
  },
  $I.annote("Document", {
    description: "Document type with unique symbol typeId and pipeable interface",
  })
) {
  get tokenCount() {
    return Chunk.size(this.tokens);
  }

  get sentenceCount() {
    return Chunk.size(this.sentences);
  }

  get characterCount() {
    return this.text.length;
  }

  static readonly getTokensInRange = dual<
    (start: number, end: number) => (self: Document) => Chunk.Chunk<Token>,
    (self: Document, start: number, end: number) => Chunk.Chunk<Token>
  >(
    3,
    (doc: Document, start: number, end: number): Chunk.Chunk<Token> =>
      pipe(
        doc.tokens,
        Chunk.filter((token) => token.start >= start && token.end <= end)
      )
  );

  static readonly getToken = dual<
    (index: number) => (self: Document) => O.Option<Token>,
    (self: Document, index: number) => O.Option<Token>
  >(2, (doc: Document, index: number): O.Option<Token> => Chunk.get(doc.tokens, index));

  static readonly getTokenByIndex = dual<
    (index: TokenIndex) => (self: Document) => O.Option<Token>,
    (self: Document, index: TokenIndex) => O.Option<Token>
  >(2, (doc: Document, index: TokenIndex): O.Option<Token> => Chunk.get(doc.tokens, index));

  static readonly getSentence = dual<
    (index: number) => (self: Document) => O.Option<Sentence>,
    (self: Document, index: number) => O.Option<Sentence>
  >(2, (doc: Document, index: number): O.Option<Sentence> => Chunk.get(doc.sentences, index));

  static readonly getSentenceByIndex = dual<
    (index: SentenceIndex) => (self: Document) => O.Option<Sentence>,
    (self: Document, index: SentenceIndex) => O.Option<Sentence>
  >(2, (doc: Document, index: SentenceIndex): O.Option<Sentence> => Chunk.get(doc.sentences, index));

  static readonly filterTokens = dual<
    (predicate: (token: Token) => boolean) => (self: Document) => Document,
    (self: Document, predicate: (token: Token) => boolean) => Document
  >(
    2,
    (doc: Document, predicate: (token: Token) => boolean): Document =>
      new Document({
        ...doc,
        tokens: Chunk.filter(doc.tokens, predicate),
      })
  );
  /**
   *
   * @param {Document} doc
   * @returns {Chunk<string>}
   */
  static readonly tokenTexts = (doc: Document): Chunk.Chunk<string> => Chunk.map(doc.tokens, (token) => token.text);

  /**
   *
   * @param {Document} doc
   * @returns {Chunk<string>}
   */
  static readonly sentenceTexts = (doc: Document): Chunk.Chunk<string> =>
    Chunk.map(doc.sentences, (sentence) => sentence.text);
}

/**
 * Core document model for NLP runtime services.
 *
 * @since 0.0.0
 * @module
 */

import { $NlpId } from "@beep/identity";
import { NonNegativeInt } from "@beep/schema";
import { Brand, Chunk, pipe, Result } from "effect";
import * as A from "effect/Array";
import { dual } from "effect/Function";
import type * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { Sentence, type SentenceIndex } from "./Sentence.ts";
import { Token, type TokenIndex } from "./Token.ts";

const $I = $NlpId.create("Core/Document");
const getRangeEnd = (options: { readonly end: number } | number): number =>
  P.isNumber(options) ? options : options.end;

/**
 * Branded identifier for NLP documents.
 *
 * @example
 * ```ts
 * import { DocumentId } from "@beep/nlp/Core/Document"
 *
 * console.log(DocumentId)
 * ```
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const DocumentId = S.NonEmptyString.pipe(
  S.brand("DocumentId"),
  S.annotate(
    $I.annote("DocumentId", {
      description: "Stable identifier for an NLP document.",
    })
  )
);

/**
 * Runtime type for {@link DocumentId}.
 *
 * @example
 * ```ts
 * import type { DocumentId } from "@beep/nlp/Core/Document"
 *
 * type Example = DocumentId
 * ```
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type DocumentId = typeof DocumentId.Type;

/**
 * Branded index for documents in ordered collections.
 *
 * @example
 * ```ts
 * import type { DocumentIndex } from "@beep/nlp/Core/Document"
 *
 * type Example = DocumentIndex
 * ```
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type DocumentIndex = Brand.Branded<NonNegativeInt, "DocumentIndex">;

/**
 * Constructor for {@link DocumentIndex}.
 *
 * @example
 * ```ts
 * import { documentIndex } from "@beep/nlp/Core/Document"
 *
 * console.log(documentIndex)
 * ```
 *
 * @since 0.0.0
 * @category Validation
 */
export const documentIndex: Brand.Constructor<DocumentIndex> = Brand.check<DocumentIndex>(
  S.makeFilter(S.is(NonNegativeInt))
);

/**
 * Schema for {@link DocumentIndex}.
 *
 * @example
 * ```ts
 * import { DocumentIndex } from "@beep/nlp/Core/Document"
 *
 * console.log(DocumentIndex)
 * ```
 *
 * @since 0.0.0
 * @category Validation
 */
export const DocumentIndex = NonNegativeInt.pipe(S.fromBrand("DocumentIndex", documentIndex));

const rebuildSentence = (sentence: Sentence, sentenceTokens: A.NonEmptyReadonlyArray<Token>) => {
  const [firstToken, ...remainingTokens] = sentenceTokens;
  const lastToken = A.reduce(remainingTokens, firstToken, (_, token) => token);

  return Result.succeed(
    new Sentence({
      end: lastToken.index,
      importance: sentence.importance,
      index: sentence.index,
      markedUpText: sentence.markedUpText,
      negationFlag: sentence.negationFlag,
      sentiment: sentence.sentiment,
      start: firstToken.index,
      text: sentence.text,
      tokens: Chunk.fromIterable(sentenceTokens),
    })
  );
};

const filterSentence = (predicate: (token: Token) => boolean) => (sentence: Sentence) =>
  pipe(
    Chunk.filter(sentence.tokens, predicate),
    Chunk.toReadonlyArray,
    A.match({
      onEmpty: () => Result.failVoid,
      onNonEmpty: (sentenceTokens) => rebuildSentence(sentence, sentenceTokens),
    })
  );

const filterDocument = (document: Document, predicate: (token: Token) => boolean): Document =>
  new Document({
    id: document.id,
    sentences: pipe(
      Chunk.toReadonlyArray(document.sentences),
      A.filterMap(filterSentence(predicate)),
      Chunk.fromIterable
    ),
    sentiment: document.sentiment,
    text: document.text,
    tokens: Chunk.filter(document.tokens, predicate),
  });

/**
 * Immutable NLP document model.
 *
 * @example
 * ```ts
 * import { Document } from "@beep/nlp/Core/Document"
 *
 * console.log(Document)
 * ```
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class Document extends S.Class<Document>($I`Document`)(
  {
    id: DocumentId,
    text: S.String,
    tokens: S.Chunk(Token),
    sentences: S.Chunk(Sentence),
    sentiment: S.OptionFromOptionalKey(S.Number),
  },
  $I.annote("Document", {
    description: "Immutable NLP document with token and sentence structure.",
  })
) {
  /**
   * Number of tokens in the document.
   */
  get tokenCount(): number {
    return Chunk.size(this.tokens);
  }

  /**
   * Number of sentences in the document.
   */
  get sentenceCount(): number {
    return Chunk.size(this.sentences);
  }

  /**
   * Number of characters in the source text.
   */
  get characterCount(): number {
    return Str.length(this.text);
  }

  /**
   * Get tokens overlapping a character range.
   */
  static readonly getTokensInRange: {
    (document: Document, start: number, options: { readonly end: number }): Chunk.Chunk<Token>;
    (start: number, options: { readonly end: number }): (document: Document) => Chunk.Chunk<Token>;
  } = dual(3, (document: Document, start: number, options: { readonly end: number }): Chunk.Chunk<Token> => {
    const end = getRangeEnd(options);
    return Chunk.filter(document.tokens, (token) => token.start < end && token.end > start);
  });

  /**
   * Safely get a token by zero-based index.
   */
  static readonly getToken: {
    (document: Document, index: number): O.Option<Token>;
    (index: number): (document: Document) => O.Option<Token>;
  } = dual(2, (document: Document, index: number): O.Option<Token> => Chunk.get(document.tokens, index));

  /**
   * Safely get a token by branded token index.
   */
  static readonly getTokenByIndex: {
    (document: Document, index: TokenIndex): O.Option<Token>;
    (index: TokenIndex): (document: Document) => O.Option<Token>;
  } = dual(
    2,
    (document: Document, index: TokenIndex): O.Option<Token> =>
      A.findFirst(Chunk.toReadonlyArray(document.tokens), (token) => token.index === index)
  );

  /**
   * Safely get a sentence by zero-based index.
   */
  static readonly getSentence: {
    (document: Document, index: number): O.Option<Sentence>;
    (index: number): (document: Document) => O.Option<Sentence>;
  } = dual(2, (document: Document, index: number): O.Option<Sentence> => Chunk.get(document.sentences, index));

  /**
   * Safely get a sentence by branded sentence index.
   */
  static readonly getSentenceByIndex: {
    (document: Document, index: SentenceIndex): O.Option<Sentence>;
    (index: SentenceIndex): (document: Document) => O.Option<Sentence>;
  } = dual(
    2,
    (document: Document, index: SentenceIndex): O.Option<Sentence> =>
      A.findFirst(Chunk.toReadonlyArray(document.sentences), (sentence) => sentence.index === index)
  );

  /**
   * Filter the token collection.
   */
  static readonly filterTokens: {
    (document: Document, predicate: (token: Token) => boolean): Document;
    (predicate: (token: Token) => boolean): (document: Document) => Document;
  } = dual(2, filterDocument);

  /**
   * Extract token texts in order.
   */
  static readonly tokenTexts = (document: Document): Chunk.Chunk<string> =>
    Chunk.map(document.tokens, (token) => token.text);

  /**
   * Extract sentence texts in order.
   */
  static readonly sentenceTexts = (document: Document): Chunk.Chunk<string> =>
    Chunk.map(document.sentences, (sentence) => sentence.text);
}

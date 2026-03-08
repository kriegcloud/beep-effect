/**
 * Core Document Model
 * Effect-native data type with unique symbol typeId and formal dual API + pipeable interface
 * @since 3.0.0
 */

import {
  Schema,
  type Brand,
  Chunk,
  type Option,
  pipe,
  Data,
  Function,
} from "effect";
import type { TokenIndex } from "./Token.js";
import type { SentenceIndex } from "./Sentence.js";
import { Token } from "./Token.js";
import { Sentence } from "./Sentence.js";

/**
 * Branded document ID
 */
export type DocumentId = string & Brand.Brand<"DocumentId">;
export const DocumentId = Schema.String.pipe(Schema.brand("DocumentId"));

/**
 * Document type with unique symbol typeId and pipeable interface
 */
export interface Document {
  readonly [Document.TypeId]?: Document.TypeId;
  readonly id: DocumentId;
  readonly text: Schema.Schema.Type<typeof Schema.String>;
  readonly tokens: Chunk.Chunk<Token>;
  readonly sentences: Chunk.Chunk<Sentence>;
  readonly sentiment: Option.Option<number>;
}

/**
 * Document namespace with typeId, constructor, and dual API functions
 */
export namespace Document {
  export declare const TypeId: unique symbol;
  export type TypeId = typeof TypeId;

  /**
   * Document constructor using Data.case for simple, pipeable API
   */
  export const make = Data.case<Document>();

  /**
   * Document schema for validation and serialization
   */
  export const schema = Schema.Struct({
    id: DocumentId,
    text: Schema.String,
    tokens: Schema.Chunk(Token.schema), // Now properly typed with Token schema
    sentences: Schema.Chunk(Sentence.schema), // Now properly typed with Sentence schema
    sentiment: Schema.Option(Schema.Number),
  });

  /**
   * Get token count - dual API (data-first and data-last)
   */
  export const tokenCount = (doc: Document): number => Chunk.size(doc.tokens);

  /**
   * Get sentence count - dual API (data-first and data-last)
   */
  export const sentenceCount = (doc: Document): number =>
    Chunk.size(doc.sentences);

  /**
   * Get character count - dual API (data-first and data-last)
   */
  export const characterCount = (doc: Document): number => doc.text.length;

  /**
   * Get tokens by character range - dual API (data-first and data-last)
   */
  export const getTokensInRange = Function.dual<
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

  /**
   * Get token by index (safe) - dual API (data-first and data-last)
   */
  export const getToken = Function.dual<
    (index: number) => (self: Document) => Option.Option<Token>,
    (self: Document, index: number) => Option.Option<Token>
  >(
    2,
    (doc: Document, index: number): Option.Option<Token> =>
      Chunk.get(doc.tokens, index)
  );

  /**
   * Get token by branded index - dual API (data-first and data-last)
   */
  export const getTokenByIndex = Function.dual<
    (index: TokenIndex) => (self: Document) => Option.Option<Token>,
    (self: Document, index: TokenIndex) => Option.Option<Token>
  >(
    2,
    (doc: Document, index: TokenIndex): Option.Option<Token> =>
      Chunk.get(doc.tokens, index)
  );

  /**
   * Get sentence by index (safe) - dual API (data-first and data-last)
   */
  export const getSentence = Function.dual<
    (index: number) => (self: Document) => Option.Option<Sentence>,
    (self: Document, index: number) => Option.Option<Sentence>
  >(
    2,
    (doc: Document, index: number): Option.Option<Sentence> =>
      Chunk.get(doc.sentences, index)
  );

  /**
   * Get sentence by branded index - dual API (data-first and data-last)
   */
  export const getSentenceByIndex = Function.dual<
    (index: SentenceIndex) => (self: Document) => Option.Option<Sentence>,
    (self: Document, index: SentenceIndex) => Option.Option<Sentence>
  >(
    2,
    (doc: Document, index: SentenceIndex): Option.Option<Sentence> =>
      Chunk.get(doc.sentences, index)
  );

  /**
   * Update tokens (returns new document) - dual API (data-first and data-last)
   */
  export const withTokens = Function.dual<
    (tokens: Chunk.Chunk<Token>) => (self: Document) => Document,
    (self: Document, tokens: Chunk.Chunk<Token>) => Document
  >(
    2,
    (doc: Document, tokens: Chunk.Chunk<Token>): Document =>
      make({ ...doc, tokens })
  );

  /**
   * Update sentences (returns new document) - dual API (data-first and data-last)
   */
  export const withSentences = Function.dual<
    (sentences: Chunk.Chunk<Sentence>) => (self: Document) => Document,
    (self: Document, sentences: Chunk.Chunk<Sentence>) => Document
  >(
    2,
    (doc: Document, sentences: Chunk.Chunk<Sentence>): Document =>
      make({ ...doc, sentences })
  );

  /**
   * Update sentiment (returns new document) - dual API (data-first and data-last)
   */
  export const withSentiment = Function.dual<
    (sentiment: Option.Option<number>) => (self: Document) => Document,
    (self: Document, sentiment: Option.Option<number>) => Document
  >(
    2,
    (doc: Document, sentiment: Option.Option<number>): Document =>
      make({ ...doc, sentiment })
  );

  /**
   * Filter tokens by predicate - dual API (data-first and data-last)
   */
  export const filterTokens = Function.dual<
    (predicate: (token: Token) => boolean) => (self: Document) => Document,
    (self: Document, predicate: (token: Token) => boolean) => Document
  >(
    2,
    (doc: Document, predicate: (token: Token) => boolean): Document =>
      make({
        ...doc,
        tokens: Chunk.filter(doc.tokens, predicate),
      })
  );

  /**
   * Get all token texts - dual API (data-first and data-last)
   */
  export const tokenTexts = (doc: Document): Chunk.Chunk<string> =>
    Chunk.map(doc.tokens, (token) => token.text);

  /**
   * Get all sentence texts - dual API (data-first and data-last)
   */
  export const sentenceTexts = (doc: Document): Chunk.Chunk<string> =>
    Chunk.map(doc.sentences, (sentence) => sentence.text);
}

/**
 * Document helpers - kept for backward compatibility
 * @deprecated Use Document namespace functions instead
 */
export const DocumentHelpers = {
  tokenCount: Document.tokenCount,
  sentenceCount: Document.sentenceCount,
  characterCount: Document.characterCount,
  getTokensInRange: (doc: Document, start: number, end: number) =>
    Document.getTokensInRange(start, end)(doc),
  getToken: (doc: Document, index: number) => Document.getToken(index)(doc),
  getTokenByIndex: (doc: Document, index: TokenIndex) =>
    Document.getTokenByIndex(index)(doc),
  getSentence: (doc: Document, index: number) =>
    Document.getSentence(index)(doc),
  getSentenceByIndex: (doc: Document, index: SentenceIndex) =>
    Document.getSentenceByIndex(index)(doc),
  withTokens: (doc: Document, tokens: Chunk.Chunk<Token>) =>
    Document.withTokens(tokens)(doc),
  withSentences: (doc: Document, sentences: Chunk.Chunk<Sentence>) =>
    Document.withSentences(sentences)(doc),
  withSentiment: (doc: Document, sentiment: Option.Option<number>) =>
    Document.withSentiment(sentiment)(doc),
};

import type { Chunk} from "effect";
import { Context, Data, Effect } from "effect";
import type { Document, DocumentId } from "./Document.js";
import type { Sentence } from "./Sentence.js";
import type { Token } from "./Token.js";

export class TokenizationError extends Data.TaggedError("TokenizationError")<{
  readonly operation: string;
  readonly cause: unknown;
}> {}

export interface Tokenization {
  readonly tokenize: (
    text: string
  ) => Effect.Effect<Chunk.Chunk<Token>, TokenizationError>;
  readonly sentences: (
    text: string
  ) => Effect.Effect<Chunk.Chunk<Sentence>, TokenizationError>;
  readonly document: (
    text: string,
    id?: DocumentId | string
  ) => Effect.Effect<Document, TokenizationError>;
  readonly tokenCount: (
    text: string
  ) => Effect.Effect<number, TokenizationError>;
}

export const Tokenization = Context.GenericTag<Tokenization>(
  "effect-nlp/Tokenization"
);

export const tokenize = (text: string) =>
  Effect.flatMap(Tokenization, (service) => service.tokenize(text));

export const sentences = (text: string) =>
  Effect.flatMap(Tokenization, (service) => service.sentences(text));

export const tokenizeToDocument = (text: string, id?: DocumentId | string) =>
  Effect.flatMap(Tokenization, (service) => service.document(text, id));

export const tokenCount = (text: string) =>
  Effect.flatMap(Tokenization, (service) => service.tokenCount(text));

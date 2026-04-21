/**
 * Tokenization service contract.
 *
 * @since 0.0.0
 * @module
 */

import { $NlpId } from "@beep/identity";
import { TaggedErrorClass } from "@beep/schema";
import { Context, Effect } from "effect";
import * as S from "effect/Schema";
import type { Document, DocumentId } from "./Document.ts";
import type { Sentence } from "./Sentence.ts";
import type { Token } from "./Token.ts";

const $I = $NlpId.create("Core/Tokenization");

type TokenizationShape = {
  readonly tokenize: (text: string) => Effect.Effect<ReadonlyArray<Token>, TokenizationError>;
  readonly sentences: (text: string) => Effect.Effect<ReadonlyArray<Sentence>, TokenizationError>;
  readonly document: (text: string, id?: DocumentId | string) => Effect.Effect<Document, TokenizationError>;
  readonly tokenCount: (text: string) => Effect.Effect<number, TokenizationError>;
};

/**
 * Tokenization error.
 *
 * @since 0.0.0
 * @category Errors
 */
export class TokenizationError extends TaggedErrorClass<TokenizationError>($I`TokenizationError`)(
  "TokenizationError",
  {
    cause: S.Unknown,
    operation: S.String,
  },
  $I.annote("TokenizationError", {
    description: "Failure raised by an NLP tokenization service.",
  })
) {}

/**
 * Tokenization service.
 *
 * @since 0.0.0
 * @category Services
 */
export class Tokenization extends Context.Service<Tokenization, TokenizationShape>()($I`Tokenization`) {}

/**
 * Tokenize text into tokens using the configured service.
 *
 * @since 0.0.0
 * @category Accessors
 */
export const tokenize = Effect.fn("Nlp.Core.Tokenization.tokenize")(function* (text: string) {
  const tokenization = yield* Tokenization;
  return yield* tokenization.tokenize(text);
});

/**
 * Split text into sentences using the configured service.
 *
 * @since 0.0.0
 * @category Accessors
 */
export const sentences = Effect.fn("Nlp.Core.Tokenization.sentences")(function* (text: string) {
  const tokenization = yield* Tokenization;
  return yield* tokenization.sentences(text);
});

/**
 * Build a document using the configured service.
 *
 * @since 0.0.0
 * @category Accessors
 */
export const tokenizeToDocument = Effect.fn("Nlp.Core.Tokenization.tokenizeToDocument")(function* (
  text: string,
  id?: DocumentId | string
) {
  const tokenization = yield* Tokenization;
  return yield* tokenization.document(text, id);
});

/**
 * Count tokens using the configured service.
 *
 * @since 0.0.0
 * @category Accessors
 */
export const tokenCount = Effect.fn("Nlp.Core.Tokenization.tokenCount")(function* (text: string) {
  const tokenization = yield* Tokenization;
  return yield* tokenization.tokenCount(text);
});

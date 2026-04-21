/**
 * Text completion request/response schemas.
 *
 * @module
 * @since 0.1.0
 */
import { $GraphSchemaId } from "@beep/identity";
import * as S from "effect/Schema";

import { TgError } from "./Primitives.ts";

const $I = $GraphSchemaId.create("TextCompletion");

/**
 * Request payload for text completion generation.
 *
 * @since 0.1.0
 * @category models
 */
export class TextCompletionRequest extends S.Class<TextCompletionRequest>($I`TextCompletionRequest`)({
  system: S.String.annotateKey({
    description: "System prompt supplied to the language model.",
  }),
  prompt: S.String.annotateKey({
    description: "User prompt supplied to the language model.",
  }),
  model: S.OptionFromOptionalKey(S.String).annotateKey({
    description: "Optional model override for the completion request.",
  }),
  temperature: S.OptionFromOptionalKey(S.Number).annotateKey({
    description: "Optional sampling temperature for the completion.",
  }),
  streaming: S.OptionFromOptionalKey(S.Boolean).annotateKey({
    description: "Whether the caller wants streamed completion chunks.",
  }),
}, $I.annote("TextCompletionRequest", {
  description: "Request payload for text completion generation.",
})) {}

/**
 * Response payload for text completion generation.
 *
 * @since 0.1.0
 * @category models
 */
export class TextCompletionResponse extends S.Class<TextCompletionResponse>($I`TextCompletionResponse`)({
  response: S.String.annotateKey({
    description: "Completion text returned by the language model.",
  }),
  model: S.OptionFromOptionalKey(S.String).annotateKey({
    description: "Model identifier used for the completion.",
  }),
  inToken: S.OptionFromOptionalKey(S.Number).annotateKey({
    description: "Prompt token count when provided by the model runtime.",
  }),
  outToken: S.OptionFromOptionalKey(S.Number).annotateKey({
    description: "Completion token count when provided by the model runtime.",
  }),
  error: S.OptionFromOptionalKey(TgError).annotateKey({
    description: "Embedded error payload when completion generation fails.",
  }),
  endOfStream: S.OptionFromOptionalKey(S.Boolean).annotateKey({
    description: "Streaming sentinel indicating the final response chunk.",
  }),
}, $I.annote("TextCompletionResponse", {
  description: "Response payload for text completion generation.",
})) {}

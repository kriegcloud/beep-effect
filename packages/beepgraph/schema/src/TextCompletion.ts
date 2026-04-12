/**
 * Text completion request/response schemas.
 *
 * @module
 * @since 0.1.0
 */
import { Schema } from "effect";

import { TgError } from "./Primitives.ts";

export const TextCompletionRequest = Schema.Struct({
  system: Schema.String,
  prompt: Schema.String,
  model: Schema.optionalKey(Schema.String),
  temperature: Schema.optionalKey(Schema.Number),
  streaming: Schema.optionalKey(Schema.Boolean),
});

export type TextCompletionRequest = typeof TextCompletionRequest.Type;

export const TextCompletionResponse = Schema.Struct({
  response: Schema.String,
  model: Schema.optionalKey(Schema.String),
  inToken: Schema.optionalKey(Schema.Number),
  outToken: Schema.optionalKey(Schema.Number),
  error: Schema.optionalKey(TgError),
  endOfStream: Schema.optionalKey(Schema.Boolean),
});

export type TextCompletionResponse = typeof TextCompletionResponse.Type;

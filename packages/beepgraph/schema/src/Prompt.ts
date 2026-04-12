/**
 * Prompt template request/response schemas.
 *
 * @module
 * @since 0.1.0
 */
import { Schema } from "effect";

import { TgError } from "./Primitives.ts";

export const PromptRequest = Schema.Struct({
  name: Schema.String,
  variables: Schema.optionalKey(Schema.Record(Schema.String, Schema.String)),
});

export type PromptRequest = typeof PromptRequest.Type;

export const PromptResponse = Schema.Struct({
  system: Schema.String,
  prompt: Schema.String,
  error: Schema.optionalKey(TgError),
});

export type PromptResponse = typeof PromptResponse.Type;

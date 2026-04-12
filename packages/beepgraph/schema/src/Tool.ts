/**
 * MCP tool invocation request/response schemas.
 *
 * @module
 * @since 0.1.0
 */
import { Schema } from "effect";

import { TgError } from "./Primitives.ts";

export const ToolRequest = Schema.Struct({
  name: Schema.String,
  parameters: Schema.String,
});

export type ToolRequest = typeof ToolRequest.Type;

export const ToolResponse = Schema.Struct({
  error: Schema.optionalKey(TgError),
  text: Schema.optionalKey(Schema.String),
  object: Schema.optionalKey(Schema.String),
});

export type ToolResponse = typeof ToolResponse.Type;

/**
 * Flow management request/response schemas.
 *
 * Flow messages carry arbitrary key/value pairs on the wire (kebab-case
 * field names). The schemas define the known fields; additional properties
 * pass through at the JSON level.
 *
 * @module
 * @since 0.1.0
 */
import { Schema } from "effect";

import { TgError } from "./Primitives.ts";

export const FlowRequest = Schema.Struct({
  operation: Schema.String,
});

export type FlowRequest = typeof FlowRequest.Type;

export const FlowResponse = Schema.Struct({
  error: Schema.optionalKey(TgError),
});

export type FlowResponse = typeof FlowResponse.Type;

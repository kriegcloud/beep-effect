/**
 * Configuration service request/response schemas.
 *
 * @module
 * @since 0.1.0
 */
import { Schema } from "effect";

import { TgError } from "./Primitives.ts";

export const ConfigOperation = Schema.Literals(["get", "list", "delete", "put", "config", "getvalues"]);

export type ConfigOperation = typeof ConfigOperation.Type;

export const ConfigRequest = Schema.Struct({
  operation: ConfigOperation,
  keys: Schema.optionalKey(Schema.Array(Schema.String)),
  values: Schema.optionalKey(Schema.Record(Schema.String, Schema.Unknown)),
  type: Schema.optionalKey(Schema.String),
});

export type ConfigRequest = typeof ConfigRequest.Type;

export const ConfigResponse = Schema.Struct({
  version: Schema.optionalKey(Schema.Number),
  values: Schema.optionalKey(Schema.Record(Schema.String, Schema.Unknown)),
  directory: Schema.optionalKey(Schema.Array(Schema.String)),
  config: Schema.optionalKey(Schema.Record(Schema.String, Schema.Unknown)),
  error: Schema.optionalKey(TgError),
});

export type ConfigResponse = typeof ConfigResponse.Type;

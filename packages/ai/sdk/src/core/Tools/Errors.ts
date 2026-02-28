import * as Schema from "effect/Schema";

/**
 * Tool name was not found in the toolkit.
 */
export class ToolNotFoundError extends Schema.TaggedErrorClass<ToolNotFoundError>()("ToolNotFoundError", {
  name: Schema.String,
  available: Schema.Array(Schema.String),
}) {
  static readonly make = (params: Pick<ToolNotFoundError, "name" | "available">) => new ToolNotFoundError(params);
}

/**
 * Tool parameters failed decoding or validation.
 */
export class ToolInputError extends Schema.TaggedErrorClass<ToolInputError>()("ToolInputError", {
  name: Schema.String,
  message: Schema.String,
  input: Schema.optional(Schema.Unknown),
  cause: Schema.optional(Schema.Defect),
}) {
  static readonly make = (params: Pick<ToolInputError, "name" | "message" | "input" | "cause">) =>
    new ToolInputError(params);
}

/**
 * Tool output failed validation or encoding.
 */
export class ToolOutputError extends Schema.TaggedErrorClass<ToolOutputError>()("ToolOutputError", {
  name: Schema.String,
  message: Schema.String,
  output: Schema.optional(Schema.Unknown),
  cause: Schema.optional(Schema.Defect),
}) {
  static readonly make = (params: Pick<ToolOutputError, "name" | "message" | "output" | "cause">) =>
    new ToolOutputError(params);
}

/**
 * Union of all tool-related errors.
 */
export const ToolError = Schema.Union([ToolNotFoundError, ToolInputError, ToolOutputError]);

export type ToolError = typeof ToolError.Type;
export type ToolErrorEncoded = typeof ToolError.Encoded;

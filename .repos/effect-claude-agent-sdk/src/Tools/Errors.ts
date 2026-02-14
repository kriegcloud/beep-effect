import * as Schema from "effect/Schema"

/**
 * Tool name was not found in the toolkit.
 */
export class ToolNotFoundError extends Schema.TaggedError<ToolNotFoundError>()(
  "ToolNotFoundError",
  {
    name: Schema.String,
    available: Schema.Array(Schema.String)
  }
) {}

/**
 * Tool parameters failed decoding or validation.
 */
export class ToolInputError extends Schema.TaggedError<ToolInputError>()(
  "ToolInputError",
  {
    name: Schema.String,
    message: Schema.String,
    input: Schema.optional(Schema.Unknown),
    cause: Schema.optional(Schema.Defect)
  }
) {}

/**
 * Tool output failed validation or encoding.
 */
export class ToolOutputError extends Schema.TaggedError<ToolOutputError>()(
  "ToolOutputError",
  {
    name: Schema.String,
    message: Schema.String,
    output: Schema.optional(Schema.Unknown),
    cause: Schema.optional(Schema.Defect)
  }
) {}

/**
 * Union of all tool-related errors.
 */
export const ToolError = Schema.Union(
  ToolNotFoundError,
  ToolInputError,
  ToolOutputError
)

export type ToolError = typeof ToolError.Type
export type ToolErrorEncoded = typeof ToolError.Encoded

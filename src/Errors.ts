import * as Schema from "effect/Schema"
import { SandboxError } from "./Sandbox/SandboxError.js"
export { SandboxError } from "./Sandbox/SandboxError.js"

/**
 * Configuration loading or validation failure.
 */
export class ConfigError extends Schema.TaggedError<ConfigError>()(
  "ConfigError",
  {
    message: Schema.String,
    cause: Schema.optional(Schema.Defect)
  }
) {}

/**
 * Failure while decoding or validating SDK payloads.
 */
export class DecodeError extends Schema.TaggedError<DecodeError>()(
  "DecodeError",
  {
    message: Schema.String,
    input: Schema.optional(Schema.Unknown),
    cause: Schema.optional(Schema.Defect)
  }
) {}

/**
 * Errors originating from the underlying SDK transport or process.
 */
export class TransportError extends Schema.TaggedError<TransportError>()(
  "TransportError",
  {
    message: Schema.String,
    cause: Schema.optional(Schema.Defect)
  }
) {}

/**
 * Failure while executing hook callbacks.
 */
export class HookError extends Schema.TaggedError<HookError>()(
  "HookError",
  {
    message: Schema.String,
    cause: Schema.optional(Schema.Defect)
  }
) {}

/**
 * Errors produced by MCP tool wrappers.
 */
export class McpError extends Schema.TaggedError<McpError>()(
  "McpError",
  {
    message: Schema.String,
    cause: Schema.optional(Schema.Defect)
  }
) {}

/**
 * Union of all public errors for the Effect wrapper.
 */
export const AgentSdkError = Schema.Union(
  ConfigError,
  DecodeError,
  TransportError,
  HookError,
  McpError,
  SandboxError
)

export type AgentSdkError = typeof AgentSdkError.Type
export type AgentSdkErrorEncoded = typeof AgentSdkError.Encoded

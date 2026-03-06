import { $AiSdkId } from "@beep/identity/packages";
import { TaggedErrorClass } from "@beep/schema";
import * as S from "effect/Schema";
import { QuerySupervisorError } from "./QuerySupervisorError.js";
import { SandboxError } from "./Sandbox/index.js";

const $I = $AiSdkId.create("core/Errors");

/**
 * Configuration loading or validation failure.
 */
/**
 * @since 0.0.0
 */
export class ConfigError extends TaggedErrorClass<ConfigError>($I`ConfigError`)(
  "ConfigError",
  {
    message: S.String,
    cause: S.optional(S.DefectWithStack),
  },
  $I.annote("ConfigError", {
    description: "Raised when configuration loading or validation fails.",
  })
) {
  static readonly make = (params: Omit<(typeof ConfigError)["Encoded"], "_tag">) => new ConfigError(params);
}

/**
 * Failure while decoding or validating SDK payloads.
 */
/**
 * @since 0.0.0
 */
export class DecodeError extends TaggedErrorClass<DecodeError>($I`DecodeError`)(
  "DecodeError",
  {
    message: S.String,
    input: S.optional(S.Unknown),
    cause: S.optional(S.DefectWithStack),
  },
  $I.annote("DecodeError", {
    description: "Raised when decoding or validation of SDK payloads fails.",
  })
) {
  static readonly make = (params: Pick<DecodeError, "message" | "input" | "cause">) => new DecodeError(params);
}

/**
 * Errors originating from the underlying SDK transport or process.
 */
/**
 * @since 0.0.0
 */
export class TransportError extends TaggedErrorClass<TransportError>($I`TransportError`)(
  "TransportError",
  {
    message: S.String,
    cause: S.optional(S.DefectWithStack),
  },
  $I.annote("TransportError", {
    description: "Raised when there's an error with the SDK transport or process.",
  })
) {
  static readonly make = (message: string, cause?: unknown) =>
    new TransportError({
      message,
      cause,
    });
}

/**
 * Failure while executing hook callbacks.
 */
/**
 * @since 0.0.0
 */
export class HookError extends TaggedErrorClass<HookError>($I`HookError`)(
  "HookError",
  {
    message: S.String,
    cause: S.optional(S.DefectWithStack),
  },
  $I.annote("HookError", {
    description: "Raised when there's an error executing hook callbacks.",
  })
) {}

/**
 * Errors produced by MCP tool wrappers.
 */
/**
 * @since 0.0.0
 */
export class McpError extends TaggedErrorClass<McpError>($I`McpError`)(
  "McpError",
  {
    message: S.String,
    cause: S.optional(S.DefectWithStack),
  },
  $I.annote("McpError", {
    description: "Raised when there's an error with MCP tool wrappers.",
  })
) {
  static readonly make = (params: Pick<McpError, "message" | "cause">) => new McpError(params);
}

/**
 * Union of all public errors for the Effect wrapper.
 */
/**
 * @since 0.0.0
 */
export const AgentSdkError = S.Union([
  ConfigError,
  DecodeError,
  TransportError,
  HookError,
  McpError,
  SandboxError,
  QuerySupervisorError,
]).annotate(
  $I.annote("AgentsSdkError", {
    description: "Union of all public errors for the Effect wrapper.",
  })
);

/**
 * @since 0.0.0
 */
export type AgentSdkError = typeof AgentSdkError.Type;
/**
 * @since 0.0.0
 */
export type AgentSdkErrorEncoded = typeof AgentSdkError.Encoded;

/**
 * @since 0.0.0
 */
export * from "./Sandbox/index.js";

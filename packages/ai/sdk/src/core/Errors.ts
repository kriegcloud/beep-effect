import * as S from "effect/Schema";
import {$AiSdkId} from "@beep/identity/packages";
import {SandboxError} from "./Sandbox/index.js";
import {QuerySupervisorError} from "./QuerySupervisorError.js";

const $I = $AiSdkId.create("core/Errors");


/**
 * Configuration loading or validation failure.
 */
export class ConfigError extends S.TaggedErrorClass<ConfigError>($I`ConfigError`)(
	"ConfigError",
	{
		message: S.String,
		cause: S.optional(S.DefectWithStack)
	},
	$I.annote(
		"ConfigError",
		{
			description: "Raised when configuration loading or validation fails."
		}
	)
) {
	static readonly make = (params: Omit<typeof ConfigError["Encoded"], "_tag">) => new ConfigError(params);
}

/**
 * Failure while decoding or validating SDK payloads.
 */
export class DecodeError extends S.TaggedErrorClass<DecodeError>($I`DecodeError`)(
	"DecodeError",
	{
		message: S.String,
		input: S.optional(S.Unknown),
		cause: S.optional(S.DefectWithStack)
	},
	$I.annote(
		"DecodeError",
		{
			description: "Raised when decoding or validation of SDK payloads fails."
		}
	)
) {
	static readonly make = (params: Pick<DecodeError, "message" | "input" | "cause">) => new DecodeError(params);
}

/**
 * Errors originating from the underlying SDK transport or process.
 */
export class TransportError extends S.TaggedErrorClass<TransportError>($I`TransportError`)(
	"TransportError",
	{
		message: S.String,
		cause: S.optional(S.DefectWithStack)
	},
	$I.annote(
		"TransportError",
		{
			description: "Raised when there's an error with the SDK transport or process."
		}
	)
) {
	static readonly make = (
		message: string,
		cause?: unknown
	) => new TransportError({
		message,
		cause
	});
}

/**
 * Failure while executing hook callbacks.
 */
export class HookError extends S.TaggedErrorClass<HookError>($I`HookError`)(
	"HookError",
	{
		message: S.String,
		cause: S.optional(S.DefectWithStack)
	},
	$I.annote(
		"HookError",
		{
			description: "Raised when there's an error executing hook callbacks."
		}
	)
) {
}

/**
 * Errors produced by MCP tool wrappers.
 */
export class McpError extends S.TaggedErrorClass<McpError>($I`McpError`)(
	"McpError",
	{
		message: S.String,
		cause: S.optional(S.DefectWithStack)
	},
	$I.annote(
		"McpError",
		{
			description: "Raised when there's an error with MCP tool wrappers."
		}
	)
) {
	static readonly make = (params: Pick<McpError, "message" | "cause">) => new McpError(params);
}

/**
 * Union of all public errors for the Effect wrapper.
 */
export const AgentSdkError = S.Union([
	ConfigError,
	DecodeError,
	TransportError,
	HookError,
	McpError,
	SandboxError,
	QuerySupervisorError
])
.pipe(
	S.toTaggedUnion("_tag"),
	S.annotate($I.annote(
		"AgentsSdkError",
		{
			description: "Union of all public errors for the Effect wrapper."
		}
	))
);

export type AgentSdkError = typeof AgentSdkError.Type
export type AgentSdkErrorEncoded = typeof AgentSdkError.Encoded


export {SandboxError};
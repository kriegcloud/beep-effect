/**
 * @file Error types for docgen agent operations.
 *
 * Defines all tagged error types used by the agent system.
 * Uses Effect Schema TaggedError for type-safe error handling.
 *
 * @module docgen/agents/errors
 * @since 1.0.0
 */
import * as S from "effect/Schema";

// -----------------------------------------------------------------------------
// Cause Chain Support
// -----------------------------------------------------------------------------

/**
 * Base schema fields for cause chain support.
 * Include in all TaggedError definitions.
 */
const CauseFields = {
  /** Original error that caused this one */
  underlyingCause: S.optional(S.Unknown),
  /** Stack trace at point of error creation */
  stack: S.optional(S.String),
  /** Operation that was being performed */
  operation: S.optional(S.String),
};

/**
 * Helper to create errors with cause chains for better error tracking.
 *
 * @example
 * ```ts
 * import { withCause, AgentApiError } from "@beep/repo-cli/commands/docgen/agents/errors"
 *
 * const originalError = new Error("Network timeout")
 * const apiError = new AgentApiError({ message: "Failed to call API" })
 * const errorWithCause = withCause(apiError, originalError)
 * ```
 *
 * @category utilities
 * @since 0.1.0
 */
export const withCause = <E extends { underlyingCause?: unknown }>(error: E, cause: unknown): E => ({
  ...error,
  underlyingCause: cause,
  stack: new Error().stack,
});

/**
 * Error when agent API communication fails.
 *
 * @example
 * ```typescript
 * import { AgentApiError } from "./errors.js"
 *
 * const error = new AgentApiError({
 *   message: "Rate limit exceeded",
 *   cause: new Error("429 Too Many Requests"),
 * })
 * ```
 *
 * @category errors
 * @since 0.1.0
 */
export class AgentApiError extends S.TaggedError<AgentApiError>()("AgentApiError", {
  message: S.String,
  cause: S.optional(S.Unknown),
  ...CauseFields,
}) {
  /** Format for display */
  get displayMessage(): string {
    return `API error: ${this.message}`;
  }
}

/**
 * Error when tool execution fails within an agent.
 *
 * @example
 * ```typescript
 * import { AgentToolError } from "./errors.js"
 *
 * const error = new AgentToolError({
 *   toolName: "ReadSourceFile",
 *   message: "File not found",
 *   cause: new Error("ENOENT"),
 * })
 * ```
 *
 * @category errors
 * @since 0.1.0
 */
export class AgentToolError extends S.TaggedError<AgentToolError>()("AgentToolError", {
  toolName: S.String,
  message: S.String,
  cause: S.optional(S.Unknown),
  ...CauseFields,
}) {
  /** Format for display */
  get displayMessage(): string {
    return `Tool ${this.toolName} failed: ${this.message}`;
  }
}

/**
 * Error when agent produces invalid output.
 *
 * @example
 * ```typescript
 * import { AgentOutputError } from "./errors.js"
 *
 * const error = new AgentOutputError({
 *   message: "Expected JSON but got text",
 *   output: "This is not JSON",
 * })
 * ```
 *
 * @category errors
 * @since 0.1.0
 */
export class AgentOutputError extends S.TaggedError<AgentOutputError>()("AgentOutputError", {
  message: S.String,
  output: S.Unknown,
  ...CauseFields,
}) {
  /** Format for display */
  get displayMessage(): string {
    return `Agent output error: ${this.message}`;
  }
}

/**
 * Error when agent exceeds iteration limit.
 *
 * @example
 * ```typescript
 * import { AgentIterationLimitError } from "./errors.js"
 *
 * const error = new AgentIterationLimitError({
 *   packageName: "@beep/schema",
 *   iterations: 20,
 *   maxIterations: 20,
 * })
 * ```
 *
 * @category errors
 * @since 0.1.0
 */
export class AgentIterationLimitError extends S.TaggedError<AgentIterationLimitError>()("AgentIterationLimitError", {
  packageName: S.String,
  iterations: S.Number,
  maxIterations: S.Number,
  ...CauseFields,
}) {
  /** Format for display */
  get displayMessage(): string {
    return `Agent exceeded ${this.maxIterations} iterations for ${this.packageName}`;
  }
}

/**
 * Union of all agent errors for Effect error channel typing.
 *
 * @example
 * ```ts
 * import type { AgentError } from "@beep/repo-cli/commands/docgen/agents/errors"
 * import * as Effect from "effect/Effect"
 *
 * const program: Effect.Effect<string, AgentError> = Effect.fail(
 *   new AgentApiError({ message: "API error" })
 * )
 * ```
 *
 * @category errors
 * @since 0.1.0
 */
export type AgentError = AgentApiError | AgentToolError | AgentOutputError | AgentIterationLimitError;

/**
 * Error schema for workflow-level failures.
 * Combines all possible errors that can occur during workflow execution.
 *
 * @example
 * ```ts
 * import { DocgenWorkflowError } from "@beep/repo-cli/commands/docgen/agents/errors"
 * import * as S from "effect/Schema"
 *
 * const errors = [
 *   new AgentApiError({ message: "Rate limit" }),
 *   new AgentToolError({ toolName: "ReadFile", message: "Not found" })
 * ]
 * ```
 *
 * @category schemas
 * @since 0.1.0
 */
export const DocgenWorkflowError = S.Union(AgentApiError, AgentToolError);

/**
 * Error when package analysis fails due to file parsing or access issues.
 *
 * @example
 * ```ts
 * import { AnalysisError } from "@beep/repo-cli/commands/docgen/agents/errors"
 *
 * const error = new AnalysisError({
 *   path: "src/index.ts",
 *   message: "Failed to parse TypeScript file"
 * })
 * ```
 *
 * @category errors
 * @since 0.1.0
 */
export class AnalysisError extends S.TaggedError<AnalysisError>()("AnalysisError", {
  path: S.String,
  message: S.String,
  ...CauseFields,
}) {
  /** Format for display */
  get displayMessage(): string {
    return `Analysis error at ${this.path}: ${this.message}`;
  }
}

/**
 * Error when a package cannot be found or resolved.
 *
 * @example
 * ```ts
 * import { PackageNotFoundError } from "@beep/repo-cli/commands/docgen/agents/errors"
 *
 * const error = new PackageNotFoundError({
 *   packageName: "@beep/schema",
 * })
 * ```
 *
 * @category errors
 * @since 0.1.0
 */
export class PackageNotFoundError extends S.TaggedError<PackageNotFoundError>()("PackageNotFoundError", {
  packageName: S.String,
  ...CauseFields,
}) {
  /** Format for display */
  get displayMessage(): string {
    return `Package not found: ${this.packageName}`;
  }
}

/**
 * @file Error types for docgen agent operations.
 *
 * Defines all tagged error types used by the agent system.
 * Uses Effect Schema TaggedError for type-safe error handling.
 *
 * @module docgen/agents/errors
 */
import * as S from "effect/Schema";

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
 * @category Errors
 * @since 0.1.0
 */
export class AgentApiError extends S.TaggedError<AgentApiError>()("AgentApiError", {
  message: S.String,
  cause: S.optional(S.Unknown),
}) {}

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
 * @category Errors
 * @since 0.1.0
 */
export class AgentToolError extends S.TaggedError<AgentToolError>()("AgentToolError", {
  toolName: S.String,
  message: S.String,
  cause: S.optional(S.Unknown),
}) {}

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
 * @category Errors
 * @since 0.1.0
 */
export class AgentOutputError extends S.TaggedError<AgentOutputError>()("AgentOutputError", {
  message: S.String,
  output: S.Unknown,
}) {}

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
 * @category Errors
 * @since 0.1.0
 */
export class AgentIterationLimitError extends S.TaggedError<AgentIterationLimitError>()("AgentIterationLimitError", {
  packageName: S.String,
  iterations: S.Number,
  maxIterations: S.Number,
}) {}

/**
 * Union of all agent errors for Effect error channel typing.
 *
 * @category Errors
 * @since 0.1.0
 */
export type AgentError = AgentApiError | AgentToolError | AgentOutputError | AgentIterationLimitError;

/**
 * Error schema for workflow-level failures.
 * Combines all possible errors that can occur during workflow execution.
 *
 * @category Errors
 * @since 0.1.0
 */
export const DocgenWorkflowError = S.Union(AgentApiError, AgentToolError);

export class AnalysisError extends S.TaggedError<AnalysisError>()("AnalysisError", {
  path: S.String,
  message: S.String,
}) {}

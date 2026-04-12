/**
 * Pipeline domain errors.
 *
 * @module
 * @since 0.1.0
 */
import { Data } from "effect";

/**
 * Error raised during Graph RAG query execution.
 *
 * @since 0.1.0
 * @category errors
 */
export class GraphRagError extends Data.TaggedError("GraphRagError")<{
  readonly phase: string;
  readonly reason: string;
}> {}

/**
 * Error raised during Document RAG query execution.
 *
 * @since 0.1.0
 * @category errors
 */
export class DocumentRagError extends Data.TaggedError("DocumentRagError")<{
  readonly phase: string;
  readonly reason: string;
}> {}

/**
 * Error raised when the LLM returns an unexpected response.
 *
 * @since 0.1.0
 * @category errors
 */
export class LlmError extends Data.TaggedError("LlmError")<{
  readonly reason: string;
}> {}

/**
 * Error raised when prompt template lookup fails.
 *
 * @since 0.1.0
 * @category errors
 */
export class PromptNotFoundError extends Data.TaggedError("PromptNotFoundError")<{
  readonly name: string;
}> {}

/**
 * Reasoning errors for Knowledge slice
 *
 * Typed errors for RDFS/OWL reasoning operations.
 *
 * @module knowledge-domain/errors/reasoning
 * @since 0.1.0
 */
import { $KnowledgeDomainId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("errors/reasoning");

/**
 * Maximum reasoning depth exceeded
 *
 * @since 0.1.0
 * @category errors
 */
export class MaxDepthExceededError extends S.TaggedError<MaxDepthExceededError>($I`MaxDepthExceededError`)(
  "MaxDepthExceededError",
  {
    message: S.String,
    limit: S.Number,
    iterations: S.Number,
  },
  $I.annotations("MaxDepthExceededError", {
    description: "Reasoning depth limit exceeded to prevent infinite loops",
  })
) {}

/**
 * Maximum inferences limit exceeded
 *
 * @since 0.1.0
 * @category errors
 */
export class MaxInferencesExceededError extends S.TaggedError<MaxInferencesExceededError>(
  $I`MaxInferencesExceededError`
)(
  "MaxInferencesExceededError",
  {
    message: S.String,
    limit: S.Number,
    inferencesGenerated: S.Number,
  },
  $I.annotations("MaxInferencesExceededError", {
    description: "Maximum number of inferences exceeded",
  })
) {}

/**
 * Union of all reasoning error types
 *
 * @since 0.1.0
 * @category errors
 */
export class ReasoningError extends S.Union(
  MaxDepthExceededError,
  MaxInferencesExceededError
).annotations(
  $I.annotations("ReasoningError", {
    description: "Union of all reasoning error types",
  })
) {}

export declare namespace ReasoningError {
  export type Type = typeof ReasoningError.Type;
  export type Encoded = typeof ReasoningError.Encoded;
}

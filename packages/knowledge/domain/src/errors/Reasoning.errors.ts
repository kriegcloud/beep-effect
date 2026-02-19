import { $KnowledgeDomainId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("errors/reasoning");

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

export class ReasoningError extends S.Union(MaxDepthExceededError, MaxInferencesExceededError).annotations(
  $I.annotations("ReasoningError", {
    description: "Union of all reasoning error types",
  })
) {}

export declare namespace ReasoningError {
  export type Type = typeof ReasoningError.Type;
  export type Encoded = typeof ReasoningError.Encoded;
}

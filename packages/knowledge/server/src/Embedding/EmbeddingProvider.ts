import { $KnowledgeServerId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $KnowledgeServerId.create("Embedding/EmbeddingProvider");

export class TaskType extends BS.StringLiteralKit("search_document", "search_query", "clustering").annotations(
  $I.annotations("TaskType", {
    description: "Task type for embedding generation",
  })
) {}

export declare namespace TaskType {
  export type Type = typeof TaskType.Type;
}

export class EmbeddingConfig extends S.Class<EmbeddingConfig>($I`EmbeddingConfig`)({
  model: S.String,
  dimensions: S.Number,
  provider: S.String,
}) {}

export class EmbeddingError extends S.TaggedError<EmbeddingError>()("EmbeddingError", {
  message: S.String,
  provider: S.String,
  retryable: S.Boolean,
  cause: S.optional(S.String),
}) {}

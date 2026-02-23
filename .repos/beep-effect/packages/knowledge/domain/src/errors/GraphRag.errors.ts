import { $KnowledgeDomainId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("errors/graphrag");

export class EmbeddingGenerationError extends S.TaggedError<EmbeddingGenerationError>($I`EmbeddingGenerationError`)(
  "EmbeddingGenerationError",
  {
    input: S.String,
    message: S.String,
    model: S.optional(S.String),
    cause: S.optional(S.String),
  },
  $I.annotations("EmbeddingGenerationError", {
    description: "Failed to generate embeddings for input text",
  })
) {}

export class VectorSearchError extends S.TaggedError<VectorSearchError>($I`VectorSearchError`)(
  "VectorSearchError",
  {
    message: S.String,
    queryVector: S.optional(S.String),
    topK: S.optional(S.Number),
    cause: S.optional(S.String),
  },
  $I.annotations("VectorSearchError", {
    description: "Failed to perform vector similarity search",
  })
) {}

export class GraphTraversalError extends S.TaggedError<GraphTraversalError>($I`GraphTraversalError`)(
  "GraphTraversalError",
  {
    message: S.String,
    startNode: S.optional(S.String),
    maxDepth: S.optional(S.Number),
    cause: S.optional(S.String),
  },
  $I.annotations("GraphTraversalError", {
    description: "Failed to traverse knowledge graph",
  })
) {}

export class GraphRAGError extends S.Union(
  EmbeddingGenerationError,
  VectorSearchError,
  GraphTraversalError
).annotations(
  $I.annotations("GraphRAGError", {
    description: "Union of all GraphRAG error types",
  })
) {}

export declare namespace GraphRAGError {
  export type Type = typeof GraphRAGError.Type;
  export type Encoded = typeof GraphRAGError.Encoded;
}

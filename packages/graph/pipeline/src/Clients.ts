/**
 * Service definitions for pipeline requestor dependencies.
 *
 * Each client is a minimal typed interface over the underlying NATS
 * request-response transport. Pipelines depend on these services via
 * Effect's context system, enabling easy mocking for tests.
 *
 * @module
 * @since 0.1.0
 */

import {
  DocumentEmbeddings,
  Embeddings,
  GraphEmbeddings,
  Prompt,
  TextCompletion,
  TriplesQuery,
} from "@beep/graph-schema";
import { Context, type Effect } from "effect";

import type { LlmError } from "./Errors.ts";

// ---------------------------------------------------------------------------
// LLM Client
// ---------------------------------------------------------------------------

/**
 * @since 0.1.0
 * @category services
 */
export class LlmClient extends Context.Service<
  LlmClient,
  {
    readonly complete: (
      request: typeof TextCompletion.TextCompletionRequest.Encoded
    ) => Effect.Effect<TextCompletion.TextCompletionResponse, LlmError>;
  }
>()("@beep/graph-pipeline/Clients/LlmClient") {}

// ---------------------------------------------------------------------------
// Embeddings Client
// ---------------------------------------------------------------------------

/**
 * @since 0.1.0
 * @category services
 */
export class EmbeddingsClient extends Context.Service<
  EmbeddingsClient,
  {
    readonly embed: (request: typeof Embeddings.EmbeddingsRequest.Encoded) => Effect.Effect<Embeddings.EmbeddingsResponse>;
  }
>()("@beep/graph-pipeline/Clients/EmbeddingsClient") {}

// ---------------------------------------------------------------------------
// Graph Embeddings Client
// ---------------------------------------------------------------------------

/**
 * @since 0.1.0
 * @category services
 */
export class GraphEmbeddingsClient extends Context.Service<
  GraphEmbeddingsClient,
  {
    readonly find: (
      request: typeof GraphEmbeddings.GraphEmbeddingsRequest.Encoded
    ) => Effect.Effect<GraphEmbeddings.GraphEmbeddingsResponse>;
  }
>()("@beep/graph-pipeline/Clients/GraphEmbeddingsClient") {}

// ---------------------------------------------------------------------------
// Triples Client
// ---------------------------------------------------------------------------

/**
 * @since 0.1.0
 * @category services
 */
export class TriplesClient extends Context.Service<
  TriplesClient,
  {
    readonly query: (
      request: typeof TriplesQuery.TriplesQueryRequest.Encoded
    ) => Effect.Effect<TriplesQuery.TriplesQueryResponse>;
  }
>()("@beep/graph-pipeline/Clients/TriplesClient") {}

// ---------------------------------------------------------------------------
// Prompt Client
// ---------------------------------------------------------------------------

/**
 * @since 0.1.0
 * @category services
 */
export class PromptClient extends Context.Service<
  PromptClient,
  {
    readonly render: (request: typeof Prompt.PromptRequest.Encoded) => Effect.Effect<Prompt.PromptResponse>;
  }
>()("@beep/graph-pipeline/Clients/PromptClient") {}

// ---------------------------------------------------------------------------
// Document Embeddings Client
// ---------------------------------------------------------------------------

/**
 * @since 0.1.0
 * @category services
 */
export class DocEmbeddingsClient extends Context.Service<
  DocEmbeddingsClient,
  {
    readonly find: (
      request: typeof DocumentEmbeddings.DocumentEmbeddingsRequest.Encoded
    ) => Effect.Effect<DocumentEmbeddings.DocumentEmbeddingsResponse>;
  }
>()("@beep/graph-pipeline/Clients/DocEmbeddingsClient") {}

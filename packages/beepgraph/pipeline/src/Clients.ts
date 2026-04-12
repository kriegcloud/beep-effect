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

import type {
  DocumentEmbeddings,
  Embeddings,
  GraphEmbeddings,
  Prompt,
  TextCompletion,
  TriplesQuery,
} from "@beep/beepgraph-schema";
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
      request: TextCompletion.TextCompletionRequest
    ) => Effect.Effect<TextCompletion.TextCompletionResponse, LlmError>;
  }
>()("@beep/beepgraph-pipeline/Clients/LlmClient") {}

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
    readonly embed: (request: Embeddings.EmbeddingsRequest) => Effect.Effect<Embeddings.EmbeddingsResponse>;
  }
>()("@beep/beepgraph-pipeline/Clients/EmbeddingsClient") {}

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
      request: GraphEmbeddings.GraphEmbeddingsRequest
    ) => Effect.Effect<GraphEmbeddings.GraphEmbeddingsResponse>;
  }
>()("@beep/beepgraph-pipeline/Clients/GraphEmbeddingsClient") {}

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
    readonly query: (request: TriplesQuery.TriplesQueryRequest) => Effect.Effect<TriplesQuery.TriplesQueryResponse>;
  }
>()("@beep/beepgraph-pipeline/Clients/TriplesClient") {}

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
    readonly render: (request: Prompt.PromptRequest) => Effect.Effect<Prompt.PromptResponse>;
  }
>()("@beep/beepgraph-pipeline/Clients/PromptClient") {}

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
      request: DocumentEmbeddings.DocumentEmbeddingsRequest
    ) => Effect.Effect<DocumentEmbeddings.DocumentEmbeddingsResponse>;
  }
>()("@beep/beepgraph-pipeline/Clients/DocEmbeddingsClient") {}

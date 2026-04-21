/**
 * Beep Graph client service for browser/React integration.
 *
 * Provides a typed client that mirrors the HttpApi endpoints and can
 * be backed by either HTTP fetch or direct WebSocket transport.
 *
 * @module
 * @since 0.1.0
 */

import {
  Agent,
  Collection,
  Config,
  DocumentEmbeddings,
  DocumentRag,
  Embeddings,
  GraphEmbeddings,
  GraphRag,
  Knowledge,
  Librarian,
  Prompt,
  TextCompletion,
  Tool,
  TriplesQuery,
} from "@beep/graph-schema";
import { Context, type Effect } from "effect";

// ---------------------------------------------------------------------------
// Client service
// ---------------------------------------------------------------------------

/**
 * Typed client interface for the Beep Graph API.
 *
 * In the browser, this is backed by HTTP fetch or WebSocket.
 * In tests, it can be mocked directly via Layer.succeed.
 *
 * @since 0.1.0
 * @category services
 */
export class BeepGraphClient extends Context.Service<
  BeepGraphClient,
  {
    /** Execute a Graph RAG query. */
    readonly graphRag: (request: typeof GraphRag.GraphRagRequest.Encoded) => Effect.Effect<GraphRag.GraphRagResponse>;

    /** Execute a Document RAG query. */
    readonly documentRag: (
      request: typeof DocumentRag.DocumentRagRequest.Encoded
    ) => Effect.Effect<DocumentRag.DocumentRagResponse>;

    /** Send an agent question. */
    readonly agent: (request: typeof Agent.AgentRequest.Encoded) => Effect.Effect<Agent.AgentResponse>;

    /** Request text completion from the LLM. */
    readonly textCompletion: (
      request: typeof TextCompletion.TextCompletionRequest.Encoded
    ) => Effect.Effect<TextCompletion.TextCompletionResponse>;

    /** Render a prompt template. */
    readonly prompt: (request: typeof Prompt.PromptRequest.Encoded) => Effect.Effect<Prompt.PromptResponse>;

    /** Generate embeddings for text. */
    readonly embeddings: (request: typeof Embeddings.EmbeddingsRequest.Encoded) => Effect.Effect<Embeddings.EmbeddingsResponse>;

    /** Query triples from the knowledge graph. */
    readonly triples: (
      request: typeof TriplesQuery.TriplesQueryRequest.Encoded
    ) => Effect.Effect<TriplesQuery.TriplesQueryResponse>;

    /** Find entities via graph embeddings. */
    readonly graphEmbeddings: (
      request: typeof GraphEmbeddings.GraphEmbeddingsRequest.Encoded
    ) => Effect.Effect<GraphEmbeddings.GraphEmbeddingsResponse>;

    /** Find document chunks via embeddings. */
    readonly documentEmbeddings: (
      request: typeof DocumentEmbeddings.DocumentEmbeddingsRequest.Encoded
    ) => Effect.Effect<DocumentEmbeddings.DocumentEmbeddingsResponse>;

    /** Read or mutate configuration. */
    readonly config: (request: typeof Config.ConfigRequest.Encoded) => Effect.Effect<Config.ConfigResponse>;

    /** Manage the document librarian. */
    readonly librarian: (request: typeof Librarian.LibrarianRequest.Encoded) => Effect.Effect<Librarian.LibrarianResponse>;

    /** Manage knowledge entries. */
    readonly knowledge: (request: typeof Knowledge.KnowledgeRequest.Encoded) => Effect.Effect<Knowledge.KnowledgeResponse>;

    /** Manage collections. */
    readonly collectionManagement: (
      request: typeof Collection.CollectionManagementRequest.Encoded
    ) => Effect.Effect<Collection.CollectionManagementResponse>;

    /** Execute a tool call. */
    readonly tool: (request: typeof Tool.ToolRequest.Encoded) => Effect.Effect<Tool.ToolResponse>;

    /** Check service health. */
    readonly health: () => Effect.Effect<{ status: "ok"; version: string }>;
  }
>()("@beep/graph-client/BeepGraphClient") {}

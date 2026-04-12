/**
 * Beep Graph client service for browser/React integration.
 *
 * Provides a typed client that mirrors the HttpApi endpoints and can
 * be backed by either HTTP fetch or direct WebSocket transport.
 *
 * @module
 * @since 0.1.0
 */

import type {
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
} from "@beep/beepgraph-schema";
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
    readonly graphRag: (request: GraphRag.GraphRagRequest) => Effect.Effect<GraphRag.GraphRagResponse>;

    /** Execute a Document RAG query. */
    readonly documentRag: (request: DocumentRag.DocumentRagRequest) => Effect.Effect<DocumentRag.DocumentRagResponse>;

    /** Send an agent question. */
    readonly agent: (request: Agent.AgentRequest) => Effect.Effect<Agent.AgentResponse>;

    /** Request text completion from the LLM. */
    readonly textCompletion: (
      request: TextCompletion.TextCompletionRequest
    ) => Effect.Effect<TextCompletion.TextCompletionResponse>;

    /** Render a prompt template. */
    readonly prompt: (request: Prompt.PromptRequest) => Effect.Effect<Prompt.PromptResponse>;

    /** Generate embeddings for text. */
    readonly embeddings: (request: Embeddings.EmbeddingsRequest) => Effect.Effect<Embeddings.EmbeddingsResponse>;

    /** Query triples from the knowledge graph. */
    readonly triples: (request: TriplesQuery.TriplesQueryRequest) => Effect.Effect<TriplesQuery.TriplesQueryResponse>;

    /** Find entities via graph embeddings. */
    readonly graphEmbeddings: (
      request: GraphEmbeddings.GraphEmbeddingsRequest
    ) => Effect.Effect<GraphEmbeddings.GraphEmbeddingsResponse>;

    /** Find document chunks via embeddings. */
    readonly documentEmbeddings: (
      request: DocumentEmbeddings.DocumentEmbeddingsRequest
    ) => Effect.Effect<DocumentEmbeddings.DocumentEmbeddingsResponse>;

    /** Read or mutate configuration. */
    readonly config: (request: Config.ConfigRequest) => Effect.Effect<Config.ConfigResponse>;

    /** Manage the document librarian. */
    readonly librarian: (request: Librarian.LibrarianRequest) => Effect.Effect<Librarian.LibrarianResponse>;

    /** Manage knowledge entries. */
    readonly knowledge: (request: Knowledge.KnowledgeRequest) => Effect.Effect<Knowledge.KnowledgeResponse>;

    /** Manage collections. */
    readonly collectionManagement: (
      request: Collection.CollectionManagementRequest
    ) => Effect.Effect<Collection.CollectionManagementResponse>;

    /** Execute a tool call. */
    readonly tool: (request: Tool.ToolRequest) => Effect.Effect<Tool.ToolResponse>;

    /** Check service health. */
    readonly health: () => Effect.Effect<{ status: "ok"; version: string }>;
  }
>()("@beep/beepgraph-client/BeepGraphClient") {}

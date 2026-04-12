/**
 * Beep Graph HttpApi definition — schema-first REST endpoints.
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
} from "@beep/beepgraph-schema";
import { Schema } from "effect";
import { HttpApi, HttpApiEndpoint, HttpApiGroup } from "effect/unstable/httpapi";

import { GatewayInternalError, GatewayTimeout } from "./Errors.ts";

// ---------------------------------------------------------------------------
// Error union for service endpoints
// ---------------------------------------------------------------------------

const ServiceError = Schema.Union([GatewayInternalError, GatewayTimeout]);

// ---------------------------------------------------------------------------
// RAG endpoints
// ---------------------------------------------------------------------------

class RagGroup extends HttpApiGroup.make("rag")
  .add(
    HttpApiEndpoint.post("graphRag", "/graph-rag", {
      payload: GraphRag.GraphRagRequest,
      success: GraphRag.GraphRagResponse,
      error: ServiceError,
    })
  )
  .add(
    HttpApiEndpoint.post("documentRag", "/document-rag", {
      payload: DocumentRag.DocumentRagRequest,
      success: DocumentRag.DocumentRagResponse,
      error: ServiceError,
    })
  ) {}

// ---------------------------------------------------------------------------
// Agent endpoints
// ---------------------------------------------------------------------------

class AgentGroup extends HttpApiGroup.make("agent").add(
  HttpApiEndpoint.post("agent", "/agent", {
    payload: Agent.AgentRequest,
    success: Agent.AgentResponse,
    error: ServiceError,
  })
) {}

// ---------------------------------------------------------------------------
// Core service endpoints
// ---------------------------------------------------------------------------

class CoreGroup extends HttpApiGroup.make("core")
  .add(
    HttpApiEndpoint.post("textCompletion", "/text-completion", {
      payload: TextCompletion.TextCompletionRequest,
      success: TextCompletion.TextCompletionResponse,
      error: ServiceError,
    })
  )
  .add(
    HttpApiEndpoint.post("embeddings", "/embeddings", {
      payload: Embeddings.EmbeddingsRequest,
      success: Embeddings.EmbeddingsResponse,
      error: ServiceError,
    })
  )
  .add(
    HttpApiEndpoint.post("prompt", "/prompt", {
      payload: Prompt.PromptRequest,
      success: Prompt.PromptResponse,
      error: ServiceError,
    })
  ) {}

// ---------------------------------------------------------------------------
// Knowledge graph endpoints
// ---------------------------------------------------------------------------

class KnowledgeGroup extends HttpApiGroup.make("knowledge")
  .add(
    HttpApiEndpoint.post("triples", "/triples", {
      payload: TriplesQuery.TriplesQueryRequest,
      success: TriplesQuery.TriplesQueryResponse,
      error: ServiceError,
    })
  )
  .add(
    HttpApiEndpoint.post("graphEmbeddings", "/graph-embeddings", {
      payload: GraphEmbeddings.GraphEmbeddingsRequest,
      success: GraphEmbeddings.GraphEmbeddingsResponse,
      error: ServiceError,
    })
  )
  .add(
    HttpApiEndpoint.post("documentEmbeddings", "/document-embeddings", {
      payload: DocumentEmbeddings.DocumentEmbeddingsRequest,
      success: DocumentEmbeddings.DocumentEmbeddingsResponse,
      error: ServiceError,
    })
  ) {}

// ---------------------------------------------------------------------------
// Management endpoints
// ---------------------------------------------------------------------------

class ManagementGroup extends HttpApiGroup.make("management")
  .add(
    HttpApiEndpoint.post("config", "/config", {
      payload: Config.ConfigRequest,
      success: Config.ConfigResponse,
      error: ServiceError,
    })
  )
  .add(
    HttpApiEndpoint.post("librarian", "/librarian", {
      payload: Librarian.LibrarianRequest,
      success: Librarian.LibrarianResponse,
      error: ServiceError,
    })
  )
  .add(
    HttpApiEndpoint.post("knowledge", "/knowledge", {
      payload: Knowledge.KnowledgeRequest,
      success: Knowledge.KnowledgeResponse,
      error: ServiceError,
    })
  )
  .add(
    HttpApiEndpoint.post("collectionManagement", "/collection-management", {
      payload: Collection.CollectionManagementRequest,
      success: Collection.CollectionManagementResponse,
      error: ServiceError,
    })
  )
  .add(
    HttpApiEndpoint.post("tool", "/tool", {
      payload: Tool.ToolRequest,
      success: Tool.ToolResponse,
      error: ServiceError,
    })
  ) {}

// ---------------------------------------------------------------------------
// Health endpoint
// ---------------------------------------------------------------------------

const HealthResponse = Schema.Struct({
  status: Schema.Literal("ok"),
  version: Schema.String,
});

class SystemGroup extends HttpApiGroup.make("system", { topLevel: true }).add(
  HttpApiEndpoint.get("health", "/health", {
    success: HealthResponse,
  })
) {}

// ---------------------------------------------------------------------------
// Root API
// ---------------------------------------------------------------------------

/**
 * Beep Graph HTTP API definition.
 *
 * Schema-first endpoint definitions for all Beep Graph services.
 * Provides automatic OpenAPI spec generation and typed client support.
 *
 * @since 0.1.0
 * @category api
 */
export class BeepGraphApi extends HttpApi.make("beepgraph")
  .add(SystemGroup, RagGroup, AgentGroup, CoreGroup, KnowledgeGroup, ManagementGroup)
  .prefix("/api/v1") {}

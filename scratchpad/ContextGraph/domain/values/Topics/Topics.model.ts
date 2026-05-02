/**
 * RDF Term type value object for the context graph.
 *
 * @since 0.0.0
 * @packageDocumentationq
 */
import { $ScratchpadId } from "@beep/identity";
import * as S from "effect/Schema"
import { SchemaUtils } from "@beep/schema";


const $I = $ScratchpadId.create("values/Topics/Topics.model");

export const Topic = S.TemplateLiteral(
  [
    S.Union([S.Literal("tg"), S.String]),
    ".",
    S.Union([S.Literal("flow"), S.String]),
    ".",
    S.String
  ]
).pipe(
  $I.annoteSchema("Topic", {
    description: "",
  }),
  SchemaUtils.withStatics(() => {
    return {
      make: (name: string, tenant = "tg", namespace = "flow"): Topic => `${tenant}.${namespace}.${name}` as const
    }
  })
);

export type Topic = typeof Topic.Type;


export const topics = {
 // Config
  configRequest: Topic.make("config-request"),
  configResponse: Topic.make("config-response"),
  configPush: Topic.make("config-push"),

  // Text completion
  textCompletionRequest: Topic.make("text-completion-request"),
  textCompletionResponse: Topic.make("text-completion-response"),

  // Embeddings
  embeddingsRequest: Topic.make("embeddings-request"),
  embeddingsResponse: Topic.make("embeddings-response"),

  // Graph RAG
  graphRagRequest: Topic.make("graph-rag-request"),
  graphRagResponse: Topic.make("graph-rag-response"),

  // Document RAG
  documentRagRequest: Topic.make("document-rag-request"),
  documentRagResponse: Topic.make("document-rag-response"),

  // Agent
  agentRequest: Topic.make("agent-request"),
  agentResponse: Topic.make("agent-response"),

  // Triples
  triplesRequest: Topic.make("triples-request"),
  triplesResponse: Topic.make("triples-response"),

  // Graph embeddings
  graphEmbeddingsRequest: Topic.make("graph-embeddings-request"),
  graphEmbeddingsResponse: Topic.make("graph-embeddings-response"),

  // Document embeddings
  docEmbeddingsRequest: Topic.make("doc-embeddings-request"),
  docEmbeddingsResponse: Topic.make("doc-embeddings-response"),

  // Prompt
  promptRequest: Topic.make("prompt-request"),
  promptResponse: Topic.make("prompt-response"),

  // MCP tool invocation
  mcpToolRequest: Topic.make("mcp-tool-request"),
  mcpToolResponse: Topic.make("mcp-tool-response"),

  // Librarian (document management)
  librarianRequest: Topic.make("librarian-request"),
  librarianResponse: Topic.make("librarian-response"),

  // Knowledge core management
  knowledgeRequest: Topic.make("knowledge-request"),
  knowledgeResponse: Topic.make("knowledge-response"),

  // Collection management
  collectionManagementRequest: Topic.make("collection-management-request"),
  collectionManagementResponse: Topic.make("collection-management-response"),

  // Flow management
  flowRequest: Topic.make("flow-request"),
  flowResponse: Topic.make("flow-response"),

}

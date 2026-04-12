/**
 * Beep Graph client service for browser/React integration.
 *
 * Provides a typed client that mirrors the HttpApi endpoints and can
 * be backed by either HTTP fetch or direct WebSocket transport.
 *
 * @module
 * @since 0.1.0
 */

import type { Agent, Config, DocumentRag, GraphRag, Prompt, TextCompletion } from "@beep/beepgraph-schema";
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

    /** Read or mutate configuration. */
    readonly config: (request: Config.ConfigRequest) => Effect.Effect<Config.ConfigResponse>;
  }
>()("@beep/beepgraph-client/BeepGraphClient") {}

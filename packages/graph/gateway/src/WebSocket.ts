/**
 * WebSocket message protocol and handler types.
 *
 * Defines the inbound/outbound message schemas for the multiplexed
 * WebSocket protocol used by the Beep Graph workbench.
 *
 * @module
 * @since 0.1.0
 */
import { Schema } from "effect";

// ---------------------------------------------------------------------------
// Inbound message (client → server)
// ---------------------------------------------------------------------------

/**
 * A WebSocket request from the client.
 *
 * @since 0.1.0
 * @category models
 */
export const WsRequest = Schema.Struct({
  id: Schema.String,
  service: Schema.String,
  request: Schema.Record(Schema.String, Schema.Unknown),
  flow: Schema.optionalKey(Schema.String),
});

/**
 * Type for {@link WsRequest}. {@inheritDoc WsRequest}
 *
 * @category models
 * @since 0.1.0
 */
export type WsRequest = typeof WsRequest.Type;

// ---------------------------------------------------------------------------
// Outbound message (server → client)
// ---------------------------------------------------------------------------

/**
 * A WebSocket response chunk from the server.
 *
 * @since 0.1.0
 * @category models
 */
export const WsResponse = Schema.Struct({
  id: Schema.String,
  response: Schema.OptionFromOptionalKey(Schema.Unknown),
  error: Schema.OptionFromOptionalKey(
    Schema.Struct({
      type: Schema.optionalKey(Schema.String),
      message: Schema.optionalKey(Schema.String),
    })
  ),
  complete: Schema.Boolean,
});

/**
 * Type for {@link WsResponse}. {@inheritDoc WsResponse}
 *
 * @category models
 * @since 0.1.0
 */
export type WsResponse = typeof WsResponse.Type;

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/**
 * Maximum concurrent requests per WebSocket connection.
 *
 * @since 0.1.0
 * @category constants
 */
export const MAX_OUTSTANDING = 15;

/**
 * Maximum queued requests before dropping.
 *
 * @since 0.1.0
 * @category constants
 */
export const MAX_QUEUE_SIZE = 10;

// ---------------------------------------------------------------------------
// Service registry
// ---------------------------------------------------------------------------

/**
 * Services available at the global scope, without a flow-specific context.
 *
 * @since 0.1.0
 * @category constants
 */
export const GLOBAL_SERVICES = new Set(["config", "flow", "librarian", "knowledge", "collection-management"]);

/**
 * Services that emit streaming response fragments over the WebSocket protocol.
 *
 * @since 0.1.0
 * @category constants
 */
export const STREAMING_SERVICES = new Set([
  "agent",
  "text-completion",
  "graph-rag",
  "document-rag",
  "triples",
  "knowledge",
  "librarian",
]);

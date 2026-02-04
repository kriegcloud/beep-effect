/**
 * Schema: Auth Types
 *
 * Request/Response schemas for WebSocket ticket-based authentication.
 *
 * @since 2.0.0
 * @module Domain/Schema/Auth
 */

import { Schema } from "effect"

/**
 * Request to obtain a WebSocket authentication ticket
 *
 * @since 2.0.0
 */
export class TicketRequest extends Schema.Class<TicketRequest>("TicketRequest")({
  /** The ontology ID the ticket grants access to */
  ontologyId: Schema.String
}) {}

/**
 * Response containing a WebSocket authentication ticket
 *
 * @since 2.0.0
 */
export class TicketResponse extends Schema.Class<TicketResponse>("TicketResponse")({
  /** The authentication ticket (single-use) */
  ticket: Schema.String,

  /** Timestamp when ticket expires (Unix ms) */
  expiresAt: Schema.Number,

  /** Time-to-live in seconds */
  ttlSeconds: Schema.Number
}) {}

/**
 * Internal ticket storage record
 *
 * @since 2.0.0
 */
export class TicketRecord extends Schema.Class<TicketRecord>("TicketRecord")({
  /** The ticket token */
  ticket: Schema.String,

  /** The ontology ID this ticket grants access to */
  ontologyId: Schema.String,

  /** The API key that created this ticket */
  apiKey: Schema.String,

  /** Timestamp when ticket was created (Unix ms) */
  createdAt: Schema.Number,

  /** Timestamp when ticket expires (Unix ms) */
  expiresAt: Schema.Number
}) {}

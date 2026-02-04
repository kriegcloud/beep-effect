/**
 * Auth Error Types
 *
 * Typed errors for WebSocket authentication via ticket-based handshake.
 *
 * @since 2.0.0
 * @module Domain/Error/Auth
 */

import { Schema } from "effect"

/**
 * Error when a ticket has expired
 */
export class TicketExpiredError extends Schema.TaggedError<TicketExpiredError>()("TicketExpiredError", {
  message: Schema.String,
  ticket: Schema.String,
  expiredAt: Schema.Number
}) {}

/**
 * Error when a ticket is not found (invalid or already consumed)
 */
export class TicketNotFoundError extends Schema.TaggedError<TicketNotFoundError>()("TicketNotFoundError", {
  message: Schema.String,
  ticket: Schema.String
}) {}

/**
 * General authentication error
 */
export class AuthenticationError extends Schema.TaggedError<AuthenticationError>()("AuthenticationError", {
  message: Schema.String,
  reason: Schema.Literal("missing", "invalid", "disabled", "expired")
}) {}

/**
 * Error when API key validation fails
 */
export class InvalidApiKeyError extends Schema.TaggedError<InvalidApiKeyError>()("InvalidApiKeyError", {
  message: Schema.String,
  cause: Schema.optional(Schema.Unknown)
}) {}

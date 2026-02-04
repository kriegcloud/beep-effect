/**
 * WebSocket Event Streaming Router
 *
 * Uses @effect/experimental/EventLogServer for real-time event sync.
 * Provides WebSocket endpoint per ontology for client synchronization.
 *
 * The EventLogServer handles the full protocol:
 * - Hello/Ping/Pong for keepalive
 * - WriteEntries/Ack for client writes
 * - RequestChanges/Changes/StopChanges for streaming
 * - ChunkedMessage for large payloads
 *
 * Storage backends:
 * - Memory (default): In-memory storage, data lost on restart
 * - PostgreSQL: Persistent storage with stable server identity
 *
 * @since 2.0.0
 * @module Runtime/EventStreamRouter
 */

import * as EventLogServer from "@effect/experimental/EventLogServer"
import { HttpRouter, HttpServerRequest, HttpServerResponse } from "@effect/platform"
import { Effect, Option } from "effect"
import { AuthenticationError } from "../Domain/Error/Auth.js"
import { ConfigService } from "../Service/Config.js"
import { OntologyService } from "../Service/Ontology.js"
import { TicketService } from "../Service/Ticket.js"

// =============================================================================
// Storage Layers
// =============================================================================

/**
 * Memory-based storage layer (default, for development/testing)
 *
 * Events are stored in-memory and lost on server restart.
 * Server identity changes on each restart.
 */
export const EventLogStorageMemory = EventLogServer.layerStorageMemory

/**
 * Re-export PostgreSQL storage from Persistence module
 * Use with PgClientLive for production deployments.
 *
 * @example
 * ```ts
 * import { EventLogStoragePostgres } from "./Persistence/EventLogStorage.js"
 * import { PgClientLive } from "./Persistence/PostgresLayer.js"
 *
 * const ProductionStorage = EventLogStoragePostgres.pipe(
 *   Layer.provide(PgClientLive)
 * )
 * ```
 */
export { EventLogStoragePostgres } from "./Persistence/EventLogStorage.js"

// =============================================================================
// Handler Factory
// =============================================================================

/**
 * Create the WebSocket handler
 *
 * The handler requires EventLogServer.Storage to be provided.
 * Use EventLogStorageMemory for development or EventLogStoragePostgres for production.
 *
 * @example
 * ```ts
 * // Development: in-memory storage
 * const devHandler = EventLogHandler.pipe(
 *   Effect.provide(EventLogStorageMemory)
 * )
 *
 * // Production: PostgreSQL storage
 * const prodHandler = EventLogHandler.pipe(
 *   Effect.provide(EventLogStoragePostgres),
 *   Effect.provide(PgClientLive)
 * )
 * ```
 */
export const EventLogHandler = EventLogServer.makeHandlerHttp

// =============================================================================
// Auth Helpers
// =============================================================================

/**
 * Validate WebSocket authentication via query params.
 *
 * Supports two modes:
 * - DEV MODE: ?dev=true bypasses auth when API_REQUIRE_AUTH=false
 * - PROD MODE: ?ticket=xxx requires valid single-use ticket
 *
 * @returns The validated ontologyId from ticket, or the path ontologyId in dev mode
 */
const validateWebSocketAuth = (ontologyId: string) =>
  Effect.gen(function*() {
    const request = yield* HttpServerRequest.HttpServerRequest
    const config = yield* ConfigService
    const ticketService = yield* TicketService

    // Parse query params from URL
    const url = new URL(request.url, "http://localhost")
    const ticket = url.searchParams.get("ticket")
    const devMode = url.searchParams.get("dev") === "true"

    // DEV MODE: Skip ticket validation when auth not required
    if (devMode && !config.api.requireAuth) {
      yield* Effect.logDebug("WebSocket connected in dev mode", { ontologyId })
      return ontologyId
    }

    // If dev mode requested but auth IS required, reject with helpful message
    if (devMode && config.api.requireAuth) {
      return yield* Effect.fail(
        new AuthenticationError({
          message: "Dev mode disabled. API_REQUIRE_AUTH=true requires ticket authentication.",
          reason: "disabled"
        })
      )
    }

    // PROD MODE: Require valid ticket
    if (ticket) {
      const validatedOntologyId = yield* ticketService.validateTicket(ticket).pipe(
        Effect.mapError((error) => {
          if (error._tag === "TicketExpiredError") {
            return new AuthenticationError({
              message: error.message,
              reason: "expired"
            })
          }
          return new AuthenticationError({
            message: error.message,
            reason: "invalid"
          })
        })
      )

      // Ensure ticket is for the requested ontology
      if (validatedOntologyId !== ontologyId) {
        return yield* Effect.fail(
          new AuthenticationError({
            message: `Ticket is for ontology "${validatedOntologyId}", not "${ontologyId}"`,
            reason: "invalid"
          })
        )
      }

      yield* Effect.logDebug("WebSocket authenticated via ticket", { ontologyId })
      return validatedOntologyId
    }

    // No ticket provided - check if we can allow unauthenticated access
    if (!config.api.requireAuth) {
      // Auth not required, allow connection
      yield* Effect.logDebug("WebSocket connected (auth not required)", { ontologyId })
      return ontologyId
    }

    // Auth required but no ticket - reject
    return yield* Effect.fail(
      new AuthenticationError({
        message: "Missing ticket. Use POST /v1/auth/ticket or add ?dev=true for development.",
        reason: "missing"
      })
    )
  })

// =============================================================================
// Router
// =============================================================================

/**
 * Event Stream WebSocket Router
 *
 * Provides WebSocket endpoint for real-time event streaming per ontology:
 * - GET /v1/ontologies/:ontologyId/events/ws - WebSocket upgrade
 *
 * Uses @effect/experimental/EventLogServer for protocol handling:
 * - Automatic Hello with RemoteId on connect
 * - Ping/Pong keepalive
 * - WriteEntries/Ack for bidirectional sync
 * - RequestChanges/Changes/StopChanges for streaming
 * - ChunkedMessage for large payloads (512KB chunks)
 *
 * **Authentication:**
 * - DEV MODE: ?dev=true bypasses auth when API_REQUIRE_AUTH=false
 * - PROD MODE: ?ticket=xxx requires valid single-use ticket from POST /v1/auth/ticket
 *
 * **Requires EventLogServer.Storage to be provided.**
 * Use EventLogStorageMemory for development or EventLogStoragePostgres for production.
 *
 * @since 2.0.0
 */
export const EventStreamRouter = HttpRouter.empty.pipe(
  HttpRouter.get(
    "/v1/ontologies/:ontologyId/events/ws",
    Effect.gen(function*() {
      const params = yield* HttpRouter.params
      const ontologyId = params.ontologyId

      if (!ontologyId) {
        return yield* HttpServerResponse.json({
          error: "INVALID_REQUEST",
          message: "Ontology ID is required"
        }, { status: 400 })
      }

      // Validate ontology exists
      const entryOpt = yield* OntologyService.getRegistryEntry(ontologyId)
      if (Option.isNone(entryOpt)) {
        return yield* HttpServerResponse.json({
          error: "NOT_FOUND",
          message: `Ontology "${ontologyId}" not found`
        }, { status: 404 })
      }

      // Validate authentication
      yield* validateWebSocketAuth(ontologyId)

      // Get the handler from EventLogServer (Storage provided by layer)
      const handler = yield* EventLogHandler

      // Execute the handler - it upgrades to WebSocket and handles the connection
      const response = yield* handler.pipe(
        Effect.annotateLogs({ ontologyId, service: "EventStreamRouter" })
      )

      return response
    }).pipe(
      Effect.catchTag("AuthenticationError", (error) =>
        Effect.gen(function*() {
          const status = error.reason === "missing" ? 401 : 403
          yield* Effect.logWarning("WebSocket auth failed", {
            reason: error.reason,
            message: error.message
          })
          return yield* HttpServerResponse.json({
            error: status === 401 ? "UNAUTHORIZED" : "FORBIDDEN",
            message: error.message,
            hint: error.reason === "missing"
              ? "Use POST /v1/auth/ticket to get a ticket, or ?dev=true for development"
              : undefined
          }, { status })
        })),
      Effect.catchAll((error) =>
        Effect.gen(function*() {
          yield* Effect.logError("WebSocket upgrade failed", { error: String(error) })
          return yield* HttpServerResponse.json({
            error: "WEBSOCKET_ERROR",
            message: "Failed to upgrade connection"
          }, { status: 500 })
        })
      )
    )
  )
)

/**
 * TicketClient Service
 *
 * Fetches WebSocket authentication tickets from the backend.
 * Supports dual-mode auth: dev mode (no ticket) or prod mode (ticket required).
 *
 * @since 2.0.0
 * @module services/TicketClient
 */

import { FetchHttpClient, HttpClient, HttpClientRequest, HttpClientResponse } from "@effect/platform"
import { Context, Effect, Layer, Schema } from "effect"

// =============================================================================
// Schemas
// =============================================================================

/**
 * Ticket response from POST /v1/auth/ticket
 */
export const TicketResponse = Schema.Struct({
  ticket: Schema.String,
  expiresAt: Schema.Number,
  ttlSeconds: Schema.Number
})

export type TicketResponse = Schema.Schema.Type<typeof TicketResponse>

// =============================================================================
// Error Types
// =============================================================================

export class TicketError extends Schema.TaggedError<TicketError>()("TicketError", {
  status: Schema.Number,
  message: Schema.String,
  reason: Schema.Literal("missing_key", "invalid_key", "network", "expired")
}) {}

// =============================================================================
// Service Interface
// =============================================================================

/**
 * TicketClient service interface
 */
export interface TicketClientService {
  /**
   * Get a WebSocket authentication ticket for an ontology
   *
   * @param ontologyId - The ontology to get a ticket for
   * @returns Ticket response with token and expiry info
   */
  readonly getTicket: (ontologyId: string) => Effect.Effect<TicketResponse, TicketError>

  /**
   * Check if running in dev mode (no ticket required)
   */
  readonly isDevMode: () => boolean
}

/**
 * TicketClient service tag
 */
export class TicketClient extends Context.Tag("TicketClient")<TicketClient, TicketClientService>() {}

// =============================================================================
// Implementation
// =============================================================================

/**
 * TicketClient layer with API key support
 *
 * In dev mode (no API key configured), returns a special "dev mode" response.
 * In prod mode, fetches a real ticket from the backend.
 */
export const TicketClientLive = (apiKey?: string) =>
  Layer.effect(
    TicketClient,
    Effect.gen(function*() {
      const client = yield* HttpClient.HttpClient

      // Check if we're in dev mode (no API key)
      const devMode = !apiKey || apiKey.trim() === ""

      return TicketClient.of({
        getTicket: (ontologyId) => {
          if (devMode) {
            // Dev mode - no ticket needed
            // Return a placeholder that signals dev mode to the WebSocket client
            return Effect.succeed({
              ticket: "__dev_mode__",
              expiresAt: Date.now() + 60 * 60 * 1000, // 1 hour
              ttlSeconds: 3600
            })
          }

          // Prod mode - fetch real ticket
          return HttpClientRequest.post("/api/v1/auth/ticket").pipe(
            HttpClientRequest.setHeader("x-api-key", apiKey!),
            HttpClientRequest.bodyJson({ ontologyId }),
            Effect.flatMap((req) =>
              client.execute(req).pipe(
                Effect.flatMap((res) => {
                  if (res.status === 401) {
                    return Effect.fail(
                      new TicketError({
                        status: 401,
                        message: "Missing or invalid API key",
                        reason: "missing_key"
                      })
                    )
                  }
                  if (res.status === 403) {
                    return Effect.fail(
                      new TicketError({
                        status: 403,
                        message: "API key not authorized",
                        reason: "invalid_key"
                      })
                    )
                  }
                  if (res.status >= 400) {
                    return res.text.pipe(
                      Effect.flatMap((body) =>
                        Effect.fail(
                          new TicketError({
                            status: res.status,
                            message: body || `HTTP ${res.status}`,
                            reason: "network"
                          })
                        )
                      )
                    )
                  }
                  return HttpClientResponse.schemaBodyJson(TicketResponse)(res).pipe(
                    Effect.mapError((parseError) =>
                      new TicketError({
                        status: 422,
                        message: `Parse error: ${parseError.message}`,
                        reason: "network"
                      })
                    )
                  )
                }),
                Effect.scoped
              )
            ),
            Effect.mapError((e) => {
              if (e instanceof TicketError) return e
              return new TicketError({
                status: 0,
                message: e instanceof Error ? e.message : String(e),
                reason: "network"
              })
            })
          )
        },

        isDevMode: () => devMode
      })
    })
  ).pipe(Layer.provide(FetchHttpClient.layer))

/**
 * Default layer using VITE_API_KEY from environment
 */
export const TicketClientDefault = TicketClientLive(
  (typeof import.meta !== "undefined" ? (import.meta as any).env?.VITE_API_KEY : undefined) as string | undefined
)

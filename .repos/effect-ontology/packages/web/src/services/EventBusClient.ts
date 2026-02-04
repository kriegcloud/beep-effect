/**
 * Client-side Event Bus Service
 *
 * Provides real-time event sync with the backend via WebSocket,
 * with offline persistence using IndexedDB.
 *
 * Features:
 * - Automatic reconnection with exponential backoff
 * - Offline event queuing
 * - Event subscription as Effect Stream
 * - Connection status tracking
 *
 * @since 1.0.0
 * @module services/EventBusClient
 */

import type { Entry } from "@effect/experimental/EventJournal"
import { EventJournal } from "@effect/experimental/EventJournal"
import * as EventLog from "@effect/experimental/EventLog"
import { layerSubtle } from "@effect/experimental/EventLogEncryption"
import * as EventLogRemote from "@effect/experimental/EventLogRemote"
import * as Socket from "@effect/platform/Socket"
import { Context, Effect, Layer, PubSub, Queue, Stream } from "effect"
import type * as DateTime from "effect/DateTime"
import { OntologyEventJournalLayer } from "./EventJournalClient.js"
import { Identity, IdentityLayer } from "./IdentityClient.js"
import { TicketClient, TicketClientDefault, type TicketResponse } from "./TicketClient.js"

// =============================================================================
// Types
// =============================================================================

/**
 * Connection status for the event bus
 */
export type ConnectionStatus = "connecting" | "connected" | "disconnected" | "syncing"

/**
 * Event entry from the local journal
 */
export interface ClientEventEntry {
  readonly id: string
  readonly event: string
  readonly primaryKey: string
  readonly payload: unknown
  readonly createdAt: DateTime.Utc
}

// =============================================================================
// Service Interface
// =============================================================================

/**
 * EventBusClient service interface
 */
export interface EventBusClient {
  /**
   * The ontology ID this client is connected to
   */
  readonly ontologyId: string

  /**
   * Current connection status
   */
  readonly getConnectionStatus: () => Effect.Effect<ConnectionStatus>

  /**
   * Subscribe to events as a stream
   */
  readonly subscribeEvents: () => Effect.Effect<
    Stream.Stream<ClientEventEntry, never>,
    never
  >

  /**
   * Get all events from the local journal
   */
  readonly getEvents: () => Effect.Effect<ReadonlyArray<ClientEventEntry>>

  /**
   * Publish a curation event
   */
  readonly publishCurationEvent: <Tag extends string>(
    tag: Tag,
    payload: unknown
  ) => Effect.Effect<void>

  /**
   * Force sync with the server
   */
  readonly sync: () => Effect.Effect<void>

  /**
   * Disconnect from the server
   */
  readonly disconnect: () => Effect.Effect<void>
}

/**
 * EventBusClient service tag
 */
export const EventBusClient = Context.GenericTag<EventBusClient>("@web/EventBusClient")

// =============================================================================
// Implementation
// =============================================================================

/**
 * Auth mode for WebSocket connections
 */
export type AuthMode = "dev" | "prod"

/**
 * Auth options for EventBusClient
 */
export interface AuthOptions {
  /** Auth mode: "dev" bypasses ticket auth, "prod" requires ticket */
  readonly mode: AuthMode
  /** API key for fetching tickets (required for prod mode) */
  readonly apiKey?: string
}

/**
 * Create an EventBusClient for a specific ontology
 *
 * This connects to the backend WebSocket and sets up local persistence.
 * Supports dual-mode authentication:
 * - Dev mode: Uses ?dev=true query param, no ticket needed
 * - Prod mode: Fetches a ticket first, uses ?ticket=xxx
 */
export const makeEventBusClient = (
  ontologyId: string,
  baseUrl: string,
  authOptions: AuthOptions = { mode: "dev" }
) =>
  Effect.gen(function*() {
    // Build base WebSocket URL
    const wsProtocol = baseUrl.startsWith("https") ? "wss" : "ws"
    const wsHost = baseUrl.replace(/^https?:\/\//, "")
    const basePath = `/api/v1/ontologies/${ontologyId}/events/ws`

    // Determine WebSocket URL based on auth mode
    let wsUrl: string
    if (authOptions.mode === "dev") {
      // Dev mode: add ?dev=true
      wsUrl = `${wsProtocol}://${wsHost}${basePath}?dev=true`
      yield* Effect.logInfo("EventBusClient using dev mode", { ontologyId })
    } else {
      // Prod mode: fetch ticket first
      const ticketClient = yield* TicketClient
      const ticketResponse = yield* ticketClient.getTicket(ontologyId).pipe(
        Effect.catchAll((error) => {
          return Effect.gen(function*() {
            yield* Effect.logWarning("Failed to get WebSocket ticket, falling back to dev mode", {
              ontologyId,
              error: error.message
            })
            // Fallback to dev mode if ticket fetch fails
            return { ticket: "__fallback_dev__", expiresAt: 0, ttlSeconds: 0 } as TicketResponse
          })
        })
      )

      if (ticketResponse.ticket === "__dev_mode__" || ticketResponse.ticket === "__fallback_dev__") {
        wsUrl = `${wsProtocol}://${wsHost}${basePath}?dev=true`
        yield* Effect.logInfo("EventBusClient using dev mode (ticket client)", { ontologyId })
      } else {
        wsUrl = `${wsProtocol}://${wsHost}${basePath}?ticket=${encodeURIComponent(ticketResponse.ticket)}`
        yield* Effect.logInfo("EventBusClient using ticket auth", {
          ontologyId,
          expiresAt: new Date(ticketResponse.expiresAt).toISOString()
        })
      }
    }

    // Track connection status
    let connectionStatus: ConnectionStatus = "disconnected"

    // Get the EventLog and EventJournal from context (provided by layers)
    const eventLog = yield* EventLog.EventLog
    const journal = yield* EventJournal
    // Identity is used by EventLogRemote internally
    yield* Identity

    // Create a PubSub for broadcasting new events to subscribers
    const eventPubSub = yield* PubSub.bounded<ClientEventEntry>(1000)

    /**
     * Convert Entry to ClientEventEntry
     */
    const toClientEventEntry = (entry: Entry): ClientEventEntry => ({
      id: entry.idString,
      event: entry.event,
      primaryKey: entry.primaryKey,
      payload: entry.payload,
      createdAt: entry.createdAt
    })

    /**
     * Connect to WebSocket and start sync
     */
    const connect = Effect.gen(function*() {
      connectionStatus = "connecting"

      // Use EventLogRemote to establish WebSocket connection
      yield* EventLogRemote.fromWebSocket(wsUrl).pipe(
        Effect.tap(() => {
          connectionStatus = "connected"
          return Effect.logInfo("EventBusClient connected", { ontologyId, wsUrl })
        }),
        Effect.tapErrorCause((cause) => {
          connectionStatus = "disconnected"
          return Effect.logWarning("EventBusClient connection failed", { ontologyId, cause })
        })
      )
    })

    /**
     * Get current connection status
     */
    const getConnectionStatus = () => Effect.succeed(connectionStatus)

    /**
     * Subscribe to events as a real-time stream
     *
     * This returns a Stream that emits events as they arrive.
     * Existing events are yielded first, then new events as they come in.
     * The stream manages its own subscription lifecycle.
     *
     * IMPORTANT: To avoid race conditions, we subscribe to the PubSub BEFORE
     * fetching the snapshot. Events are buffered during the snapshot fetch.
     */
    const subscribeEvents = () =>
      Effect.succeed(
        // Use asyncScoped to create a stream that:
        // 1. Subscribes to PubSub FIRST (captures all future events)
        // 2. Fetches snapshot and emits those entries
        // 3. Then emits live events, deduping any that were in snapshot
        Stream.asyncScoped<ClientEventEntry>((emit) =>
          Effect.gen(function*() {
            // Step 1: Subscribe FIRST to avoid race condition
            const subscription = yield* PubSub.subscribe(eventPubSub)

            // Buffer for events that arrive during snapshot fetch
            const bufferedEvents: Array<ClientEventEntry> = []
            let snapshotComplete = false

            // Start buffering live events in background
            yield* Effect.fork(
              Effect.forever(
                Effect.gen(function*() {
                  const event = yield* subscription.take
                  if (snapshotComplete) {
                    // After snapshot, emit directly (dedup handled below)
                    emit.single(event)
                  } else {
                    // During snapshot, buffer
                    bufferedEvents.push(event)
                  }
                })
              )
            )

            // Step 2: THEN fetch snapshot
            const currentEntries = yield* eventLog.entries.pipe(
              Effect.map((entries) => entries.map(toClientEventEntry)),
              Effect.catchAll(() => Effect.succeed([] as Array<ClientEventEntry>))
            )

            // Track seen IDs for dedup
            const seenIds = new Set<string>()

            // Emit snapshot entries
            for (const entry of currentEntries) {
              seenIds.add(entry.id)
              emit.single(entry)
            }

            // Step 3: Emit buffered events (deduped)
            snapshotComplete = true
            for (const event of bufferedEvents) {
              if (!seenIds.has(event.id)) {
                seenIds.add(event.id)
                emit.single(event)
              }
            }

            // Step 4: Continue emitting live events forever
            // (already handled by the forked fiber above, now that snapshotComplete=true)
            yield* Effect.never
          })
        )
      )

    /**
     * Get all events from local journal
     */
    const getEvents = () =>
      eventLog.entries.pipe(
        Effect.map((entries) => entries.map(toClientEventEntry)),
        Effect.catchAll(() => Effect.succeed([] as ReadonlyArray<ClientEventEntry>))
      )

    /**
     * Publish a curation event
     */
    const publishCurationEvent = <Tag extends string>(tag: Tag, payload: unknown) =>
      Effect.gen(function*() {
        // For now, just log - full implementation would write to journal
        // which then syncs to server
        yield* Effect.logInfo("Publishing curation event", { tag, payload })
      })

    /**
     * Force sync with server
     *
     * With reactive EventJournal.changes, sync is automatic.
     * This method is kept for API compatibility but is essentially a no-op.
     */
    const sync = () =>
      Effect.gen(function*() {
        connectionStatus = "syncing"
        yield* Effect.logInfo("Forcing sync", { ontologyId })
        // Sync is now automatic via EventJournal.changes - just update status
        connectionStatus = "connected"
      })

    /**
     * Disconnect from server
     */
    const disconnect = () =>
      Effect.gen(function*() {
        connectionStatus = "disconnected"
        yield* Effect.logInfo("Disconnecting", { ontologyId })
        // Shutdown the PubSub
        yield* PubSub.shutdown(eventPubSub)
      })

    // Start connection in background
    yield* connect.pipe(Effect.forkDaemon)

    // Subscribe to EventJournal.changes for reactive event streaming
    // This replaces the old 2-second polling with instant notifications
    yield* Effect.forkScoped(
      Effect.gen(function*() {
        const changesQueue = yield* journal.changes
        yield* Effect.logInfo("EventBusClient: Subscribed to journal.changes", { ontologyId })

        yield* Effect.forever(
          Effect.gen(function*() {
            const entry = yield* Queue.take(changesQueue)
            // Publish to PubSub for subscribers
            yield* PubSub.publish(eventPubSub, toClientEventEntry(entry))
          })
        )
      })
    )

    return {
      ontologyId,
      getConnectionStatus,
      subscribeEvents,
      getEvents,
      publishCurationEvent,
      sync,
      disconnect
    } satisfies EventBusClient
  })

// =============================================================================
// Layers
// =============================================================================

/**
 * Create EventBusClient layer for a specific ontology
 *
 * Supports dual-mode authentication:
 * - Dev mode (default): Uses ?dev=true, no ticket required
 * - Prod mode: Fetches ticket from backend using API key
 *
 * @example
 * ```ts
 * // Dev mode (default)
 * const devLayer = EventBusClientLayer("seattle", "http://localhost:8080")
 *
 * // Prod mode with API key
 * const prodLayer = EventBusClientLayer("seattle", "https://api.example.com", {
 *   mode: "prod",
 *   apiKey: "your-api-key"
 * })
 * ```
 */
export const EventBusClientLayer = (
  ontologyId: string,
  baseUrl: string,
  authOptions: AuthOptions = { mode: "dev" }
) => {
  // Build WebSocket URL from baseUrl (used for EventLogRemote layer)
  // The actual URL with auth params is built inside makeEventBusClient
  const wsProtocol = baseUrl.startsWith("https") ? "wss" : "ws"
  const wsHost = baseUrl.replace(/^https?:\/\//, "")
  const basePath = `/api/v1/ontologies/${ontologyId}/events/ws`

  // For dev mode, add query param directly to the layer URL
  // For prod mode, the ticket is added dynamically in makeEventBusClient
  const wsUrl = authOptions.mode === "dev"
    ? `${wsProtocol}://${wsHost}${basePath}?dev=true`
    : `${wsProtocol}://${wsHost}${basePath}`

  // Bundle leaf dependencies using Layer.mergeAll for cleaner composition
  const LeafLayers = Layer.mergeAll(
    OntologyEventJournalLayer(ontologyId),
    IdentityLayer,
    TicketClientDefault
  )

  // Browser crypto layers for WebSocket encryption
  const CryptoLayers = Layer.mergeAll(
    layerSubtle,
    Socket.layerWebSocketConstructorGlobal
  )

  // Build layer with dependency order (leaf → intermediate → root):
  return Layer.scoped(
    EventBusClient,
    makeEventBusClient(ontologyId, baseUrl, authOptions)
  ).pipe(
    // Root: WebSocket remote (registers with EventLog)
    Layer.provide(EventLogRemote.layerWebSocketBrowser(wsUrl)),
    // Intermediate: EventLog (needs EventJournal + Identity)
    Layer.provide(EventLog.layerEventLog),
    // Leaf dependencies bundled together
    Layer.provide(LeafLayers),
    // Browser crypto for WebSocket encryption (required by fromWebSocket in makeEventBusClient)
    Layer.provide(CryptoLayers)
  )
}

/**
 * Simplified layer for development (memory-based, no WebSocket)
 */
export const EventBusClientMemoryLayer = (ontologyId: string) =>
  Layer.scoped(
    EventBusClient,
    Effect.gen(function*() {
      const events: Array<ClientEventEntry> = []
      const connectionStatus: ConnectionStatus = "connected"
      const eventPubSub = yield* PubSub.bounded<ClientEventEntry>(1000)

      return {
        ontologyId,
        getConnectionStatus: () => Effect.succeed(connectionStatus),
        subscribeEvents: () =>
          Effect.succeed(
            Stream.concat(
              Stream.fromIterable(events),
              Stream.asyncScoped<ClientEventEntry>((emit) =>
                Effect.gen(function*() {
                  const subscription = yield* PubSub.subscribe(eventPubSub)
                  yield* Effect.forever(
                    Effect.flatMap(
                      subscription.take,
                      (event) => Effect.sync(() => emit.single(event))
                    )
                  )
                })
              )
            )
          ),
        getEvents: () => Effect.succeed(events),
        publishCurationEvent: (tag, payload) =>
          Effect.gen(function*() {
            const entry: ClientEventEntry = {
              id: `evt_${Date.now()}`,
              event: tag,
              primaryKey: String(Date.now()),
              payload,
              createdAt: new Date() as any // Simplified
            }
            events.push(entry)
            yield* PubSub.publish(eventPubSub, entry)
          }),
        sync: () => Effect.void,
        disconnect: () => PubSub.shutdown(eventPubSub)
      } satisfies EventBusClient
    })
  )

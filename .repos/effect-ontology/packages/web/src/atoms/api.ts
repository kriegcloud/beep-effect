/**
 * API Atoms
 *
 * Effect-based atoms for API data fetching.
 * Uses apiRuntime for HttpClient dependency injection.
 *
 * @since 2.0.0
 * @module atoms/api
 */

import { Atom, Result } from "@effect-atom/atom"
import { Effect, Stream } from "effect"
import { apiRuntime } from "../lib/runtime"
import { ApiClient, type ApiClientService, type DocumentsFilter, type TimelineFilter } from "../services/ApiClient"
import { invalidationTriggerAtom } from "../services/CacheInvalidation"
import { type ClientEventEntry, eventsAtom } from "./events"

// =============================================================================
// Timeline Event Types
// =============================================================================

/**
 * Event types that affect the timeline and should trigger live updates
 */
const TIMELINE_EVENT_TYPES = new Set([
  "ClaimCorrected",
  "ClaimDeprecated",
  "ClaimPromoted",
  "ExtractionCompleted"
])

// =============================================================================
// Filter State Atoms
// =============================================================================

/** Links list filter state - scoped per ontology */
export const linksFiltersAtom = Atom.family((_ontologyId: string) =>
  Atom.make({
    status: undefined as string | undefined,
    sourceType: undefined as string | undefined,
    limit: 20,
    offset: 0
  })
)

/** Timeline filter state - scoped per ontology */
export const timelineFiltersAtom = Atom.family((_ontologyId: string) =>
  Atom.make<TimelineFilter>({
    limit: 50,
    offset: 0
  })
)

/** Documents filter state - scoped per ontology */
export const documentsFiltersAtom = Atom.family((_ontologyId: string) =>
  Atom.make<DocumentsFilter>({
    limit: 20,
    offset: 0
  })
)

// =============================================================================
// Data Fetching Atoms
// =============================================================================

/** Links list - re-fetches when filters change or invalidated, scoped by ontologyId */
export const linksAtom = Atom.family((ontologyId: string) =>
  apiRuntime.atom((get) =>
    Effect.gen(function*() {
      // Subscribe to invalidation trigger for event-driven refresh
      get(invalidationTriggerAtom(ontologyId))
      const api: ApiClientService = yield* ApiClient
      const filters = get(linksFiltersAtom(ontologyId))
      return yield* api.listLinks(ontologyId, filters)
    })
  )
)

/** Single link detail - uses string key "ontologyId:id" for stable identity */
export const linkDetailAtom = Atom.family((key: string) => {
  const [ontologyId, id] = key.split(":")
  return apiRuntime.atom(() =>
    Effect.gen(function*() {
      const api: ApiClientService = yield* ApiClient
      return yield* api.getLink(ontologyId, id)
    })
  )
})

/** Health check - kept alive across component unmounts */
export const healthAtom = apiRuntime
  .atom(() =>
    Effect.gen(function*() {
      const api: ApiClientService = yield* ApiClient
      return yield* api.healthCheck()
    }).pipe(Effect.catchAll(() => Effect.succeed({ status: "offline" })))
  )
  .pipe(Atom.keepAlive)

// =============================================================================
// Mutation Atoms (Function Atoms)
// =============================================================================

/** Ingest a URL */
export const ingestAtom = apiRuntime.fn(
  Effect.fnUntraced(function*(params: { url: string; ontologyId: string }) {
    const api: ApiClientService = yield* ApiClient
    return yield* api.ingestLink({
      url: params.url,
      ontologyId: params.ontologyId,
      skipEnrich: false,
      allowDuplicates: false
    })
  })
)

/** Preview a URL without storing */
export const previewAtom = apiRuntime.fn(
  Effect.fnUntraced(function*(url: string) {
    const api: ApiClientService = yield* ApiClient
    return yield* api.previewLink(url)
  })
)

// =============================================================================
// Ontology Atoms
// =============================================================================

/** List all ontologies - kept alive for navigation */
export const ontologiesAtom = apiRuntime
  .atom(() =>
    Effect.gen(function*() {
      const api: ApiClientService = yield* ApiClient
      return yield* api.listOntologies()
    })
  )
  .pipe(Atom.keepAlive)

/** Single ontology detail - family by id */
export const ontologyDetailAtom = Atom.family((id: string) =>
  apiRuntime.atom(() =>
    Effect.gen(function*() {
      const api: ApiClientService = yield* ApiClient
      return yield* api.getOntology(id)
    })
  )
)

// =============================================================================
// Timeline Atoms
// =============================================================================

/** Timeline claims - family by ontologyId, re-fetches when filters change or invalidated */
export const timelineAtom = Atom.family((ontologyId: string) =>
  apiRuntime.atom((get) =>
    Effect.gen(function*() {
      // Subscribe to invalidation trigger for event-driven refresh
      get(invalidationTriggerAtom(ontologyId))
      const api: ApiClientService = yield* ApiClient
      const filters = get(timelineFiltersAtom(ontologyId))
      return yield* api.getTimelineClaims(ontologyId, filters)
    })
  )
)

// =============================================================================
// Live Timeline Atom (Stream-based)
// =============================================================================

/**
 * Internal state for tracking processed events in the live timeline
 */
interface LiveTimelineState {
  /** The current timeline data */
  readonly timeline: {
    readonly claims: ReadonlyArray<unknown>
    readonly total: number
    readonly limit: number
    readonly offset: number
    readonly hasMore: boolean
  }
  /** IDs of events we've already processed */
  readonly processedEventIds: Set<string>
}

/**
 * Apply timeline-relevant events incrementally
 *
 * This reducer processes new events and updates the timeline state accordingly.
 * Events are filtered to only those affecting the timeline.
 */
const applyTimelineEvents = (
  state: LiveTimelineState,
  allEvents: ReadonlyArray<ClientEventEntry>
): LiveTimelineState => {
  // Find events we haven't processed yet that affect the timeline
  const newTimelineEvents = allEvents.filter(
    (e) => !state.processedEventIds.has(e.id) && TIMELINE_EVENT_TYPES.has(e.event)
  )

  if (newTimelineEvents.length === 0) {
    return state
  }

  // Create a new set with all processed IDs
  const newProcessedIds = new Set(state.processedEventIds)
  for (const e of newTimelineEvents) {
    newProcessedIds.add(e.id)
  }

  // Apply each event to the timeline
  let claims = [...state.timeline.claims]
  let total = state.timeline.total

  for (const event of newTimelineEvents) {
    switch (event.event) {
      case "ExtractionCompleted": {
        // New claims from extraction - prepend to list
        const payload = event.payload as { claims?: ReadonlyArray<unknown> } | null
        if (payload?.claims) {
          claims = [...payload.claims, ...claims]
          total += payload.claims.length
        }
        break
      }
      case "ClaimDeprecated": {
        // Mark claim as deprecated - filter out or update rank
        const payload = event.payload as { claimId?: string } | null
        if (payload?.claimId) {
          claims = claims.filter((c) => (c as { id?: string }).id !== payload.claimId)
          total = Math.max(0, total - 1)
        }
        break
      }
      case "ClaimPromoted":
      case "ClaimCorrected": {
        // These may require a full refetch for accurate state
        // For now, just mark as processed to avoid duplicate handling
        break
      }
    }
  }

  return {
    timeline: {
      ...state.timeline,
      claims,
      total
    },
    processedEventIds: newProcessedIds
  }
}

/**
 * Live timeline atom with stream-based incremental updates
 *
 * This atom:
 * 1. Fetches initial timeline data from the API
 * 2. Subscribes to the events stream via get.stream()
 * 3. Applies incremental updates as new events arrive
 *
 * Benefits over refetch approach:
 * - Zero network overhead for incremental updates
 * - Near-instant UI updates (no API roundtrip)
 * - Efficient handling of high-frequency events
 *
 * @since 2.0.0
 * @category Timeline
 */
export const liveTimelineAtom = Atom.family((ontologyId: string) =>
  apiRuntime.atom((get) => {
    // Get a stream of events - emits current value immediately, then updates
    const eventStream = get.stream(eventsAtom(ontologyId), {
      withoutInitialValue: false,
      bufferSize: 16
    })

    // Use scanEffect to:
    // 1. Fetch initial data on first event emission
    // 2. Apply incremental updates for subsequent emissions
    return Stream.scanEffect(
      eventStream,
      null as LiveTimelineState | null,
      (state, events) =>
        Effect.gen(function*() {
          if (state === null) {
            // First emission: fetch initial data from API
            const api: ApiClientService = yield* ApiClient
            const filters = get(timelineFiltersAtom(ontologyId))
            const initial = yield* api.getTimelineClaims(ontologyId, filters)

            // Create initial state, marking current events as "seen"
            const processedEventIds = new Set(events.map((e) => e.id))
            return {
              timeline: initial,
              processedEventIds
            } as LiveTimelineState
          }

          // Subsequent emissions: apply new events incrementally
          return applyTimelineEvents(state, events)
        })
    ).pipe(
      // Skip the initial null emission
      Stream.filter((s): s is LiveTimelineState => s !== null),
      // Extract just the timeline data for consumers
      Stream.map((state) => state.timeline),
      // Only emit when timeline actually changes
      Stream.changes
    )
  })
)

/** Entity detail - uses string key "ontologyId:iri" for stable identity */
export const entityDetailAtom = Atom.family((key: string) => {
  const [ontologyId, ...iriParts] = key.split(":")
  const iri = iriParts.join(":") // IRIs contain colons, rejoin them
  return apiRuntime.atom(() =>
    Effect.gen(function*() {
      const api: ApiClientService = yield* ApiClient
      return yield* api.getEntity(ontologyId, iri)
    })
  )
})

// =============================================================================
// Document Atoms
// =============================================================================

/** Documents search - family by ontologyId, re-fetches when filters change or invalidated */
export const documentsAtom = Atom.family((ontologyId: string) =>
  apiRuntime.atom((get) =>
    Effect.gen(function*() {
      // Subscribe to invalidation trigger for event-driven refresh
      get(invalidationTriggerAtom(ontologyId))
      const api: ApiClientService = yield* ApiClient
      const filters = get(documentsFiltersAtom(ontologyId))
      return yield* api.searchDocuments(ontologyId, filters)
    })
  )
)

/** Document detail - uses string key "ontologyId:id" for stable identity */
export const documentDetailAtom = Atom.family((key: string) => {
  const [ontologyId, id] = key.split(":")
  return apiRuntime.atom(() =>
    Effect.gen(function*() {
      const api: ApiClientService = yield* ApiClient
      return yield* api.getDocument(ontologyId, id)
    })
  )
})

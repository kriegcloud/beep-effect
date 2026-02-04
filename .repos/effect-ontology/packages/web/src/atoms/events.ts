/**
 * Event Atoms
 *
 * Simple event state atoms for UI state management.
 * Uses basic Atom.make for state that doesn't need Effect runtime.
 *
 * @since 2.0.0
 * @module atoms/events
 */

import { Atom } from "@effect-atom/atom"
import type { ClientEventEntry, ConnectionStatus } from "../services/EventBusClient"

// Re-export for use in other atoms
export type { ClientEventEntry, ConnectionStatus }

// =============================================================================
// Connection Status State
// =============================================================================

/**
 * Connection status per ontology
 *
 * Simple state atom tracking WebSocket connection state.
 * Updated by the EventBusClient when connection changes.
 */
export const connectionStatusAtom = Atom.family((_ontologyId: string) => Atom.make<ConnectionStatus>("disconnected"))

// =============================================================================
// Event State
// =============================================================================

/**
 * All events for an ontology
 *
 * Simple state atom holding the current list of events.
 * Updated by the EventBusClient when events are received.
 */
export const eventsAtom = Atom.family((_ontologyId: string) => Atom.make<ReadonlyArray<ClientEventEntry>>([]))

/**
 * Last sync timestamp per ontology
 */
export const lastSyncAtom = Atom.family((_ontologyId: string) => Atom.make<Date | null>(null))

/**
 * Pending events count (not yet synced to server)
 */
export const pendingEventsCountAtom = Atom.family((_ontologyId: string) => Atom.make<number>(0))

// =============================================================================
// UI State
// =============================================================================

/**
 * Selected event type filter
 */
export const eventTypeFilterAtom = Atom.family((_ontologyId: string) => Atom.make<string | null>(null))

/**
 * Event list pagination
 */
export const eventPaginationAtom = Atom.family((_ontologyId: string) =>
  Atom.make({
    offset: 0,
    limit: 50
  })
)

// =============================================================================
// Helpers
// =============================================================================

/**
 * Update connection status for an ontology
 */
export const updateConnectionStatus = (ontologyId: string, status: ConnectionStatus) => {
  const atom = connectionStatusAtom(ontologyId)
  return Atom.set(atom, status)
}

/**
 * Add events to the event list
 */
export const addEvents = (ontologyId: string, newEvents: Array<ClientEventEntry>) => {
  const atom = eventsAtom(ontologyId)
  return Atom.update(atom, (current) => [...current, ...newEvents])
}

/**
 * Replace all events for an ontology
 */
export const setEvents = (ontologyId: string, events: ReadonlyArray<ClientEventEntry>) => {
  const atom = eventsAtom(ontologyId)
  return Atom.set(atom, events)
}

/**
 * Update last sync timestamp
 */
export const updateLastSync = (ontologyId: string) => {
  const atom = lastSyncAtom(ontologyId)
  return Atom.set(atom, new Date())
}

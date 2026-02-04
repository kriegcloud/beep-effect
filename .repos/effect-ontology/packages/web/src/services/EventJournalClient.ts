/**
 * Client-side EventJournal using IndexedDB
 *
 * Creates a per-ontology IndexedDB database for offline event persistence.
 * Uses @effect/experimental/EventJournal.makeIndexedDb for implementation.
 *
 * Database structure (auto-created):
 * - entries: Event entries with id and event indexes
 * - remotes: Sync state per remote source
 * - remoteEntryId: Cursor position per remote
 *
 * @since 1.0.0
 * @module services/EventJournalClient
 */

import * as EventJournal from "@effect/experimental/EventJournal"
import { Effect } from "effect"

/**
 * Create an EventJournal layer for a specific ontology
 *
 * Each ontology gets its own IndexedDB database to isolate events.
 *
 * @example
 * ```ts
 * const JournalLayer = OntologyEventJournalLayer("seattle")
 * // Creates database: ontology_events_seattle
 * ```
 *
 * @since 1.0.0
 */
export const OntologyEventJournalLayer = (ontologyId: string) =>
  EventJournal.layerIndexedDb({
    database: `ontology_events_${ontologyId}`
  })

/**
 * Create an EventJournal effect for a specific ontology
 *
 * Use this when you need programmatic access to the journal.
 *
 * @since 1.0.0
 */
export const makeOntologyEventJournal = (ontologyId: string) =>
  EventJournal.makeIndexedDb({
    database: `ontology_events_${ontologyId}`
  })

/**
 * Delete the IndexedDB database for an ontology
 *
 * Use for cleanup or resetting offline data.
 *
 * @since 1.0.0
 */
export const deleteOntologyEventJournal = (ontologyId: string) =>
  Effect.sync(() => {
    indexedDB.deleteDatabase(`ontology_events_${ontologyId}`)
  })

/**
 * List all ontology event databases
 *
 * Returns the names of all IndexedDB databases matching the ontology pattern.
 *
 * @since 1.0.0
 */
export const listOntologyEventDatabases = () =>
  Effect.tryPromise({
    try: async () => {
      if (!indexedDB.databases) {
        // Firefox doesn't support indexedDB.databases()
        return []
      }
      const databases = await indexedDB.databases()
      return databases
        .filter((db) => db.name?.startsWith("ontology_events_"))
        .map((db) => ({
          name: db.name!,
          ontologyId: db.name!.replace("ontology_events_", ""),
          version: db.version
        }))
    },
    catch: (error) => new Error(`Failed to list databases: ${error}`)
  })

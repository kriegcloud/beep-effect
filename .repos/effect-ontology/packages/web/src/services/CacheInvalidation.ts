/**
 * Cache Invalidation Service
 *
 * Maps events to atom invalidations using reactivity keys.
 * When server events arrive, this service determines which
 * atoms need to be refreshed.
 *
 * @since 2.0.0
 * @module services/CacheInvalidation
 */

import { Atom, type Registry } from "@effect-atom/atom"
import { Effect } from "effect"
import type { ClientEventEntry } from "./EventBusClient.js"
import { getReactivityKeys } from "./EventHandlers.js"

// =============================================================================
// Invalidation Trigger Atoms
// =============================================================================

/**
 * Invalidation trigger per ontology
 *
 * When this atom is updated, all dependent atoms for that ontology
 * will re-fetch their data. The value is a timestamp.
 */
export const invalidationTriggerAtom = Atom.family((_ontologyId: string) => Atom.make<number>(Date.now()))

/**
 * Per-key invalidation triggers
 *
 * Used for fine-grained invalidation of specific data types.
 */
export const keyInvalidationTriggerAtom = Atom.family((_key: string) => Atom.make<number>(Date.now()))

// =============================================================================
// Reactivity Key to Atom Mapping
// =============================================================================

/**
 * Maps reactivity keys to invalidation key prefixes
 *
 * This determines which data is invalidated when an event occurs.
 * The prefix is combined with ontologyId for scoped invalidation.
 *
 * NOTE: Timeline is NOT included here because liveTimelineAtom now handles
 * updates via stream-based event processing, not invalidation/refetch.
 * This eliminates redundant API calls when claims are added/modified.
 */
const REACTIVITY_KEY_MAPPING: Record<string, Array<string>> = {
  // Claims no longer triggers timeline refetch - liveTimelineAtom handles it
  claims: ["claims"],
  // Timeline events now handled by liveTimelineAtom via eventsAtom stream
  // timeline: ["timeline"],  // REMOVED - handled by live stream
  corrections: ["corrections"],
  deprecations: ["deprecations"],
  entities: ["entity-detail", "entities"],
  aliases: ["entity-detail"],
  "entity-detail": ["entity-detail"],
  "wikidata-links": ["entity-detail"],
  documents: ["documents", "document-detail"],
  stats: ["stats"],
  validations: ["validations", "documents"],
  "batch-state": ["batch-monitor", "batch-state"]
}

// =============================================================================
// Invalidation Functions
// =============================================================================

/**
 * Invalidate atoms for a specific event
 *
 * @param event - The event that occurred
 * @param ontologyId - The ontology ID for scoped invalidation
 * @param registry - The atom registry for getting/setting atoms
 */
export const invalidateForEvent = (
  event: ClientEventEntry,
  ontologyId: string,
  registry: Registry.Registry
): Effect.Effect<void> =>
  Effect.sync(() => {
    const reactivityKeys = getReactivityKeys(event.event)
    const now = Date.now()

    // Update the main invalidation trigger for this ontology
    const trigger = invalidationTriggerAtom(ontologyId)
    registry.set(trigger, now)

    // Update specific key invalidation triggers
    for (const key of reactivityKeys) {
      const mappings = REACTIVITY_KEY_MAPPING[key] ?? [key]
      for (const mapping of mappings) {
        const keyTrigger = keyInvalidationTriggerAtom(`${ontologyId}:${mapping}`)
        registry.set(keyTrigger, now)
      }
    }
  })

/**
 * Invalidate all data for an ontology
 *
 * Forces a complete refresh of all data atoms.
 */
export const invalidateOntology = (
  ontologyId: string,
  registry: Registry.Registry
): Effect.Effect<void> =>
  Effect.sync(() => {
    const now = Date.now()
    const trigger = invalidationTriggerAtom(ontologyId)
    registry.set(trigger, now)

    // Invalidate all known keys
    // Note: "timeline" is NOT included - liveTimelineAtom handles updates via stream
    const allKeys = [
      "claims",
      "entities",
      "entity-detail",
      "documents",
      "document-detail",
      "links",
      "stats",
      "validations",
      "corrections",
      "deprecations",
      "batch-state",
      "batch-monitor"
    ]

    for (const key of allKeys) {
      const keyTrigger = keyInvalidationTriggerAtom(`${ontologyId}:${key}`)
      registry.set(keyTrigger, now)
    }
  })

// =============================================================================
// Event Type Helpers
// =============================================================================

/**
 * Check if an event type requires data invalidation
 */
export const requiresInvalidation = (eventType: string): boolean => {
  const keys = getReactivityKeys(eventType)
  return keys.length > 0
}

/**
 * Get all invalidation keys for an event type
 */
export const getInvalidationKeys = (
  eventType: string,
  ontologyId: string
): Array<string> => {
  const reactivityKeys = getReactivityKeys(eventType)
  const invalidationKeys: Array<string> = [`${ontologyId}:*`]

  for (const key of reactivityKeys) {
    const mappings = REACTIVITY_KEY_MAPPING[key] ?? [key]
    for (const mapping of mappings) {
      invalidationKeys.push(`${ontologyId}:${mapping}`)
    }
  }

  return invalidationKeys
}

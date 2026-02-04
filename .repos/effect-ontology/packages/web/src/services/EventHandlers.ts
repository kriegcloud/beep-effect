/**
 * Frontend Event Handlers
 *
 * Provides event type definitions and handler utilities for the frontend.
 * Events are received from the server and stored in IndexedDB.
 *
 * @since 1.0.0
 * @module services/EventHandlers
 */

// =============================================================================
// Event Type Definitions
// =============================================================================

/**
 * Curation event types
 */
export const CurationEventTypes = [
  "ClaimCorrected",
  "ClaimDeprecated",
  "AliasAdded",
  "ClaimPromoted",
  "EntityLinked"
] as const

export type CurationEventType = (typeof CurationEventTypes)[number]

/**
 * Extraction event types
 */
export const ExtractionEventTypes = ["ExtractionCompleted", "ValidationFailed", "BatchStateChanged"] as const

export type ExtractionEventType = (typeof ExtractionEventTypes)[number]

/**
 * All event types
 */
export const AllEventTypes = [...CurationEventTypes, ...ExtractionEventTypes] as const

export type EventType = (typeof AllEventTypes)[number]

// =============================================================================
// Reactivity Keys
// =============================================================================

/**
 * Reactivity keys for curation events
 *
 * Maps event types to UI components that should refresh when the event occurs.
 */
export const CurationReactivityKeys: Record<CurationEventType, ReadonlyArray<string>> = {
  ClaimCorrected: ["claims", "timeline", "corrections"],
  ClaimDeprecated: ["claims", "timeline", "deprecations"],
  AliasAdded: ["entities", "aliases", "entity-detail"],
  ClaimPromoted: ["claims", "timeline"],
  EntityLinked: ["entities", "wikidata-links", "entity-detail"]
}

/**
 * Reactivity keys for extraction events
 */
export const ExtractionReactivityKeys: Record<ExtractionEventType, ReadonlyArray<string>> = {
  ExtractionCompleted: ["documents", "claims", "timeline", "stats"],
  ValidationFailed: ["validations", "documents"],
  BatchStateChanged: ["batch-state", "documents", "stats"]
}

/**
 * Get reactivity keys for an event type
 */
export const getReactivityKeys = (eventType: string): ReadonlyArray<string> => {
  if (eventType in CurationReactivityKeys) {
    return CurationReactivityKeys[eventType as CurationEventType]
  }
  if (eventType in ExtractionReactivityKeys) {
    return ExtractionReactivityKeys[eventType as ExtractionEventType]
  }
  return []
}

// =============================================================================
// Event Helpers
// =============================================================================

/**
 * Check if an event is a curation event
 */
export const isCurationEvent = (eventType: string): eventType is CurationEventType =>
  CurationEventTypes.includes(eventType as CurationEventType)

/**
 * Check if an event is an extraction event
 */
export const isExtractionEvent = (eventType: string): eventType is ExtractionEventType =>
  ExtractionEventTypes.includes(eventType as ExtractionEventType)

/**
 * Get human-readable event name
 */
export const getEventDisplayName = (eventType: string): string => {
  const names: Record<string, string> = {
    ClaimCorrected: "Claim Corrected",
    ClaimDeprecated: "Claim Deprecated",
    AliasAdded: "Alias Added",
    ClaimPromoted: "Claim Promoted",
    EntityLinked: "Entity Linked",
    ExtractionCompleted: "Extraction Completed",
    ValidationFailed: "Validation Failed",
    BatchStateChanged: "Batch State Changed"
  }
  return names[eventType] || eventType
}

/**
 * Get event icon (Lucide icon name)
 */
export const getEventIcon = (eventType: string): string => {
  const icons: Record<string, string> = {
    ClaimCorrected: "check-circle",
    ClaimDeprecated: "x-circle",
    AliasAdded: "tag",
    ClaimPromoted: "arrow-up",
    EntityLinked: "link",
    ExtractionCompleted: "file-check",
    ValidationFailed: "alert-triangle",
    BatchStateChanged: "loader"
  }
  return icons[eventType] || "activity"
}

/**
 * Batch State Atoms
 *
 * Real-time batch state tracking via EventBus events.
 * Updates from BatchStateChanged events are pushed directly to atoms.
 *
 * @since 2.0.0
 * @module atoms/batch
 */

import { Atom } from "@effect-atom/atom"

// BatchState type - inline definition matching backend
// (Avoids complex cross-package imports for frontend)
export type BatchStage =
  | "Pending"
  | "Preprocessing"
  | "Extracting"
  | "Resolving"
  | "Validating"
  | "Ingesting"
  | "Complete"
  | "Failed"

export interface BatchStateBase {
  readonly _tag: BatchStage
  readonly batchId: string
  readonly ontologyId: string
  readonly manifestUri: string
  readonly ontologyVersion: string
  readonly createdAt: unknown // DateTimeUtc
  readonly updatedAt: unknown // DateTimeUtc
}

export interface BatchState extends BatchStateBase {
  // Stage-specific fields (optional - present based on _tag)
  readonly documentCount?: number
  readonly documentsTotal?: number
  readonly documentsClassified?: number
  readonly documentsCompleted?: number
  readonly documentsFailed?: number
  readonly entitiesTotal?: number
  readonly clustersFormed?: number
  readonly triplesTotal?: number
  readonly triplesIngested?: number
  readonly stats?: {
    readonly documentsProcessed: number
    readonly entitiesExtracted: number
    readonly relationsExtracted: number
    readonly claimsExtracted: number
    readonly clustersResolved: number
    readonly triplesIngested: number
    readonly totalDurationMs: number
  }
  readonly error?: {
    readonly code: string
    readonly message: string
  }
  readonly failedInStage?: string
}

// =============================================================================
// Batch State Atoms
// =============================================================================

/**
 * Map of batchId -> BatchState for an ontology
 *
 * Updated from BatchStateChanged events via EventBusClient.
 * Key format: ontologyId for the family, value is Map of batchId -> state.
 */
export const batchStatesAtom = Atom.family((_ontologyId: string) => Atom.make<Map<string, BatchState>>(new Map()))

/**
 * Currently focused batch ID (for detail view)
 */
export const focusedBatchIdAtom = Atom.family((_ontologyId: string) => Atom.make<string | null>(null))

/**
 * Filter for batch stage (for listing)
 */
export const batchStageFilterAtom = Atom.family((_ontologyId: string) => Atom.make<string | null>(null))

// =============================================================================
// Derived Atoms (using Atom.make with get)
// =============================================================================

/**
 * Get all batches sorted by updatedAt (newest first)
 */
export const allBatchesAtom = Atom.family((ontologyId: string) =>
  Atom.make((get) => {
    const states = get(batchStatesAtom(ontologyId))
    const all = Array.from(states.values())
    // Sort by updatedAt descending
    return all.sort((a, b) => {
      const aTime = new Date(String(a.updatedAt)).getTime()
      const bTime = new Date(String(b.updatedAt)).getTime()
      return bTime - aTime
    })
  })
)

/**
 * Get active (non-terminal) batches for an ontology
 */
export const activeBatchesAtom = Atom.family((ontologyId: string) =>
  Atom.make((get) => {
    const all = get(allBatchesAtom(ontologyId))
    return all.filter((state) => state._tag !== "Complete" && state._tag !== "Failed")
  })
)

/**
 * Get completed batches for an ontology
 */
export const completedBatchesAtom = Atom.family((ontologyId: string) =>
  Atom.make((get) => {
    const all = get(allBatchesAtom(ontologyId))
    return all.filter((state) => state._tag === "Complete")
  })
)

/**
 * Get failed batches for an ontology
 */
export const failedBatchesAtom = Atom.family((ontologyId: string) =>
  Atom.make((get) => {
    const all = get(allBatchesAtom(ontologyId))
    return all.filter((state) => state._tag === "Failed")
  })
)

// =============================================================================
// Update Functions
// =============================================================================

/**
 * Update batch state from an event
 *
 * Called from EventBusClient when BatchStateChanged event is received.
 */
export const updateBatchState = (ontologyId: string, batchId: string, state: BatchState) => {
  const atom = batchStatesAtom(ontologyId)
  return Atom.update(atom, (current) => {
    const next = new Map(current)
    next.set(batchId, state)
    return next
  })
}

/**
 * Remove a batch from tracking (e.g., after viewing results)
 */
export const removeBatch = (ontologyId: string, batchId: string) => {
  const atom = batchStatesAtom(ontologyId)
  return Atom.update(atom, (current) => {
    const next = new Map(current)
    next.delete(batchId)
    return next
  })
}

/**
 * Clear all batches for an ontology
 */
export const clearBatches = (ontologyId: string) => {
  const atom = batchStatesAtom(ontologyId)
  return Atom.set(atom, new Map())
}

/**
 * Set focused batch ID
 */
export const setFocusedBatch = (ontologyId: string, batchId: string | null) => {
  const atom = focusedBatchIdAtom(ontologyId)
  return Atom.set(atom, batchId)
}

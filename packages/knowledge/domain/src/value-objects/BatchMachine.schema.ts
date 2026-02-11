import { Event, Slot, State } from "effect-machine";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import * as S from "effect/Schema";

import { BatchConfig } from "./BatchConfig.value";

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

export const BatchMachineState = State({
  Pending: {
    batchId: KnowledgeEntityIds.BatchExecutionId,
    documentIds: S.Array(S.String),
    config: BatchConfig,
  },
  Extracting: {
    batchId: KnowledgeEntityIds.BatchExecutionId,
    documentIds: S.Array(S.String),
    config: BatchConfig,
    completedCount: S.NonNegativeInt,
    failedCount: S.NonNegativeInt,
    totalDocuments: S.NonNegativeInt,
    entityCount: S.NonNegativeInt,
    relationCount: S.NonNegativeInt,
    progress: S.Number,
  },
  Resolving: {
    batchId: KnowledgeEntityIds.BatchExecutionId,
    config: BatchConfig,
    totalDocuments: S.NonNegativeInt,
    entityCount: S.NonNegativeInt,
    relationCount: S.NonNegativeInt,
    progress: S.Number,
  },
  Completed: {
    batchId: KnowledgeEntityIds.BatchExecutionId,
    totalDocuments: S.NonNegativeInt,
    entityCount: S.NonNegativeInt,
    relationCount: S.NonNegativeInt,
  },
  Failed: {
    batchId: KnowledgeEntityIds.BatchExecutionId,
    documentIds: S.Array(S.String),
    config: BatchConfig,
    failedCount: S.NonNegativeInt,
    error: S.String,
  },
  Cancelled: {
    batchId: KnowledgeEntityIds.BatchExecutionId,
    completedCount: S.NonNegativeInt,
    totalDocuments: S.NonNegativeInt,
  },
});

export type BatchMachineState = typeof BatchMachineState.Type;

// ---------------------------------------------------------------------------
// Event
// ---------------------------------------------------------------------------

export const BatchMachineEvent = Event({
  StartExtraction: {},
  DocumentCompleted: {
    documentId: S.String,
    entityCount: S.NonNegativeInt,
    relationCount: S.NonNegativeInt,
  },
  DocumentFailed: {
    documentId: S.String,
    error: S.String,
  },
  ExtractionComplete: {
    successCount: S.NonNegativeInt,
    failureCount: S.NonNegativeInt,
    totalEntityCount: S.NonNegativeInt,
    totalRelationCount: S.NonNegativeInt,
  },
  ResolutionComplete: {
    mergeCount: S.NonNegativeInt,
  },
  Cancel: {},
  Retry: {},
  Fail: {
    error: S.String,
  },
});

export type BatchMachineEvent = typeof BatchMachineEvent.Type;

// ---------------------------------------------------------------------------
// Guards
// ---------------------------------------------------------------------------

export const BatchMachineGuards = Slot.Guards({
  canRetry: { maxRetries: S.Number },
  isResolutionEnabled: {},
});

export type BatchMachineGuards = typeof BatchMachineGuards;

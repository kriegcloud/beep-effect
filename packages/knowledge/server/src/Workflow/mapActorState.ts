import type { BatchState } from "@beep/knowledge-domain/value-objects";
import { BatchMachineState } from "@beep/knowledge-domain/value-objects";

export const mapActorStateToBatchState = (state: BatchMachineState): BatchState =>
  BatchMachineState.$match(state, {
    Pending: (s): BatchState => ({
      _tag: "BatchState.Pending",
      batchId: s.batchId,
    }),
    Extracting: (s): BatchState => ({
      _tag: "BatchState.Extracting",
      batchId: s.batchId,
      completedDocuments: s.completedCount,
      totalDocuments: s.totalDocuments,
      progress: s.progress,
    }),
    Resolving: (s): BatchState => ({
      _tag: "BatchState.Resolving",
      batchId: s.batchId,
      progress: s.progress,
    }),
    Completed: (s): BatchState => ({
      _tag: "BatchState.Completed",
      batchId: s.batchId,
      totalDocuments: s.totalDocuments,
      entityCount: s.entityCount,
      relationCount: s.relationCount,
    }),
    Failed: (s): BatchState => ({
      _tag: "BatchState.Failed",
      batchId: s.batchId,
      failedDocuments: s.failedCount,
      error: s.error,
    }),
    Cancelled: (s): BatchState => ({
      _tag: "BatchState.Cancelled",
      batchId: s.batchId,
      completedDocuments: s.completedCount,
      totalDocuments: s.totalDocuments,
    }),
  });

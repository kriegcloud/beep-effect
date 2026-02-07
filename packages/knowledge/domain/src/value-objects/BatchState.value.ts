import { $KnowledgeDomainId } from "@beep/identity/packages";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("value-objects/batch-state");

export class Pending extends S.TaggedClass<Pending>($I`Pending`)(
  "BatchState.Pending",
  {
    batchId: KnowledgeEntityIds.BatchExecutionId,
  },
  $I.annotations("Pending", {
    description: "Batch created, not yet started",
  })
) {}

export class Extracting extends S.TaggedClass<Extracting>($I`Extracting`)(
  "BatchState.Extracting",
  {
    batchId: KnowledgeEntityIds.BatchExecutionId,
    completedDocuments: S.NonNegativeInt,
    totalDocuments: S.NonNegativeInt,
    progress: S.Number.pipe(S.between(0, 1)),
  },
  $I.annotations("Extracting", {
    description: "Documents being processed in the batch",
  })
) {}

export class Resolving extends S.TaggedClass<Resolving>($I`Resolving`)(
  "BatchState.Resolving",
  {
    batchId: KnowledgeEntityIds.BatchExecutionId,
    progress: S.Number.pipe(S.between(0, 1)),
  },
  $I.annotations("Resolving", {
    description: "Entity resolution running across all documents",
  })
) {}

export class Completed extends S.TaggedClass<Completed>($I`Completed`)(
  "BatchState.Completed",
  {
    batchId: KnowledgeEntityIds.BatchExecutionId,
    totalDocuments: S.NonNegativeInt,
    entityCount: S.NonNegativeInt,
    relationCount: S.NonNegativeInt,
  },
  $I.annotations("Completed", {
    description: "All batch processing completed successfully",
  })
) {}

export class Failed extends S.TaggedClass<Failed>($I`Failed`)(
  "BatchState.Failed",
  {
    batchId: KnowledgeEntityIds.BatchExecutionId,
    failedDocuments: S.NonNegativeInt,
    error: S.String,
  },
  $I.annotations("Failed", {
    description: "Batch processing failed",
  })
) {}

export class Cancelled extends S.TaggedClass<Cancelled>($I`Cancelled`)(
  "BatchState.Cancelled",
  {
    batchId: KnowledgeEntityIds.BatchExecutionId,
    completedDocuments: S.NonNegativeInt,
    totalDocuments: S.NonNegativeInt,
  },
  $I.annotations("Cancelled", {
    description: "Batch processing was cancelled",
  })
) {}

export const BatchState = S.Union(Pending, Extracting, Resolving, Completed, Failed, Cancelled).annotations(
  $I.annotations("BatchState", {
    description: "State machine ADT for batch extraction processing",
  })
);

export type BatchState = S.Schema.Type<typeof BatchState>;

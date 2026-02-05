import { $KnowledgeDomainId } from "@beep/identity/packages";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("value-objects/batch-state");

export const Pending = S.TaggedStruct("BatchState.Pending", {
  batchId: KnowledgeEntityIds.BatchExecutionId,
}).annotations(
  $I.annotations("BatchState.Pending", {
    description: "Batch created, not yet started",
  })
);

export declare namespace Pending {
  export type Type = S.Schema.Type<typeof Pending>;
}

export const Extracting = S.TaggedStruct("BatchState.Extracting", {
  batchId: KnowledgeEntityIds.BatchExecutionId,
  completedDocuments: S.NonNegativeInt,
  totalDocuments: S.NonNegativeInt,
  progress: S.Number.pipe(S.between(0, 1)),
}).annotations(
  $I.annotations("BatchState.Extracting", {
    description: "Documents being processed in the batch",
  })
);

export declare namespace Extracting {
  export type Type = S.Schema.Type<typeof Extracting>;
}

export const Resolving = S.TaggedStruct("BatchState.Resolving", {
  batchId: KnowledgeEntityIds.BatchExecutionId,
  progress: S.Number.pipe(S.between(0, 1)),
}).annotations(
  $I.annotations("BatchState.Resolving", {
    description: "Entity resolution running across all documents",
  })
);

export declare namespace Resolving {
  export type Type = S.Schema.Type<typeof Resolving>;
}

export const Completed = S.TaggedStruct("BatchState.Completed", {
  batchId: KnowledgeEntityIds.BatchExecutionId,
  totalDocuments: S.NonNegativeInt,
  entityCount: S.NonNegativeInt,
  relationCount: S.NonNegativeInt,
}).annotations(
  $I.annotations("BatchState.Completed", {
    description: "All batch processing completed successfully",
  })
);

export declare namespace Completed {
  export type Type = S.Schema.Type<typeof Completed>;
}

export const Failed = S.TaggedStruct("BatchState.Failed", {
  batchId: KnowledgeEntityIds.BatchExecutionId,
  failedDocuments: S.NonNegativeInt,
  error: S.String,
}).annotations(
  $I.annotations("BatchState.Failed", {
    description: "Batch processing failed",
  })
);

export declare namespace Failed {
  export type Type = S.Schema.Type<typeof Failed>;
}

export const Cancelled = S.TaggedStruct("BatchState.Cancelled", {
  batchId: KnowledgeEntityIds.BatchExecutionId,
  completedDocuments: S.NonNegativeInt,
  totalDocuments: S.NonNegativeInt,
}).annotations(
  $I.annotations("BatchState.Cancelled", {
    description: "Batch processing was cancelled",
  })
);

export declare namespace Cancelled {
  export type Type = S.Schema.Type<typeof Cancelled>;
}

export const BatchState = S.Union(Pending, Extracting, Resolving, Completed, Failed, Cancelled).annotations(
  $I.annotations("BatchState", {
    description: "State machine ADT for batch extraction processing",
  })
);

export type BatchState = S.Schema.Type<typeof BatchState>;

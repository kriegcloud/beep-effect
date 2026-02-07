import { $KnowledgeDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("value-objects/batch-event");

export const BatchCreated = S.TaggedStruct("BatchEvent.BatchCreated", {
  batchId: KnowledgeEntityIds.BatchExecutionId,
  totalDocuments: S.NonNegativeInt,
  timestamp: BS.DateTimeUtcFromAllAcceptable,
}).annotations(
  $I.annotations("BatchEvent.BatchCreated", {
    description: "Emitted when a batch extraction is created",
  })
);

export declare namespace BatchCreated {
  export type Type = S.Schema.Type<typeof BatchCreated>;
}

export const DocumentStarted = S.TaggedStruct("BatchEvent.DocumentStarted", {
  batchId: KnowledgeEntityIds.BatchExecutionId,
  documentId: S.String,
  documentIndex: S.NonNegativeInt,
  timestamp: BS.DateTimeUtcFromAllAcceptable,
}).annotations(
  $I.annotations("BatchEvent.DocumentStarted", {
    description: "Emitted when a document extraction begins within a batch",
  })
);

export declare namespace DocumentStarted {
  export type Type = S.Schema.Type<typeof DocumentStarted>;
}

export const DocumentCompleted = S.TaggedStruct("BatchEvent.DocumentCompleted", {
  batchId: KnowledgeEntityIds.BatchExecutionId,
  documentId: S.String,
  entityCount: S.NonNegativeInt,
  relationCount: S.NonNegativeInt,
  timestamp: BS.DateTimeUtcFromAllAcceptable,
}).annotations(
  $I.annotations("BatchEvent.DocumentCompleted", {
    description: "Emitted when a document extraction completes within a batch",
  })
);

export declare namespace DocumentCompleted {
  export type Type = S.Schema.Type<typeof DocumentCompleted>;
}

export const DocumentFailed = S.TaggedStruct("BatchEvent.DocumentFailed", {
  batchId: KnowledgeEntityIds.BatchExecutionId,
  documentId: S.String,
  error: S.String,
  timestamp: BS.DateTimeUtcFromAllAcceptable,
}).annotations(
  $I.annotations("BatchEvent.DocumentFailed", {
    description: "Emitted when a document extraction fails within a batch",
  })
);

export declare namespace DocumentFailed {
  export type Type = S.Schema.Type<typeof DocumentFailed>;
}

export const StageProgress = S.TaggedStruct("BatchEvent.StageProgress", {
  batchId: KnowledgeEntityIds.BatchExecutionId,
  documentId: S.String,
  stage: S.String,
  progress: S.Number.pipe(S.between(0, 1)),
  timestamp: BS.DateTimeUtcFromAllAcceptable,
}).annotations(
  $I.annotations("BatchEvent.StageProgress", {
    description: "Emitted for progress updates within a document extraction stage",
  })
);

export declare namespace StageProgress {
  export type Type = S.Schema.Type<typeof StageProgress>;
}

export const ResolutionStarted = S.TaggedStruct("BatchEvent.ResolutionStarted", {
  batchId: KnowledgeEntityIds.BatchExecutionId,
  timestamp: BS.DateTimeUtcFromAllAcceptable,
}).annotations(
  $I.annotations("BatchEvent.ResolutionStarted", {
    description: "Emitted when cross-document entity resolution begins",
  })
);

export declare namespace ResolutionStarted {
  export type Type = S.Schema.Type<typeof ResolutionStarted>;
}

export const ResolutionCompleted = S.TaggedStruct("BatchEvent.ResolutionCompleted", {
  batchId: KnowledgeEntityIds.BatchExecutionId,
  mergeCount: S.NonNegativeInt,
  timestamp: BS.DateTimeUtcFromAllAcceptable,
}).annotations(
  $I.annotations("BatchEvent.ResolutionCompleted", {
    description: "Emitted when cross-document entity resolution completes",
  })
);

export declare namespace ResolutionCompleted {
  export type Type = S.Schema.Type<typeof ResolutionCompleted>;
}

export const BatchCompleted = S.TaggedStruct("BatchEvent.BatchCompleted", {
  batchId: KnowledgeEntityIds.BatchExecutionId,
  totalDocuments: S.NonNegativeInt,
  entityCount: S.NonNegativeInt,
  relationCount: S.NonNegativeInt,
  timestamp: BS.DateTimeUtcFromAllAcceptable,
}).annotations(
  $I.annotations("BatchEvent.BatchCompleted", {
    description: "Emitted when the entire batch extraction completes successfully",
  })
);

export declare namespace BatchCompleted {
  export type Type = S.Schema.Type<typeof BatchCompleted>;
}

export const BatchFailed = S.TaggedStruct("BatchEvent.BatchFailed", {
  batchId: KnowledgeEntityIds.BatchExecutionId,
  error: S.String,
  failedDocuments: S.NonNegativeInt,
  timestamp: BS.DateTimeUtcFromAllAcceptable,
}).annotations(
  $I.annotations("BatchEvent.BatchFailed", {
    description: "Emitted when the batch extraction fails",
  })
);

export declare namespace BatchFailed {
  export type Type = S.Schema.Type<typeof BatchFailed>;
}

export const BatchEvent = S.Union(
  BatchCreated,
  DocumentStarted,
  DocumentCompleted,
  DocumentFailed,
  StageProgress,
  ResolutionStarted,
  ResolutionCompleted,
  BatchCompleted,
  BatchFailed
).annotations(
  $I.annotations("BatchEvent", {
    description: "Events emitted during batch extraction processing for SSE delivery",
  })
);

export type BatchEvent = S.Schema.Type<typeof BatchEvent>;

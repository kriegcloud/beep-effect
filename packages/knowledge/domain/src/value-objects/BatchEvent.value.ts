import { $KnowledgeDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { WorkspacesEntityIds, KnowledgeEntityIds } from "@beep/shared-domain";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("value-objects/batch-event");

export class BatchCreated extends S.TaggedClass<BatchCreated>($I`BatchCreated`)(
  "BatchEvent.BatchCreated",
  {
    batchId: KnowledgeEntityIds.BatchExecutionId,
    totalDocuments: S.NonNegativeInt,
    timestamp: BS.DateTimeUtcFromAllAcceptable,
  },
  $I.annotations("BatchCreated", {
    description: "Emitted when a batch extraction is created",
  })
) {}

export class DocumentStarted extends S.TaggedClass<DocumentStarted>($I`DocumentStarted`)(
  "BatchEvent.DocumentStarted",
  {
    batchId: KnowledgeEntityIds.BatchExecutionId,
    documentId: WorkspacesEntityIds.DocumentId,
    documentIndex: S.NonNegativeInt,
    timestamp: BS.DateTimeUtcFromAllAcceptable,
  },
  $I.annotations("DocumentStarted", {
    description: "Emitted when a document extraction begins within a batch",
  })
) {}

export class DocumentCompleted extends S.TaggedClass<DocumentCompleted>($I`DocumentCompleted`)(
  "BatchEvent.DocumentCompleted",
  {
    batchId: KnowledgeEntityIds.BatchExecutionId,
    documentId: WorkspacesEntityIds.DocumentId,
    entityCount: S.NonNegativeInt,
    relationCount: S.NonNegativeInt,
    timestamp: BS.DateTimeUtcFromAllAcceptable,
  },
  $I.annotations("DocumentCompleted", {
    description: "Emitted when a document extraction completes within a batch",
  })
) {}

export class DocumentFailed extends S.TaggedClass<DocumentFailed>($I`DocumentFailed`)(
  "BatchEvent.DocumentFailed",
  {
    batchId: KnowledgeEntityIds.BatchExecutionId,
    documentId: WorkspacesEntityIds.DocumentId,
    error: S.String,
    timestamp: BS.DateTimeUtcFromAllAcceptable,
  },
  $I.annotations("DocumentFailed", {
    description: "Emitted when a document extraction fails within a batch",
  })
) {}

export class StageProgress extends S.TaggedClass<StageProgress>($I`StageProgress`)(
  "BatchEvent.StageProgress",
  {
    batchId: KnowledgeEntityIds.BatchExecutionId,
    documentId: WorkspacesEntityIds.DocumentId,
    stage: S.String,
    progress: S.Number.pipe(S.between(0, 1)),
    timestamp: BS.DateTimeUtcFromAllAcceptable,
  },
  $I.annotations("StageProgress", {
    description: "Emitted for progress updates within a document extraction stage",
  })
) {}

export class ResolutionStarted extends S.TaggedClass<ResolutionStarted>($I`ResolutionStarted`)(
  "BatchEvent.ResolutionStarted",
  {
    batchId: KnowledgeEntityIds.BatchExecutionId,
    timestamp: BS.DateTimeUtcFromAllAcceptable,
  },
  $I.annotations("ResolutionStarted", {
    description: "Emitted when cross-document entity resolution begins",
  })
) {}

export class ResolutionCompleted extends S.TaggedClass<ResolutionCompleted>($I`ResolutionCompleted`)(
  "BatchEvent.ResolutionCompleted",
  {
    batchId: KnowledgeEntityIds.BatchExecutionId,
    mergeCount: S.NonNegativeInt,
    timestamp: BS.DateTimeUtcFromAllAcceptable,
  },
  $I.annotations("ResolutionCompleted", {
    description: "Emitted when cross-document entity resolution completes",
  })
) {}

export class BatchCompleted extends S.TaggedClass<BatchCompleted>($I`BatchCompleted`)(
  "BatchEvent.BatchCompleted",
  {
    batchId: KnowledgeEntityIds.BatchExecutionId,
    totalDocuments: S.NonNegativeInt,
    entityCount: S.NonNegativeInt,
    relationCount: S.NonNegativeInt,
    timestamp: BS.DateTimeUtcFromAllAcceptable,
  },
  $I.annotations("BatchCompleted", {
    description: "Emitted when the entire batch extraction completes successfully",
  })
) {}

export class BatchFailed extends S.TaggedClass<BatchFailed>($I`BatchFailed`)(
  "BatchEvent.BatchFailed",
  {
    batchId: KnowledgeEntityIds.BatchExecutionId,
    error: S.String,
    failedDocuments: S.NonNegativeInt,
    timestamp: BS.DateTimeUtcFromAllAcceptable,
  },
  $I.annotations("BatchFailed", {
    description: "Emitted when the batch extraction fails",
  })
) {}

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
export declare namespace BatchEvent {
  export type Type = S.Schema.Type<typeof BatchEvent>;
  export type Encoded = S.Schema.Encoded<typeof BatchEvent>;
}

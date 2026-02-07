import { $KnowledgeDomainId } from "@beep/identity/packages";
import { BatchAlreadyRunningError, InvalidStateTransitionError } from "@beep/knowledge-domain/errors";
import { BatchConfig } from "@beep/knowledge-domain/value-objects";
import { DocumentsEntityIds, KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("rpc/Batch/StartBatch");

export class BatchDocument extends S.Class<BatchDocument>($I`BatchDocument`)(
  {
    documentId: DocumentsEntityIds.DocumentId,
    text: S.String,
  },
  $I.annotations("BatchDocument", {
    description: "Document with text content for batch extraction",
  })
) {}

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    organizationId: SharedEntityIds.OrganizationId,
    ontologyId: KnowledgeEntityIds.OntologyId,
    documents: S.Array(BatchDocument),
    ontologyContent: S.String,
    config: S.optional(BatchConfig),
  },
  $I.annotations("Payload", {
    description: "batch_start payload",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    batchId: KnowledgeEntityIds.BatchExecutionId,
    totalDocuments: S.NonNegativeInt,
  },
  $I.annotations("Success", {
    description: "Batch extraction started",
  })
) {}

export const Error = S.Union(InvalidStateTransitionError, BatchAlreadyRunningError).annotations(
  $I.annotations("Error", {
    description: "batch_start failed",
  })
);

export const Contract = Rpc.make("start", {
  payload: Payload,
  success: Success,
  error: Error,
});

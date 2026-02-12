import { $KnowledgeDomainId } from "@beep/identity/packages";
import { BatchAlreadyRunningError, InvalidStateTransitionError } from "@beep/knowledge-domain/errors";
import { BatchConfig } from "@beep/knowledge-domain/value-objects";
import { DocumentsEntityIds, KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("entities/Batch/contracts/StartBatch.contract");

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

export const Failure = S.Union(InvalidStateTransitionError, BatchAlreadyRunningError);
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "start",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "Start batch extraction Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.post("StartBatch", "/start")
    .setPayload(Payload)
    .addError(InvalidStateTransitionError)
    .addError(BatchAlreadyRunningError)
    .addSuccess(Success, { status: 201 });
}

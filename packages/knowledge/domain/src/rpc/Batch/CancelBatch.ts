import { $KnowledgeDomainId } from "@beep/identity/packages";
import { BatchNotFoundError, InvalidStateTransitionError } from "@beep/knowledge-domain/errors";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("rpc/Batch/CancelBatch");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    batchId: KnowledgeEntityIds.BatchExecutionId,
  },
  $I.annotations("Payload", {
    description: "batch_cancel payload",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    batchId: KnowledgeEntityIds.BatchExecutionId,
    cancelled: S.Boolean,
  },
  $I.annotations("Success", {
    description: "Batch cancellation result",
  })
) {}

export const Error = S.Union(BatchNotFoundError, InvalidStateTransitionError).annotations(
  $I.annotations("Error", {
    description: "batch_cancel failed",
  })
);

export const Contract = Rpc.make("cancel", {
  payload: Payload,
  success: Success,
  error: Error,
});

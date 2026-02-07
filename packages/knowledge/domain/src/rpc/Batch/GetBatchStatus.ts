import { $KnowledgeDomainId } from "@beep/identity/packages";
import { BatchNotFoundError } from "@beep/knowledge-domain/errors";
import { BatchState } from "@beep/knowledge-domain/value-objects";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("rpc/Batch/GetBatchStatus");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    batchId: KnowledgeEntityIds.BatchExecutionId,
  },
  $I.annotations("Payload", {
    description: "batch_getStatus payload",
  })
) {}

export const Success = BatchState.annotations(
  $I.annotations("Success", {
    description: "Current batch state",
  })
);

export const Error = BatchNotFoundError.annotations(
  $I.annotations("Error", {
    description: "batch_getStatus failed",
  })
);

export const Contract = Rpc.make("getStatus", {
  payload: Payload,
  success: Success,
  error: Error,
});

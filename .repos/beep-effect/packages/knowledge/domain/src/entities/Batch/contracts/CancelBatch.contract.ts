import { $KnowledgeDomainId } from "@beep/identity/packages";
import { BatchNotFoundError, InvalidStateTransitionError } from "@beep/knowledge-domain/errors";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("entities/Batch/contracts/CancelBatch.contract");

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

export const Failure = S.Union(BatchNotFoundError, InvalidStateTransitionError);
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "cancel",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "Cancel batch Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.del("CancelBatch", "/cancel")
    .setPayload(Payload)
    .addError(BatchNotFoundError)
    .addError(InvalidStateTransitionError)
    .addSuccess(Success);
}

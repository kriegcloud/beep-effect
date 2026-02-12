import { $KnowledgeDomainId } from "@beep/identity/packages";
import { BatchNotFoundError } from "@beep/knowledge-domain/errors";
import { BatchState } from "@beep/knowledge-domain/value-objects";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("entities/Batch/contracts/GetBatchStatus.contract");

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

export const Failure = BatchNotFoundError;
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "getStatus",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "Get batch status Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.get("GetBatchStatus", "/status")
    .setPayload(Payload)
    .addError(BatchNotFoundError)
    .addSuccess(Success);
}

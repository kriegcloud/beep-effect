import { $KnowledgeDomainId } from "@beep/identity/packages";
import { BatchNotFoundError } from "@beep/knowledge-domain/errors";
import { BatchEvent } from "@beep/knowledge-domain/value-objects";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import * as Rpc from "@effect/rpc/Rpc";
import * as RpcSchema from "@effect/rpc/RpcSchema";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("entities/Batch/contracts/StreamProgress.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    batchId: KnowledgeEntityIds.BatchExecutionId,
  },
  $I.annotations("Payload", {
    description: "batch_streamProgress payload",
  })
) {}

export const SuccessElement = BatchEvent.annotations(
  $I.annotations("SuccessElement", {
    description: "Batch progress event stream element",
  })
);

export const FailureElement = BatchNotFoundError;

export const Success = RpcSchema.Stream({ success: SuccessElement, failure: FailureElement });
export type Success = S.Schema.Type<typeof Success>;

export const Failure = S.Never;
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "streamProgress",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotations("Contract", {
    description: "Stream batch progress Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
}

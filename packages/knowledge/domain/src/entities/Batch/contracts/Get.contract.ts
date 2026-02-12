import { $KnowledgeDomainId } from "@beep/identity/packages";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as BatchErrors from "../Batch.errors";
import * as Batch from "../Batch.model";

const $I = $KnowledgeDomainId.create("entities/Batch/contracts/Get.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    id: KnowledgeEntityIds.BatchExecutionId,
  },
  $I.annotations("Payload", {
    description: "Payload for the Get Batch Contract.",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    data: Batch.Model.json,
  },
  $I.annotations("Success", {
    description: "Success response for the Get Batch Contract.",
  })
) {}

export const Failure = BatchErrors.BatchNotFoundError;
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "Get",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "Get Batch Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.get("Get", "/:id")
    .setPayload(Payload)
    .addError(BatchErrors.BatchNotFoundError)
    .addSuccess(Success);
}

import { $KnowledgeDomainId } from "@beep/identity/packages";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as RelationErrors from "../Relation.errors";
import * as Relation from "../Relation.model";

const $I = $KnowledgeDomainId.create("entities/Relation/contracts/Get.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    id: KnowledgeEntityIds.RelationId,
  },
  $I.annotations("Payload", {
    description: "Payload for the Get Relation Contract.",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    data: Relation.Model.json,
  },
  $I.annotations("Success", {
    description: "Success response for the Get Relation Contract.",
  })
) {}

export const Failure = RelationErrors.RelationNotFoundError;
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "Get",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "Get Relation Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.get("Get", "/:id")
    .setPayload(Payload)
    .addError(RelationErrors.RelationNotFoundError)
    .addSuccess(Success);
}

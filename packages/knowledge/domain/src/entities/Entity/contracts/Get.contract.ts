import { $KnowledgeDomainId } from "@beep/identity/packages";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as EntityErrors from "../Entity.errors";
import * as Entity from "../Entity.model";

const $I = $KnowledgeDomainId.create("entities/Entity/contracts/Get.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    id: KnowledgeEntityIds.KnowledgeEntityId,
  },
  $I.annotations("Payload", {
    description: "Payload for the Get KnowledgeEntity Contract.",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    data: Entity.Model.json,
  },
  $I.annotations("Success", {
    description: "Success response for the Get KnowledgeEntity Contract.",
  })
) {}

export const Failure = EntityErrors.KnowledgeEntityNotFoundError;
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "Get",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "Get KnowledgeEntity Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.get("Get", "/:id")
    .setPayload(Payload)
    .addError(EntityErrors.KnowledgeEntityNotFoundError)
    .addSuccess(Success);
}

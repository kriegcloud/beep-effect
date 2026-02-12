import { $KnowledgeDomainId } from "@beep/identity/packages";
import { EntityNotFoundError } from "@beep/shared-domain/errors";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import { Model } from "../Entity.model";

const $I = $KnowledgeDomainId.create("entities/Entity/contracts/Update.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  Model.update,
  $I.annotations("Payload", {
    description: "entity_update payload",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  Model.json,
  $I.annotations("Success", {
    description: "entity_update succeeded",
  })
) {}

export const Failure = EntityNotFoundError;
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "update",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "Update entity Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.patch("Update", "/update")
    .setPayload(Payload)
    .addError(EntityNotFoundError)
    .addSuccess(Success);
}

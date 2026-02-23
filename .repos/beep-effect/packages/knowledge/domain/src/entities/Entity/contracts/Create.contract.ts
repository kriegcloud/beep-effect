import { $KnowledgeDomainId } from "@beep/identity/packages";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import { Model } from "../Entity.model";

const $I = $KnowledgeDomainId.create("entities/Entity/contracts/Create.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  Model.insert,
  $I.annotations("Payload", {
    description: "entity_create payload",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  Model.json,
  $I.annotations("Success", {
    description: "entity_create succeeded",
  })
) {}

export const Failure = S.Never;
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "create",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "Create entity Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.post("Create", "/create")
    .setPayload(Payload)
    .addSuccess(Success, { status: 201 });
}

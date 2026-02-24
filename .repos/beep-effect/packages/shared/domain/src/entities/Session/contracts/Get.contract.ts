import { $SharedDomainId } from "@beep/identity/packages";
import { SharedEntityIds } from "@beep/shared-domain/entity-ids";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as SessionErrors from "../Session.errors";
import * as Session from "../Session.model";

const $I = $SharedDomainId.create("entities/Session/contracts/Get.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    id: SharedEntityIds.SessionId,
  },
  $I.annotations("Payload", {
    description: "Payload for the Get Session Contract.",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    data: Session.Model.json,
  },
  $I.annotations("Success", {
    description: "Success response for the Get Session Contract.",
  })
) {}

export const Failure = SessionErrors.SessionNotFoundError;
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "Get",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "Get Session Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.get("Get", "/:id")
    .setPayload(Payload)
    .addError(SessionErrors.SessionNotFoundError)
    .addSuccess(Success);
}

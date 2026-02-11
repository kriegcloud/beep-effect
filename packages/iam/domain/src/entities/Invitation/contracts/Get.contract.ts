import { $IamDomainId } from "@beep/identity/packages";
import { IamEntityIds } from "@beep/shared-domain";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as InvitationErrors from "../Invitation.errors";
import * as Invitation from "../Invitation.model";

const $I = $IamDomainId.create("entities/Invitation/contracts/Get.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    id: IamEntityIds.InvitationId,
  },
  $I.annotations("Payload", {
    description: "Payload for the Get Invitation Contract.",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    data: Invitation.Model.json,
  },
  $I.annotations("Success", {
    description: "Success response for the Get Invitation Contract.",
  })
) {}

export const Failure = InvitationErrors.InvitationNotFoundError;
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "Get",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "Get Invitation Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.get("Get", "/:id")
    .setPayload(Payload)
    .addError(InvitationErrors.InvitationNotFoundError)
    .addSuccess(Success);
}

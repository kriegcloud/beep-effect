import { $SharedDomainId } from "@beep/identity/packages";
import { SharedEntityIds } from "@beep/shared-domain/entity-ids";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as UserErrors from "../User.errors";
import * as User from "../User.model";

const $I = $SharedDomainId.create("entities/User/contracts/Get.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    id: SharedEntityIds.UserId,
  },
  $I.annotations("Payload", {
    description: "Payload for the Get User Contract.",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    data: User.Model.json,
  },
  $I.annotations("Success", {
    description: "Success response for the Get User Contract.",
  })
) {}

export const Failure = UserErrors.UserNotFoundError;
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "Get",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "Get User Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.get("Get", "/:id")
    .setPayload(Payload)
    .addError(UserErrors.UserNotFoundError)
    .addSuccess(Success);
}

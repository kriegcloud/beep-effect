import { $CustomizationDomainId } from "@beep/identity/packages";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as UserHotkeyErrors from "../UserHotkey.errors";
import { Model } from "../UserHotkey.model";

const $I = $CustomizationDomainId.create("entities/UserHotkey/contracts/Update.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  Model.update,
  $I.annotations("Payload", { description: "Payload for the Update UserHotkey contract." })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    data: Model,
  },
  $I.annotations("Success", { description: "Success response for the Update UserHotkey contract." })
) {}

export const Failure = S.Union(
  UserHotkeyErrors.UserHotkeyNotFoundError,
  UserHotkeyErrors.UserHotkeyPermissionDeniedError
);
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "Update",
  { payload: Payload.fields, success: Success, failure: Failure },
  $I.annotationsHttp("Contract", { description: "Update UserHotkey Request Contract." })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.patch("Update", "/:id/update")
    .setPayload(Payload)
    .addError(UserHotkeyErrors.UserHotkeyNotFoundError)
    .addError(UserHotkeyErrors.UserHotkeyPermissionDeniedError)
    .addSuccess(Success, { status: 204 });
}

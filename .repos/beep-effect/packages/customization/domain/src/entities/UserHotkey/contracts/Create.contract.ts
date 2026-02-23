import { $CustomizationDomainId } from "@beep/identity/packages";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as UserHotkeyErrors from "../UserHotkey.errors";
import { Model } from "../UserHotkey.model";

const $I = $CustomizationDomainId.create("entities/UserHotkey/contracts/Create.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  Model.jsonCreate,
  $I.annotations("Payload", { description: "Payload for the Create UserHotkey contract." })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    data: Model,
  },
  $I.annotations("Success", { description: "Success response for the Create UserHotkey contract." })
) {}

export const Failure = S.Union(
  UserHotkeyErrors.UserHotkeyNotFoundError,
  UserHotkeyErrors.UserHotkeyPermissionDeniedError
);
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "Create",
  { payload: Payload.fields, success: Success, failure: Failure },
  $I.annotationsHttp("Contract", { description: "Create UserHotkey Request Contract." })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.post("Create", "/create")
    .setPayload(Payload)
    .addError(UserHotkeyErrors.UserHotkeyNotFoundError)
    .addError(UserHotkeyErrors.UserHotkeyPermissionDeniedError)
    .addSuccess(Success, { status: 204 });
}

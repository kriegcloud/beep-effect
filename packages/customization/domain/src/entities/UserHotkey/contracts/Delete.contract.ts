import { $CustomizationDomainId } from "@beep/identity/packages";
import { CustomizationEntityIds } from "@beep/shared-domain";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as UserHotkeyErrors from "../UserHotkey.errors";

const $I = $CustomizationDomainId.create("entities/UserHotkey/contracts/Delete.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  { id: CustomizationEntityIds.UserHotkeyId },
  $I.annotations("Payload", { description: "Payload for the Delete UserHotkey contract." })
) {}

export class Success extends S.Void.annotations(
  $I.annotations("Success", { description: "Success response for the Delete UserHotkey contract." })
) {}

export const Failure = S.Union(
  UserHotkeyErrors.UserHotkeyNotFoundError,
  UserHotkeyErrors.UserHotkeyPermissionDeniedError,
);
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "Delete",
  { payload: Payload.fields, success: Success, failure: Failure },
  $I.annotationsHttp("Contract", { description: "Delete UserHotkey Request Contract." })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.del("Delete", "/:id")
    .setPayload(Payload)
    .addError(UserHotkeyErrors.UserHotkeyNotFoundError)
    .addError(UserHotkeyErrors.UserHotkeyPermissionDeniedError)
    .addSuccess(Success, { status: 204 });
}

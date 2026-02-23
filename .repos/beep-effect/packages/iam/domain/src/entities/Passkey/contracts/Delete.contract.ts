import { $IamDomainId } from "@beep/identity/packages";
import { IamEntityIds } from "@beep/shared-domain";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as PasskeyErrors from "../Passkey.errors";

const $I = $IamDomainId.create("entities/Passkey/contracts/Delete.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  { id: IamEntityIds.PasskeyId },
  $I.annotations("Payload", { description: "Payload for the Delete Passkey contract." })
) {}

export class Success extends S.Void.annotations(
  $I.annotations("Success", { description: "Success response for the Delete Passkey contract." })
) {}

export const Failure = S.Union(PasskeyErrors.PasskeyNotFoundError, PasskeyErrors.PasskeyPermissionDeniedError);
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "Delete",
  { payload: Payload.fields, success: Success, failure: Failure },
  $I.annotationsHttp("Contract", { description: "Delete Passkey Request Contract." })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.del("Delete", "/:id")
    .setPayload(Payload)
    .addError(PasskeyErrors.PasskeyNotFoundError)
    .addError(PasskeyErrors.PasskeyPermissionDeniedError)
    .addSuccess(Success, { status: 204 });
}

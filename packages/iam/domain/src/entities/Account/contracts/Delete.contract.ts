import { $IamDomainId } from "@beep/identity/packages";
import { IamEntityIds } from "@beep/shared-domain";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as AccountErrors from "../Account.errors";

const $I = $IamDomainId.create("entities/Account/contracts/Delete.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    id: IamEntityIds.AccountId,
  },
  $I.annotations("Payload", {
    description: "Payload for the Delete Account contract.",
  })
) {}

export class Success extends S.Void.annotations(
  $I.annotations("Success", {
    description: "Success response for the Delete Account contract.",
  })
) {}

export const Failure = S.Union(AccountErrors.AccountNotFoundError, AccountErrors.AccountPermissionDeniedError);
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "Delete",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "Delete Account Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.del("Delete", "/:id")
    .setPayload(Payload)
    .addError(AccountErrors.AccountNotFoundError)
    .addError(AccountErrors.AccountPermissionDeniedError)
    .addSuccess(Success, { status: 204 });
}

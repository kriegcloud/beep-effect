import { $IamDomainId } from "@beep/identity/packages";
import { IamEntityIds } from "@beep/shared-domain";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as AccountErrors from "../Account.errors";
import * as Account from "../Account.model";

const $I = $IamDomainId.create("entities/Account/contracts/Get.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    id: IamEntityIds.AccountId,
  },
  $I.annotations("Payload", {
    description: "Payload for the Get Account Contract.",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    data: Account.Model.json,
  },
  $I.annotations("Success", {
    description: "Success response for the Get Account Contract.",
  })
) {}

export const Failure = AccountErrors.AccountNotFoundError;
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "Get",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "Get Account Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.get("Get", "/:id")
    .setPayload(Payload)
    .addError(AccountErrors.AccountNotFoundError)
    .addSuccess(Success);
}

import { $IamDomainId } from "@beep/identity/packages";
import { IamEntityIds } from "@beep/shared-domain";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as OAuthRefreshTokenErrors from "../OAuthRefreshToken.errors";
import * as OAuthRefreshToken from "../OAuthRefreshToken.model";

const $I = $IamDomainId.create("entities/OAuthRefreshToken/contracts/Get.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  { id: IamEntityIds.OAuthRefreshTokenId },
  $I.annotations("Payload", { description: "Payload for the Get OAuthRefreshToken Contract." })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  { data: OAuthRefreshToken.Model.json },
  $I.annotations("Success", { description: "Success response for the Get OAuthRefreshToken Contract." })
) {}

export const Failure = OAuthRefreshTokenErrors.OAuthRefreshTokenNotFoundError;
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "Get",
  { payload: Payload.fields, success: Success, failure: Failure },
  $I.annotationsHttp("Contract", { description: "Get OAuthRefreshToken Request Contract." })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.get("Get", "/:id")
    .setPayload(Payload)
    .addError(OAuthRefreshTokenErrors.OAuthRefreshTokenNotFoundError)
    .addSuccess(Success);
}

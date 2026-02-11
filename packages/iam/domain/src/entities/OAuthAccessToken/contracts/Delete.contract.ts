import { $IamDomainId } from "@beep/identity/packages";
import { IamEntityIds } from "@beep/shared-domain";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as OAuthAccessTokenErrors from "../OAuthAccessToken.errors";

const $I = $IamDomainId.create("entities/OAuthAccessToken/contracts/Delete.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    id: IamEntityIds.OAuthAccessTokenId,
  },
  $I.annotations("Payload", {
    description: "Payload for the Delete OAuthAccessToken contract.",
  })
) {}

export class Success extends S.Void.annotations(
  $I.annotations("Success", {
    description: "Success response for the Delete OAuthAccessToken contract.",
  })
) {}

export const Failure = S.Union(
  OAuthAccessTokenErrors.OAuthAccessTokenNotFoundError,
  OAuthAccessTokenErrors.OAuthAccessTokenPermissionDeniedError,
);
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "Delete",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "Delete OAuthAccessToken Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.del("Delete", "/:id")
    .setPayload(Payload)
    .addError(OAuthAccessTokenErrors.OAuthAccessTokenNotFoundError)
    .addError(OAuthAccessTokenErrors.OAuthAccessTokenPermissionDeniedError)
    .addSuccess(Success, { status: 204 });
}

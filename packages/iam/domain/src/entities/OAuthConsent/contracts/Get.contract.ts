import { $IamDomainId } from "@beep/identity/packages";
import { IamEntityIds } from "@beep/shared-domain";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as OAuthConsentErrors from "../OAuthConsent.errors";
import * as OAuthConsent from "../OAuthConsent.model";

const $I = $IamDomainId.create("entities/OAuthConsent/contracts/Get.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  { id: IamEntityIds.OAuthConsentId },
  $I.annotations("Payload", { description: "Payload for the Get OAuthConsent Contract." })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  { data: OAuthConsent.Model.json },
  $I.annotations("Success", { description: "Success response for the Get OAuthConsent Contract." })
) {}

export const Failure = OAuthConsentErrors.OAuthConsentNotFoundError;
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "Get",
  { payload: Payload.fields, success: Success, failure: Failure },
  $I.annotationsHttp("Contract", { description: "Get OAuthConsent Request Contract." })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.get("Get", "/:id")
    .setPayload(Payload)
    .addError(OAuthConsentErrors.OAuthConsentNotFoundError)
    .addSuccess(Success);
}

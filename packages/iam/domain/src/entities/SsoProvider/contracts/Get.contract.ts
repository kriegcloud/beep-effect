import { $IamDomainId } from "@beep/identity/packages";
import { IamEntityIds } from "@beep/shared-domain";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as SsoProviderErrors from "../SsoProvider.errors";
import * as SsoProvider from "../SsoProvider.model";

const $I = $IamDomainId.create("entities/SsoProvider/contracts/Get.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  { id: IamEntityIds.SsoProviderId },
  $I.annotations("Payload", { description: "Payload for the Get SsoProvider Contract." })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  { data: SsoProvider.Model.json },
  $I.annotations("Success", { description: "Success response for the Get SsoProvider Contract." })
) {}

export const Failure = SsoProviderErrors.SsoProviderNotFoundError;
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "Get",
  { payload: Payload.fields, success: Success, failure: Failure },
  $I.annotationsHttp("Contract", { description: "Get SsoProvider Request Contract." })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.get("Get", "/:id")
    .setPayload(Payload).addError(SsoProviderErrors.SsoProviderNotFoundError).addSuccess(Success);
}

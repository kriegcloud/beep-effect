import { $IamDomainId } from "@beep/identity/packages";
import { IamEntityIds } from "@beep/shared-domain";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as ScimProviderErrors from "../ScimProvider.errors";
import * as ScimProvider from "../ScimProvider.model";

const $I = $IamDomainId.create("entities/ScimProvider/contracts/Get.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  { id: IamEntityIds.ScimProviderId },
  $I.annotations("Payload", { description: "Payload for the Get ScimProvider Contract." })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  { data: ScimProvider.Model.json },
  $I.annotations("Success", { description: "Success response for the Get ScimProvider Contract." })
) {}

export const Failure = ScimProviderErrors.ScimProviderNotFoundError;
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "Get",
  { payload: Payload.fields, success: Success, failure: Failure },
  $I.annotationsHttp("Contract", { description: "Get ScimProvider Request Contract." })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.get("Get", "/:id")
    .setPayload(Payload)
    .addError(ScimProviderErrors.ScimProviderNotFoundError)
    .addSuccess(Success);
}

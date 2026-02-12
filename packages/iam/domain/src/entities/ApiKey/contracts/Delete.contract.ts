import { $IamDomainId } from "@beep/identity/packages";
import { IamEntityIds } from "@beep/shared-domain";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as ApiKeyErrors from "../ApiKey.errors";

const $I = $IamDomainId.create("entities/ApiKey/contracts/Delete.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    id: IamEntityIds.ApiKeyId,
  },
  $I.annotations("Payload", {
    description: "Payload for the Delete ApiKey contract.",
  })
) {}

export class Success extends S.Void.annotations(
  $I.annotations("Success", {
    description: "Success response for the Delete ApiKey contract.",
  })
) {}

export const Failure = S.Union(ApiKeyErrors.ApiKeyNotFoundError, ApiKeyErrors.ApiKeyPermissionDeniedError);
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "Delete",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "Delete ApiKey Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.del("Delete", "/:id")
    .setPayload(Payload)
    .addError(ApiKeyErrors.ApiKeyNotFoundError)
    .addError(ApiKeyErrors.ApiKeyPermissionDeniedError)
    .addSuccess(Success, { status: 204 });
}

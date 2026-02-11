import { $IamDomainId } from "@beep/identity/packages";
import { IamEntityIds } from "@beep/shared-domain";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as RateLimitErrors from "../RateLimit.errors";

const $I = $IamDomainId.create("entities/RateLimit/contracts/Delete.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  { id: IamEntityIds.RateLimitId },
  $I.annotations("Payload", { description: "Payload for the Delete RateLimit contract." })
) {}

export class Success extends S.Void.annotations(
  $I.annotations("Success", { description: "Success response for the Delete RateLimit contract." })
) {}

export const Failure = S.Union(
  RateLimitErrors.RateLimitNotFoundError,
  RateLimitErrors.RateLimitPermissionDeniedError,
);
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "Delete",
  { payload: Payload.fields, success: Success, failure: Failure },
  $I.annotationsHttp("Contract", { description: "Delete RateLimit Request Contract." })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.del("Delete", "/:id")
    .setPayload(Payload)
    .addError(RateLimitErrors.RateLimitNotFoundError)
    .addError(RateLimitErrors.RateLimitPermissionDeniedError)
    .addSuccess(Success, { status: 204 });
}

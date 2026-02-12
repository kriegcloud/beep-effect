import { $IamDomainId } from "@beep/identity/packages";
import { IamEntityIds } from "@beep/shared-domain";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as SubscriptionErrors from "../Subscription.errors";

const $I = $IamDomainId.create("entities/Subscription/contracts/Delete.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  { id: IamEntityIds.SubscriptionId },
  $I.annotations("Payload", { description: "Payload for the Delete Subscription contract." })
) {}

export class Success extends S.Void.annotations(
  $I.annotations("Success", { description: "Success response for the Delete Subscription contract." })
) {}

export const Failure = S.Union(
  SubscriptionErrors.SubscriptionNotFoundError,
  SubscriptionErrors.SubscriptionPermissionDeniedError
);
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "Delete",
  { payload: Payload.fields, success: Success, failure: Failure },
  $I.annotationsHttp("Contract", { description: "Delete Subscription Request Contract." })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.del("Delete", "/:id")
    .setPayload(Payload)
    .addError(SubscriptionErrors.SubscriptionNotFoundError)
    .addError(SubscriptionErrors.SubscriptionPermissionDeniedError)
    .addSuccess(Success, { status: 204 });
}

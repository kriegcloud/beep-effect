import { $IamDomainId } from "@beep/identity/packages";
import { IamEntityIds } from "@beep/shared-domain";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("entities/Subscription/Subscription.errors");

export class SubscriptionNotFoundError extends S.TaggedError<SubscriptionNotFoundError>()(
  $I`SubscriptionNotFoundError`,
  { id: IamEntityIds.SubscriptionId },
  $I.annotationsHttp("SubscriptionNotFoundError", {
    status: 404,
    description: "Error when a subscription with the specified ID cannot be found.",
  })
) {}

export class SubscriptionPermissionDeniedError extends S.TaggedError<SubscriptionPermissionDeniedError>()(
  $I`SubscriptionPermissionDeniedError`,
  { id: IamEntityIds.SubscriptionId },
  $I.annotationsHttp("SubscriptionPermissionDeniedError", {
    status: 403,
    description: "Thrown when the user lacks permission to perform the requested action on the subscription.",
  })
) {}

export const Errors = S.Union(SubscriptionNotFoundError, SubscriptionPermissionDeniedError);
export type Errors = typeof Errors.Type;

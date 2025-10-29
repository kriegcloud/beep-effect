import { makeErrorProps } from "@beep/iam-domain/errors/_internal";
import * as S from "effect/Schema";

export class SubscriptionNotFound extends S.TaggedError<SubscriptionNotFound>(
  "@beep/iam-domain/errors/subscription/SubscriptionNotFound"
)(...makeErrorProps("SUBSCRIPTION_NOT_FOUND")("Subscription not found")) {}

export class SubscriptionPlanNotFound extends S.TaggedError<SubscriptionPlanNotFound>(
  "@beep/iam-domain/errors/subscription/SubscriptionPlanNotFound"
)(...makeErrorProps("SUBSCRIPTION_PLAN_NOT_FOUND")("Subscription plan not found")) {}

export class AlreadySubscribedPlan extends S.TaggedError<AlreadySubscribedPlan>(
  "@beep/iam-domain/errors/subscription/AlreadySubscribedPlan"
)(...makeErrorProps("ALREADY_SUBSCRIBED_PLAN")("You're already subscribed to this plan")) {}

export class UnableToCreateCustomer extends S.TaggedError<UnableToCreateCustomer>(
  "@beep/iam-domain/errors/subscription/UnableToCreateCustomer"
)(...makeErrorProps("UNABLE_TO_CREATE_CUSTOMER")("Unable to create customer")) {}

export class FailedToFetchPlans extends S.TaggedError<FailedToFetchPlans>(
  "@beep/iam-domain/errors/subscription/FailedToFetchPlans"
)(...makeErrorProps("FAILED_TO_FETCH_PLANS")("Failed to fetch plans")) {}

export class EmailVerificationRequired extends S.TaggedError<EmailVerificationRequired>(
  "@beep/iam-domain/errors/subscription/EmailVerificationRequired"
)(
  ...makeErrorProps("EMAIL_VERIFICATION_REQUIRED")("Email verification is required before you can subscribe to a plan")
) {}

export class SubscriptionNotActive extends S.TaggedError<SubscriptionNotActive>(
  "@beep/iam-domain/errors/subscription/SubscriptionNotActive"
)(...makeErrorProps("SUBSCRIPTION_NOT_ACTIVE")("Subscription is not active")) {}

export class SubscriptionNotScheduledForCancellation extends S.TaggedError<SubscriptionNotScheduledForCancellation>(
  "@beep/iam-domain/errors/subscription/SubscriptionNotScheduledForCancellation"
)(...makeErrorProps("SUBSCRIPTION_NOT_SCHEDULED_FOR_CANCELLATION")("Subscription is not scheduled for cancellation")) {}

export class SubscriptionErrors extends S.Union(
  SubscriptionNotFound,
  SubscriptionPlanNotFound,
  AlreadySubscribedPlan,
  UnableToCreateCustomer,
  FailedToFetchPlans,
  EmailVerificationRequired,
  SubscriptionNotActive,
  SubscriptionNotScheduledForCancellation
) {}

export declare namespace SubscriptionErrors {
  export type Type = typeof SubscriptionErrors.Type;
  export type Encoded = typeof SubscriptionErrors.Encoded;
}

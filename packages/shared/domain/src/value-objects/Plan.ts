import * as S from "effect/Schema";
import {BS} from "@beep/schema";
import {$SharedDomainId} from "@beep/identity/packages";

const $I = $SharedDomainId.create("value-objects/Plan");

export class PlanType extends BS.StringLiteralKit(
  "monthly",
  "yearly",
).annotations(
  $I.annotations(
    "PlanType",
    {
      description: "The billing cycle type for a subscription plan - monthly for pay-per-month or yearly for annual billing with potential discounts",
    }
  )
) {
}

export declare namespace PlanType {
  export type Type = typeof PlanType.Type;
}

export class PlanStatus extends BS.StringLiteralKit(
  "active",
  "inactive",
  "past_due",
  "cancelled"
).annotations(
  $I.annotations(
    "PlanStatus",
    {
      description: "The current status of a subscription plan - active for valid subscriptions, inactive for disabled plans, past_due for failed payments, or cancelled for terminated subscriptions",
    }
  )
) {
}

export declare namespace PlanStatus {
  export type Type = typeof PlanStatus.Type;
}

export class PlanFeature extends S.Class<PlanFeature>($I`PlanFeature`)(
  {
    name: S.String,
    icon: S.String,
    iconColor: S.optionalWith(S.String, {as: "Option"})
  },
  $I.annotations(
    "PlanFeature",
    {}
  )
) {
}

const makePlanClass = PlanType.toTagged("type").composer({
  id: S.String,
  title: S.String,
  description: S.String,
  highlight: S.optionalWith(S.String, {as: "Option"}),
  currency: S.optionalWith(BS.Currency, {as: "Option"}),
  monthlyPrice: BS.Money.MonetaryAmount,
  yearlyPrice: BS.Money.MonetaryAmount,
  buttonText: S.String,
  badge: S.optionalWith(S.String, {as: "Option"}),
  features: S.Array(PlanFeature)
});

export class MonthlyPlan extends S.Class<MonthlyPlan>($I`MonthlyPlan`)(
  makePlanClass.monthly({}),
  $I.annotations(
    "MonthlyPlan",
    {
      description: "Represents a subscription plan with pricing tiers, features, and display information for billing and plan selection interfaces",
    }
  )
) {}

export class YearlyPlan extends S.Class<YearlyPlan>($I`YearlyPlan`)(
  makePlanClass.yearly({}),
  $I.annotations(
    "YearlyPlan",
    {
      description: "Represents a subscription plan with pricing tiers, features, and display information for billing and plan selection interfaces",
    }
  )
) {}

export class Plan extends S.Union(
  MonthlyPlan,
  YearlyPlan
).annotations(
  $I.annotations(
    "Plan",
    {
      description: "Represents a subscription plan with pricing tiers, features, and display information for billing and plan selection interfaces",
    }
  )
) {}

export declare namespace Plan {
  export type Type = typeof Plan.Type;
  export type Encoded = typeof Plan.Encoded;
}

export class CurrentPlanType extends BS.StringLiteralKit(
  ...PlanType.Options,
  "custom"
).annotations(
  $I.annotations(
    "CurrentPlanType",
    {
      description: "The current plan type for a subscription plan - monthly for pay-per-month or yearly for annual billing with potential discounts",
    }
  )
) {}

export declare namespace CurrentPlanType {
  export type Type = typeof CurrentPlanType.Type;
}

const makeCurrentPlanClass = PlanStatus.toTagged("status").composer({
  plan: Plan,
  type: CurrentPlanType,
  price: S.optionalWith(BS.Money.MonetaryAmount, { as: "Option"}),
  nextBillingDate: BS.DateTimeUtcFromAllAcceptable,
  paymentMethod: S.String,
})

export class ActiveCurrentPlan extends S.Class<ActiveCurrentPlan>($I`ActiveCurrentPlan`)(
  makeCurrentPlanClass.active({}),
  $I.annotations(
    "ActiveCurrentPlan",
    {
      description: "Represents the active subscription plan for a user with pricing tiers, features, and display information for billing and plan selection interfaces",
    }
  )
) {}

export class InactiveCurrentPlan extends S.Class<InactiveCurrentPlan>($I`InactiveCurrentPlan`)(
  makeCurrentPlanClass.inactive({}),
  $I.annotations(
    "InactiveCurrentPlan",
    {
      description: "Represents the inactive subscription plan for a user with pricing tiers, features, and display information for billing and plan selection interfaces",
    }
  )
) {}

export class PastDueCurrentPlan extends S.Class<PastDueCurrentPlan>($I`PastDueCurrentPlan`)(
  makeCurrentPlanClass.past_due({}),
  $I.annotations(
    "PastDueCurrentPlan",
    {
      description: "Represents the past due subscription plan for a user with pricing tiers, features, and display information for billing and plan selection interfaces",
    }
  )
) {}

export class CancelledCurrentPlan extends S.Class<PastDueCurrentPlan>($I`PastDueCurrentPlan`)(
  makeCurrentPlanClass.cancelled({}),
  $I.annotations(
    "CancelledCurrentPlan",
    {
      description: "Represents the cancelled subscription plan for a user with pricing tiers, features, and display information for billing and plan selection interfaces",
    }
  )
) {}

export class CurrentPlan extends S.Union(
  ActiveCurrentPlan,
  InactiveCurrentPlan,
  PastDueCurrentPlan,
  CancelledCurrentPlan
).annotations(
  $I.annotations(
    "CurrentPlan",
    {
      description: "Represents the current subscription plan for a user with pricing tiers, features, and display information for billing and plan selection interfaces",
    }
  )
) {}

export declare namespace CurrentPlan {
  export type Type = typeof CurrentPlan.Type;
  export type Encoded = typeof CurrentPlan.Encoded;
}

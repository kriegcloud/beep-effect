import { Common, IamEntityIds } from "@beep/shared-domain";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

export const SubscriptionModelSchemaId = Symbol.for("@beep/iam-domain/SubscriptionModel");

/**
 * Subscription model representing user billing subscriptions.
 * Maps to the `subscription` table in the database.
 */
export class Model extends M.Class<Model>(`SubscriptionModel`)(
  {
    /** Primary key identifier for the subscription */
    id: M.Generated(IamEntityIds.SubscriptionId),
    _rowId: M.Generated(IamEntityIds.SubscriptionId.privateSchema),
    /** User this subscription belongs to */
    userId: IamEntityIds.UserId.annotations({
      description: "ID of the user this subscription belongs to",
    }),

    /** Subscription plan */
    plan: S.Literal("free", "basic", "pro", "enterprise").annotations({
      description: "The subscription plan level",
    }),

    /** Subscription status */
    status: S.Literal("active", "canceled", "past_due", "trialing", "incomplete").annotations({
      description: "Current status of the subscription",
    }),

    /** Stripe subscription ID */
    stripeSubscriptionId: M.FieldOption(
      S.NonEmptyString.annotations({
        description: "Stripe subscription identifier",
      })
    ),

    /** When the current period starts */
    currentPeriodStart: M.FieldOption(
      Common.DateTimeFromDate({
        description: "Start of the current billing period",
      })
    ),

    /** When the current period ends */
    currentPeriodEnd: M.FieldOption(
      Common.DateTimeFromDate({
        description: "End of the current billing period",
      })
    ),

    /** When the subscription was canceled */
    canceledAt: M.FieldOption(
      Common.DateTimeFromDate({
        description: "When the subscription was canceled",
      })
    ),

    // Default columns include organizationId
    ...Common.defaultColumns,
  },
  {
    title: "Subscription Model",
    description: "Subscription model representing user billing subscriptions.",
    schemaId: SubscriptionModelSchemaId,
  }
) {}
export namespace Model {
  export type Type = S.Schema.Type<typeof Model>;
  export type Encoded = S.Schema.Encoded<typeof Model>;
}

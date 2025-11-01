import { BS } from "@beep/schema";
import { IamEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

export const SubscriptionModelSchemaId = Symbol.for("@beep/iam-domain/SubscriptionModel");

/**
 * Subscription model representing user billing subscriptions.
 * Maps to the `subscription` table in the database.
 */
export class Model extends M.Class<Model>(`SubscriptionModel`)(
  makeFields(IamEntityIds.SubscriptionId, {
    /** Subscription plan */
    plan: S.String.annotations({
      description: "The subscription plan level",
    }),

    /** Subscription status */
    status: BS.toOptionalWithDefault(S.String)("incomplete").annotations({
      description: "Current status of the subscription",
    }),

    /** Stripe subscription ID */
    stripeSubscriptionId: BS.FieldOptionOmittable(
      S.NonEmptyString.annotations({
        description: "Stripe subscription identifier",
      })
    ),

    /** When the current period starts */
    periodStart: BS.FieldOptionOmittable(
      BS.DateTimeFromDate({
        description: "Start of the current billing period",
      })
    ),

    /** When the current period ends */
    periodEnd: BS.FieldOptionOmittable(
      BS.DateTimeFromDate({
        description: "End of the current billing period",
      })
    ),

    /** When the subscription was canceled */
    cancelAtPeriodEnd: BS.BoolWithDefault(false).annotations({
      description: "When the subscription was canceled",
    }),

    organizationId: SharedEntityIds.OrganizationId,
  }),
  {
    title: "Subscription Model",
    description: "Subscription model representing user billing subscriptions.",
    schemaId: SubscriptionModelSchemaId,
  }
) {
  static readonly utils = modelKit(Model);
}

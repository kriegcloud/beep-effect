import { $IamDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { IamEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("entities/Subscription/Subscription.model");

export class Model extends M.Class<Model>($I`SubscriptionModel`)(
  makeFields(IamEntityIds.SubscriptionId, {
    plan: S.String.annotations({
      description: "The subscription plan level",
    }),
    status: BS.FieldOptionOmittable(
      S.String.annotations({
        description: "Current status of the subscription",
      })
    ),
    stripeSubscriptionId: BS.FieldOptionOmittable(
      S.NonEmptyString.annotations({
        description: "Stripe subscription identifier",
      })
    ),
    periodStart: BS.FieldOptionOmittable(
      BS.DateTimeUtcFromAllAcceptable.annotations({
        description: "Start of the current billing period",
      })
    ),
    periodEnd: BS.FieldOptionOmittable(
      BS.DateTimeUtcFromAllAcceptable.annotations({
        description: "End of the current billing period",
      })
    ),
    cancelAtPeriodEnd: BS.BoolWithDefault(false).annotations({
      description: "When the subscription was canceled",
    }),
    organizationId: SharedEntityIds.OrganizationId,
  }),
  $I.annotations("SubscriptionModel", {
    title: "Subscription Model",
    description: "Subscription model representing user billing subscriptions.",
  })
) {
  static readonly utils = modelKit(Model);
}

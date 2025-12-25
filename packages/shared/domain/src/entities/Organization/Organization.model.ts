import { $SharedDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { Slug, Url } from "@beep/schema/primitives";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";
import { SharedEntityIds } from "../../entity-ids";
import { OrganizationType, OrganizationTypeEnum, SubscriptionStatus, SubscriptionTier } from "./schemas";

const $I = $SharedDomainId.create("entities/Organization/Organization.model");
export const OrganizationModelSchemaId = Symbol.for("@beep/shared-domain/OrganizationModel");

/**
 * Organization model representing organizations.
 * Maps to the `organization` table in the database.
 */

export class Model extends M.Class<Model>($I`OrganizationModel`)(
  makeFields(SharedEntityIds.OrganizationId, {
    /** Organization name */
    name: S.NonEmptyString.annotations({
      description: "The organization's display name",
    }),

    /** URL-friendly slug identifier */
    slug: Slug.pipe(S.pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/), S.minLength(2), S.maxLength(50)).annotations({
      description: "URL-friendly identifier for the organization",
    }),

    /** Organization logo URL */
    logo: BS.FieldOptionOmittable(
      Url.annotations({
        description: "URL to the organization's logo",
      })
    ),

    /** Flexible metadata storage */
    metadata: BS.FieldOptionOmittable(
      S.String.annotations({
        description: "JSON metadata for additional organization data",
      })
    ),
    type: BS.toOptionalWithDefault(OrganizationType)(OrganizationTypeEnum.individual).annotations({
      description: "The type of the organization",
    }),
    ownerUserId: SharedEntityIds.UserId.annotations({
      description: "The owner of the organization",
    }),
    isPersonal: BS.BoolFalse.annotations({
      description: "Whether this organization is auto-created for a user",
    }),
    maxMembers: BS.FieldOptionOmittable(
      S.NonNegativeInt.annotations({
        description: "The maximum number of members allowed in the organization",
      })
    ),
    features: BS.FieldOptionOmittable(BS.Json),
    settings: BS.FieldOptionOmittable(BS.Json),
    subscriptionTier: BS.toOptionalWithDefault(SubscriptionTier)(SubscriptionTier.Enum.free).annotations({
      description: "The subscription tier of the organization",
    }),
    subscriptionStatus: BS.toOptionalWithDefault(SubscriptionStatus)(SubscriptionStatus.Enum.active).annotations({
      description: "The subscription status of the organization",
    }),
  }),
  $I.annotations("OrganizationModel", {
    description: "Organization model representing organizations.",
  })
) {
  static readonly utils = modelKit(Model);
}

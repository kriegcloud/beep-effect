import { Slug, URLString } from "@beep/schema/custom";
import * as Common from "@beep/shared-domain/common";
import { IamEntityIds, SharedEntityIds } from "@beep/shared-domain/EntityIds";
import * as M from "@effect/sql/Model";
import * as F from "effect/Function";
import * as S from "effect/Schema";
import { OrganizationType, SubscriptionStatus, SubscriptionTier } from "./schemas";

export const OrganizationModelSchemaId = Symbol.for("@beep/shared-domain/OrganizationModel");

/**
 * Organization model representing organizations.
 * Maps to the `organization` table in the database.
 */
export class Model extends M.Class<Model>(`OrganizationModel`)(
  {
    /** Primary key identifier for the organization */
    id: M.Generated(SharedEntityIds.OrganizationId),

    /** Organization name */
    name: S.NonEmptyString.annotations({
      description: "The organization's display name",
    }),

    /** URL-friendly slug identifier */
    slug: M.FieldOption(
      Slug.pipe(S.pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/), S.minLength(2), S.maxLength(50)).annotations({
        description: "URL-friendly identifier for the organization",
      })
    ),

    /** Organization logo URL */
    logo: M.FieldOption(
      URLString.annotations({
        description: "URL to the organization's logo",
      })
    ),

    /** Flexible metadata storage */
    metadata: M.FieldOption(
      S.String.annotations({
        description: "JSON metadata for additional organization data",
      })
    ),
    type: OrganizationType,
    ownerUserId: IamEntityIds.UserId.annotations({
      description: "The owner of the organization",
    }),
    isPersonal: S.Boolean.pipe(
      S.optional,
      S.withDefaults({
        decoding: F.constFalse,
        constructor: F.constFalse,
      })
    ).annotations({
      description: "Whether this organization is auto-created for a user",
    }),
    maxMembers: M.FieldOption(
      S.NonNegativeInt.annotations({
        description: "The maximum number of members allowed in the organization",
      })
    ),
    features: M.FieldOption(M.JsonFromString(S.Record({ key: S.String, value: S.Any }))),
    settings: M.FieldOption(M.JsonFromString(S.Record({ key: S.String, value: S.Any }))),
    subscriptionTier: SubscriptionTier.pipe(
      S.optional,
      S.withDefaults({
        decoding: F.constant(SubscriptionTier.Enum.free),
        constructor: F.constant(SubscriptionTier.Enum.free),
      })
    ).annotations({
      description: "The subscription tier of the organization",
    }),
    subscriptionStatus: SubscriptionStatus.pipe(
      S.optional,
      S.withDefaults({
        decoding: F.constant(SubscriptionStatus.Enum.active),
        constructor: F.constant(SubscriptionStatus.Enum.active),
      })
    ).annotations({
      description: "The subscription status of the organization",
    }),
    ...Common.globalColumns,
  },
  {
    title: "Organization Model",
    description: "Organization model representing organizations.",
    schemaId: OrganizationModelSchemaId,
  }
) {}

export namespace Model {
  export type Type = S.Schema.Type<typeof Model>;
  export type Encoded = S.Schema.Encoded<typeof Model>;
}

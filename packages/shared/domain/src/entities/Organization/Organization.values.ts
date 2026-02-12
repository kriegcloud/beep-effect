import { $SharedDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import type * as S from "effect/Schema";

const $I = $SharedDomainId.create("entities/Organization/Organization.values");

export class OrganizationType extends BS.StringLiteralKit("individual", "team", "enterprise").annotations(
  $I.annotations("OrganizationType", {
    title: "Organization Type",
    description: "The type of organization (individual, team, enterprise)",
  })
) {}

export const makeOrganizationTypePgEnum = BS.toPgEnum(OrganizationType);

export const OrganizationTypeEnum = OrganizationType.Enum;

export const OrganizationTypeOptions = OrganizationType.Options;

export declare namespace OrganizationType {
  export type Type = S.Schema.Type<typeof OrganizationType>;
  export type Encoded = S.Schema.Encoded<typeof OrganizationType>;
}

export class SubscriptionStatus extends BS.StringLiteralKit("active", "canceled").annotations(
  $I.annotations("SubscriptionStatus", {
    description: "Organization subscription status (active or canceled)",
  })
) {}
export const makeSubscriptionStatusPgEnum = BS.toPgEnum(SubscriptionStatus);
export const SubscriptionStatusEnum = SubscriptionStatus.Enum;
export const SubscriptionStatusOptions = SubscriptionStatus.Options;
export declare namespace SubscriptionStatus {
  export type Type = S.Schema.Type<typeof SubscriptionStatus>;
  export type Encoded = S.Schema.Encoded<typeof SubscriptionStatus>;
}

export class SubscriptionTier extends BS.StringLiteralKit("free", "plus", "pro", "enterprise").annotations(
  $I.annotations("SubscriptionTier", {
    description: "Organization subscription tier levels (free, plus, pro, enterprise)",
  })
) {}
export const makeSubscriptionTierPgEnum = BS.toPgEnum(SubscriptionTier);
export const SubscriptionTierEnum = SubscriptionTier.Enum;
export const SubscriptionTierOptions = SubscriptionTier.Options;
export declare namespace SubscriptionTier {
  export type Type = S.Schema.Type<typeof SubscriptionTier>;
  export type Encoded = S.Schema.Encoded<typeof SubscriptionTier>;
}
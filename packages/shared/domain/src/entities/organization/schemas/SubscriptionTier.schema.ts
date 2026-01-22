import { $SharedDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import type * as S from "effect/Schema";

const $I = $SharedDomainId.create("entities/Organization/schemas/SubscriptionTier.schema");

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

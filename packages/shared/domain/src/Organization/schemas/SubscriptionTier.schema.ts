import { BS } from "@beep/schema";
import type * as S from "effect/Schema";

const kit = BS.stringLiteralKit(
  "free",
  "plus",
  "pro",
  "enterprise"
)({
  description: "The subscription tier of the organization",
  identifier: "SubscriptionTier",
  title: "Subscription Tier",
});

export const makeSubscriptionTierPgEnum = kit.toPgEnum;
export const SubscriptionTierEnum = kit.Enum;
export const SubscriptionTierOptions = kit.Options;

export class SubscriptionTier extends kit.Schema {
  static readonly Options = kit.Options;
  static readonly Enum = kit.Enum;
}

export namespace SubscriptionTier {
  export type Type = S.Schema.Type<typeof SubscriptionTier>;
  export type Encoded = S.Schema.Encoded<typeof SubscriptionTier>;
}

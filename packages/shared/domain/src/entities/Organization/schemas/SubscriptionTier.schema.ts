import { BS } from "@beep/schema";
import type * as S from "effect/Schema";




export class SubscriptionTier extends BS.StringLiteralKit("free", "plus", "pro", "enterprise") {

}
export const makeSubscriptionTierPgEnum = BS.toPgEnum(SubscriptionTier);
export const SubscriptionTierEnum = SubscriptionTier.Enum;
export const SubscriptionTierOptions = SubscriptionTier.Options;
export declare namespace SubscriptionTier {
  export type Type = S.Schema.Type<typeof SubscriptionTier>;
  export type Encoded = S.Schema.Encoded<typeof SubscriptionTier>;
}

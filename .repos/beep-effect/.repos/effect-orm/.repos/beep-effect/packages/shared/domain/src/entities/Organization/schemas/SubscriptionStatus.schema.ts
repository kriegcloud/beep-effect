import { BS } from "@beep/schema";
import type * as S from "effect/Schema";

export class SubscriptionStatus extends BS.StringLiteralKit("active", "canceled") {}
export const makeSubscriptionStatusPgEnum = BS.toPgEnum(SubscriptionStatus);
export const SubscriptionStatusEnum = SubscriptionStatus.Enum;
export const SubscriptionStatusOptions = SubscriptionStatus.Options;
export declare namespace SubscriptionStatus {
  export type Type = S.Schema.Type<typeof SubscriptionStatus>;
  export type Encoded = S.Schema.Encoded<typeof SubscriptionStatus>;
}

import { BS } from "@beep/schema";
import type * as S from "effect/Schema";

const kit = BS.stringLiteralKit("active", "canceled");

export const makeSubscriptionStatusPgEnum = kit.toPgEnum;
export const SubscriptionStatusEnum = kit.Enum;
export const SubscriptionStatusOptions = kit.Options;

export class SubscriptionStatus extends kit.Schema {
  static readonly Options = kit.Options;
  static readonly Enum = kit.Enum;
}

export declare namespace SubscriptionStatus {
  export type Type = S.Schema.Type<typeof SubscriptionStatus>;
  export type Encoded = S.Schema.Encoded<typeof SubscriptionStatus>;
}

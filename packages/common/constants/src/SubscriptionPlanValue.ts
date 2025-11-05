import { BS } from "@beep/schema";
import type * as S from "effect/Schema";
export const SubscriptionPlanValueKit = BS.stringLiteralKit("basic", "pro", "enterprise");

export class SubscriptionPlanValue extends SubscriptionPlanValueKit.Schema.annotations({
  schemaId: Symbol.for("@beep/constants/SubscriptionPlanValue"),
  identifier: "SubscriptionPlanValue",
  title: "Subscription Plan Value",
  description: "Possible subscription plan values.",
}) {}

export declare namespace SubscriptionPlanValue {
  export type Type = S.Schema.Type<typeof SubscriptionPlanValue>;
  export type Encoded = S.Schema.Type<typeof SubscriptionPlanValue>;
}

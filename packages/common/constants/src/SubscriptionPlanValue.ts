import { StringLiteralKit } from "@beep/schema/derived";
import type * as S from "effect/Schema";


export class SubscriptionPlanValue extends StringLiteralKit("basic", "pro", "enterprise").annotations({
  schemaId: Symbol.for("@beep/constants/SubscriptionPlanValue"),
  identifier: "SubscriptionPlanValue",
  title: "Subscription Plan Value",
  description: "Possible subscription plan values.",
}) {}

export declare namespace SubscriptionPlanValue {
  export type Type = S.Schema.Type<typeof SubscriptionPlanValue>;
  export type Encoded = S.Schema.Encoded<typeof SubscriptionPlanValue>;
}

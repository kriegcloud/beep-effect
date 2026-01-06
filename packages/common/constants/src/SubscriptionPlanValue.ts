import { $ConstantsId } from "@beep/identity/packages";
import { StringLiteralKit } from "@beep/schema/derived/kits/string-literal-kit";
import type * as S from "effect/Schema";

const $I = $ConstantsId.create("SubscriptionPlanValue");
export class SubscriptionPlanValue extends StringLiteralKit("basic", "pro", "enterprise").annotations(
  $I.annotations("SubscriptionPlanValue", {
    description: "Possible subscription plan values.",
  })
) {}

export declare namespace SubscriptionPlanValue {
  export type Type = S.Schema.Type<typeof SubscriptionPlanValue>;
  export type Encoded = S.Schema.Encoded<typeof SubscriptionPlanValue>;
}

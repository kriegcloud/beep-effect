import { $SharedDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import type * as S from "effect/Schema";

const $I = $SharedDomainId.create("entities/Organization/schemas/SubscriptionStatus.schema");

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

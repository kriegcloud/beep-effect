import { $SharedDomainId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import * as Ids from "./ids";

const $I = $SharedDomainId.create("entity-ids/iam/any-id");

export class AnyId extends S.Union(
  Ids.JwksId,
  Ids.MemberId,
  Ids.PasskeyId,
  Ids.RateLimitId,
  Ids.SsoProviderId,
  Ids.SubscriptionId,
  Ids.TeamMemberId,
  Ids.TwoFactorId,
  Ids.VerificationId,
  Ids.WalletAddressId,
  Ids.OrganizationRoleId,
  Ids.DeviceCodeId,
  Ids.ScimProviderId
).annotations(
  $I.annotations("AnyIamId", {
    description: "Any entity id within the iam domain context",
  })
) {}

export declare namespace AnyId {
  export type Type = S.Schema.Type<typeof AnyId>;
  export type Encoded = S.Schema.Encoded<typeof AnyId>;
}

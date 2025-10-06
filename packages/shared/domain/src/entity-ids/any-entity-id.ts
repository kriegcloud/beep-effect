import * as S from "effect/Schema";
import * as IamEntityIds from "./iam";
import { OrganizationId, TeamId, UserId } from "./shared";

export class AnyEntityId extends S.Union(
  IamEntityIds.AccountId,
  IamEntityIds.ApiKeyId,
  IamEntityIds.InvitationId,
  IamEntityIds.MemberId,
  IamEntityIds.OAuthApplicationId,
  IamEntityIds.OAuthAccessTokenId,
  IamEntityIds.OAuthConsentId,
  IamEntityIds.PasskeyId,
  IamEntityIds.SessionId,
  IamEntityIds.SsoProviderId,
  IamEntityIds.SubscriptionId,
  IamEntityIds.SubscriptionId,
  IamEntityIds.TeamMemberId,
  IamEntityIds.TwoFactorId,
  IamEntityIds.VerificationId,
  IamEntityIds.WalletAddressId,
  IamEntityIds.OrganizationRoleId,
  IamEntityIds.DeviceCodeId,
  OrganizationId,
  TeamId,
  UserId
).annotations({
  schemaId: Symbol.for("@beep/shared/domain/EntityIds/AnyEntityId"),
  description: "Any entity id",
  title: "Any Entity Id",
  identifier: "AnyEntityId",
}) {}

export namespace AnyEntityId {
  export type Type = S.Schema.Type<typeof AnyEntityId>;
  export type Encoded = S.Schema.Encoded<typeof AnyEntityId>;
}

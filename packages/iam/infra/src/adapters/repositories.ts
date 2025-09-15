import type { SqlClient } from "@effect/sql/SqlClient";
import { DbError } from "@beep/core-db/errors";
import type { SqlError } from "@effect/sql/SqlError";
import * as Layer from "effect/Layer";
import { AccountRepo } from "./repos/Account.repo";
import { ApiKeyRepo } from "./repos/ApiKey.repo";
import { DeviceCodeRepo } from "./repos/DeviceCode.repo";
import { InvitationRepo } from "./repos/Invitation.repo";
import { JwksRepo } from "./repos/Jwks.repo";
import { MemberRepo } from "./repos/Member.repo";
import { OAuthAccessTokenRepo } from "./repos/OAuthAccessToken.repo";
import { OAuthApplicationRepo } from "./repos/OAuthApplication.repo";
import { OAuthConsentRepo } from "./repos/OAuthConsent.repo";
import { OrganizationRoleRepo } from "./repos/OrganizationRole.repo";
import { PasskeyRepo } from "./repos/Passkey.repo";
import { RateLimitRepo } from "./repos/RateLimit.repo";
import { SessionRepo } from "./repos/Session.repo";
import { SsoProviderRepo } from "./repos/SsoProvider.repo";
import { SubscriptionRepo } from "./repos/Subscription.repo";
import { TeamMemberRepo } from "./repos/TeamMember.repo";
import { TwoFactorRepo } from "./repos/TwoFactor.repo";
import { UserRepo } from "./repos/User.repo";
import { VerificationRepo } from "./repos/Verification.repo";
import { WalletAddressRepo } from "./repos/WalletAddress.repo";
import { OrganizationRepo } from "@beep/iam-infra/adapters/repos/Organization.repo";
import type { ConfigError, } from "effect/ConfigError";

export type IamRepos =
  | AccountRepo
  | ApiKeyRepo
  | DeviceCodeRepo
  | InvitationRepo
  | JwksRepo
  | MemberRepo
  | OAuthAccessTokenRepo
  | OAuthApplicationRepo
  | OAuthConsentRepo
  | OrganizationRoleRepo
  | PasskeyRepo
  | RateLimitRepo
  | SessionRepo
  | SsoProviderRepo
  | SubscriptionRepo
  | TeamMemberRepo
  | TwoFactorRepo
  | UserRepo
  | VerificationRepo
  | WalletAddressRepo

export type IamReposLive = Layer.Layer<IamRepos, ConfigError | SqlError, SqlClient>;

export const IamReposLive: IamReposLive = Layer.mergeAll(
  AccountRepo.Default,
  ApiKeyRepo.Default,
  DeviceCodeRepo.Default,
  InvitationRepo.Default,
  JwksRepo.Default,
  MemberRepo.Default,
  OAuthAccessTokenRepo.Default,
  OAuthApplicationRepo.Default,
  OAuthConsentRepo.Default,
  OrganizationRoleRepo.Default,
  PasskeyRepo.Default,
  RateLimitRepo.Default,
  SessionRepo.Default,
  SsoProviderRepo.Default,
  SubscriptionRepo.Default,
  TeamMemberRepo.Default,
  TwoFactorRepo.Default,
  UserRepo.Default,
  VerificationRepo.Default,
  WalletAddressRepo.Default,
);


export { AccountRepo } from "./repos/Account.repo";
export { ApiKeyRepo } from "./repos/ApiKey.repo";
export { DeviceCodeRepo } from "./repos/DeviceCode.repo";
export { InvitationRepo } from "./repos/Invitation.repo";
export { JwksRepo } from "./repos/Jwks.repo";
export { MemberRepo } from "./repos/Member.repo";
export { OAuthAccessTokenRepo } from "./repos/OAuthAccessToken.repo";
export { OAuthApplicationRepo } from "./repos/OAuthApplication.repo";
export { OAuthConsentRepo } from "./repos/OAuthConsent.repo";
export { OrganizationRoleRepo } from "./repos/OrganizationRole.repo";
export { PasskeyRepo } from "./repos/Passkey.repo";
export { RateLimitRepo } from "./repos/RateLimit.repo";
export { SessionRepo } from "./repos/Session.repo";
export { SsoProviderRepo } from "./repos/SsoProvider.repo";
export { SubscriptionRepo } from "./repos/Subscription.repo";
export { TeamMemberRepo } from "./repos/TeamMember.repo";
export { TwoFactorRepo } from "./repos/TwoFactor.repo";
export { UserRepo } from "./repos/User.repo";
export { VerificationRepo } from "./repos/Verification.repo";
export { WalletAddressRepo } from "./repos/WalletAddress.repo";

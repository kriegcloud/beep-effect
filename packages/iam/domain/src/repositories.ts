import { OrganizationRepo } from "@beep/shared-domain/Organization";
import { TeamRepo } from "@beep/shared-domain/Team";
import type { SqlClient } from "@effect/sql/SqlClient";
import * as Layer from "effect/Layer";
import { AccountRepo } from "./Account";
import { ApiKeyRepo } from "./ApiKey";
import { DeviceCodeRepo } from "./DeviceCode";
import { InvitationRepo } from "./Invitation";
import { JwksRepo } from "./Jwks";
import { MemberRepo } from "./Member";
import { OAuthAccessTokenRepo } from "./OAuthAccessToken";
import { OAuthApplicationRepo } from "./OAuthApplication";
import { OAuthConsentRepo } from "./OAuthConsent";
import { OrganizationRoleRepo } from "./OrganizationRole";
import { PasskeyRepo } from "./Passkey";
import { RateLimitRepo } from "./RateLimit";
import { SessionRepo } from "./Session";
import { SsoProviderRepo } from "./SsoProvider";
import { SubscriptionRepo } from "./Subscription";
import { TeamMemberRepo } from "./TeamMember";
import { TwoFactorRepo } from "./TwoFactor";
import { UserRepo } from "./User";
import { VerificationRepo } from "./Verification";
import { WalletAddressRepo } from "./WalletAddress";

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
  | OrganizationRepo
  | TeamRepo;

export type IamReposLive = Layer.Layer<IamRepos, never, SqlClient>;

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
  OrganizationRepo.Default,
  TeamRepo.Default
);

export { OrganizationRepo } from "@beep/shared-domain/Organization";
export { TeamRepo } from "@beep/shared-domain/Team";
export { AccountRepo } from "./Account";
export { ApiKeyRepo } from "./ApiKey";
export { DeviceCodeRepo } from "./DeviceCode";
export { InvitationRepo } from "./Invitation";
export { JwksRepo } from "./Jwks";
export { MemberRepo } from "./Member";
export { OAuthAccessTokenRepo } from "./OAuthAccessToken";
export { OAuthApplicationRepo } from "./OAuthApplication";
export { OAuthConsentRepo } from "./OAuthConsent";
export { OrganizationRoleRepo } from "./OrganizationRole";
export { PasskeyRepo } from "./Passkey";
export { RateLimitRepo } from "./RateLimit";
export { SessionRepo } from "./Session";
export { SsoProviderRepo } from "./SsoProvider";
export { SubscriptionRepo } from "./Subscription";
export { TeamMemberRepo } from "./TeamMember";
export { TwoFactorRepo } from "./TwoFactor";
export { UserRepo } from "./User";
export { VerificationRepo } from "./Verification";
export { WalletAddressRepo } from "./WalletAddress";

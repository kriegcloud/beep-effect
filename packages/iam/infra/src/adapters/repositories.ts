import type { DbPool } from "@beep/core-db";
import type { SqlClient } from "@effect/sql/SqlClient";
import type { SqlError } from "@effect/sql/SqlError";
import type { ConfigError } from "effect/ConfigError";
import * as Layer from "effect/Layer";
import {
  AccountRepo,
  ApiKeyRepo,
  DeviceCodeRepo,
  InvitationRepo,
  JwksRepo,
  MemberRepo,
  OAuthAccessTokenRepo,
  OAuthApplicationRepo,
  OAuthConsentRepo,
  OrganizationRepo,
  OrganizationRoleRepo,
  PasskeyRepo,
  RateLimitRepo,
  SessionRepo,
  SsoProviderRepo,
  SubscriptionRepo,
  TeamMemberRepo,
  TeamRepo,
  TwoFactorRepo,
  UserRepo,
  VerificationRepo,
  WalletAddressRepo,
} from "./repos";

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

export type IamReposLive = Layer.Layer<IamRepos, ConfigError | SqlError, SqlClient | DbPool>;

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

export * from "./repos";

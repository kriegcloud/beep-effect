import type { Db } from "@beep/shared-server/Db";
import * as Layer from "effect/Layer";
import type { IamDb } from "../db";
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
  ScimProviderRepo,
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
  | TeamRepo
  | ScimProviderRepo;

export type IamReposLive = Layer.Layer<IamRepos, never, Db.SliceDbRequirements | IamDb.IamDb>;

export const layer: IamReposLive = Layer.mergeAll(
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
  TeamRepo.Default,
  ScimProviderRepo.Default
);

export * from "./repos";

import type { DbClient } from "@beep/shared-server/Db";
import * as Layer from "effect/Layer";
import type { IamDb } from "./Db";
import * as repos from "./repos";

export * from "./repos";

export type RepoLayer = Layer.Layer<Repos, never, DbClient.SliceDbRequirements | IamDb.Db>;

export type Repos =
  | repos.AccountRepo
  | repos.ApiKeyRepo
  | repos.DeviceCodeRepo
  | repos.InvitationRepo
  | repos.JwksRepo
  | repos.MemberRepo
  | repos.OAuthAccessTokenRepo
  | repos.OAuthApplicationRepo
  | repos.OAuthConsentRepo
  | repos.OrganizationRoleRepo
  | repos.PasskeyRepo
  | repos.RateLimitRepo
  | repos.SessionRepo
  | repos.SsoProviderRepo
  | repos.SubscriptionRepo
  | repos.TeamMemberRepo
  | repos.TwoFactorRepo
  | repos.UserRepo
  | repos.VerificationRepo
  | repos.WalletAddressRepo
  | repos.OrganizationRepo
  | repos.TeamRepo
  | repos.ScimProviderRepo;

export const layer: RepoLayer = Layer.mergeAll(
  repos.AccountRepo.Default,
  repos.ApiKeyRepo.Default,
  repos.DeviceCodeRepo.Default,
  repos.InvitationRepo.Default,
  repos.JwksRepo.Default,
  repos.MemberRepo.Default,
  repos.OAuthAccessTokenRepo.Default,
  repos.OAuthApplicationRepo.Default,
  repos.OAuthConsentRepo.Default,
  repos.OrganizationRoleRepo.Default,
  repos.PasskeyRepo.Default,
  repos.RateLimitRepo.Default,
  repos.SessionRepo.Default,
  repos.SsoProviderRepo.Default,
  repos.SubscriptionRepo.Default,
  repos.TeamMemberRepo.Default,
  repos.TwoFactorRepo.Default,
  repos.UserRepo.Default,
  repos.VerificationRepo.Default,
  repos.WalletAddressRepo.Default,
  repos.OrganizationRepo.Default,
  repos.TeamRepo.Default,
  repos.ScimProviderRepo.Default
);

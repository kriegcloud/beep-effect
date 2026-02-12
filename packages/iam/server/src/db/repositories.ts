import type { Entities } from "@beep/iam-domain";
import type { DbClient } from "@beep/shared-server";
import * as Layer from "effect/Layer";
import * as Live from "../entities";

export type Repos =
  | Entities.Account.Repo
  | Entities.ApiKey.Repo
  | Entities.DeviceCode.Repo
  | Entities.Invitation.Repo
  | Entities.Jwks.Repo
  | Entities.Member.Repo
  | Entities.Organization.Repo
  | Entities.OrganizationRole.Repo
  | Entities.Passkey.Repo
  | Entities.RateLimit.Repo
  | Entities.ScimProvider.Repo
  | Entities.Session.Repo
  | Entities.SsoProvider.Repo
  | Entities.Subscription.Repo
  | Entities.Team.Repo
  | Entities.TeamMember.Repo
  | Entities.TwoFactor.Repo
  | Entities.User.Repo
  | Entities.Verification.Repo
  | Entities.WalletAddress.Repo;

export type RepoLayer = Layer.Layer<Repos, never, DbClient.SliceDbRequirements>;

export const layer: RepoLayer = Layer.mergeAll(
  Live.AccountLive.RepoLive,
  Live.ApiKeyLive.RepoLive,
  Live.DeviceCodeLive.RepoLive,
  Live.InvitationLive.RepoLive,
  Live.JwksLive.RepoLive,
  Live.MemberLive.RepoLive,
  Live.OrganizationLive.RepoLive,
  Live.OrganizationRoleLive.RepoLive,
  Live.PasskeyLive.RepoLive,
  Live.RateLimitLive.RepoLive,
  Live.ScimProviderLive.RepoLive,
  Live.SessionLive.RepoLive,
  Live.SsoProviderLive.RepoLive,
  Live.SubscriptionLive.RepoLive,
  Live.TeamLive.RepoLive,
  Live.TeamMemberLive.RepoLive,
  Live.TwoFactorLive.RepoLive,
  Live.UserLive.RepoLive,
  Live.VerificationLive.RepoLive,
  Live.WalletAddressLive.RepoLive
);

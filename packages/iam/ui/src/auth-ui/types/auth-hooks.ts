import type { Account, User } from "@beep/iam-infra/adapters/better-auth/types";
import type { AuthClient } from "@beep/iam-sdk/adapters/better-auth/types";
import type { BetterFetchError } from "@better-fetch/fetch";
// import type {Account, User} from "better-auth";
import type { Member } from "better-auth/plugins/organization";
import type { ApiKey } from "./api-key";
import type { Invitation } from "./invitation";
import type { Refetch } from "./refetch";

type AnyAuthSession = AuthClient["$Infer"]["Session"];

type AuthHook<T> = {
  readonly isPending: boolean;
  readonly data?: T | null | undefined;
  readonly error?: BetterFetchError | null | undefined;
  readonly refetch?: Refetch | undefined;
};

export type AuthHooks = {
  readonly useSession: () => ReturnType<AuthClient["useSession"]>;
  readonly useListAccounts: () => AuthHook<Array<Account>>;
  readonly useAccountInfo: (params: Parameters<AuthClient["accountInfo"]>[0]) => AuthHook<{ user: User }>;
  readonly useListDeviceSessions: () => AuthHook<Array<AuthClient["$Infer"]["Session"]>>;
  readonly useListSessions: () => AuthHook<Array<AnyAuthSession["session"]>>;
  readonly useListPasskeys: () => Partial<ReturnType<AuthClient["useListPasskeys"]>>;
  readonly useListApiKeys: () => AuthHook<Array<ApiKey>>;
  readonly useActiveOrganization: () => Partial<ReturnType<AuthClient["useActiveOrganization"]>>;
  readonly useListOrganizations: () => Partial<ReturnType<AuthClient["useListOrganizations"]>>;
  readonly useHasPermission: (params: Parameters<AuthClient["organization"]["hasPermission"]>[0]) => AuthHook<{
    readonly error: null;
    readonly success: boolean;
  }>;
  readonly useInvitation: (params: Parameters<AuthClient["organization"]["getInvitation"]>[0]) => AuthHook<
    Invitation & {
      readonly organizationName: string;
      readonly organizationSlug: string;
      readonly organizationLogo?: string | undefined;
    }
  >;
  readonly useListInvitations: (
    params: Parameters<AuthClient["organization"]["listInvitations"]>[0]
  ) => AuthHook<Invitation[]>;
  readonly useListUserInvitations: () => AuthHook<Invitation[]>;
  readonly useListMembers: (params: Parameters<AuthClient["organization"]["listMembers"]>[0]) => AuthHook<{
    readonly members: Array<Member & { readonly user?: Partial<User> | null | undefined }>;
    readonly total: number;
  }>;
  readonly useIsRestoring?: undefined | (() => boolean);
};

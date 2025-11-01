"use client";
import { client } from "@beep/iam-sdk/adapters/better-auth";
import type {
  AccountOptions,
  AccountOptionsContext,
  AdditionalFields,
  AuthHooks,
  AuthMutators,
  AvatarOptions,
  CaptchaOptions,
  CredentialsOptions,
  DeleteUserOptions,
  GenericOAuthOptions,
  GravatarOptions,
  Link,
  OrganizationOptions,
  OrganizationOptionsContext,
  RenderToast,
  SignUpOptions,
  SocialOptions,
} from "@beep/iam-ui/auth-ui/types";
import { toast } from "@beep/ui/molecules";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import React from "react";
import { type AuthLocalization, authLocalization } from "../lib/auth-localization";
import type { AuthViewPaths } from "./view-paths";
import { accountViewPaths, authViewPaths, organizationViewPaths } from "./view-paths";

const DefaultLink: Link = ({ href, className, children }) => (
  <a className={className} href={href}>
    {children}
  </a>
);

const defaultNavigate = (href: string) => {
  window.location.href = href;
};

const defaultReplace = (href: string) => {
  window.location.replace(href);
};

const defaultToast: RenderToast = ({ variant = "default", message }) => {
  if (variant === "default") {
    toast(message);
  } else {
    toast[variant](message);
  }
};

export type AuthUIContextType = {
  readonly authClient: typeof client;
  /**
   * Additional fields for users
   */
  readonly additionalFields?: AdditionalFields;
  /**
   * API Key plugin configuration
   */
  readonly apiKey?:
    | (
        | {
            /**
             * Prefix for API Keys
             */
            readonly prefix?: undefined | string;
            /**
             * Metadata for API Keys
             */
            readonly metadata?: undefined | Record<string, unknown>;
          }
        | boolean
      )
    | undefined;
  /**
   * Avatar configuration
   * @default undefined
   */
  readonly avatar?: AvatarOptions | undefined;
  /**
   * Base path for the auth views
   * @default "/auth"
   */
  readonly basePath: string;
  /**
   * Front end base URL for auth API callbacks
   */
  readonly baseURL?: string | undefined;
  /**
   * Captcha configuration
   */
  readonly captcha?: CaptchaOptions | undefined;
  readonly credentials?: CredentialsOptions | undefined;
  /**
   * Default redirect URL after authenticating
   * @default "/"
   */
  readonly redirectTo: string;
  /**
   * Enable or disable user change email support
   * @default true
   */
  readonly changeEmail?: boolean | undefined;
  /**
   * User Account deletion configuration
   * @default undefined
   */
  readonly deleteUser?: DeleteUserOptions | undefined;
  /**
   * Show Verify Email card for unverified emails
   */
  readonly emailVerification?: boolean | undefined;
  /**
   * Freshness age for Session data
   * @default 60 * 60 * 24
   */
  readonly freshAge: number;
  /**
   * Generic OAuth provider configuration
   */
  readonly genericOAuth?: GenericOAuthOptions | undefined;
  /**
   * Gravatar configuration
   */
  readonly gravatar?: (boolean | GravatarOptions) | undefined;
  readonly hooks: AuthHooks;
  readonly localization: typeof authLocalization;
  /**
   * Enable or disable Magic Link support
   * @default false
   */
  readonly magicLink?: boolean | undefined;
  /**
   * Enable or disable Email OTP support
   * @default false
   */
  readonly emailOTP?: boolean | undefined;
  /**
   * Enable or disable Multi Session support
   * @default false
   */
  readonly multiSession?: boolean | undefined;
  readonly mutators: AuthMutators;
  /**
   * Whether the name field should be required
   * @default true
   */
  readonly nameRequired?: boolean | undefined;
  /**
   * Enable or disable One Tap support
   * @default false
   */
  readonly oneTap?: boolean | undefined;
  /**
   * Perform some User updates optimistically
   * @default false
   */
  readonly optimistic?: boolean | undefined;
  /**
   * Organization configuration
   */
  readonly organization?: OrganizationOptionsContext | undefined;
  /**
   * Enable or disable Passkey support
   * @default false
   */
  readonly passkey?: boolean | undefined;
  /**
   * Forces better-auth-tanstack to refresh the Session on the auth callback page
   * @default false
   */
  readonly persistClient?: boolean | undefined;
  /**
   * Account configuration
   */
  readonly account?: AccountOptionsContext | undefined;
  /**
   * Sign Up configuration
   */
  readonly signUp?: SignUpOptions | undefined;
  /**
   * Social provider configuration
   */
  readonly social?: SocialOptions | undefined;
  readonly toast: RenderToast;
  /**
   * Enable or disable two-factor authentication support
   * @default undefined
   */
  readonly twoFactor?: ("otp" | "totp")[] | undefined;
  readonly viewPaths: AuthViewPaths;
  /**
   * Navigate to a new URL
   * @default window.location.href
   */
  readonly navigate: (href: string) => void;
  /**
   * Called whenever the Session changes
   */
  readonly onSessionChange?: (() => void | Promise<void>) | undefined;
  /**
   * Replace the current URL
   * @default navigate
   */
  readonly replace: (href: string) => void;
  /**
   * Custom Link component for navigation
   * @default <a>
   */
  readonly Link: Link;
};

export type AuthUIProviderProps = {
  readonly children: React.ReactNode;
  /**
   * Enable account view & account configuration
   * @default { fields: ["image", "name"] }
   */
  readonly account?: boolean | Partial<AccountOptions> | undefined;
  /**
   * Avatar configuration
   * @default undefined
   */
  readonly avatar?: boolean | Partial<AvatarOptions> | undefined;
  /**
   * User Account deletion configuration
   * @default undefined
   */
  readonly deleteUser?: DeleteUserOptions | boolean | undefined;
  /**
   * ADVANCED: Custom hooks for fetching auth data
   */
  readonly hooks?: Partial<AuthHooks> | undefined;
  /**
   * Customize the paths for the auth views
   * @default authViewPaths
   * @remarks `AuthViewPaths`
   */
  readonly viewPaths?: Partial<AuthViewPaths> | undefined;
  /**
   * Render custom Toasts
   * @default Sonner
   */
  readonly toast?: RenderToast | undefined;
  /**
   * Customize the Localization strings
   * @default authLocalization
   * @remarks `AuthLocalization`
   */
  readonly localization?: AuthLocalization | undefined;
  /**
   * ADVANCED: Custom mutators for updating auth data
   */
  readonly mutators?: Partial<AuthMutators> | undefined;
  /**
   * Organization plugin configuration
   */
  readonly organization?: OrganizationOptions | boolean | undefined;
  /**
   * Enable or disable Credentials support
   * @default { forgotPassword: true }
   */
  readonly credentials?: boolean | CredentialsOptions | undefined;
  /**
   * Enable or disable Sign Up form
   * @default { fields: ["name"] }
   */
  readonly signUp?: SignUpOptions | boolean | undefined;
} & Partial<
  Omit<
    AuthUIContextType,
    | "authClient"
    | "viewPaths"
    | "localization"
    | "mutators"
    | "toast"
    | "hooks"
    | "avatar"
    | "account"
    | "deleteUser"
    | "credentials"
    | "signUp"
    | "organization"
  >
>;

export const AuthUIContext = React.createContext<AuthUIContextType>({} as unknown as AuthUIContextType);

export const AuthUIProvider = ({
  children,
  account: accountProp,
  avatar: avatarProp,
  deleteUser: deleteUserProp,
  social: socialProp,
  genericOAuth: genericOAuthProp,
  basePath = "/auth",
  baseURL = "",
  captcha,
  redirectTo = "/",
  credentials: credentialsProp,
  changeEmail = true,
  freshAge = 60 * 60 * 24,
  hooks: hooksProp,
  mutators: mutatorsProp,
  localization: localizationProp,
  nameRequired = true,
  organization: organizationProp,
  signUp: signUpProp = true,
  toast = defaultToast,
  viewPaths: viewPathsProp,
  navigate,
  replace,
  Link = DefaultLink,
  ...props
}: AuthUIProviderProps) => {
  const avatar = React.useMemo<AvatarOptions | undefined>(() => {
    if (!avatarProp) return;

    if (avatarProp === true) {
      return {
        extension: "png",
        size: 128,
      };
    }

    return {
      upload: avatarProp.upload,
      delete: avatarProp.delete,
      extension: avatarProp.extension || "png",
      size: avatarProp.size || (avatarProp.upload ? 256 : 128),
    };
  }, [avatarProp]);

  const account = React.useMemo<AccountOptionsContext | undefined>(() => {
    if (accountProp === false) return;

    if (accountProp === true || accountProp === undefined) {
      return {
        basePath: "/account",
        fields: ["image", "name"] as const,
        viewPaths: accountViewPaths,
      } as const;
    }

    // Remove trailing slash from basePath
    const basePath = accountProp.basePath?.endsWith("/") ? accountProp.basePath.slice(0, -1) : accountProp.basePath;

    return {
      basePath: basePath ?? "/account",
      fields: accountProp.fields || ["image", "name"],
      viewPaths: { ...accountViewPaths, ...accountProp.viewPaths },
    };
  }, [accountProp]);

  const deleteUser = React.useMemo<DeleteUserOptions | undefined>(() => {
    if (!deleteUserProp) return;

    if (deleteUserProp === true) {
      return {};
    }

    return deleteUserProp;
  }, [deleteUserProp]);

  const social = React.useMemo<SocialOptions | undefined>(() => {
    if (!socialProp) return;

    return socialProp;
  }, [socialProp]);

  const genericOAuth = React.useMemo<GenericOAuthOptions | undefined>(() => {
    if (!genericOAuthProp) return;

    return genericOAuthProp;
  }, [genericOAuthProp]);

  const credentials = React.useMemo<CredentialsOptions | undefined>(() => {
    if (credentialsProp === false) return;

    if (credentialsProp === true) {
      return {
        forgotPassword: true,
      };
    }

    return {
      ...credentialsProp,
      forgotPassword: credentialsProp?.forgotPassword ?? true,
    };
  }, [credentialsProp]);

  const signUp = React.useMemo<SignUpOptions | undefined>(() => {
    if (signUpProp === false) return;

    if (signUpProp === true || signUpProp === undefined) {
      return {
        fields: ["name"],
      };
    }

    return {
      fields: signUpProp.fields || ["name"],
    };
  }, [signUpProp]);

  const organization = React.useMemo<OrganizationOptionsContext | undefined>(() => {
    if (!organizationProp) return;

    if (organizationProp === true) {
      return {
        basePath: "/organization",
        viewPaths: organizationViewPaths,
        customRoles: [],
      };
    }

    let logo: OrganizationOptionsContext["logo"] | undefined;

    if (organizationProp.logo === true) {
      logo = {
        extension: "png",
        size: 128,
      };
    } else if (organizationProp.logo) {
      logo = {
        upload: organizationProp.logo.upload,
        delete: organizationProp.logo.delete,
        extension: organizationProp.logo.extension || "png",
        size: organizationProp.logo.size || organizationProp.logo.upload ? 256 : 128,
      };
    }

    // Remove trailing slash from basePath
    const basePath = organizationProp.basePath?.endsWith("/")
      ? organizationProp.basePath.slice(0, -1)
      : organizationProp.basePath;

    return {
      ...organizationProp,
      logo,
      basePath: basePath ?? "/organization",
      customRoles: organizationProp.customRoles || [],
      viewPaths: {
        ...organizationViewPaths,
        ...organizationProp.viewPaths,
      },
    };
  }, [organizationProp]);

  const defaultMutators = React.useMemo(() => {
    return {
      deleteApiKey: (params) =>
        client.apiKey.delete({
          ...params,
          fetchOptions: { throw: true },
        }),
      deletePasskey: (params) =>
        client.passkey.deletePasskey({
          ...params,
          fetchOptions: { throw: true },
        }),
      revokeDeviceSession: (params) =>
        client.multiSession.revoke({
          ...params,
          fetchOptions: { throw: true },
        }),
      revokeSession: (params) =>
        client.revokeSession({
          ...params,
          fetchOptions: { throw: true },
        }),
      setActiveSession: (params) =>
        client.multiSession.setActive({
          ...params,
          fetchOptions: { throw: true },
        }),
      updateOrganization: (params) =>
        client.organization.update({
          ...params,
          data: {
            ...params.data,
            logo: F.pipe(
              params.data.logo,
              O.fromNullable,
              O.flatten,
              O.match({
                onNone: () => undefined,
                onSome: (logo) => logo,
              })
            ),
            metadata: F.pipe(params.data.metadata, (r) => (P.isRecord(r) ? r : {})),
          },
          fetchOptions: { throw: true },
        }),
      updateUser: (params) =>
        client.updateUser({
          ...params,
          fetchOptions: { throw: true },
        }),
      unlinkAccount: (params) =>
        client.unlinkAccount({
          ...params,
          fetchOptions: { throw: true },
        }),
    } as AuthMutators;
  }, [client]);

  const defaultHooks = React.useMemo(() => {
    // Import useAuthData dynamically to avoid circular dependency
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { useAuthData } = require("../hooks/use-auth-data");

    return {
      useSession: client.useSession,
      useListAccounts: () =>
        useAuthData({
          queryFn: client.listAccounts,
          cacheKey: "listAccounts",
        }),
      useAccountInfo: (params) =>
        useAuthData({
          queryFn: () => client.accountInfo(params),
          cacheKey: `accountInfo:${JSON.stringify(params)}`,
        }),
      useListDeviceSessions: () =>
        useAuthData({
          queryFn: client.multiSession.listDeviceSessions,
          cacheKey: "listDeviceSessions",
        }),
      useListSessions: () =>
        useAuthData({
          queryFn: client.listSessions,
          cacheKey: "listSessions",
        }),
      useListPasskeys: client.useListPasskeys,
      useListApiKeys: () =>
        useAuthData({
          queryFn: client.apiKey.list,
          cacheKey: "listApiKeys",
        }),
      useActiveOrganization: client.useActiveOrganization,
      useListOrganizations: client.useListOrganizations,
      useHasPermission: (params) =>
        useAuthData({
          queryFn: () =>
            client.$fetch("/organization/has-permission", {
              method: "POST",
              body: params,
            }),
          cacheKey: `hasPermission:${JSON.stringify(params)}`,
        }),
      useInvitation: (params) =>
        useAuthData({
          queryFn: () => client.organization.getInvitation(params),
          cacheKey: `invitation:${JSON.stringify(params)}`,
        }),
      useListInvitations: (params) =>
        useAuthData({
          queryFn: () =>
            client.$fetch(`/organization/list-invitations?organizationId=${params?.query?.organizationId || ""}`),
          cacheKey: `listInvitations:${JSON.stringify(params)}`,
        }),
      useListUserInvitations: () =>
        useAuthData({
          queryFn: () => client.$fetch("/organization/list-user-invitations"),
          cacheKey: `listUserInvitations`,
        }),
      useListMembers: (params) =>
        useAuthData({
          queryFn: () =>
            client.$fetch(`/organization/list-members?organizationId=${params?.query?.organizationId || ""}`),
          cacheKey: `listMembers:${JSON.stringify(params)}`,
        }),
    } as AuthHooks;
  }, [client]);

  const viewPaths = React.useMemo(() => {
    return { ...authViewPaths, ...viewPathsProp };
  }, [viewPathsProp]);

  const localization = React.useMemo(() => {
    return { ...authLocalization, ...localizationProp };
  }, [localizationProp]);

  const hooks = React.useMemo(() => {
    return { ...defaultHooks, ...hooksProp };
  }, [defaultHooks, hooksProp]);

  const mutators = React.useMemo(() => {
    return { ...defaultMutators, ...mutatorsProp };
  }, [defaultMutators, mutatorsProp]);

  // Remove trailing slash from baseURL
  baseURL = baseURL.endsWith("/") ? baseURL.slice(0, -1) : baseURL;

  // Remove trailing slash from basePath
  basePath = basePath.endsWith("/") ? basePath.slice(0, -1) : basePath;

  const { data: sessionData } = hooks.useSession();

  return (
    <AuthUIContext.Provider
      value={{
        authClient: client,
        avatar,
        basePath: basePath === "/" ? "" : basePath,
        baseURL,
        captcha,
        redirectTo,
        changeEmail,
        credentials,
        deleteUser,
        freshAge,
        genericOAuth,
        hooks,
        mutators,
        localization,
        nameRequired,
        organization,
        account,
        signUp,
        social,
        toast,
        navigate: navigate || defaultNavigate,
        replace: replace || navigate || defaultReplace,
        viewPaths,
        Link,
        ...props,
      }}
    >
      <AuthUIProviderChildren
        sessionData={sessionData}
        organization={organization}
        captcha={captcha}
        hooks={hooks}
        navigate={navigate || defaultNavigate}
        redirectTo={redirectTo}
      >
        {children}
      </AuthUIProviderChildren>
    </AuthUIContext.Provider>
  );
};

function AuthUIProviderChildren({
  children,
  sessionData,
  organization,
  captcha,
  hooks,
  navigate,
  redirectTo,
}: {
  children: React.ReactNode;
  sessionData: ReturnType<typeof client.useSession>["data"];
  organization: AuthUIContextType["organization"];
  captcha: AuthUIContextType["captcha"];
  hooks: AuthHooks;
  navigate: (href: string) => void;
  redirectTo: string;
}) {
  // Lazy load to break circular dependency
  const RecaptchaV3 = React.lazy(() =>
    import("../components/captcha/recaptcha-v3").then((m) => ({ default: m.RecaptchaV3 }))
  );
  const OrganizationRefetcher = React.lazy(() =>
    import("./organization-refetcher").then((m) => ({ default: m.OrganizationRefetcher }))
  );

  return (
    <React.Suspense fallback={null}>
      {sessionData && organization && (
        <OrganizationRefetcher
          hooks={hooks}
          organizationOptions={organization}
          navigate={navigate}
          redirectTo={redirectTo}
        />
      )}
      {captcha?.provider === "google-recaptcha-v3" ? <RecaptchaV3 captcha={captcha}>{children}</RecaptchaV3> : children}
    </React.Suspense>
  );
}

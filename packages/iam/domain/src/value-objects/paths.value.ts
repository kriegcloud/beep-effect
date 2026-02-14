import { BS } from "@beep/schema";
import { PathBuilder } from "@beep/shared-domain/factories";

const auth = PathBuilder.make("/auth");

export const authViewPaths = PathBuilder.collection({
  signIn: auth("sign-in"),
  signUp: auth("sign-up"),
  signOut: auth("sign-out"),
  callback: auth("callback"),
  forgotPassword: auth("forgot-password"),
  recoverAccount: auth("recover-account"),
  resetPassword: auth("reset-password"),
  twoFactor: auth("two-factor"),
  acceptInvitation: auth("accept-invitation"),
});

export class AccountSettingsTabSearchParamValue extends BS.StringLiteralKit(
  "general",
  "billing",
  "notifications",
  "connections",
  "security",
  "localization"
).annotations({
  schemaId: Symbol.for("@beep/iam-domain/value-objects/paths/AccountSettingsTabSearchParamValue"),
  identifier: "AccountSettingsTabSearchParamValue",
  title: "Account Settings Tab Search Param",
  description: "Search param for account settings tab",
}) {}

export declare namespace AccountSettingsTabSearchParamValue {
  export type Type = typeof AccountSettingsTabSearchParamValue.Type;
  export type Encoded = typeof AccountSettingsTabSearchParamValue.Encoded;
}

export const accountViewPaths = {
  settings: (pathname: string) => (tab: typeof AccountSettingsTabSearchParamValue.Type) =>
    PathBuilder.make(pathname as `/${string}`).withQuery({
      settingsTab: tab,
    }),
} as const;

export type AccountViewPaths = typeof accountViewPaths;

export const organizationViewPaths = {
  SETTINGS: "settings",
  MEMBERS: "members",
  API_KEYS: "api-keys",
};

export type OrganizationViewPaths = typeof organizationViewPaths;

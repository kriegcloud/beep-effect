import { BS } from "@beep/schema";
import { PathBuilder } from "@beep/shared-domain/factories";

const authPaths = PathBuilder.createRoot("/auth");

export const authViewPaths = PathBuilder.collection({
  signIn: authPaths.child("sign-in"),
  signUp: authPaths.child("sign-up"),
  signOut: authPaths.child("sign-out"),
  callback: authPaths.child("callback"),
  forgotPassword: authPaths.child("forgot-password"),
  recoverAccount: authPaths.child("recover-account"),
  resetPassword: authPaths.child("reset-password"),
  twoFactor: authPaths.child("two-factor"),
  acceptInvitation: authPaths.child("accept-invitation"),
});

export const AccountSettingsTabKit = BS.stringLiteralKit(
  "general",
  "security",
  "billing",
  "notifications",
  "connections"
);

export class AccountSettingsTabSearchParamValue extends AccountSettingsTabKit.Schema.annotations({
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
    PathBuilder.dynamicQueries(pathname)({
      settingsTab: tab,
    }),
} as const;

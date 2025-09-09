import { BS } from "@beep/schema";
import type * as S from "effect/Schema";

export const AuthProviderNameValueKit = BS.stringLiteralKit(
  "github",
  "google",
  "linkedin",
  "twitter",
  "discord"
  // "facebook",
  // "microsoft",
);

export class AuthProviderNameValue extends AuthProviderNameValueKit.Schema.annotations({
  schemaId: Symbol.for("@beep/env/common/AuthProviderNameValue"),
  identifier: "AuthProviderNameValue",
  title: "Auth Provider Name Value",
  description: "Auth provider name value.",
}) {}

export namespace AuthProviderNameValue {
  export type Type = S.Schema.Type<typeof AuthProviderNameValue>;
  export type Encoded = S.Schema.Type<typeof AuthProviderNameValue>;
}

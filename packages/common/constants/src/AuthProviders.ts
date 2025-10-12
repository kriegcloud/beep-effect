import { invariant } from "@beep/invariant";
import { BS } from "@beep/schema";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as S from "effect/Schema";

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
  schemaId: Symbol.for("@beep/constants/AuthProviderNameValue"),
  identifier: "AuthProviderNameValue",
  title: "Auth Provider Name Value",
  description: "One of the supported social authentication providers.",
  examples: AuthProviderNameValueKit.Options,
}) {
  static readonly Options = AuthProviderNameValueKit.Options;
  static readonly filter = (supportedAuthProviders: A.NonEmptyReadonlyArray<AuthProviderNameValue.Type>) =>
    F.pipe(
      AuthProviderNameValue.Options,
      A.filter((provider) => supportedAuthProviders.includes(provider)),
      (providers) => {
        invariant(
          S.is(S.NonEmptyArray(AuthProviderNameValue))(providers),
          `invalid providers ${providers.join(", ")}`,
          {
            file: "@beep/constants/AuthProviders",
            line: 40,
            args: [providers],
          }
        );

        return providers;
      }
    );
}

export namespace AuthProviderNameValue {
  export type Type = S.Schema.Type<typeof AuthProviderNameValue>;
  export type Encoded = S.Schema.Type<typeof AuthProviderNameValue>;
}

export class TaggedAuthProviderNameValue extends AuthProviderNameValueKit.toTagged("name").Union {}

export namespace TaggedAuthProviderNameValue {
  export type Type = S.Schema.Type<typeof TaggedAuthProviderNameValue>;
  export type Encoded = S.Schema.Type<typeof TaggedAuthProviderNameValue>;
}

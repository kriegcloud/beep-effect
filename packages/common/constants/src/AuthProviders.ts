import { invariant } from "@beep/invariant";
import { BS } from "@beep/schema";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as S from "effect/Schema";

export class AuthProviderNameValue extends BS.StringLiteralKit(
  "github",
  "google",
  "linkedin",
  "twitter",
  "discord"
  // "facebook",
  // "microsoft",
).annotations({
  schemaId: Symbol.for("@beep/constants/AuthProviderNameValue"),
  identifier: "AuthProviderNameValue",
  title: "Auth Provider Name Value",
  description: "One of the supported social authentication providers.",
}) {
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

export declare namespace AuthProviderNameValue {
  export type Type = S.Schema.Type<typeof AuthProviderNameValue>;
  export type Encoded = S.Schema.Type<typeof AuthProviderNameValue>;
}

export class TaggedAuthProviderNameValue extends AuthProviderNameValue.toTagged("name").Union {}

export declare namespace TaggedAuthProviderNameValue {
  export type Type = S.Schema.Type<typeof TaggedAuthProviderNameValue>;
  export type Encoded = S.Schema.Type<typeof TaggedAuthProviderNameValue>;
}

import { AuthProviderNameValue } from "@beep/constants";
import { CommonFields, IamAuthError } from "@beep/iam-domain/api/common";
import { $IamDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { User } from "@beep/shared-domain/entities";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/sign-in/social");

export class Payload extends S.Class<Payload>($I`Payload`)({
  provider: AuthProviderNameValue,
  callbackURL: BS.toOptionalWithDefault(BS.URLPath)(BS.URLPath.make("/")).annotations({
    description: "Callback URL to redirect to after the user has signed in",
  }),
  disableRedirect: BS.BoolWithDefault(false).annotations({
    description: "Disable automatic redirection to the provider. Useful for handling the redirection yourself",
  }),
  errorCallbackURL: S.optionalWith(BS.URLPath, { as: "Option", exact: true }).annotations({
    description: "Callback URL to redirect to if an error happens",
  }),
  idToken: S.optionalWith(
    S.Struct({
      token: S.Redacted(S.String).annotations({
        description: "ID token from the provider",
      }),
      accessToken: S.optionalWith(S.Redacted(S.String), { as: "Option", exact: true }).annotations({
        description: "Access token from the provider",
      }),
      expiresAt: S.optionalWith(BS.EpochMillisFromAllAcceptable, { as: "Option", exact: true }).annotations({
        description: "Expiry date of the token",
      }),
      nonce: S.optionalWith(S.Redacted(S.String), { as: "Option", exact: true }).annotations({
        description: "Nonce used to generate the token",
      }),
      refreshToken: S.optionalWith(S.Redacted(S.String), { as: "Option", exact: true }).annotations({
        description: "Refresh token from the provider",
      }),
    }),
    { as: "Option", exact: true }
  ),
  loginHint: S.optionalWith(S.String, { as: "Option", exact: true }).annotations({
    description: "The login hint to use for the authorization code request",
  }),
  newUserCallbackURL: S.optionalWith(BS.URLString, { as: "Option", exact: true }),
  requestSignUp: S.optionalWith(S.Boolean, { as: "Option", exact: true }).annotations({
    description: "Explicitly request sign-up. Useful when disableImplicitSignUp is true for this provider",
  }),
  scopes: S.optionalWith(S.mutable(S.Array(S.String)), { as: "Option", exact: true }).annotations({
    description: "Explicitly request sign-up. Useful when disableImplicitSignUp is true for this provider",
  }),
}) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    user: User.Model,
    redirect: CommonFields.Redirect,
    token: CommonFields.SessionToken,
    url: CommonFields.RedirectURL,
  },
  $I.annotations("SignInSuccess", {
    description: "Session response when idToken is provided.",
  })
) {}

export const Contract = HttpApiEndpoint.post("social", "/social")
  .setPayload(Payload)
  .addError(IamAuthError)
  .addSuccess(Success);

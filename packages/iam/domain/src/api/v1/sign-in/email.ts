import { CommonFields, CommonHeaders, IamAuthError } from "@beep/iam-domain/api/common";
import { $IamDomainId } from "@beep/identity/packages";
import { User } from "@beep/shared-domain/entities";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/sign-in/email");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    email: CommonFields.UserEmail,
    password: CommonFields.UserPassword,
    callbackURL: CommonFields.CallbackURL,
    rememberMe: CommonFields.RememberMe,
  },
  $I.annotations("SignInPayload", {
    description: "Sign in with email and password.",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    user: User.Model.json,
    redirect: CommonFields.Redirect,
    token: CommonFields.SessionToken,
    url: CommonFields.RedirectURL,
  },
  $I.annotations("SignInSuccess", {
    description: "Session response when idToken is provided.",
  })
) {}

export const Contract = HttpApiEndpoint.post("email", "/email")
  .setPayload(Payload)
  .setHeaders(CommonHeaders.CaptchaRequestHeaders)
  .addError(
    IamAuthError.annotations(
      $I.annotations("IamAuthError", {
        description: "An Error indicating a failure to sign in with email and password.",
      })
    )
  )
  .addSuccess(Success);

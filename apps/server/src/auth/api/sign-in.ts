import { Contract } from "@beep/contract";
import { User } from "@beep/iam-domain/entities";
import { $ServerId } from "@beep/identity/packages";
import { AuthService } from "@beep/runtime-server/rpcs/AuthLive";
import { BS } from "@beep/schema";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as HttpApiGroup from "@effect/platform/HttpApiGroup";

import * as HttpServerRequest from "@effect/platform/HttpServerRequest";
import * as F from "effect/Function";
import * as S from "effect/Schema";
import { AuthError } from "../shared";

const $I = $ServerId.create("auth/routes/sign-in");

export class SignInPayload extends S.Class<SignInPayload>($I`SignInPayload`)(
  {
    email: BS.Email.annotations({ description: "The email of the user." }),
    password: BS.Password.annotations({ description: "The password of the user." }),
    callbackURL: S.optionalWith(BS.URLString, { as: "Option", nullable: true }).annotations({
      description: "The URL to use for email verification callback.",
    }),
    rememberMe: S.optionalWith(S.Boolean, { default: F.constFalse }).annotations({
      description: "If this is false, the session will not be remembered. Default is true.",
    }),
  },
  $I.annotations("SignInPayload", {
    description: "Sign in with email and password.",
  })
) {}

export class SignInSuccess extends S.Class<SignInSuccess>($I`SignInSuccess`)(
  {
    user: User.Model,
    redirect: S.Boolean.annotations({ description: "" }),
    token: S.optionalWith(S.String, { as: "Option", nullable: true }).annotations({
      description: "Session token.",
    }),
    url: S.optionalWith(BS.URLString, { as: "Option", nullable: true }).annotations({
      description: "URL to redirect to.",
    }),
  },
  $I.annotations("SignInSuccess", {
    description: "Session response when idToken is provided.",
  })
) {}

export const SignInContract = Contract.make("signIn", {
  description: "Sign in with email and password.",
  payload: SignInPayload,
  failure: AuthError,
  success: S.Struct({ headers: S.instanceOf(Headers), response: SignInSuccess }),
  dependencies: [AuthService, HttpServerRequest.HttpServerRequest],
})
  .annotate(Contract.Title, "Sign in with email and password.")
  .annotate(Contract.Domain, "iam")
  .annotate(Contract.Method, "signIn");

const signInRoute = HttpApiEndpoint.post("email", "/email")
  .addSuccess(SignInSuccess)
  .addError(AuthError)
  .setPayload(SignInPayload);

export class SignInGroup extends HttpApiGroup.make("signIn").add(signInRoute).prefix("/sign-in") {}

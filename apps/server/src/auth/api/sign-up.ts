import { User } from "@beep/iam-domain/entities";
import { $ServerId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as HttpApiGroup from "@effect/platform/HttpApiGroup";
import * as F from "effect/Function";
import * as S from "effect/Schema";
import { AuthError } from "../shared";

const $I = $ServerId.create("auth/routes/sign-up");
export class SignUpPayload extends S.Class<SignUpPayload>($I`SignUpPayload`)(
  {
    email: BS.Email.annotations({ description: "The email of the user." }),
    name: BS.NameAttribute.annotations({ description: "The name of the user." }),
    password: BS.Password.annotations({ description: "The password of the user." }),
    callbackURL: S.optionalWith(BS.URLString, { as: "Option", nullable: true }).annotations({
      description: "The URL to use for email verification callback.",
    }),
    image: S.optionalWith(BS.URLString, { as: "Option", nullable: true }).annotations({
      description: "The profile image URL of the user.",
    }),
    rememberMe: S.optionalWith(S.Boolean, { default: F.constFalse }).annotations({
      description: "If this is false, the session will not be remembered. Default is true.",
    }),
  },
  $I.annotations("SignUpPayload", {
    description: "Sign in with email and password.",
  })
) {}

export class SignUpSuccess extends S.Class<SignUpSuccess>($I`SignUpSuccess`)(
  {
    user: User.Model,
    token: S.optionalWith(S.String, { as: "Option", nullable: true }).annotations({
      description: "Session token.",
    }),
    url: S.optionalWith(BS.URLString, { as: "Option", nullable: true }).annotations({
      description: "URL to redirect to.",
    }),
  },
  $I.annotations("SignUpSuccess", {
    description: "Session response when idToken is provided.",
  })
) {}
const signUpRoute = HttpApiEndpoint.post("email", "/email")
  .addSuccess(SignUpSuccess)
  .addError(AuthError)
  .setPayload(SignUpPayload);

export class SignUpGroup extends HttpApiGroup.make("signUp").add(signUpRoute).prefix("/sign-up") {}

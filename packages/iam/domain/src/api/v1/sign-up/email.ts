import { CommonFields, IamAuthError } from "@beep/iam-domain/api/common";
import { $IamDomainId } from "@beep/identity/packages";
import { User } from "@beep/shared-domain/entities";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/sign-up/email");

export class Payload extends S.Class<Payload>($I`SignUpEmailPayload`)(
  {
    email: CommonFields.UserEmail,
    name: CommonFields.Name,
    password: CommonFields.UserPassword,
    callbackURL: CommonFields.CallbackURL,
    image: CommonFields.UserImage,
    rememberMe: CommonFields.RememberMe,
  },
  $I.annotations("SignUpEmailPayload", {
    description: "Payload for sign up with email and password.",
  })
) {}

export class Success extends S.Class<Success>($I`SignUpEmailSuccess`)(
  {
    user: User.Model,
    token: CommonFields.SessionToken,
    url: CommonFields.RedirectURL,
  },
  $I.annotations("SignUpEmailSuccess", {
    description: "Success response for sign up with email and password.",
  })
) {}

export const Contract = HttpApiEndpoint.post("email", "/email")
  .addSuccess(Success)
  .addError(IamAuthError)
  .setPayload(Payload);

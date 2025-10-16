import { AuthProviderNameValue } from "@beep/constants";
import { Handler, HandlerSet } from "@beep/iam-sdk/authkit";
import { BS } from "@beep/schema";
import * as S from "effect/Schema";
import { IamError } from "../../errors";

export const SignInEmail = Handler.make("SignInEmail", {
  description: "Signs the user in using email",
  parameters: {
    email: BS.Email,
    password: BS.Password,
    rememberMe: BS.BoolWithDefault(false),
    captchaResponse: S.Redacted(S.String),
  },
  failure: S.instanceOf(IamError),
  success: S.Void,
});

export const SignInSocial = Handler.make("SignInSocial", {
  description: "Signs the user in using social provider",
  parameters: {
    provider: AuthProviderNameValue,
  },
  success: S.String,
})
  .annotate(Handler.Title, "Sign in Social")
  .annotate(Handler.Idempotent, true);

export const SignIn = HandlerSet.make(SignInEmail);

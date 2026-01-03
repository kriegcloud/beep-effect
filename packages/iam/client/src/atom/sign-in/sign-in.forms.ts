import { SignIn } from "@beep/iam-domain/api/v1/sign-in";
import { BS } from "@beep/schema";
import { formOptionsWithDefaults, useAppForm } from "@beep/ui/form";
import * as O from "effect/Option";
import * as Redacted from "effect/Redacted";
import * as S from "effect/Schema";
import { useSignIn } from "./sign-in.atoms";

type Props = {
  readonly executeCaptcha: () => Promise<Redacted.Redacted>;
};

export const useSignInEmailForm = ({ executeCaptcha }: Props) => {
  const { signInEmail } = useSignIn();
  const form = useAppForm(
    formOptionsWithDefaults({
      schema: SignIn.Email.Payload.pipe(S.pick("email", "password", "rememberMe")).annotations({
        [BS.DefaultFormValuesAnnotationId]: {
          email: "",
          password: "",
          rememberMe: false,
        },
      }),
      onSubmit: async (value) => {
        const captchaResponse = await executeCaptcha();
        await signInEmail({
          payload: {
            ...value,
            callbackURL: O.none(),
          },
          headers: {
            "x-captcha-response": O.some(Redacted.value(captchaResponse)),
          },
        });
      },
    })
  );

  return { form };
};

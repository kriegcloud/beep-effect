import { client } from "@beep/iam-client/adapters";
import { BS } from "@beep/schema";
import { formOptionsWithDefaults, useAppForm } from "@beep/ui/form";
import * as Redacted from "effect/Redacted";
import * as S from "effect/Schema";

type Props = {
  readonly executeCaptcha: () => Promise<Redacted.Redacted>;
};

export const useSignInEmailForm = ({ executeCaptcha }: Props) => {
  const form = useAppForm(
    formOptionsWithDefaults({
      schema: S.Struct({
        email: BS.Email,
        rememberMe: BS.BoolWithDefault(true),
        password: BS.Password,
      }).annotations({
        [BS.DefaultFormValuesAnnotationId]: {
          email: "",
          password: "",
          rememberMe: true,
        },
      }),
      onSubmit: async (value) => {
        const captchaResponse = await executeCaptcha();
        await client.signIn.email({
          email: Redacted.value(value.email),
          password: Redacted.value(value.password),
          rememberMe: value.rememberMe,
          fetchOptions: {
            headers: {
              "x-captcha-response": Redacted.value(captchaResponse),
            },
          },
        });
      },
    })
  );

  return { form };
};

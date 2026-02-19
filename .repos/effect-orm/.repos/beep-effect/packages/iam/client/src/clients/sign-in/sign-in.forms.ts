import { useSignIn } from "@beep/iam-client";
import { formOptionsWithDefaults, useAppForm } from "@beep/ui/form";
import * as Redacted from "effect/Redacted";
import { SignInEmailContract } from "./sign-in.contracts";

type Props = {
  readonly executeCaptcha: () => Promise<Redacted.Redacted>;
};

export const useSignInEmailForm = ({ executeCaptcha }: Props) => {
  const { signInEmail } = useSignIn();
  const form = useAppForm(
    formOptionsWithDefaults({
      schema: SignInEmailContract.payloadSchema,
      onSubmit: async (value) => {
        const captchaResponse = await executeCaptcha();
        await signInEmail({
          ...value,
          captchaResponse: Redacted.value(captchaResponse),
        });
      },
    })
  );

  return { form };
};

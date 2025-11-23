import { useSignInEmail } from "@beep/iam-sdk";
import { formOptionsWithSubmitEffect, useAppForm } from "@beep/ui/form";
import type * as Redacted from "effect/Redacted";
import { SignInEmailContract } from "./sign-in.contracts";

type Props = {
  readonly executeCaptcha: () => Promise<Redacted.Redacted>;
};

export const useSignInEmailForm = ({ executeCaptcha }: Props) => {
  const { signInEmail } = useSignInEmail();
  const form = useAppForm(
    formOptionsWithSubmitEffect({
      schema: SignInEmailContract.payloadSchema,
      defaultValues: {
        email: "",
        password: "",
        rememberMe: false,
        captchaResponse: "",
      },
      onSubmit: async (value) => {
        const captchaResponse = await executeCaptcha();
        await signInEmail({
          ...value,
          captchaResponse: captchaResponse,
        });
      },
    })
  );

  return { form };
};

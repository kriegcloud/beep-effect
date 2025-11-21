import { useSignInEmail } from "@beep/iam-sdk";
import { formOptionsWithDefaults, useAppForm } from "@beep/ui/form";
import * as Redacted from "effect/Redacted";
import { SignInEmailContract } from "./sign-in.contracts";

type Props = {
  readonly executeCaptcha: () => Promise<Redacted.Redacted<string>>;
};

export const useSignInEmailForm = ({ executeCaptcha }: Props) => {
  const { signInEmail } = useSignInEmail();
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

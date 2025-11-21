import { useSignUpEmail } from "@beep/iam-sdk";
import { formOptionsWithDefaults, useAppForm } from "@beep/ui/form";
import type * as Redacted from "effect/Redacted";
import { SignUpEmailContract } from "./sign-up.contracts";

type Props = {
  executeRecaptcha: () => Promise<Redacted.Redacted<string>>;
};

export const useSignUpEmailForm = ({ executeRecaptcha }: Props) => {
  const { signUpEmail } = useSignUpEmail();

  const form = useAppForm(
    formOptionsWithDefaults({
      schema: SignUpEmailContract.payloadSchema,
      onSubmit: async (value) => {
        const captchaRedacted = await executeRecaptcha();
        signUpEmail({
          ...value,
          captchaResponse: captchaRedacted,
        });
      },
    })
  );

  return {
    form,
  };
};

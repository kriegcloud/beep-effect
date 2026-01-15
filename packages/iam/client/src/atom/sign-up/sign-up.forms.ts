import { client } from "@beep/iam-client/adapters/better-auth";
import { BS } from "@beep/schema";
import { paths } from "@beep/shared-domain";
import { formOptionsWithDefaults, useAppForm } from "@beep/ui/form";
import * as Redacted from "effect/Redacted";
import * as S from "effect/Schema";

type Props = {
  executeRecaptcha: () => Promise<Redacted.Redacted<string>>;
  onSuccess?: () => void | Promise<void>;
};

export const useSignUpEmailForm = ({ executeRecaptcha, onSuccess }: Props) => {
  const form = useAppForm(
    formOptionsWithDefaults({
      schema: S.Struct({
        email: BS.Email,
        rememberMe: BS.BoolWithDefault(false),
        redirectTo: S.optionalWith(BS.URLPath, { default: () => paths.dashboard.root }),
        password: BS.Password,
        passwordConfirm: BS.Password,
        firstName: S.NonEmptyTrimmedString,
        lastName: S.NonEmptyTrimmedString,
      }).annotations({
        [BS.DefaultFormValuesAnnotationId]: {
          email: "",
          password: "",
          passwordConfirm: "",
          firstName: "",
          lastName: "",
          redirectTo: paths.dashboard.root,
          rememberMe: false,
        },
      }),
      onSubmit: async (value) => {
        const captchaRedacted = await executeRecaptcha();
        if (Redacted.value(value.password) !== Redacted.value(value.passwordConfirm)) {
          throw new Error("Passwords do not match");
        }
        const response = await client.signUp.email({
          name: `${value.firstName} ${value.lastName}`,
          email: Redacted.value(value.email),
          password: Redacted.value(value.password),
          fetchOptions: {
            headers: {
              "x-captcha-response": Redacted.value(captchaRedacted),
            },
          },
        });
        await onSuccess?.();
      },
    })
  );

  return {
    form,
  };
};

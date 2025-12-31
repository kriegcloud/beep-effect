import {BS} from "@beep/schema";
import {paths} from "@beep/shared-domain";
import {formOptionsWithDefaults, useAppForm} from "@beep/ui/form";
import * as O from "effect/Option";
import * as Redacted from "effect/Redacted";
import * as S from "effect/Schema";
import {useSignUpEmail} from "./sign-up.atoms";

type Props = {
  executeRecaptcha: () => Promise<Redacted.Redacted<string>>;
};

export const useSignUpEmailForm = ({executeRecaptcha}: Props) => {
  const {signUpEmail} = useSignUpEmail();

  const form = useAppForm(
    formOptionsWithDefaults({
      schema: S.Struct({
        email: BS.Email,
        rememberMe: BS.BoolWithDefault(false),
        redirectTo: BS.StringWithDefault(paths.dashboard.root),
        password: BS.Password,
        passwordConfirm: BS.Password,
        firstName: S.NonEmptyTrimmedString,
        lastName: S.NonEmptyTrimmedString,
      }).annotations(
        {
          [BS.DefaultFormValuesAnnotationId]: {
            email: "",
            password: "",
            passwordConfirm: "",
            firstName: "",
            lastName: "",
            redirectTo: paths.dashboard.root,
            rememberMe: false,
          }
        }
      ),
      onSubmit: async (value) => {
        const captchaRedacted = await executeRecaptcha();
        if (Redacted.value(value.password) !== Redacted.value(value.passwordConfirm)) {
          throw new Error("Passwords do not match");
        }
        signUpEmail({
          payload: {
            ...value,
            callbackURL: O.none(),
            name: `${value.firstName} ${value.lastName}`,
            image: O.none(),
          },
          headers: {
            "x-captcha-response": O.some(Redacted.value(captchaRedacted)),
          },
        });
      },
    })
  );

  return {
    form,
  };
};

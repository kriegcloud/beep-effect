// import { useSignIn } from "./sign-in.atoms";
import { client } from "@beep/iam-client/adapters";
import { SignIn } from "@beep/iam-domain/api/v1/sign-in";
import { BS } from "@beep/schema";
import { formOptionsWithDefaults, useAppForm } from "@beep/ui/form";
// import * as O from "effect/Option";
import * as Redacted from "effect/Redacted";
import * as S from "effect/Schema";

type Props = {
  readonly executeCaptcha: () => Promise<Redacted.Redacted>;
};

export const useSignInEmailForm = ({ executeCaptcha }: Props) => {
  // const { signInEmail } = useSignIn();
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
        const res = await client.signIn.email({
          email: Redacted.value(value.email),
          password: Redacted.value(value.password),
          fetchOptions: {
            headers: {
              "x-captcha-response": Redacted.value(captchaResponse),
            },
          },
        });
        console.log(res);
        // await signInEmail({
        //   payload: {
        //     ...value,
        //     callbackURL: O.none(),
        //   },
        //   headers: {
        //     "x-captcha-response": O.some(Redacted.value(captchaResponse)),
        //   },
        // });
      },
    })
  );

  return { form };
};

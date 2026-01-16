import { SignUp } from "@beep/iam-client";
import { RecaptchaBadge, useCaptchaAtom } from "@beep/iam-ui/_common";
import { paths } from "@beep/shared-domain";
import { PasswordFieldsGroup } from "@beep/ui/form/groups/index";
import { Form, formOptionsWithDefaults, useAppForm } from "@beep/ui/form/index";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import * as Redacted from "effect/Redacted";
import { Suspense } from "react";
import { useSignUp } from "./sign-up-email.atoms.ts";

export const SignUpEmailForm = () => {
  const { executeCaptcha, isReady } = useCaptchaAtom();
  const signUp = useSignUp();
  const form = useAppForm(
    formOptionsWithDefaults({
      // Use PayloadFrom directly for form binding (has firstName/lastName fields)
      // The handler internally encodes via Payload transform (computes `name` from parts)
      schema: SignUp.Email.PayloadFrom,
      onSubmit: async (payload) => {
        const captchaResponse = await executeCaptcha(paths.auth.signIn);
        await signUp.email({
          payload,
          fetchOptions: {
            headers: {
              "x-captcha-response": Redacted.value(captchaResponse),
            },
          },
        });
      },
    })
  );

  return (
    <Form onSubmit={form.handleSubmit}>
      <form.AppForm>
        <Suspense
          fallback={
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          }
        >
          <Box sx={{ gap: 3, display: "flex", flexDirection: "column" }}>
            <Box
              sx={{
                display: "flex",
                gap: { xs: 3, sm: 2 },
                flexDirection: { xs: "column", sm: "row" },
              }}
            >
              <form.AppField name={"firstName"} children={(field) => <field.Text label={"First name"} />} />
              <form.AppField name={"lastName"} children={(field) => <field.Text label={"Last name"} />} />
            </Box>
            <form.AppField name={"email"} children={(field) => <field.Text label={"Email"} type={"email"} />} />
            <PasswordFieldsGroup
              form={form}
              fields={{
                password: "password",
                passwordConfirm: "passwordConfirm",
              }}
            />
            <RecaptchaBadge />
            <form.Submit variant={"contained"} disabled={!isReady} />
          </Box>
        </Suspense>
      </form.AppForm>
    </Form>
  );
};

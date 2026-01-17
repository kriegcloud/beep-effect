import { SignUp } from "@beep/iam-client";
import { RecaptchaBadge, useCaptchaAtom } from "@beep/iam-ui/_common";
import { Form, formOptionsWithDefaults, useAppForm } from "@beep/ui/form";
import { PasswordFieldsGroup } from "@beep/ui/form/groups";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import { Suspense } from "react";

export const SignUpEmailForm = () => {
  const { isReady } = useCaptchaAtom();
  const signUp = SignUp.useSignUp();
  const form = useAppForm(
    formOptionsWithDefaults({
      // Use PayloadFrom directly for form binding (has firstName/lastName fields)
      // The handler internally encodes via Payload transform (computes `name` from parts)
      schema: SignUp.Email.PayloadFrom,
      onSubmit: signUp.email,
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

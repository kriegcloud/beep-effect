import { SignUp } from "@beep/iam-client";
import { RecaptchaBadge, useCaptcha } from "@beep/iam-ui/_common";
import { Form } from "@beep/ui/form";
import { PasswordFieldsGroup } from "@beep/ui/form/groups";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import { Suspense } from "react";

export const SignUpEmailForm = () => {
  const { isReady } = useCaptcha();
  const { emailForm } = SignUp.Form.use();

  return (
    <Form onSubmit={emailForm.handleSubmit}>
      <emailForm.AppForm>
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
              <emailForm.AppField name={"firstName"} children={(field) => <field.Text label={"First name"} />} />
              <emailForm.AppField name={"lastName"} children={(field) => <field.Text label={"Last name"} />} />
            </Box>
            <emailForm.AppField name={"email"} children={(field) => <field.Text label={"Email"} type={"email"} />} />
            <PasswordFieldsGroup
              form={emailForm}
              fields={{
                password: "password",
                passwordConfirm: "passwordConfirm",
              }}
            />
            <RecaptchaBadge />
            <emailForm.Submit variant={"contained"} disabled={!isReady} />
          </Box>
        </Suspense>
      </emailForm.AppForm>
    </Form>
  );
};

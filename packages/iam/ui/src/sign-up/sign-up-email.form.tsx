"use client";
import { useSignUpEmailForm } from "@beep/iam-client/atom/sign-up";
import { RecaptchaBadge, useCaptchaAtom } from "@beep/iam-ui/_common";
import { paths } from "@beep/shared-domain";
import { Form } from "@beep/ui/form";
import { PasswordFieldsGroup } from "@beep/ui/form/groups";
import Box from "@mui/material/Box";
export const SignUpEmailForm = () => {
  const { executeCaptcha } = useCaptchaAtom();

  const { form } = useSignUpEmailForm({
    executeRecaptcha: async () => executeCaptcha(paths.auth.signUp),
  });

  return (
    <Form onSubmit={form.handleSubmit}>
      <form.AppForm>
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
          <form.Submit variant={"contained"} />
        </Box>
      </form.AppForm>
    </Form>
  );
};

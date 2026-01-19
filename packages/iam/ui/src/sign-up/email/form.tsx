import { SignUp } from "@beep/iam-client";
import { RecaptchaBadge, useCaptcha } from "@beep/iam-ui/_common";
import { Form } from "@beep/ui/form";
import { PasswordFieldsGroup } from "@beep/ui/form/groups";
import { useIsHydrated } from "@beep/ui/hooks";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import { Suspense } from "react";

/**
 * Loading fallback component for consistent styling.
 */
const FormLoadingFallback = () => (
  <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
    <CircularProgress />
  </Box>
);

/**
 * Inner form component that uses atom-based hooks.
 * Only rendered after hydration to avoid SSR/client hook mismatch.
 */
const SignUpEmailFormContent = () => {
  const { isReady } = useCaptcha();
  const { emailForm } = SignUp.Form.use();

  return (
    <Form onSubmit={emailForm.handleSubmit}>
      <emailForm.AppForm>
        <Suspense fallback={<FormLoadingFallback />}>
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

/**
 * Sign-up email form with hydration protection.
 * Renders loading state during SSR/hydration to prevent hook mismatch errors.
 */
export const SignUpEmailForm = () => {
  const isHydrated = useIsHydrated();

  if (!isHydrated) {
    return <FormLoadingFallback />;
  }

  return <SignUpEmailFormContent />;
};

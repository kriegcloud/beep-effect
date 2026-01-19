"use client";
import { SignIn } from "@beep/iam-client/sign-in";
import { useCaptcha } from "@beep/iam-ui/_common";
import { paths } from "@beep/shared-domain";
import { Iconify } from "@beep/ui/atoms";
import * as UIForm from "@beep/ui/form";
import { useBoolean, useIsHydrated } from "@beep/ui/hooks";
import { RouterLink } from "@beep/ui/routing/index";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Link from "@mui/material/Link";

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
const SignInEmailFormContent = () => {
  const showPassword = useBoolean();
  const { isReady } = useCaptcha();
  const { emailForm } = SignIn.Form.use();

  return (
    <UIForm.Form
      sx={{
        gap: 3,
        display: "flex",
        flexDirection: "column",
      }}
      onSubmit={emailForm.handleSubmit}
    >
      <emailForm.AppField
        name={"email"}
        children={(field) => (
          <field.Text
            label={"Email"}
            type={"email"}
            slotProps={{
              inputLabel: { shrink: true },
            }}
          />
        )}
      />
      <Box
        sx={{
          gap: 1.5,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <emailForm.AppField
          name={"password"}
          children={(field) => (
            <field.Text
              label={"Password"}
              type={showPassword.value ? "text" : "password"}
              slotProps={{
                inputLabel: { shrink: true },
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={showPassword.onToggle} edge="end">
                        <Iconify icon={showPassword.value ? "solar:eye-bold" : "solar:eye-closed-bold"} />
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
          )}
        />
        <Link
          component={RouterLink}
          href={paths.auth.resetPassword}
          variant="body2"
          color="inherit"
          sx={{ alignSelf: "flex-end" }}
        >
          Forgot password?
        </Link>
      </Box>
      <emailForm.AppForm>
        <emailForm.Submit variant={"contained"} disabled={!isReady} />
      </emailForm.AppForm>
    </UIForm.Form>
  );
};

/**
 * Sign-in email form with hydration protection.
 * Renders loading state during SSR/hydration to prevent hook mismatch errors.
 */
export const Form = () => {
  const isHydrated = useIsHydrated();

  if (!isHydrated) {
    return <FormLoadingFallback />;
  }

  return <SignInEmailFormContent />;
};

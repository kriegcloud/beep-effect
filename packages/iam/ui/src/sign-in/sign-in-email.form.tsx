"use client";
import { useSignInEmailForm } from "@beep/iam-client/atom/sign-in";
import { useCaptchaAtom } from "@beep/iam-ui/_common";
import { paths } from "@beep/shared-domain";
import { Iconify } from "@beep/ui/atoms";
import { Form } from "@beep/ui/form";
import { useBoolean } from "@beep/ui/hooks";
import { RouterLink } from "@beep/ui/routing";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Link from "@mui/material/Link";

export const SignInEmailForm = () => {
  const showPassword = useBoolean();
  const { executeCaptcha } = useCaptchaAtom();
  const { form } = useSignInEmailForm({ executeCaptcha: async () => await executeCaptcha(paths.auth.signIn) });

  return (
    <Form
      sx={{
        gap: 3,
        display: "flex",
        flexDirection: "column",
      }}
      onSubmit={form.handleSubmit}
    >
      <form.AppField
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
        <Link
          component={RouterLink}
          href={paths.auth.resetPassword}
          variant="body2"
          color="inherit"
          sx={{ alignSelf: "flex-end" }}
        >
          Forgot password?
        </Link>
        <form.AppField
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
      </Box>
      <form.AppForm>
        <form.Submit variant={"contained"} />
      </form.AppForm>
    </Form>
  );
};

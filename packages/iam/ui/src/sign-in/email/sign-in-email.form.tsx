"use client";
import { Email } from "@beep/iam-client/v1/sign-in";
import { useCaptchaAtom } from "@beep/iam-ui/_common";
import { paths } from "@beep/shared-domain";
import { Iconify } from "@beep/ui/atoms/index";
import { Form, formOptionsWithDefaults, useAppForm } from "@beep/ui/form/index";
import { useBoolean } from "@beep/ui/hooks/index";
import { RouterLink } from "@beep/ui/routing/index";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Link from "@mui/material/Link";
import * as Redacted from "effect/Redacted";
import { useSignIn } from "./sign-in-email.atom.ts";

export const SignInEmailForm = () => {
  const showPassword = useBoolean();
  const { executeCaptcha, isReady } = useCaptchaAtom();

  const signIn = useSignIn();

  const form = useAppForm(
    formOptionsWithDefaults({
      schema: Email.Payload,
      onSubmit: async (value) => {
        const captchaResponse = await executeCaptcha(paths.auth.signIn);
        await signIn.email({
          payload: value,
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
        <form.Submit variant={"contained"} disabled={!isReady} />
      </form.AppForm>
    </Form>
  );
};

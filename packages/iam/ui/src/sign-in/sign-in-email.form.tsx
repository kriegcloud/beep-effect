"use client";
import { SignInEmailPayload } from "@beep/iam-sdk/clients";
import { SignInImplementations } from "@beep/iam-sdk/clients/sign-in/sign-in.implementations";
import { clientRuntimeLayer } from "@beep/runtime-client";
import { paths } from "@beep/shared-domain";
import { Iconify } from "@beep/ui/atoms";
import { withToast } from "@beep/ui/common";
import { Form, formOptionsWithSubmitEffect, useAppForm } from "@beep/ui/form";
import { useBoolean } from "@beep/ui/hooks";
import { RouterLink } from "@beep/ui/routing";
import { Atom, useAtom } from "@effect-atom/atom-react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Link from "@mui/material/Link";
import * as F from "effect/Function";
import * as O from "effect/Option";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";

const runtime = Atom.runtime(clientRuntimeLayer);

const signInEmailAtom = runtime.fn(
  F.flow(
    SignInImplementations.SignInEmailContract,
    withToast({
      onWaiting: "Signing in",
      onSuccess: "Signed in successfully",
      onFailure: O.match({
        onNone: () => "Failed with unknown error.",
        onSome: (e) => e.message,
      }),
    })
  )
);

export const SignInEmailForm = () => {
  const showPassword = useBoolean();
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [, signIn] = useAtom(signInEmailAtom);
  const form = useAppForm(
    formOptionsWithSubmitEffect({
      schema: SignInEmailPayload,
      defaultValues: {
        email: "",
        password: "",
        captchaResponse: "",
        rememberMe: false,
      },
      onSubmit: async (value) => signIn(value),
    })
  );

  return (
    <Form
      sx={{
        gap: 3,
        display: "flex",
        flexDirection: "column",
      }}
      onSubmit={async (e) => {
        e.preventDefault();
        if (!executeRecaptcha) {
          console.error("execute Recaptcha is not available");
          return;
        }

        const token = await executeRecaptcha("signin_form");

        form.setFieldValue("captchaResponse", token);
        return form.handleSubmit();
      }}
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

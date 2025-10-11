"use client";
import { SignInEmailContract } from "@beep/iam-sdk/clients";
import { paths } from "@beep/shared-domain";
import { Iconify } from "@beep/ui/atoms";
import { Form, formOptionsWithSubmit, useAppForm } from "@beep/ui/form";
import { useBoolean } from "@beep/ui/hooks";
import { RouterLink } from "@beep/ui/routing";

import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Link from "@mui/material/Link";
import type * as Effect from "effect/Effect";
import type { ParseError } from "effect/ParseResult";
import type React from "react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";

type Props = {
  onSubmit: (values: Effect.Effect<SignInEmailContract.Type, ParseError, never>) => Promise<void>;
};

export const SignInEmailForm: React.FC<Props> = ({ onSubmit }) => {
  const showPassword = useBoolean();
  const { executeRecaptcha } = useGoogleReCaptcha();
  const form = useAppForm(
    formOptionsWithSubmit({
      schema: SignInEmailContract,
      defaultValues: {
        email: "",
        password: "",
        captchaResponse: "",
        rememberMe: false,
      },
      onSubmit,
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

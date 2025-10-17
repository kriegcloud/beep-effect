"use client";
import { SignUpValue } from "@beep/iam-sdk/clients";
import { useSignUpEmail } from "@beep/iam-ui/sign-up/sign-up.atoms";
import { makeRunClientPromise, useRuntime } from "@beep/runtime-client";
import { paths } from "@beep/shared-domain";
import * as SharedEntities from "@beep/shared-domain/entities";
import { Form, formOptionsWithSubmitEffect, useAppForm } from "@beep/ui/form";
import { PasswordFieldsGroup } from "@beep/ui/form/groups";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import type React from "react";
import { GoogleReCaptcha } from "react-google-recaptcha-v3";
import { toast } from "sonner";

type Props = {
  setVerificationNotice: React.Dispatch<
    React.SetStateAction<{
      redirectPath: string;
      firstName: string;
    } | null>
  >;
  executeRecaptcha: (action?: string) => Promise<string>;
};

export const SignUpEmailForm: React.FC<Props> = ({ setVerificationNotice, executeRecaptcha }) => {
  const runtime = useRuntime();
  const runClientPromise = makeRunClientPromise(runtime);
  const { signUpEmail } = useSignUpEmail();

  const form = useAppForm(
    formOptionsWithSubmitEffect({
      schema: SignUpValue,
      defaultValues: {
        email: "",
        password: "",
        passwordConfirm: "",
        gender: SharedEntities.User.UserGenderEnum.male,
        firstName: "",
        captchaResponse: "",
        lastName: "",
        rememberMe: false,
      },
      onSubmit: async (value) => {
        const program = Effect.gen(function* () {
          if (!executeRecaptcha) {
            return yield* Effect.fail(new Error("executeRecaptcha is not defined"));
          }
          const token = yield* Effect.tryPromise({
            try: () => executeRecaptcha("contact_form"),
            catch: (error) => {
              console.error("Failed to execute ReCAPTCHA", error);
              toast.error("Verification timed out. Please try again.");
              return Effect.fail(error);
            },
          });

          if (!token) {
            return yield* Effect.fail(new Error("No Captcha Token."));
          }

          return Redacted.make(token);
        });

        const token = await runClientPromise(program);

        return signUpEmail({
          value: {
            name: `${value.firstName} ${value.lastName}`,
            callbackURL: paths.dashboard.root,
            email: value.email,
            password: value.password,
            passwordConfirm: value.passwordConfirm,
            gender: value.gender,
            firstName: value.firstName,
            lastName: value.lastName,
            rememberMe: value.rememberMe,
            captchaResponse: token,
          },
          onSuccess: (path) =>
            setVerificationNotice({
              redirectPath: path,
              firstName: value.firstName,
            }),
        });
      },
    })
  );
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
            <form.AppField name={"lastName"} children={(field) => <field.Text label={"lastName"} />} />
          </Box>
          <form.AppField name={"email"} children={(field) => <field.Text label={"Email"} type={"email"} />} />

          <PasswordFieldsGroup
            form={form}
            fields={{
              password: "password",
              passwordConfirm: "passwordConfirm",
            }}
          />
          <Stack direction={"row"} spacing={2}>
            <form.AppField
              name={"gender"}
              children={(field) => (
                <field.RadioGroup options={SharedEntities.User.UserGender.DropDownOptions} label={"Gender"} row />
              )}
            />
          </Stack>
          <GoogleReCaptcha
            onVerify={(response) => {
              form.setFieldValue("captchaResponse", response);
            }}
          />
          <form.Submit variant={"contained"} />
        </Box>
      </form.AppForm>
    </Form>
  );
};

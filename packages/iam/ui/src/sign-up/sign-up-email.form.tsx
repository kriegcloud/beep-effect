"use client";
import { SignUpImplementations, SignUpValue } from "@beep/iam-sdk/clients";
import { clientRuntimeLayer, makeRunClientPromise, useRuntime } from "@beep/runtime-client";
import { paths } from "@beep/shared-domain";
import * as SharedEntities from "@beep/shared-domain/entities";
import { withToast } from "@beep/ui/common/with-toast";
import { Form, formOptionsWithSubmitEffect, useAppForm } from "@beep/ui/form";
import { PasswordFieldsGroup } from "@beep/ui/form/groups";
import { Atom, useAtom } from "@effect-atom/atom-react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as Redacted from "effect/Redacted";
import type React from "react";
import { toast } from "sonner";

const runtime = Atom.runtime(clientRuntimeLayer);
const signUpEmailAtom = runtime.fn(
  F.flow(
    SignUpImplementations.SignUpEmailContract,
    withToast({
      onWaiting: "Signing up",
      onSuccess: "Signed up successfully",
      onFailure: O.match({
        onNone: () => "Failed with unknown error.",
        onSome: (e) => e.message,
      }),
    })
  )
);
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

  const [, signUpEmail] = useAtom(signUpEmailAtom);
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
          <form.Submit variant={"contained"} />
        </Box>
      </form.AppForm>
    </Form>
  );
};

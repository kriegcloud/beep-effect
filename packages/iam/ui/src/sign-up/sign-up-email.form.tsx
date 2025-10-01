"use client";
import { SignUpValue } from "@beep/iam-sdk/clients";
import * as SharedEntities from "@beep/shared-domain/entities";
import { Form, formOptionsWithSubmit, useAppForm } from "@beep/ui/form";
import { PasswordFieldsGroup } from "@beep/ui/form/groups";
import Box from "@mui/material/Box";
import type * as Effect from "effect/Effect";
import type { ParseError } from "effect/ParseResult";
import type React from "react";

type Props = {
  onSubmit: (values: Effect.Effect<SignUpValue.Type, ParseError, never>) => Promise<void>;
};

export const SignUpEmailForm: React.FC<Props> = ({ onSubmit }) => {
  const form = useAppForm(
    formOptionsWithSubmit({
      schema: SignUpValue,
      defaultValues: {
        email: "",
        password: "",
        gender: SharedEntities.User.UserGenderEnum.male,
        passwordConfirm: "",
        firstName: "",
        lastName: "",
        rememberMe: false,
      },
      onSubmit,
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
            <form.AppField
              name={"gender"}
              children={(field) => (
                <field.RadioGroup
                  options={[
                    { label: "Male", value: "male" },
                    { label: "Female", value: "female" },
                  ]}
                  label={"Gender"}
                />
              )}
            />
          </Box>
          <form.AppField name={"email"} children={(field) => <field.Text label={"Email"} type={"email"} />} />

          <PasswordFieldsGroup
            form={form}
            fields={{
              password: "password",
              passwordConfirm: "passwordConfirm",
            }}
          />
          <form.Submit variant={"contained"} />
        </Box>
      </form.AppForm>
    </Form>
  );
};

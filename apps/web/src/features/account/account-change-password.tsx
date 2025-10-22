import { BS } from "@beep/schema";
import { Iconify } from "@beep/ui/atoms";
import { Form, formOptionsWithSubmitEffect, useAppForm } from "@beep/ui/form";
import { PasswordFieldsGroup } from "@beep/ui/form/groups";
import { useBoolean } from "@beep/ui/hooks";
import { toast } from "@beep/ui/molecules";
import Card from "@mui/material/Card";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import * as Equal from "effect/Equal";
import * as Redacted from "effect/Redacted";
import * as S from "effect/Schema";

// ----------------------------------------------------------------------

const ResetPasswordPayloadFields = {
  oldPassword: BS.Password,
  newPassword: BS.Password,
  passwordConfirm: BS.Password,
};
export const ChangePasswordPayload = S.Struct(ResetPasswordPayloadFields).pipe(
  S.filter(
    ({ newPassword, passwordConfirm }) =>
      Equal.equals(Redacted.value(newPassword), Redacted.value(passwordConfirm)) || "Passwords do not match"
  ),
  S.annotations({
    identifier: "ChangePasswordPayload",
    description: "Payload containing the data required to reset a password.",
    schemaId: Symbol.for("@beep/iam-sdk/clients/ChangePasswordPayload"),
  })
);

export declare namespace ChangePasswordPayload {
  export type Type = S.Schema.Type<typeof ChangePasswordPayload>;
  export type Encoded = S.Schema.Encoded<typeof ChangePasswordPayload>;
}

// ----------------------------------------------------------------------

export function AccountChangePassword() {
  const showPassword = useBoolean();

  const form = useAppForm(
    formOptionsWithSubmitEffect({
      schema: ChangePasswordPayload,
      defaultValues: {
        oldPassword: "",
        newPassword: "",
        passwordConfirm: "",
      },
      onSubmit: async (data) => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        console.log(data);
        toast.success("Update success!");
      },
    })
  );

  return (
    <Form onSubmit={form.handleSubmit}>
      <Card
        sx={{
          p: 3,
          gap: 3,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <form.AppField
          name={"oldPassword"}
          children={(field) => (
            <field.Text
              type={showPassword.value ? "text" : "password"}
              label={"Old password"}
              slotProps={{
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

        <PasswordFieldsGroup
          form={form}
          fields={{
            password: "newPassword",
            passwordConfirm: "passwordConfirm",
          }}
        />
        <form.Submit variant={"contained"} sx={{ ml: "auto" }}>
          Save changes
        </form.Submit>
      </Card>
    </Form>
  );
}

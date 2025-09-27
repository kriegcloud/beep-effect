import { VerifyPhoneContract } from "@beep/iam-sdk/clients/iam-client";
import { Form, formOptionsWithSubmit, useAppForm } from "@beep/ui/form";
import type * as Effect from "effect/Effect";
import type { ParseError } from "effect/ParseResult";
import type React from "react";

type Props = {
  onSubmit: (values: Effect.Effect<VerifyPhoneContract.Type, ParseError, never>) => Promise<void>;
};
export const VerifyPhoneForm: React.FC<Props> = ({ onSubmit }) => {
  const form = useAppForm(
    formOptionsWithSubmit({
      schema: VerifyPhoneContract,
      defaultValues: {
        phoneNumber: "",
        code: "",
        updatePhoneNumber: true,
      },
      onSubmit,
    })
  );
  return (
    <Form onSubmit={form.handleSubmit}>
      <form.AppField name={"phoneNumber"} children={(field) => <field.Phone label={"Phone Number"} type={"phone"} />} />
      <form.AppField name={"code"} children={(field) => <field.OTP />} />
      <form.AppField
        name={"updatePhoneNumber"}
        children={(field) => <field.Checkbox label={"Update Phone Number"} />}
      />
      <form.AppForm>
        <form.Submit variant={"contained"}>Verify Phone Number</form.Submit>
      </form.AppForm>
    </Form>
  );
};

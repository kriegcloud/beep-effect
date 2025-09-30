import { SendEmailVerificationContract } from "@beep/iam-sdk/clients";
import { Form, formOptionsWithSubmit, useAppForm } from "@beep/ui/form";
import type * as Effect from "effect/Effect";
import type { ParseError } from "effect/ParseResult";
import type React from "react";

type Props = {
  onSubmit: (values: Effect.Effect<SendEmailVerificationContract.Type, ParseError, never>) => Promise<void>;
};
export const VerifyEmailForm: React.FC<Props> = ({ onSubmit }) => {
  const form = useAppForm(
    formOptionsWithSubmit({
      schema: SendEmailVerificationContract,
      defaultValues: {
        email: "",
      },
      onSubmit,
    })
  );
  return (
    <Form sx={{ display: "flex", flexDirection: "column", gap: 2 }} onSubmit={form.handleSubmit}>
      <form.AppField name={"email"} children={(field) => <field.Text label={"Email"} type={"email"} />} />
      <form.AppForm>
        <form.Submit variant={"contained"}>Send Verification Email</form.Submit>
      </form.AppForm>
    </Form>
  );
};

import { RequestResetPasswordContract } from "@beep/iam-sdk/clients";
import { Form } from "@beep/ui/form";
import { formOptionsWithSubmit } from "@beep/ui/form/form-options-with-submit";
import { useAppForm } from "@beep/ui/form/useAppForm";
import type * as Effect from "effect/Effect";
import type { ParseError } from "effect/ParseResult";
import type React from "react";

type Props = {
  onSubmit: (values: Effect.Effect<RequestResetPasswordContract.Type, ParseError, never>) => Promise<void>;
};
export const RequestResetPasswordForm: React.FC<Props> = ({ onSubmit }) => {
  const form = useAppForm(
    formOptionsWithSubmit({
      schema: RequestResetPasswordContract,
      defaultValues: {
        email: "",
      },
      onSubmit,
    })
  );

  return (
    <Form onSubmit={form.handleSubmit} sx={{ gap: 3, display: "flex", flexDirection: "column" }}>
      <form.AppField name={"email"} children={(field) => <field.Text label={"Email"} type={"email"} />} />
      <form.AppForm>
        <form.Submit variant={"contained"}>Send Request</form.Submit>
      </form.AppForm>
    </Form>
  );
};

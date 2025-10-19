import { RecoverImplementations, RequestResetPasswordPayload } from "@beep/iam-sdk/clients";
import { clientRuntimeLayer } from "@beep/runtime-client";
import { withToast } from "@beep/ui/common";
import { Form, formOptionsWithSubmitEffect } from "@beep/ui/form";
import { useAppForm } from "@beep/ui/form/useAppForm";
import { Atom, useAtom } from "@effect-atom/atom-react";
import * as F from "effect/Function";
import * as O from "effect/Option";

const runtime = Atom.runtime(clientRuntimeLayer);

const requestResetPasswordAtom = runtime.fn(
  F.flow(
    RecoverImplementations.RequestResetPassword,
    withToast({
      onWaiting: "Requesting reset password",
      onSuccess: "Reset password requested successfully",
      onFailure: O.match({
        onNone: () => "Reset password request failed",
        onSome: (error) => error.message,
      }),
    })
  )
);
export const RequestResetPasswordForm = () => {
  const [, requestPasswordRest] = useAtom(requestResetPasswordAtom);
  const form = useAppForm(
    formOptionsWithSubmitEffect({
      schema: RequestResetPasswordPayload,
      defaultValues: {
        email: "",
      },
      onSubmit: async (value) => requestPasswordRest(value),
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

import { SendVerifyPhonePayload, VerifyImplementations } from "@beep/iam-sdk/clients";
import { clientRuntimeLayer } from "@beep/runtime-client";
import { withToast } from "@beep/ui/common";
import { Form, formOptionsWithSubmitEffect, useAppForm } from "@beep/ui/form";
import { Atom, useAtom } from "@effect-atom/atom-react";
import * as F from "effect/Function";
import * as O from "effect/Option";

const runtime = Atom.runtime(clientRuntimeLayer);
const verifyPhoneAtom = runtime.fn(
  F.flow(
    VerifyImplementations.SendVerifyPhone,
    withToast({
      onWaiting: "Verifying phone",
      onSuccess: "Phone verified.",
      onFailure: O.match({
        onNone: () => "Failed with unknown error.",
        onSome: (e) => e.message,
      }),
    })
  )
);
export const VerifyPhoneForm = () => {
  const [, verifyPhone] = useAtom(verifyPhoneAtom);
  const form = useAppForm(
    formOptionsWithSubmitEffect({
      schema: SendVerifyPhonePayload,
      defaultValues: {
        phoneNumber: "",
        code: "",
        updatePhoneNumber: true,
      },
      onSubmit: async (value) => verifyPhone(value),
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

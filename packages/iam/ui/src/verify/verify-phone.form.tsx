import { VerifyPhonePayload } from "@beep/iam-sdk/clients";
import { useVerifyPhone } from "@beep/iam-sdk/clients/verify";
import { Form, formOptionsWithSubmitEffect, useAppForm } from "@beep/ui/form";

export const VerifyPhoneForm = () => {
  const { verifyPhone } = useVerifyPhone();
  const form = useAppForm(
    formOptionsWithSubmitEffect({
      schema: VerifyPhonePayload,
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

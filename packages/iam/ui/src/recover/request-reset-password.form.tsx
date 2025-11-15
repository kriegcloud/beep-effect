import { useRequestResetPasswordForm } from "@beep/iam-sdk/clients";
import { Form } from "@beep/ui/form";

export const RequestResetPasswordForm = () => {
  const { form } = useRequestResetPasswordForm();

  return (
    <Form onSubmit={form.handleSubmit} sx={{ gap: 3, display: "flex", flexDirection: "column" }}>
      <form.AppField name={"email"} children={(field) => <field.Text label={"Email"} type={"email"} />} />
      <form.AppForm>
        <form.Submit variant={"contained"}>Send Request</form.Submit>
      </form.AppForm>
    </Form>
  );
};

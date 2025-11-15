import { formOptionsWithSubmitEffect } from "@beep/ui/form";
import { useAppForm } from "@beep/ui/form/useAppForm";
import { useRecover } from "./recover.atoms";
import { RequestResetPasswordContract, ResetPasswordContract } from "./recover.contracts";

export const useResetPasswordForm = () => {
  const { resetPassword } = useRecover();

  const form = useAppForm(
    formOptionsWithSubmitEffect({
      schema: ResetPasswordContract.payloadSchema,
      defaultValues: {
        newPassword: "",
        passwordConfirm: "",
      },
      onSubmit: async (value) => resetPassword(value),
    })
  );

  return {
    form,
  };
};

export const useRequestResetPasswordForm = () => {
  const { requestResetPassword } = useRecover();

  const form = useAppForm(
    formOptionsWithSubmitEffect({
      schema: RequestResetPasswordContract.payloadSchema,
      defaultValues: {
        email: "",
      },
      onSubmit: async (value) => requestResetPassword(value),
    })
  );

  return {
    form,
  };
};

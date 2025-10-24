import { formOptionsWithSubmitEffect, useAppForm } from "@beep/ui/form";
import { usePasskeyAdd, usePasskeyUpdate } from "./passkey.atoms";
import { PasskeyAddPayload, PasskeyUpdatePayload } from "./passkey.contracts";

export const usePasskeyAddForm = () => {
  const { addPasskey } = usePasskeyAdd();

  const form = useAppForm(
    formOptionsWithSubmitEffect({
      schema: PasskeyAddPayload,
      defaultValues: {
        name: "",
      },
      onSubmit: async (value) => {
        await addPasskey(value);
        form.reset();
      },
    })
  );

  return {
    form,
  };
};

export const usePasskeyUpdateForm = (defaultValues: PasskeyUpdatePayload.Encoded) => {
  const { updatePasskey } = usePasskeyUpdate();
  const form = useAppForm(
    formOptionsWithSubmitEffect({
      schema: PasskeyUpdatePayload,
      defaultValues,
      onSubmit: async (value) => updatePasskey(value),
    })
  );

  return {
    form,
  };
};

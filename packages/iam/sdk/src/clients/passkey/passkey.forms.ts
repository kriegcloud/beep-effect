import { usePasskeyCRUD } from "@beep/iam-sdk/clients/passkey/passkey.atoms";
import {
  PasskeyAddContract,
  type PasskeyDTO,
  PasskeyUpdateContract,
} from "@beep/iam-sdk/clients/passkey/passkey.contracts";
import { formOptionsWithDefaults, useAppForm } from "@beep/ui/form";

type PasskeyFormPropsBase = {
  readonly onDone: (formReset: () => void) => void;
};

type UsePasskeyAddFormProps = PasskeyFormPropsBase;
export const useAddPasskeyForm = ({ onDone }: UsePasskeyAddFormProps) => {
  const { addPasskey } = usePasskeyCRUD();
  const form = useAppForm(
    formOptionsWithDefaults({
      schema: PasskeyAddContract.payloadSchema.toFormSchema,
      onSubmit: async (value) => {
        await addPasskey(value);
        onDone(form.reset);
      },
    })
  );

  return {
    form,
  };
};

type UsePasskeyUpdateFormProps = PasskeyFormPropsBase & {
  readonly defaultValues: PasskeyDTO;
};

export const useUpdatePasskeyForm = ({ defaultValues, onDone }: UsePasskeyUpdateFormProps) => {
  const { updatePasskey } = usePasskeyCRUD();
  const form = useAppForm(
    formOptionsWithDefaults({
      schema: PasskeyUpdateContract.payloadSchema.toFormSchema({
        name: defaultValues.name,
      }),
      onSubmit: async (value) => {
        await updatePasskey({
          passkey: {
            ...value,
            id: defaultValues.id,
          },
        });
        onDone(form.reset);
      },
    })
  );

  return {
    form,
  };
};

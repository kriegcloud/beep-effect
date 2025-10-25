import { formOptionsWithSubmitEffect, useAppForm } from "@beep/ui/form";
import * as S from "effect/Schema";
import { usePasskeyCRUD } from "./passkey.atoms";
import { PasskeyAddPayload, PasskeyUpdatePayload, type PasskeyView } from "./passkey.contracts";

export const useAddPasskeyForm = () => {
  const { addPasskey } = usePasskeyCRUD();
  const form = useAppForm(
    formOptionsWithSubmitEffect({
      schema: PasskeyAddPayload,
      defaultValues: {
        name: "",
      },
      onSubmit: async (value) => addPasskey(value),
    })
  );

  return {
    form,
  };
};

type UsePasskeyUpdateFormProps = {
  readonly defaultValues: PasskeyView.Type;
  readonly onDone: () => void;
};

export const useUpdatePasskeyForm = ({ defaultValues, onDone }: UsePasskeyUpdateFormProps) => {
  const { updatePasskey } = usePasskeyCRUD();
  const form = useAppForm(
    formOptionsWithSubmitEffect({
      schema: PasskeyUpdatePayload.pipe(S.pick("name")),
      defaultValues: {
        name: defaultValues.name,
      },
      onSubmit: async (value) => {
        updatePasskey({
          name: value.name,
          id: defaultValues.id,
        });
        onDone();
      },
    })
  );

  return {
    form,
  };
};

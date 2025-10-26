import { usePasskeyCRUD } from "@beep/iam-sdk/clients/passkey/passkey.atoms";
import {
  PasskeyAddPayload,
  PasskeyUpdatePayload,
  type PasskeyView,
} from "@beep/iam-sdk/clients/passkey/passkey.contracts";
import { IamEntityIds } from "@beep/shared-domain";
import { formOptionsWithSubmitEffect, useAppForm } from "@beep/ui/form";
import * as S from "effect/Schema";

type PasskeyFormPropsBase = {
  readonly onDone: (formReset: () => void) => void;
};

type UsePasskeyAddFormProps = PasskeyFormPropsBase;
export const useAddPasskeyForm = ({ onDone }: UsePasskeyAddFormProps) => {
  const { addPasskey } = usePasskeyCRUD();
  const form = useAppForm(
    formOptionsWithSubmitEffect({
      schema: PasskeyAddPayload,
      defaultValues: {
        name: "",
      },
      onSubmit: async (value) => {
        await addPasskey({
          ...value,
          id: IamEntityIds.PasskeyId.create(),
        });
        onDone(form.reset);
      },
    })
  );

  return {
    form,
  };
};

type UsePasskeyUpdateFormProps = PasskeyFormPropsBase & {
  readonly defaultValues: PasskeyView.Type;
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
        await updatePasskey({
          name: value.name,
          id: defaultValues.id,
        });
        onDone(form.reset);
      },
    })
  );

  return {
    form,
  };
};

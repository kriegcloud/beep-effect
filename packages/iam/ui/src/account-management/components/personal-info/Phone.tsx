import { useAccountManagement } from "@beep/iam-ui/account-management/account-management.provider";
import { BS } from "@beep/schema";
import { Iconify } from "@beep/ui/atoms";
import { Form, formOptionsWithSubmitEffect, useAppForm } from "@beep/ui/form";
import { useBoolean } from "@beep/ui/hooks";
import Stack from "@mui/material/Stack";
import * as Redacted from "effect/Redacted";
import type * as S from "effect/Schema";
import { AccountFormDialog, InfoCard, InfoCardAttribute } from "../common";

export class PhoneFormValues extends BS.Class<PhoneFormValues>("PhoneFormValues")({
  phone: BS.Phone,
}) {}

export declare namespace PhoneFormValues {
  export type Type = S.Schema.Type<typeof PhoneFormValues>;
  export type Encoded = S.Schema.Encoded<typeof PhoneFormValues>;
}

export const Phone = () => {
  const { personalInfo } = useAccountManagement();
  const { value: open, setValue: setOpen } = useBoolean();

  const form = useAppForm(
    formOptionsWithSubmitEffect({
      schema: PhoneFormValues,
      defaultValues: {
        phone: Redacted.value(personalInfo.phoneNumber),
      },
      onSubmit: async (value) => {
        setOpen(false);
        console.log(value);
      },
    })
  );

  const handleDiscard = () => {
    form.reset();
    setOpen(false);
  };

  return (
    <Form>
      <InfoCard setOpen={setOpen} sx={{ mb: 2 }}>
        <Stack direction="column" spacing={{ xs: 2, sm: 1 }}>
          <InfoCardAttribute label="Phone Number" value={Redacted.value(personalInfo.phoneNumber)} />
        </Stack>
        <Iconify
          icon="material-symbols-light:edit-outline"
          sx={{ fontSize: 20, color: "neutral.dark", visibility: "hidden" }}
        />
      </InfoCard>
      <AccountFormDialog
        title="Phone Number"
        subtitle="Update your phone number."
        open={open}
        handleDialogClose={() => setOpen(false)}
        handleDiscard={handleDiscard}
        sx={{
          maxWidth: 463,
        }}
      >
        <Stack direction="column" spacing={1} p={0.125}>
          <form.AppField
            name="phone"
            children={(field) => <field.Phone placeholder="Phone Number" label="Phone Number" type={"tel"} fullWidth />}
          />
        </Stack>
      </AccountFormDialog>
    </Form>
  );
};

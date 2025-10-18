import { useAccountManagement } from "@beep/iam-ui/account-management/account-management.provider";
import { BS } from "@beep/schema";
import { Iconify } from "@beep/ui/atoms";
import { Form, formOptionsWithSubmitEffect, useAppForm } from "@beep/ui/form";
import { useBoolean } from "@beep/ui/hooks";
import Stack from "@mui/material/Stack";
import type * as S from "effect/Schema";
import { AccountFormDialog, InfoCard, InfoCardAttribute } from "../common";

export class NameFormValues extends BS.Class<NameFormValues>("NameFormValues")({
  username: BS.NameAttribute,
}) {}

export declare namespace NameFormValues {
  export type Type = S.Schema.Type<typeof NameFormValues>;
  export type Encoded = S.Schema.Encoded<typeof NameFormValues>;
}

export const Username = () => {
  const { personalInfo } = useAccountManagement();
  const { value: open, setValue: setOpen } = useBoolean();

  const form = useAppForm(
    formOptionsWithSubmitEffect({
      schema: NameFormValues,
      defaultValues: {
        username: personalInfo.username,
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
          <InfoCardAttribute label="Username" value={personalInfo.username} />
        </Stack>
        <Iconify
          icon="material-symbols-light:edit-outline"
          sx={{ fontSize: 20, color: "neutral.dark", visibility: "hidden" }}
        />
      </InfoCard>
      <AccountFormDialog
        title="User Name"
        subtitle="Update your username. This change will apply to your account and be visible to others in your interactions."
        open={open}
        handleDialogClose={() => setOpen(false)}
        handleDiscard={handleDiscard}
        sx={{
          maxWidth: 463,
        }}
      >
        <Stack direction="column" spacing={1} p={0.125}>
          <form.AppField
            name="username"
            children={(field) => <field.Text placeholder="Username" label="User Name" fullWidth />}
          />
        </Stack>
      </AccountFormDialog>
    </Form>
  );
};

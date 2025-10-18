import { useAccountManagement } from "@beep/iam-ui/account-management/account-management.provider";
import { BS } from "@beep/schema";
import { Iconify } from "@beep/ui/atoms";
import { Form, formOptionsWithSubmitEffect, useAppForm } from "@beep/ui/form";
import { useBoolean } from "@beep/ui/hooks";
import Stack from "@mui/material/Stack";
import type * as S from "effect/Schema";
import { AccountFormDialog, InfoCard, InfoCardAttribute } from "../common";

export class NameFormValues extends BS.Class<NameFormValues>("NameFormValues")({
  firstName: BS.FirstName,
  lastName: BS.LastName,
}) {}

export declare namespace NameFormValues {
  export type Type = S.Schema.Type<typeof NameFormValues>;
  export type Encoded = S.Schema.Encoded<typeof NameFormValues>;
}

export const Names = () => {
  const { personalInfo } = useAccountManagement();
  const { value: open, setValue: setOpen } = useBoolean();

  const form = useAppForm(
    formOptionsWithSubmitEffect({
      schema: NameFormValues,
      defaultValues: {
        firstName: personalInfo.firstName,
        lastName: personalInfo.lastName,
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
      <InfoCard setOpen={setOpen}>
        <Stack direction="column" spacing={{ xs: 2, sm: 1 }}>
          <InfoCardAttribute label="First Name" value={personalInfo.firstName} />
          <InfoCardAttribute label="Last Name" value={personalInfo.lastName} />
        </Stack>
        <Iconify
          icon="material-symbols-light:edit-outline"
          sx={{ fontSize: 20, color: "neutral.dark", visibility: "hidden" }}
        />
      </InfoCard>
      <AccountFormDialog
        title="Name"
        subtitle="Enter your updated first and last name below. Your name will be reflected across all your account settings."
        open={open}
        handleDialogClose={() => setOpen(false)}
        handleDiscard={handleDiscard}
        sx={{ maxWidth: 463 }}
      >
        <Stack direction="column" spacing={1} p={0.125}>
          <form.AppField
            name="firstName"
            children={(field) => <field.Text placeholder="First Name" label="First Name" fullWidth />}
          />
          <form.AppField
            name="lastName"
            children={(field) => <field.Text placeholder="Last Name" label="Last Name" fullWidth />}
          />
        </Stack>
      </AccountFormDialog>
    </Form>
  );
};

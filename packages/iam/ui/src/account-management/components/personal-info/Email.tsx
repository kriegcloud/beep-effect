import { useAccountManagement } from "@beep/iam-ui/account-management/account-management.provider";
import { BS } from "@beep/schema";
import { Iconify } from "@beep/ui/atoms";
import { Form, formOptionsWithSubmitEffect, useAppForm } from "@beep/ui/form";
import { useBoolean } from "@beep/ui/hooks";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import * as Redacted from "effect/Redacted";
import type * as S from "effect/Schema";
import { AccountFormDialog, InfoCard, InfoCardAttribute } from "../common";

export class EmailFormValues extends BS.Class<EmailFormValues>("EmailFormValues")({
  primaryEmail: BS.Email,
  secondaryEmail: BS.Email,
}) {}

export declare namespace EmailFormValues {
  export type Type = S.Schema.Type<typeof EmailFormValues>;
  export type Encoded = S.Schema.Encoded<typeof EmailFormValues>;
}

export const Email = () => {
  const { value: open, setValue: setOpen } = useBoolean();
  const { personalInfo } = useAccountManagement();

  const form = useAppForm(
    formOptionsWithSubmitEffect({
      schema: EmailFormValues,
      defaultValues: {
        primaryEmail: Redacted.value(personalInfo.email),
        secondaryEmail: Redacted.value(personalInfo.secondaryEmail),
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
          <InfoCardAttribute label="Primary Email" value={Redacted.value(personalInfo.email)} />
          <InfoCardAttribute label="Secondary Email" value={Redacted.value(personalInfo.secondaryEmail)} />
        </Stack>
        <Iconify
          icon="material-symbols-light:edit-outline"
          sx={{ fontSize: 20, color: "neutral.dark", visibility: "hidden" }}
        />
      </InfoCard>
      <AccountFormDialog
        title="Email Address"
        subtitle="Update your primary email address. You can also set an alternate email address for extra security and backup."
        open={open}
        handleDialogClose={() => setOpen(false)}
        handleDiscard={handleDiscard}
        sx={{
          maxWidth: 463,
        }}
      >
        <Stack direction="column" spacing={1} p={0.125}>
          <form.AppField
            name="primaryEmail"
            children={(field) => (
              <field.Text placeholder="Primary Email" label="Primary Email" type={"email"} fullWidth />
            )}
          />
          <form.AppField
            name="secondaryEmail"
            children={(field) => (
              <field.Text placeholder="Secondary Email" label="Secondary Email" type={"email"} fullWidth />
            )}
          />
        </Stack>
      </AccountFormDialog>
      <Stack spacing={1} sx={{ color: "info.main" }}>
        <Iconify icon="material-symbols:info" sx={{ fontSize: 24 }} />
        <Typography variant="body2">
          Your alternate email will be used to gain access to your account if you ever have issues with logging in with
          your primary email.
        </Typography>
      </Stack>
    </Form>
  );
};

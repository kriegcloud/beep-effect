import { BS } from "@beep/schema";
import { Iconify } from "@beep/ui/atoms";
import { formOptionsWithSubmitEffect, useAppForm } from "@beep/ui/form";
import { Stack, Typography } from "@mui/material";
import * as O from "effect/Option";
import * as Redacted from "effect/Redacted";
import * as S from "effect/Schema";
import { useState } from "react";
import { useAccountSettings } from "@/features/account/account-settings-provider";
import { InfoCard } from "../common/InfoCard";
import { InfoCardAttribute } from "../common/InfoCardAttribute";

const Email = () => {
  const [open, setOpen] = useState(false);
  const { userInfo } = useAccountSettings();

  const primaryEmail = Redacted.value(userInfo.email);
  const secondaryEmail = userInfo.secondaryEmail.pipe(
    O.match({
      onNone: () => "",
      onSome: (secondaryEmail) => Redacted.value(secondaryEmail),
    })
  );

  const form = useAppForm(
    formOptionsWithSubmitEffect({
      schema: S.Struct({
        primaryEmail: BS.Email,
        secondaryEmail: BS.Email,
      }),
      defaultValues: {
        primaryEmail,
        secondaryEmail,
      },
      onSubmit: async (value) => {
        console.log(value);
      },
    })
  );

  return (
    <>
      <InfoCard setOpen={setOpen} sx={{ mb: 2 }}>
        <Stack direction="column" spacing={{ xs: 2, sm: 1 }}>
          <InfoCardAttribute label="Primary Email" value={primaryEmail} />
          <InfoCardAttribute label="Secondary Email" value={secondaryEmail} />
        </Stack>
        <Iconify icon="material-symbols-light:edit-outline" width={20} />
      </InfoCard>
      <form.AppForm>
        <form.FormDialog
          title="Email Address"
          subtitle="Update your primary email address. You can also set an alternate email address for extra security and backup."
          open={open}
          onSubmit={() => {}}
          handleDialogClose={() => setOpen(false)}
          handleDiscard={() => {}}
          sx={{
            maxWidth: 463,
          }}
        >
          <Stack direction="column" spacing={1} p={0.125}>
            <form.AppField
              name="primaryEmail"
              children={(field) => <field.Text label={"Primary Email"} type={"email"} fullWidth={true} />}
            />
            <form.AppField
              name="secondaryEmail"
              children={(field) => <field.Text label={"Secondary Email"} type={"email"} fullWidth={true} />}
            />
            s
          </Stack>
        </form.FormDialog>
      </form.AppForm>

      <Stack spacing={1} direction={"row"} sx={{ color: "info.main" }}>
        <Iconify icon="material-symbols:info" sx={{ fontSize: 24 }} />
        <Typography variant="body2">
          Your alternate email will be used to gain access to your account if you ever have issues with logging in with
          your primary email.
        </Typography>
      </Stack>
    </>
  );
};

export default Email;

import { useChangeEmailForm } from "@beep/iam-sdk/clients/user";
import { Iconify } from "@beep/ui/atoms";
import { Stack, Typography } from "@mui/material";
import * as Redacted from "effect/Redacted";
import { useState } from "react";
import { useAccountSettings } from "@/features/account/account-settings-provider";
import { InfoCard } from "@/features/account/common/InfoCard";
import { InfoCardAttribute } from "@/features/account/common/InfoCardAttribute";

const Email = () => {
  const [open, setOpen] = useState(false);
  const { userInfo } = useAccountSettings();

  const email = Redacted.value(userInfo.email);

  const { form } = useChangeEmailForm({
    userInfo,
    onSuccess: () => {
      setOpen(false);
      form.reset();
    },
  });

  return (
    <>
      <InfoCard setOpen={setOpen} sx={{ mb: 2 }}>
        <Stack direction="column" spacing={{ xs: 2, sm: 1 }}>
          <InfoCardAttribute label="Primary Email" value={email} />
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
              name="newEmail"
              children={(field) => <field.Text label={"New Email"} type={"email"} fullWidth={true} />}
            />
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

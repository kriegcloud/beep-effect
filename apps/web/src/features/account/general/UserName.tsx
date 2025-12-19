import { useUpdateUsernameForm } from "@beep/iam-client/clients/user";
import { Iconify } from "@beep/ui/atoms";
import { Stack } from "@mui/material";
import * as O from "effect/Option";
import { useState } from "react";
import { useAccountSettings } from "@/features/account/account-settings-provider";
import { InfoCard } from "@/features/account/common/InfoCard";
import { InfoCardAttribute } from "@/features/account/common/InfoCardAttribute";

const UserName = () => {
  const { userInfo } = useAccountSettings();
  const [open, setOpen] = useState(false);

  const username = userInfo.username.pipe(
    O.match({
      onNone: () => "",
      onSome: (username) => username,
    })
  );
  const displayUsername = userInfo.displayUsername.pipe(
    O.match({
      onNone: () => "",
      onSome: (displayUsername) => displayUsername,
    })
  );
  const { form } = useUpdateUsernameForm({
    userInfo,
    onSuccess: () => {
      setOpen(false);
      form.reset();
    },
  });

  return (
    <>
      <InfoCard setOpen={setOpen}>
        <Stack direction="column" spacing={{ xs: 2, sm: 1 }} justifyContent="center">
          <InfoCardAttribute label="User Name" value={username} />
          <InfoCardAttribute label="Display Username" value={displayUsername} />
        </Stack>
        <Iconify icon="material-symbols-light:edit-outline" width={20} />
      </InfoCard>
      <form.AppForm>
        <form.FormDialog
          title="User Name"
          subtitle="Update your username. This change will apply to your account and be visible to others in your interactions."
          open={open}
          handleDialogClose={() => setOpen(false)}
          handleDiscard={() => {
            form.reset();
            setOpen(false);
          }}
          sx={{
            maxWidth: 463,
          }}
        >
          <Stack direction="column" spacing={1} p={0.125}>
            <form.AppField name={"username"} children={(field) => <field.Text label={"Username"} />} />
            <form.AppField name={"displayUsername"} children={(field) => <field.Text label={"Display Username"} />} />
          </Stack>
        </form.FormDialog>
      </form.AppForm>
    </>
  );
};

export default UserName;

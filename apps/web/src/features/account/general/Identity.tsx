import { useUpdateUserIdentityForm } from "@beep/iam-sdk/clients/user";
import { Iconify } from "@beep/ui/atoms";
import { Stack } from "@mui/material";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as Str from "effect/String";
import { useState } from "react";
import { useAccountSettings } from "@/features/account/account-settings-provider";
import { InfoCard } from "@/features/account/common/InfoCard";
import { InfoCardAttribute } from "@/features/account/common/InfoCardAttribute";

const Identity = () => {
  const { userInfo } = useAccountSettings();
  const [open, setOpen] = useState(false);

  const { firstName, lastName } = F.pipe(userInfo.name, Str.split(" "), ([firstName, lastName]) => ({
    firstName: O.fromNullable(firstName).pipe(
      O.match({
        onNone: () => "",
        onSome: (firstName) => firstName,
      })
    ),
    lastName: O.fromNullable(lastName).pipe(
      O.match({
        onNone: () => "",
        onSome: (lastName) => lastName,
      })
    ),
  }));

  const { form } = useUpdateUserIdentityForm({
    userInfo,
    onSuccess: () => {
      setOpen(false);
      form.reset();
    },
  });

  return (
    <>
      <InfoCard setOpen={setOpen}>
        <Stack direction="column" spacing={{ xs: 2, sm: 1 }}>
          <InfoCardAttribute label="First Name" value={firstName} />
          <InfoCardAttribute label="Last Name" value={lastName} />
        </Stack>
        <Iconify icon="material-symbols-light:edit-outline" width={20} />
      </InfoCard>
      <form.AppForm>
        <form.FormDialog
          title="Name"
          subtitle="Enter your updated first and last name below. Your name will be reflected across all your account settings."
          open={open}
          handleDialogClose={() => setOpen(false)}
          sx={{ maxWidth: 463 }}
        >
          <Stack direction="column" spacing={1} p={0.125}>
            <form.AppField
              name={"firstName"}
              children={(field) => <field.Text label={"First Name"} fullWidth={true} />}
            />
            <form.AppField
              name={"lastName"}
              children={(field) => <field.Text label={"Last Name"} fullWidth={true} />}
            />
          </Stack>
        </form.FormDialog>
      </form.AppForm>
    </>
  );
};

export default Identity;

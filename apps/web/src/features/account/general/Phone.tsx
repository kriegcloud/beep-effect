import { useUpdatePhoneNumberForm } from "@beep/iam-client/clients/user";
import { Iconify } from "@beep/ui/atoms";
import { Link, Stack, Typography } from "@mui/material";
import * as O from "effect/Option";
import * as Redacted from "effect/Redacted";
import { useState } from "react";
import { useAccountSettings } from "@/features/account/account-settings-provider";
import { InfoCard } from "@/features/account/common/InfoCard";
import { InfoCardAttribute } from "@/features/account/common/InfoCardAttribute";

const Phone = () => {
  const [open, setOpen] = useState(false);

  const { userInfo } = useAccountSettings();
  const { form } = useUpdatePhoneNumberForm({
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
          <InfoCardAttribute
            label="Number"
            value={userInfo.phoneNumber.pipe(
              O.match({
                onNone: () => "No Phone Number",
                onSome: (phoneNumber) => Redacted.value(phoneNumber),
              })
            )}
          />
        </Stack>
        <Iconify icon="material-symbols-light:edit-outline" width={20} />
      </InfoCard>
      <form.AppForm>
        <form.FormDialog
          title="Phone"
          subtitle="Ensure your phone number to enable account recovery and receive important notifications."
          open={open}
          handleDialogClose={() => setOpen(false)}
          handleDiscard={() => {}}
          sx={{
            maxWidth: 463,
          }}
        >
          <form.AppField
            name="phoneNumber"
            children={(field) => <field.Phone label={"Phone Number"} defaultCountry={"US"} />}
          />
        </form.FormDialog>
      </form.AppForm>
      <Stack direction="column" spacing={1} alignItems="flex-start">
        <Typography variant="body2" sx={{ color: "text.secondary", textWrap: "pretty" }}>
          This phone number has to be confirmed to ensure its authenticity first before being connected with your
          profile.
        </Typography>
        <Link
          href="#!"
          sx={{
            display: "flex",
            alignItems: "center",
            fontSize: "body2.fontSize",
          }}
        >
          Confirm your number <Iconify icon="material-symbols:chevron-right" height={20} width={20} />
        </Link>
      </Stack>
    </>
  );
};

export default Phone;

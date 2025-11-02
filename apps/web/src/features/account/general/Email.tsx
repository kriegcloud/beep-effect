import { Iconify } from "@beep/ui/atoms";
import { Form } from "@beep/ui/form";
import { Stack, Typography } from "@mui/material";
import { useState } from "react";
import { AccountFormDialog } from "../common/AccountFormDialog";
import { InfoCard } from "../common/InfoCard";
import { InfoCardAttribute } from "../common/InfoCardAttribute";

// interface EmailFormValues {
//   primaryEmail: string;
//   secondaryEmail: string;
// }

const Email = () => {
  const [open, setOpen] = useState(false);
  // const { personalInfo } = useAccounts();
  // const { enqueueSnackbar } = useSnackbar();
  // const [currentEmail, setCurrentEmail] = useState<EmailFormValues>({
  //   primaryEmail: personalInfo.primaryEmail,
  //   secondaryEmail: personalInfo.secondaryEmail,
  // });
  // const methods = useForm<EmailFormValues>({
  //   defaultValues: {
  //     primaryEmail: personalInfo.primaryEmail,
  //     secondaryEmail: personalInfo.secondaryEmail,
  //   },
  //   resolver: yupResolver(emailSchema),
  // });
  // const {
  //   getValues,
  //   register,
  //   reset,
  //   formState: { errors },
  // } = methods;
  //
  // const onSubmit: SubmitHandler<EmailFormValues> = (data) => {
  //   console.log(data);
  //   const updatedData = getValues();
  //   setCurrentEmail(updatedData);
  //   setOpen(false);
  //   enqueueSnackbar('Updated successfully!', { variant: 'success', autoHideDuration: 3000 });
  // };
  //
  // const handleDiscard = () => {
  //   reset(currentEmail);
  //   setOpen(false);
  // };

  return (
    <Form>
      <InfoCard setOpen={setOpen} sx={{ mb: 2 }}>
        <Stack direction="column" spacing={{ xs: 2, sm: 1 }}>
          <InfoCardAttribute label="Primary Email" value={"something@email.com"} />
          <InfoCardAttribute label="Secondary Email" value={"something.alternate@email.com"} />
        </Stack>
        <Iconify icon="material-symbols-light:edit-outline" width={20} />
      </InfoCard>
      <AccountFormDialog
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
          {/*<TextField*/}
          {/*  placeholder="Primary Email"*/}
          {/*  label="Primary Email"*/}
          {/*  error={!!errors.primaryEmail}*/}
          {/*  helperText={errors.primaryEmail?.message}*/}
          {/*  fullWidth*/}
          {/*  {...register('primaryEmail')}*/}
          {/*/>*/}
          {/*<TextField*/}
          {/*  placeholder="Secondary Email"*/}
          {/*  label="Secondary Email"*/}
          {/*  error={!!errors.secondaryEmail}*/}
          {/*  helperText={errors.secondaryEmail?.message}*/}
          {/*  fullWidth*/}
          {/*  {...register('secondaryEmail')}*/}
          {/*/>*/}
        </Stack>
      </AccountFormDialog>
      <Stack spacing={1} direction={"row"} sx={{ color: "info.main" }}>
        <Iconify icon="material-symbols:info" sx={{ fontSize: 24 }} />
        <Typography variant="body2">
          Your alternate email will be used to gain access to your account if you ever have issues with logging in with
          your primary email.
        </Typography>
      </Stack>
    </Form>
  );
};

export default Email;

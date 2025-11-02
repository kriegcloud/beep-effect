import { Button, Stack, Typography } from "@mui/material";
import { useState } from "react";
// import { toast } from '@beep/ui/molecules';

import { Iconify } from "@beep/ui/atoms";
import { Form } from "@beep/ui/form";
import { AccountFormDialog } from "../common/AccountFormDialog";

const ChangePassword = () => {
  const [open, setOpen] = useState(false);
  // const methods = useForm<PasswordFormValues>({
  //   resolver: yupResolver(passwordSchema),
  // });
  // const { enqueueSnackbar } = useSnackbar();
  // const {
  //   register,
  //   formState: { errors },
  // } = methods;

  const onSubmit = (data: any) => {
    console.log(data);
    setOpen(false);
    // enqueueSnackbar('Updated successfully!', { variant: 'success', autoHideDuration: 3000 });
  };

  return (
    <Form>
      <Stack direction="column" spacing={2} alignItems="flex-start">
        <Typography
          variant="body2"
          sx={{
            fontWeight: 500,
            color: "info.main",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Iconify icon="material-symbols:info-outline" sx={{ fontSize: 24 }} />
          Your password was last updated on 07/08/22
        </Typography>
        <Button
          variant="soft"
          onClick={() => setOpen(true)}
          endIcon={<Iconify icon="material-symbols:chevron-right" sx={{ fontSize: 20 }} />}
        >
          Change password
        </Button>
        <AccountFormDialog
          title="Set New Password"
          subtitle="Create a new password for your account. New password must be different from any previous passwords."
          open={open}
          handleDialogClose={() => setOpen(false)}
          onSubmit={onSubmit}
          sx={{
            maxWidth: 463,
          }}
        >
          <Stack direction="column" spacing={1} pb={0.125}>
            {/*<PasswordTextField*/}
            {/*  placeholder="Current password"*/}
            {/*  label="Current password"*/}
            {/*  error={!!errors.currentPassword}*/}
            {/*  helperText={errors.currentPassword?.message}*/}
            {/*  {...register('currentPassword')}*/}
            {/*/>*/}
            {/*<PasswordTextField*/}
            {/*  placeholder="New password"*/}
            {/*  label="New password"*/}
            {/*  error={!!errors.newPassword}*/}
            {/*  helperText={errors.newPassword?.message}*/}
            {/*  {...register('newPassword')}*/}
            {/*/>*/}
            {/*<PasswordTextField*/}
            {/*  placeholder="Retype new password"*/}
            {/*  label="Retype password"*/}
            {/*  error={!!errors.confirmPassword}*/}
            {/*  helperText={errors.confirmPassword?.message}*/}
            {/*  {...register('confirmPassword')}*/}
            {/*/>*/}
          </Stack>
        </AccountFormDialog>
      </Stack>
    </Form>
  );
};

export default ChangePassword;

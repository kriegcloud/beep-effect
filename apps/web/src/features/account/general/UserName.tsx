import { Iconify } from "@beep/ui/atoms";
import { Form } from "@beep/ui/form";

import { Stack } from "@mui/material";
import { useState } from "react";
import { AccountFormDialog } from "../common/AccountFormDialog";
import { InfoCard } from "../common/InfoCard";
import { InfoCardAttribute } from "../common/InfoCardAttribute";

const UserName = () => {
  // const { personalInfo } = useAccounts();
  //   const { enqueueSnackbar } = useSnackbar();
  const [open, setOpen] = useState(false);

  // const [currentUserName, setCurrentUserName] = useState<string>(personalInfo.userName);
  // const methods = useForm<UserNameFormValues>({
  //   defaultValues: {
  //     userName: currentUserName,
  //   },
  //   resolver: yupResolver(userNameSchema),
  // });
  // const {
  //   register,
  //   getValues,
  //   reset,
  //   formState: { errors },
  // } = methods;
  //
  // const onSubmit: SubmitHandler<UserNameFormValues> = (data) => {
  //   console.log(data);
  //   const updatedData = getValues();
  //   setCurrentUserName(updatedData.userName);
  //   setOpen(false);
  //   enqueueSnackbar('Updated successfully!', { variant: 'success', autoHideDuration: 3000 });
  // };
  //
  // const handleDiscard = () => {
  //   reset({ userName: currentUserName });
  //   setOpen(false);
  // };

  return (
    <Form>
      <InfoCard setOpen={setOpen}>
        <Stack direction="column" spacing={{ xs: 2, sm: 1 }} justifyContent="center">
          <InfoCardAttribute label="User Name" value={"BeepHole69!"} />
        </Stack>
        <Iconify icon="material-symbols-light:edit-outline" width={20} />
      </InfoCard>
      <AccountFormDialog
        title="User Name"
        subtitle="Update your username. This change will apply to your account and be visible to others in your interactions."
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
          {/*  placeholder="User Name"*/}
          {/*  label="User Name"*/}
          {/*  error={!!errors.userName}*/}
          {/*  helperText={errors.userName?.message}*/}
          {/*  fullWidth*/}
          {/*  {...register('userName')}*/}
          {/*/>*/}
        </Stack>
      </AccountFormDialog>
    </Form>
  );
};

export default UserName;

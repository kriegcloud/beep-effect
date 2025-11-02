import { Iconify } from "@beep/ui/atoms";
import { Form } from "@beep/ui/form";
import { Stack } from "@mui/material";
import { useState } from "react";
import { AccountFormDialog } from "../common/AccountFormDialog";
import { InfoCard } from "../common/InfoCard";
import { InfoCardAttribute } from "../common/InfoCardAttribute";

const Names = () => {
  // const { personalInfo } = useAccounts();
  const [open, setOpen] = useState(false);
  // const { enqueueSnackbar } = useSnackbar();
  // const [currentName, setCurrentName] = useState<NameFormValues>({
  //   firstName: personalInfo.firstName,
  //   lastName: personalInfo.lastName,
  // });
  // const methods = useForm<NameFormValues>({
  //   defaultValues: {
  //     firstName: currentName.firstName,
  //     lastName: currentName.lastName,
  //   },
  //   resolver: yupResolver(nameSchema),
  // });
  // const {
  //   register,
  //   getValues,
  //   reset,
  //   formState: { errors },
  // } = methods;
  //
  // const onSubmit: SubmitHandler<NameFormValues> = (data) => {
  //   console.log(data);
  //   const updatedData = getValues();
  //   setCurrentName(updatedData);
  //   setOpen(false);
  //   enqueueSnackbar('Updated successfully!', { variant: 'success', autoHideDuration: 3000 });
  // };
  //
  // const handleDiscard = () => {
  //   reset({ firstName: currentName.firstName, lastName: currentName.lastName });
  //   setOpen(false);
  // };

  return (
    <Form>
      <InfoCard setOpen={setOpen}>
        <Stack direction="column" spacing={{ xs: 2, sm: 1 }}>
          <InfoCardAttribute label="First Name" value={"Beep"} />
          <InfoCardAttribute label="Last Name" value={"Hole"} />
        </Stack>
        <Iconify icon="material-symbols-light:edit-outline" width={20} />
      </InfoCard>
      <AccountFormDialog
        title="Name"
        subtitle="Enter your updated first and last name below. Your name will be reflected across all your account settings."
        open={open}
        onSubmit={() => {}}
        handleDialogClose={() => setOpen(false)}
        handleDiscard={() => {}}
        sx={{ maxWidth: 463 }}
      >
        <Stack direction="column" spacing={1} p={0.125}>
          {/*<TextField*/}
          {/*  placeholder="First Name"*/}
          {/*  label="First Name"*/}
          {/*  error={!!errors.firstName}*/}
          {/*  helperText={errors.firstName?.message}*/}
          {/*  fullWidth*/}
          {/*  {...register('firstName')}*/}
          {/*/>*/}
          {/*<TextField*/}
          {/*  placeholder="Last Name"*/}
          {/*  label="Last Name"*/}
          {/*  error={!!errors.lastName}*/}
          {/*  helperText={errors.lastName?.message}*/}
          {/*  fullWidth*/}
          {/*  {...register('lastName')}*/}
          {/*/>*/}
        </Stack>
      </AccountFormDialog>
    </Form>
  );
};

export default Names;

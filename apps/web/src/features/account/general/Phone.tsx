import { Iconify } from "@beep/ui/atoms";
import { Form } from "@beep/ui/form";

import { Link, Stack, Typography } from "@mui/material";
import { useState } from "react";
// import PhoneTextfield from 'components/base/PhoneTextfield';
import { AccountFormDialog } from "../common/AccountFormDialog";
import { InfoCard } from "../common/InfoCard";
import { InfoCardAttribute } from "../common/InfoCardAttribute";

const Phone = () => {
  const [open, setOpen] = useState(false);
  // const { personalInfo } = useAccounts();
  // const { enqueueSnackbar } = useSnackbar();
  // const [currentPhone, setCurrentPhone] = useState<string>(personalInfo.phoneNumber);
  // const methods = useForm<PhoneFormValues>({
  //   defaultValues: {
  //     phoneNumber: currentPhone,
  //   },
  //   resolver: yupResolver(phoneSchema),
  // });
  // const { control, reset, getValues } = methods;
  //
  // const onSubmit: SubmitHandler<PhoneFormValues> = (data) => {
  //   console.log(data);
  //   const updatedData = getValues();
  //   setCurrentPhone(updatedData.phoneNumber);
  //   setOpen(false);
  //   enqueueSnackbar('Updated successfully!', { variant: 'success', autoHideDuration: 3000 });
  // };
  // const handleDiscard = () => {
  //   reset({ phoneNumber: currentPhone });
  //   setOpen(false);
  // };
  // const match = currentPhone.match(/\(\+(\d+)\)(\d+)/);

  return (
    <Form>
      <InfoCard setOpen={setOpen} sx={{ mb: 2 }}>
        <Stack direction="column" spacing={{ xs: 2, sm: 1 }}>
          <InfoCardAttribute label="Number" value={"(+880)1795448106"} />
        </Stack>
        <Iconify icon="material-symbols-light:edit-outline" width={20} />
      </InfoCard>
      <AccountFormDialog
        title="Phone"
        subtitle="Ensure your phone number to enable account recovery and receive important notifications."
        open={open}
        onSubmit={() => {}}
        handleDialogClose={() => setOpen(false)}
        handleDiscard={() => {}}
        sx={{
          maxWidth: 463,
        }}
      >
        {/*<Controller*/}
        {/*  name="phoneNumber"*/}
        {/*  control={control}*/}
        {/*  render={({ field: { onChange } }) => (*/}
        {/*    <PhoneTextfield*/}
        {/*      onChange={onChange}*/}
        {/*      defaultValue={{*/}
        {/*        code: match?.[1] as string,*/}
        {/*        number: match?.[2] as string,*/}
        {/*      }}*/}
        {/*    />*/}
        {/*  )}*/}
        {/*/>*/}
      </AccountFormDialog>
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
    </Form>
  );
};

export default Phone;

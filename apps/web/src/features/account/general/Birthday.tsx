import {
  Form,
  // useAppForm,
  // formOptionsWithSubmitEffect
} from "@beep/ui/form";
import {
  Stack,
  // Radio,
  // RadioGroup,
  // Typography,
  // FormControl,
  // FormControlLabel
} from "@mui/material";
// import {DatePicker} from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { useState } from "react";
// import type {Theme} from "@mui/material/styles";
// import {useMediaQuery} from "@mui/material";

// import { useBreakpoints } from 'providers/BreakpointsProvider';

import { Iconify } from "@beep/ui/atoms";
import { AccountFormDialog } from "../common/AccountFormDialog";
import { InfoCard } from "../common/InfoCard";
import { InfoCardAttribute } from "../common/InfoCardAttribute";

export interface BirthdayFormValues {
  birthDate: string;
  visibility?: "only_me" | "followers_only" | "everyone" | undefined;
}

const Birthday = () => {
  const [open, setOpen] = useState(false);
  // const { personalInfo } = useAccounts();

  // const upSm = useMediaQuery<Theme>((theme) => theme.breakpoints.up("sm"))
  // const { enqueueSnackbar } = useSnackbar();
  // const [currentBirthDate, setCurrentBirthDate] = useState<string>(personalInfo.birthDate);
  // const methods = useForm<BirthdayFormValues>({
  //   defaultValues: {
  //     birthDate: currentBirthDate,
  //     visibility: 'only_me',
  //   },
  //   resolver: yupResolver(birthdaySchema),
  // });
  // const {
  //   control,
  //   reset,
  //   getValues,
  //   formState: { errors },
  // } = methods;

  // const upSm = up('sm');

  // const onSubmit: SubmitHandler<BirthdayFormValues> = (data) => {
  //   console.log(data);
  //   const updatedData = getValues();
  //   setCurrentBirthDate(updatedData.birthDate);
  //   setOpen(false);
  //   enqueueSnackbar('Updated successfully!', { variant: 'success', autoHideDuration: 3000 });
  // };
  const handleDiscard = () => {
    // reset({ birthDate: currentBirthDate });
    setOpen(false);
  };

  return (
    <Form>
      <InfoCard setOpen={setOpen} sx={{ mb: 3 }}>
        <Stack direction="column" spacing={{ xs: 2, sm: 1 }}>
          <InfoCardAttribute label="Date" value={dayjs(new Date(Date.now())).format("D MMMM, YYYY")} />
        </Stack>
        <Iconify icon="material-symbols-light:edit-outline" width={20} />
      </InfoCard>
      <AccountFormDialog
        title="Birthday"
        subtitle="Provide your birthday to ensure you get the right content and features for your age."
        open={open}
        onSubmit={() => {}}
        handleDialogClose={() => setOpen(false)}
        handleDiscard={handleDiscard}
        sx={{
          maxWidth: 463,
        }}
      >
        <Stack direction={{ xs: "column" }} spacing={1}>
          {/*<Controller*/}
          {/*  control={control}*/}
          {/*  name="birthDate"*/}
          {/*  render={({ field: { value, ...rest } }) => (*/}
          {/*    <DatePicker*/}
          {/*      label="Select Birth date"*/}
          {/*      value={dayjs(value)}*/}
          {/*      slotProps={{*/}
          {/*        textField: {*/}
          {/*          error: !!errors.birthDate,*/}
          {/*          helperText: errors.birthDate?.message,*/}
          {/*          fullWidth: true,*/}
          {/*        },*/}
          {/*        inputAdornment: {*/}
          {/*          position: 'start',*/}
          {/*        },*/}
          {/*      }}*/}
          {/*      {...rest}*/}
          {/*    />*/}
          {/*  )}*/}
          {/*/>*/}
        </Stack>
      </AccountFormDialog>
      {/*<FormControl sx={{ gap: 2 }}>*/}
      {/*  <Typography variant="subtitle2" sx={{ fontWeight: 400 }}>*/}
      {/*    Who can see your birthday?*/}
      {/*  </Typography>*/}
      {/*  <Controller*/}
      {/*    control={control}*/}
      {/*    name="visibility"*/}
      {/*    render={({ field }) => (*/}
      {/*      <RadioGroup row={upSm} aria-labelledby="birthday-visibility-radio-buttons" {...field}>*/}
      {/*        <FormControlLabel value="only_me" control={<Radio />} label="Only me" />*/}
      {/*        <FormControlLabel value="followers_only" control={<Radio />} label="Followers only" />*/}
      {/*        <FormControlLabel value="everyone" control={<Radio />} label="Everyone" />*/}
      {/*      </RadioGroup>*/}
      {/*    )}*/}
      {/*  />*/}
      {/*</FormControl>*/}
    </Form>
  );
};

export default Birthday;

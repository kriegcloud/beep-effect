// import { countries } from 'data/countries';
// import { useSnackbar } from 'notistack';
// import { useAccounts } from 'providers/AccountsProvider';
// import { useBreakpoints } from 'providers/BreakpointsProvider';
// import * as yup from 'yup';
import { Iconify } from "@beep/ui/atoms";
import {
  // useAppForm,
  // formOptionsWithSubmitEffect,
  Form,
} from "@beep/ui/form";
// import { useForm, Controller, FormProvider, SubmitHandler } from 'react-hook-form';
// import { yupResolver } from '@hookform/resolvers/yup';
import {
  //  Radio,
  Stack,
  // TextField,
  // RadioGroup,
  // Typography,
  // FormControl,
  // FormControlLabel,
} from "@mui/material";
import { useState } from "react";
// import { useMediaQuery } from "@mui/material";
// import type { Theme } from "@mui/material/styles";
// import CountrySelect from 'components/common/CountrySelect';
import { AccountFormDialog } from "../common/AccountFormDialog";
import { InfoCard } from "../common/InfoCard";
import { InfoCardAttribute } from "../common/InfoCardAttribute";

export interface AddressFormValues {
  country: string;
  state: string;
  city: string;
  street: string;
  zip: string;
  visibility?: "only_me" | "followers_only" | "everyone";
}

// const addressSchema = yup.object().shape({
//   country: yup.string().required('Country name is required'),
//   state: yup.string().required('State name is required'),
//   city: yup.string().required('City name is required'),
//   street: yup.string().required('Street name is required'),
//   zip: yup.string().required('ZIP is required'),
// });

const Address = () => {
  const [open, setOpen] = useState(false);
  // const { personalInfo } = useAccounts();

  // const upSm = useMediaQuery<Theme>((theme) => theme.breakpoints.up("sm"));
  // const { enqueueSnackbar } = useSnackbar();
  // const [currentAddress, setCurrentAddress] = useState<AddressFormValues>({
  //   country: personalInfo.country,
  //   state: personalInfo.state,
  //   city: personalInfo.city,
  //   street: personalInfo.street,
  //   zip: personalInfo.zip,
  // });
  // const methods = useForm<AddressFormValues>({
  //   defaultValues: {
  //     country: currentAddress.country,
  //     state: currentAddress.state,
  //     city: currentAddress.city,
  //     street: currentAddress.street,
  //     zip: currentAddress.zip,
  //     visibility: 'followers_only',
  //   },
  //   resolver: yupResolver(addressSchema),
  // });
  // const {
  //   control,
  //   getValues,
  //   reset,
  //   register,
  //   formState: { errors },
  // } = methods;
  //
  // const upSm = up('sm');

  // const onSubmit: SubmitHandler<AddressFormValues> = (data) => {
  //   console.log(data);
  //   const updatedData = getValues();
  //   setCurrentAddress(updatedData);
  //   setOpen(false);
  //   enqueueSnackbar('Updated successfully!', { variant: 'success', autoHideDuration: 3000 });
  // };

  // const handleDiscard = () => {
  //   reset(currentAddress);
  //   setOpen(false);
  // };

  return (
    <Form>
      <InfoCard setOpen={setOpen} sx={{ mb: 3 }}>
        <Stack direction="column" spacing={{ xs: 2, sm: 1 }}>
          <InfoCardAttribute label="Country" value={"United States"} />
          <InfoCardAttribute label="State" value={"Pennsylvania"} />
          <InfoCardAttribute label="City" value={"Essington"} />
          <InfoCardAttribute label="Street" value={"500 Powhattan Ave"} />
          <InfoCardAttribute label="ZIP" value={"19029"} />
        </Stack>
        <Iconify icon="material-symbols-light:edit-outline" width={20} />
      </InfoCard>
      <AccountFormDialog
        title="Address"
        subtitle="Enter your updated address to ensure we have your most recent and accurate location information."
        open={open}
        onSubmit={() => {}}
        handleDialogClose={() => setOpen(false)}
        handleDiscard={() => {}}
        sx={{
          maxWidth: 463,
        }}
      >
        <Stack direction="column" spacing={1} p={0.125}>
          {/*<Controller*/}
          {/*  name="country"*/}
          {/*  control={control}*/}
          {/*  render={({ field: { onChange, value } }) => (*/}
          {/*    <CountrySelect*/}
          {/*      sx={{ mb: 1 }}*/}
          {/*      fullWidth*/}
          {/*      onChange={(_, value) => onChange(value ? value.label : '')}*/}
          {/*      value={countries.find((country) => country.label === value) || null}*/}
          {/*      renderInput={(params) => (*/}
          {/*        <TextField*/}
          {/*          label="Country"*/}
          {/*          error={!!errors.country?.message}*/}
          {/*          helperText={errors.country?.message}*/}
          {/*          {...params}*/}
          {/*        />*/}
          {/*      )}*/}
          {/*    />*/}
          {/*  )}*/}
          {/*/>*/}
          {/*<TextField*/}
          {/*  placeholder="State"*/}
          {/*  label="State"*/}
          {/*  error={!!errors.state}*/}
          {/*  helperText={errors.state?.message}*/}
          {/*  fullWidth*/}
          {/*  {...register('state')}*/}
          {/*/>*/}
          {/*<TextField*/}
          {/*  placeholder="City"*/}
          {/*  label="City"*/}
          {/*  error={!!errors.city}*/}
          {/*  helperText={errors.city?.message}*/}
          {/*  fullWidth*/}
          {/*  {...register('city')}*/}
          {/*/>*/}
          {/*<TextField*/}
          {/*  placeholder="Street"*/}
          {/*  label="Street"*/}
          {/*  error={!!errors.street}*/}
          {/*  helperText={errors.street?.message}*/}
          {/*  fullWidth*/}
          {/*  {...register('street')}*/}
          {/*/>*/}
          {/*<TextField*/}
          {/*  placeholder="ZIP"*/}
          {/*  label="ZIP"*/}
          {/*  error={!!errors.zip}*/}
          {/*  helperText={errors.zip?.message}*/}
          {/*  fullWidth*/}
          {/*  {...register('zip')}*/}
          {/*/>*/}
        </Stack>
      </AccountFormDialog>
      {/*<FormControl sx={{ gap: 2 }}>*/}
      {/*  <Typography variant="subtitle2" sx={{ fontWeight: 400 }}>*/}
      {/*    Who can see your address?*/}
      {/*  </Typography>*/}
      {/*  <Controller*/}
      {/*    control={control}*/}
      {/*    name="visibility"*/}
      {/*    render={({ field }) => (*/}
      {/*      <RadioGroup row={upSm} aria-labelledby="address-visibility-radio-buttons" {...field}>*/}
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

export default Address;

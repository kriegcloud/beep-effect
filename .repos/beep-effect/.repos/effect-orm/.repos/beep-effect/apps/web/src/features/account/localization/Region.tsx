// import { Controller, useFormContext } from 'react-hook-form';
import {
  FormControl,
  //Radio,
  Stack,
  // RadioGroup,
  Typography,
  // Autocomplete,
  // FormControlLabel,
} from "@mui/material";

// import {
// dateFormats,
// listSortOrders,
// numberFormats,
// regions,
// weekDays,
// } from './data';
// import TextField from '@mui/material/TextField';
// import { LanguageRegionFormValues } from './LanguageRegionTabPanel';

const Region = () => {
  // const { control } = useFormContext<LanguageRegionFormValues>();

  return (
    <Stack direction="column" spacing={3} mb={5}>
      {/*<Controller*/}
      {/*  name="region"*/}
      {/*  control={control}*/}
      {/*  render={({ field }) => (*/}
      {/*    <Autocomplete*/}
      {/*      aria-labelledby="region-autocomplete-label"*/}
      {/*      disablePortal*/}
      {/*      fullWidth*/}
      {/*      options={regions}*/}
      {/*      {...field}*/}
      {/*      onChange={(_, value) => {*/}
      {/*        field.onChange(value);*/}
      {/*      }}*/}
      {/*      renderInput={(params) => (*/}
      {/*        <TextField*/}
      {/*          {...params}*/}
      {/*          label="Region"*/}
      {/*          placeholder={regions[0]}*/}
      {/*          sx={{ width: { sm: 0.5 }, pr: { sm: 0.5 } }}*/}
      {/*        />*/}
      {/*      )}*/}
      {/*    />*/}
      {/*  )}*/}
      {/*/>*/}
      <FormControl sx={{ gap: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          Temperature
        </Typography>
        {/*<Controller*/}
        {/*  name="temperature"*/}
        {/*  control={control}*/}
        {/*  render={({ field }) => (*/}
        {/*    <RadioGroup row aria-labelledby="temperature-radio-button-group-label" {...field}>*/}
        {/*      <FormControlLabel value="celcius" control={<Radio />} label="Celsius (℃)" />*/}
        {/*      <FormControlLabel value="fahrenheit" control={<Radio />} label="Fahrenheit (℉)" />*/}
        {/*    </RadioGroup>*/}
        {/*  )}*/}
        {/*/>*/}
      </FormControl>
      <FormControl sx={{ gap: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          Measurement System
        </Typography>
        {/*<Controller*/}
        {/*  name="measurementSystem"*/}
        {/*  control={control}*/}
        {/*  render={({ field }) => (*/}
        {/*    <RadioGroup*/}
        {/*      row*/}
        {/*      aria-labelledby="measurement-system-radio-button-group-label"*/}
        {/*      {...field}*/}
        {/*    >*/}
        {/*      <FormControlLabel value="metric" control={<Radio />} label="Metric" />*/}
        {/*      <FormControlLabel value="us" control={<Radio />} label="US" />*/}
        {/*      <FormControlLabel value="uk" control={<Radio />} label="UK" />*/}
        {/*    </RadioGroup>*/}
        {/*  )}*/}
        {/*/>*/}
      </FormControl>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ width: 1 }}>
        {/*<Controller*/}
        {/*  name="firstDayOfWeek"*/}
        {/*  control={control}*/}
        {/*  render={({ field }) => (*/}
        {/*    <Autocomplete*/}
        {/*      aria-labelledby="first-day-of-week-autocomplete-label"*/}
        {/*      disablePortal*/}
        {/*      options={weekDays}*/}
        {/*      fullWidth*/}
        {/*      {...field}*/}
        {/*      onChange={(_, value) => {*/}
        {/*        field.onChange(value);*/}
        {/*      }}*/}
        {/*      renderInput={(params) => (*/}
        {/*        <StyledTextField {...params} label="First day of week" placeholder={weekDays[0]} />*/}
        {/*      )}*/}
        {/*    />*/}
        {/*  )}*/}
        {/*/>*/}
        {/*<Controller*/}
        {/*  name="dateFormat"*/}
        {/*  control={control}*/}
        {/*  render={({ field }) => (*/}
        {/*    <Autocomplete*/}
        {/*      aria-labelledby="date-format-autocomplete-label"*/}
        {/*      disablePortal*/}
        {/*      options={dateFormats}*/}
        {/*      fullWidth*/}
        {/*      {...field}*/}
        {/*      onChange={(_, value) => {*/}
        {/*        field.onChange(value);*/}
        {/*      }}*/}
        {/*      renderInput={(params) => (*/}
        {/*        <StyledTextField {...params} label="Date format" placeholder={dateFormats[0]} />*/}
        {/*      )}*/}
        {/*    />*/}
        {/*  )}*/}
        {/*/>*/}
      </Stack>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1} width={1}>
        {/*<Controller*/}
        {/*  name="numberFormat"*/}
        {/*  control={control}*/}
        {/*  render={({ field }) => (*/}
        {/*    <Autocomplete*/}
        {/*      aria-labelledby="number-format-autocomplete-label"*/}
        {/*      disablePortal*/}
        {/*      options={numberFormats}*/}
        {/*      fullWidth*/}
        {/*      {...field}*/}
        {/*      onChange={(_, value) => {*/}
        {/*        field.onChange(value);*/}
        {/*      }}*/}
        {/*      renderInput={(params) => (*/}
        {/*        <StyledTextField {...params} label="Number format" placeholder={numberFormats[0]} />*/}
        {/*      )}*/}
        {/*    />*/}
        {/*  )}*/}
        {/*/>*/}
        {/*<Controller*/}
        {/*  name="listSortOrder"*/}
        {/*  control={control}*/}
        {/*  render={({ field }) => (*/}
        {/*    <Autocomplete*/}
        {/*      aria-labelledby="list-sort-order-autocomplete-label"*/}
        {/*      disablePortal*/}
        {/*      options={listSortOrders}*/}
        {/*      fullWidth*/}
        {/*      {...field}*/}
        {/*      onChange={(_, value) => {*/}
        {/*        field.onChange(value);*/}
        {/*      }}*/}
        {/*      renderInput={(params) => (*/}
        {/*        <StyledTextField*/}
        {/*          {...params}*/}
        {/*          label="List sort order"*/}
        {/*          placeholder={listSortOrders[0]}*/}
        {/*        />*/}
        {/*      )}*/}
        {/*    />*/}
        {/*  )}*/}
        {/*/>*/}
      </Stack>
    </Stack>
  );
};

export default Region;

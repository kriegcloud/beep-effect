import {
  FormControl,
  // Checkbox,
  FormGroup,
  // Radio,
  Stack,
  // RadioGroup,
  Typography,
  // FormControlLabel,
  // formControlLabelClasses,
} from "@mui/material";
// import { LanguageRegionFormValues } from './LanguageRegionTabPanel';
import Languages from "./Languages";

const PreferredLanguage = () => {
  // const { control } = useFormContext<LanguageRegionFormValues>();

  return (
    <Stack direction="column" spacing={3} alignItems="flex-start">
      <Languages />
      <FormControl component="fieldset" sx={{ gap: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          Spell Check
        </Typography>
        {/*<Controller*/}
        {/*  name="spellCheck"*/}
        {/*  control={control}*/}
        {/*  render={({ field }) => (*/}
        {/*    <RadioGroup*/}
        {/*      aria-labelledby="spell-check-radio-button-group-label"*/}
        {/*      sx={{ alignItems: 'flex-start' }}*/}
        {/*      {...field}*/}
        {/*    >*/}
        {/*      <FormControlLabel value="basic" control={<Radio />} label="Basic Spell Check" />*/}
        {/*      <FormControlLabel*/}
        {/*        value="advanced"*/}
        {/*        control={<Radio />}*/}
        {/*        label={*/}
        {/*          <>*/}
        {/*            <Typography component="span" variant="body2">*/}
        {/*              Advanced Spell Check*/}
        {/*            </Typography>*/}
        {/*            <br />*/}
        {/*            <Typography component="span" variant="body2" sx={{ color: 'text.secondary' }}>*/}
        {/*              The same spell checker that is used in Google will be used.{' '}*/}
        {/*            </Typography>*/}
        {/*          </>*/}
        {/*        }*/}
        {/*        sx={{*/}
        {/*          alignItems: 'flex-start',*/}
        {/*          [`.${formControlLabelClasses.label}`]: {*/}
        {/*            mt: 0.5,*/}
        {/*          },*/}
        {/*        }}*/}
        {/*      />*/}
        {/*    </RadioGroup>*/}
        {/*  )}*/}
        {/*/>*/}
      </FormControl>
      <FormControl component="fieldset" sx={{ gap: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          Use Spell Checker For
        </Typography>
        <FormGroup aria-labelledby="spell-checker-checkboxes-label">
          {/*<Controller*/}
          {/*  name="checkerLanguages.english"*/}
          {/*  control={control}*/}
          {/*  render={({ field }) => (*/}
          {/*    <FormControlLabel*/}
          {/*      control={<Checkbox checked={field.value} {...field} />}*/}
          {/*      label="English (US) - Primary"*/}
          {/*    />*/}
          {/*  )}*/}
          {/*/>*/}
          {/*<Controller*/}
          {/*  name="checkerLanguages.bangla"*/}
          {/*  control={control}*/}
          {/*  render={({ field }) => (*/}
          {/*    <FormControlLabel*/}
          {/*      control={<Checkbox checked={field.value} {...field} />}*/}
          {/*      label="Bangla"*/}
          {/*    />*/}
          {/*  )}*/}
          {/*/>*/}
          {/*<Controller*/}
          {/*  name="checkerLanguages.french"*/}
          {/*  control={control}*/}
          {/*  render={({ field }) => (*/}
          {/*    <FormControlLabel*/}
          {/*      control={<Checkbox checked={field.value} {...field} />}*/}
          {/*      label="French"*/}
          {/*    />*/}
          {/*  )}*/}
          {/*/>*/}
        </FormGroup>
      </FormControl>
    </Stack>
  );
};

export default PreferredLanguage;

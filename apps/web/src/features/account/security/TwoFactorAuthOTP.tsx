// import { Controller, useFormContext } from 'react-hook-form';
import {
  FormControl,
  //  Radio,
  //  RadioGroup,
  Typography,
  //  FormControlLabel
} from "@mui/material";

// import { TwoFAOtpLoginAlertFormValues } from './PrivacyProtectionTabPanel';

const TwoFactorAuthOTP = () => {
  // const { control } = useFormContext<TwoFAOtpLoginAlertFormValues>();

  return (
    <FormControl sx={{ gap: 2 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
        Set how you are going to receive OPT
      </Typography>
      {/*<Controller*/}
      {/*  name="otpMethod"*/}
      {/*  control={control}*/}
      {/*  render={({ field }) => (*/}
      {/*    <RadioGroup aria-labelledby="privacy-protection-2fa-radio-buttons" {...field}>*/}
      {/*      <FormControlLabel*/}
      {/*        value="send_text"*/}
      {/*        defaultChecked*/}
      {/*        control={<Radio />}*/}
      {/*        label="Send a text message to (***) ***-***78"*/}
      {/*      />*/}
      {/*      <FormControlLabel*/}
      {/*        value="send_email"*/}
      {/*        control={<Radio />}*/}
      {/*        label="Send an email to *****hing@email.com"*/}
      {/*      />*/}
      {/*    </RadioGroup>*/}
      {/*  )}*/}
      {/*/>*/}
    </FormControl>
  );
};

export default TwoFactorAuthOTP;

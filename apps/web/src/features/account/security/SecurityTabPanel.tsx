// import { useForm, FormProvider, SubmitHandler } from 'react-hook-form';
// import {
//   Form,
// //  useAppForm,
// //  formOptionsWithSubmitEffect
// } from "@beep/ui/form";
import { Button, Divider, Link, Stack, Typography } from "@mui/material";
// import { useSnackbar } from 'notistack';
// import { toast } from "@beep/ui/molecules";
import { AccountTabPanelSection } from "../common/AccountTabPanelSection";
import AlternateLoginMethod from "./AlternateLoginMethod";
import ChangePassword from "./ChangePassword";
import ConnectedDevice from "./ConnectedDevice";
import { connectedDevices, loggedInDevices } from "./data";
import LoggedDevice from "./LoggedDevice";
// import LoginAlerts from './LoginAlerts';
import TwoFactorAuthOTP from "./TwoFactorAuthOTP";

export interface TwoFAOtpLoginAlertFormValues {
  otpMethod: "send_text" | "send_email";
  email_alert: boolean;
  text_message_alert: boolean;
}

export const SecurityTabPanel = () => {
  // const methods = useForm<TwoFAOtpLoginAlertFormValues>({
  //   defaultValues: {
  //     otpMethod: 'send_text',
  //     email_alert: true,
  //     text_message_alert: false,
  //   },
  // });
  // const { enqueueSnackbar } = useSnackbar();

  // const { handleSubmit, reset } = methods;

  // const onSubmit: SubmitHandler<TwoFAOtpLoginAlertFormValues> = (data) => {
  //   console.log(data);
  //   enqueueSnackbar('Updated successfully!', { variant: 'success', autoHideDuration: 3000 });
  // };

  return (
    <>
      <Stack direction="column" divider={<Divider />} spacing={5} mt={2}>
        <AccountTabPanelSection
          title="Password Modification"
          subtitle="Update your password regularly to enhance account security. Ensure your new password is strong and unique."
          icon="material-symbols:key-outline"
        >
          <ChangePassword />
        </AccountTabPanelSection>

        <AccountTabPanelSection
          title="Two Factor Authentication"
          subtitleEl={
            <>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                We will ask for OTP whenever we detect login from an unrecognised device.
              </Typography>
              <Typography component={Link} href="#!" variant="body2" sx={{ display: "inline-block", mb: 3 }}>
                Click here to turn off two factor authentication
              </Typography>
            </>
          }
          icon="material-symbols:lock-outline"
        >
          <TwoFactorAuthOTP />
        </AccountTabPanelSection>

        <AccountTabPanelSection
          title="Alternate Login Method"
          subtitle="Set up different alternate methods if you somehow lose your email or password."
          icon="material-symbols:lock-outline"
        >
          <Stack direction="column" spacing={2}>
            <AlternateLoginMethod />
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              You are connected in the following devices
            </Typography>
            {connectedDevices.map((device) => (
              <ConnectedDevice key={device.deviceName} connectedDevice={device} />
            ))}
          </Stack>
        </AccountTabPanelSection>

        <AccountTabPanelSection
          title="Recognized Devices"
          subtitle="Review a list of devices in which you won't have to use a login code."
          icon="material-symbols:devices-outline-rounded"
        >
          <Stack direction="column" spacing={2}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              You are logged in the following devices
            </Typography>
            {loggedInDevices.map((device) => (
              <LoggedDevice key={device.name} loggedInDevice={device} />
            ))}
          </Stack>
        </AccountTabPanelSection>

        <AccountTabPanelSection
          title="Login Alerts"
          subtitle="Set how we are going to send you an alert if there is an unrecognised login attempt."
          icon="material-symbols:notifications-outline-rounded"
        >
          {/*<LoginAlerts />*/}
          <Stack justifyContent="flex-end" spacing={1}>
            <Button
              variant="soft"
              color="neutral"
              onClick={() => {
                // reset()
              }}
            >
              Discard
            </Button>
            <Button
              variant="contained"
              //  onClick={handleSubmit(onSubmit)}
            >
              Confirm
            </Button>
          </Stack>
        </AccountTabPanelSection>
      </Stack>
    </>
  );
};

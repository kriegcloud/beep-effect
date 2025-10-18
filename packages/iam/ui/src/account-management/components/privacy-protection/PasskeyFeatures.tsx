import { FormControl, FormControlLabel, Stack, Switch, Typography } from "@mui/material";

export const PasskeyFeatures = () => {
  return (
    <Stack direction="column" spacing={3}>
      <FormControl component="fieldset" variant="standard" sx={{ gap: 2, alignItems: "flex-start" }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          Manage Touch ID Features
        </Typography>
        <FormControlLabel
          control={<Switch defaultChecked />}
          label="Use Touch ID to unlock your login page"
          sx={{ gap: 2, ml: 0 }}
        />
        <FormControlLabel
          control={<Switch defaultChecked />}
          label="Use Touch ID for online payment"
          sx={{ gap: 2, ml: 0 }}
        />
        <FormControlLabel
          control={<Switch defaultChecked />}
          label="Use Touch ID for Autofilling passwords"
          sx={{ gap: 2, ml: 0 }}
        />
        <FormControlLabel control={<Switch />} label="Use Touch ID for fast user switching" sx={{ gap: 2, ml: 0 }} />
      </FormControl>
    </Stack>
  );
};

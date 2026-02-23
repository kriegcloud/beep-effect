import { FormControl, Typography } from "@mui/material";

const TwoFactorAuthOTP = () => {
  return (
    <FormControl sx={{ gap: 2 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
        Set how you are going to receive OPT
      </Typography>
    </FormControl>
  );
};

export default TwoFactorAuthOTP;

import { Iconify, Label } from "@beep/ui/atoms";
import type { BoxProps } from "@mui/material/Box";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";

// ----------------------------------------------------------------------

export function PaymentSummary({ sx, ...other }: BoxProps) {
  const renderPrice = () => (
    <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
      <Typography variant="h4">$</Typography>

      <Typography variant="h2">9.99</Typography>

      <Typography
        component="span"
        sx={{
          ml: 1,
          alignSelf: "center",
          typography: "body2",
          color: "text.disabled",
        }}
      >
        / mo
      </Typography>
    </Box>
  );

  return (
    <Box
      sx={[
        () => ({
          p: 5,
          borderRadius: 2,
          bgcolor: "background.neutral",
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <Typography variant="h6" sx={{ mb: 5 }}>
        Summary
      </Typography>

      <Stack spacing={2.5}>
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Subscription
          </Typography>

          <Label color="error">PREMIUM</Label>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Billed monthly
          </Typography>
          <Switch
            defaultChecked
            slotProps={{
              input: {
                id: "monthly-billed-switch",
                "aria-label": "Monthly billed switch",
              },
            }}
          />
        </Box>

        {renderPrice()}

        <Divider sx={{ borderStyle: "dashed" }} />

        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="subtitle1">Total billed</Typography>

          <Typography variant="subtitle1">$9.99*</Typography>
        </Box>

        <Divider sx={{ borderStyle: "dashed" }} />
      </Stack>

      <Typography component="div" variant="caption" sx={{ color: "text.secondary", mt: 1 }}>
        * Plus applicable taxes
      </Typography>

      <Button fullWidth size="large" variant="contained" sx={{ mt: 5, mb: 3 }}>
        Upgrade plan
      </Button>

      <Stack alignItems="center" spacing={1}>
        <Box sx={{ gap: 1, display: "flex", alignItems: "center" }}>
          <Iconify icon="solar:shield-check-bold" sx={{ color: "success.main" }} />
          <Typography variant="subtitle2">Secure credit card payment</Typography>
        </Box>

        <Typography variant="caption" sx={{ color: "text.disabled", textAlign: "center" }}>
          This is a secure 128-bit SSL encrypted payment
        </Typography>
      </Stack>
    </Box>
  );
}

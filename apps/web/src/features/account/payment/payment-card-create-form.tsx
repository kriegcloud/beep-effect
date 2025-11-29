import { Iconify } from "@beep/ui/atoms";
import { useBoolean } from "@beep/ui/hooks";
import type { BoxProps } from "@mui/material/Box";

import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import type { TextFieldProps } from "@mui/material/TextField";
import TextField from "@mui/material/TextField";

// ----------------------------------------------------------------------

type PaymentCardCreateFormProps = BoxProps & {
  readonly isRHF?: boolean | undefined;
  readonly numberField?: (TextFieldProps & { name: string }) | undefined;
  readonly holderField?: (TextFieldProps & { name: string }) | undefined;
  readonly dateField?: (TextFieldProps & { name: string }) | undefined;
  readonly cvvField?: (TextFieldProps & { name: string }) | undefined;
};

export function PaymentCardCreateForm({
  sx,
  isRHF,
  cvvField,
  dateField,
  numberField,
  holderField,
  ...other
}: PaymentCardCreateFormProps) {
  const showPassword = useBoolean();

  return (
    <Box
      sx={[
        {
          gap: 2.5,
          width: 1,
          display: "flex",
          flexDirection: "column",
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <TextField
        label="Card number"
        placeholder="xxxx xxxx xxxx xxxx"
        slotProps={{ inputLabel: { shrink: true } }}
        {...numberField}
        name={numberField?.name ?? ""}
      />
      <TextField
        label="Card holder"
        placeholder="John Doe"
        slotProps={{ inputLabel: { shrink: true } }}
        {...holderField}
        name={holderField?.name ?? ""}
      />
      <Box sx={{ gap: 2, display: "flex" }}>
        <TextField
          fullWidth
          label="Expiration date"
          placeholder="MM/YY"
          slotProps={{ inputLabel: { shrink: true } }}
          {...dateField}
          name={dateField?.name ?? ""}
        />
        <TextField
          fullWidth
          label="CVV/CVC"
          placeholder="***"
          slotProps={{
            inputLabel: { shrink: true },
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={showPassword.onToggle} edge="end">
                    <Iconify icon={showPassword.value ? "solar:eye-bold" : "solar:eye-closed-bold"} />
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
          type={showPassword.value ? "text" : "password"}
          {...cvvField}
          name={cvvField?.name ?? ""}
        />
      </Box>

      <Box
        sx={{
          gap: 1,
          display: "flex",
          alignItems: "center",
          typography: "caption",
          color: "text.disabled",
        }}
      >
        <Iconify icon="solar:lock-password-outline" />
        Your transaction is secured with SSL encryption
      </Box>
    </Box>
  );
}

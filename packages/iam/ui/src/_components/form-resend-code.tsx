import type { BoxProps } from "@mui/material/Box";

import Box from "@mui/material/Box";
import Link from "@mui/material/Link";

type FormResendCodeProps = BoxProps & {
  value?: number;
  disabled?: boolean;
  onResendCode?: () => void;
};

export function FormResendCode({ value, disabled, onResendCode, sx, ...other }: FormResendCodeProps) {
  return (
    <Box
      sx={[
        () => ({
          mt: 3,
          typography: "body2",
          alignSelf: "center",
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      {`Don’t have a code? `}
      <Link
        variant="subtitle2"
        onClick={onResendCode}
        sx={{
          cursor: "pointer",
          ...(disabled && { color: "text.disabled", pointerEvents: "none" }),
        }}
      >
        Resend {disabled && value && value > 0 && `(${value}s)`}
      </Link>
    </Box>
  );
}

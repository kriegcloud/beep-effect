import type { BoxProps } from "@mui/material/Box";
import Box from "@mui/material/Box";

export function Privacy({ sx, ...other }: BoxProps) {
  return (
    <Box
      component="span"
      sx={[
        () => ({
          mt: 3,
          display: "block",
          textAlign: "center",
          typography: "caption",
          color: "text.secondary",
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      Privacy Policy
    </Box>
  );
}

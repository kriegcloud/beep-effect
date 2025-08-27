import type { FormHelperTextProps } from "@mui/material/FormHelperText";

import FormHelperText from "@mui/material/FormHelperText";
import type React from "react";

export type HelperTextProps = FormHelperTextProps & {
  errorMessage?: string;
  disableGutters?: boolean;
  helperText?: React.ReactNode;
};

export function HelperText({ sx, helperText, errorMessage, disableGutters, ...other }: HelperTextProps) {
  if (errorMessage || helperText) {
    return (
      <FormHelperText
        error={!!errorMessage}
        sx={[
          {
            mx: disableGutters ? 0 : 1.75,
          },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
        {...other}
      >
        {errorMessage || helperText}
      </FormHelperText>
    );
  }

  return null;
}

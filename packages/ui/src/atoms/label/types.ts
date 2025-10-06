import type { SxProps, Theme } from "@mui/material/styles";
import type React from "react";

export type LabelColor = "default" | "primary" | "secondary" | "info" | "success" | "warning" | "error";

export type LabelVariant = "filled" | "outlined" | "soft" | "inverted";

export interface LabelProps extends React.ComponentProps<"span"> {
  sx?: SxProps<Theme>;
  disabled?: boolean | undefined;
  color?: LabelColor | undefined;
  variant?: LabelVariant | undefined;
  endIcon?: React.ReactNode | undefined;
  startIcon?: React.ReactNode | undefined;
}

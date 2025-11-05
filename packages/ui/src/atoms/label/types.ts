import type { SxProps, Theme } from "@mui/material/styles";
import type React from "react";

export type LabelColor = "default" | "primary" | "secondary" | "info" | "success" | "warning" | "error";

export type LabelVariant = "filled" | "outlined" | "soft" | "inverted";

export interface LabelProps extends React.ComponentProps<"span"> {
  readonly sx?: SxProps<Theme> | undefined;
  readonly disabled?: boolean | undefined;
  readonly color?: LabelColor | undefined;
  readonly variant?: LabelVariant | undefined;
  readonly endIcon?: React.ReactNode | undefined;
  readonly startIcon?: React.ReactNode | undefined;
}

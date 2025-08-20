import type { SxProps, Theme } from "@mui/material/styles";
import type React from "react";

export type SvgColorProps = React.ComponentProps<"span"> & {
  src: string;
  sx?: SxProps<Theme> | undefined;
};

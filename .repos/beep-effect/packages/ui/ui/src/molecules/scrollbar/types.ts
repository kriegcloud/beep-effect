import type { SxProps, Theme } from "@mui/material/styles";
import type * as React from "react";
import type { SimpleBarProps } from "../simple-bar";

export type ScrollbarProps = SimpleBarProps &
  React.ComponentProps<"div"> & {
    sx?: SxProps<Theme> | undefined;
    fillContent?: boolean | undefined;
    slotProps?:
      | {
          wrapperSx?: SxProps<Theme> | undefined;
          contentSx?: SxProps<Theme> | undefined;
          contentWrapperSx?: SxProps<Theme> | undefined;
        }
      | undefined;
  };

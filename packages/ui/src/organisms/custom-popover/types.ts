import type { PaperProps } from "@mui/material/Paper";
import type { PopoverProps } from "@mui/material/Popover";
import type { SxProps, Theme } from "@mui/material/styles";

// ----------------------------------------------------------------------

export type ArrowPlacement =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right"
  | "left-top"
  | "left-center"
  | "left-bottom"
  | "right-top"
  | "right-center"
  | "right-bottom";

export type ArrowProps = {
  hide?: boolean;
  size?: number;
  sx?: SxProps<Theme>;
  placement?: ArrowPlacement;
};

export type PaperOffset = [number, number];

export type CustomPopoverProps = PopoverProps & {
  slotProps?: PopoverProps["slotProps"] & {
    arrow?: ArrowProps;
    paper?: PaperProps & {
      offset?: PaperOffset;
    };
  };
};

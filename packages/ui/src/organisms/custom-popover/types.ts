import type { PaperProps } from "@mui/material/Paper";
import type { PopoverProps } from "@mui/material/Popover";
import type { SxProps, Theme } from "@mui/material/styles";

export type PopoverArrow = {
  hide?: boolean;
  size?: number;
  offset?: number;
  sx?: SxProps<Theme>;
  placement?:
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
};

export type CustomPopoverProps = PopoverProps & {
  slotProps?: PopoverProps["slotProps"] & {
    arrow?: PopoverArrow;
    paper?: PaperProps;
  };
};

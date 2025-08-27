import type { ButtonBaseProps } from "@mui/material/ButtonBase";
import type { IconButtonProps } from "@mui/material/IconButton";
import type { SxProps, Theme } from "@mui/material/styles";
import type { TooltipProps } from "@mui/material/Tooltip";

export interface ExtendFile extends File {
  path?: string | undefined;
  preview?: string | undefined;
  lastModifiedDate?: Date | undefined;
}

export type FileThumbnailProps = React.ComponentProps<"div"> & {
  tooltip?: boolean | undefined;
  file: File | string;
  imageView?: boolean | undefined;
  sx?: SxProps<Theme> | undefined;
  onDownload?: (() => void) | undefined;
  onRemove?: (() => void) | undefined;
  slotProps?:
    | undefined
    | {
        tooltip?: TooltipProps | undefined;
        removeBtn?: IconButtonProps | undefined;
        downloadBtn?: ButtonBaseProps | undefined;
        img?: (React.ComponentProps<"img"> & { sx?: SxProps<Theme> }) | undefined;
        icon?: (React.ComponentProps<"img"> & { sx?: SxProps<Theme> }) | undefined;
      };
};

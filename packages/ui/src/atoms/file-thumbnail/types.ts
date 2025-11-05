import type { TooltipProps } from "@mui/material/Tooltip";
import type { DownloadButton, RemoveButton, ThumbnailImage, ThumbnailRoot } from "./styles";

export type FileThumbnailProps = React.ComponentProps<typeof ThumbnailRoot> & {
  readonly tooltip?: boolean | undefined;
  readonly showImage?: boolean | undefined;
  readonly previewUrl?: string | undefined;
  readonly file?: File | string | null | undefined;
  readonly onDownload?: (() => void) | undefined;
  readonly onRemove?: (() => void) | undefined;
  readonly slotProps?: {
    readonly tooltip?: TooltipProps | undefined;
    readonly img?: React.ComponentProps<typeof ThumbnailImage> | undefined;
    readonly icon?: React.ComponentProps<typeof ThumbnailImage> | undefined;
    readonly removeBtn?: React.ComponentProps<typeof RemoveButton> | undefined;
    readonly downloadBtn?: React.ComponentProps<typeof DownloadButton> | undefined;
  };
};

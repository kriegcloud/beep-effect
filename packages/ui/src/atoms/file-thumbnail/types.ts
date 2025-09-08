import type { TooltipProps } from "@mui/material/Tooltip";
import type { DownloadButton, RemoveButton, ThumbnailImage, ThumbnailRoot } from "./styles";

// ----------------------------------------------------------------------

export type FileThumbnailProps = React.ComponentProps<typeof ThumbnailRoot> & {
  tooltip?: boolean;
  showImage?: boolean;
  previewUrl?: string;
  file?: File | string | null;
  onDownload?: () => void;
  onRemove?: () => void;
  slotProps?: {
    tooltip?: TooltipProps;
    img?: React.ComponentProps<typeof ThumbnailImage>;
    icon?: React.ComponentProps<typeof ThumbnailImage>;
    removeBtn?: React.ComponentProps<typeof RemoveButton>;
    downloadBtn?: React.ComponentProps<typeof DownloadButton>;
  };
};

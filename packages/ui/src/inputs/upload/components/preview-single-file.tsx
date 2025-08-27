import { Iconify } from "@beep/ui/atoms";
import { mergeClasses, rgbaFromChannel } from "@beep/ui/utils";
import type { IconButtonProps } from "@mui/material/IconButton";
import IconButton from "@mui/material/IconButton";
import { styled } from "@mui/material/styles";
import { uploadClasses } from "../classes";

import type { SingleFilePreviewProps } from "../types";

export function SingleFilePreview({ file, sx, className, ...other }: SingleFilePreviewProps) {
  const fileName = typeof file === "string" ? file : file.name;

  const previewUrl = typeof file === "string" ? file : URL.createObjectURL(file);

  return (
    <PreviewRoot className={mergeClasses([uploadClasses.uploadSinglePreview, className])} sx={sx} {...other}>
      {/* biome-ignore lint/performance/noImgElement: UI library component - preview images don't need Next.js optimization */}
      <img alt={fileName} src={previewUrl} />
    </PreviewRoot>
  );
}

const PreviewRoot = styled("div")(({ theme }) => ({
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  position: "absolute",
  padding: theme.spacing(1),
  "& > img": {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    borderRadius: Number(theme.shape.borderRadius),
  },
}));

export function DeleteButton({ sx, ...other }: IconButtonProps) {
  return (
    <IconButton
      size="small"
      sx={[
        (theme) => ({
          top: 16,
          right: 16,
          zIndex: 9,
          position: "absolute",
          color: rgbaFromChannel(theme.vars.palette.common.whiteChannel, 0.8),
          bgcolor: rgbaFromChannel(theme.vars.palette.grey["900Channel"], 0.72),
          "&:hover": {
            bgcolor: rgbaFromChannel(theme.vars.palette.grey["900Channel"], 0.48),
          },
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <Iconify icon="mingcute:close-line" width={18} />
    </IconButton>
  );
}

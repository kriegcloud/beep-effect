import { rgbaFromChannel } from "@beep/ui-core/utils";
import ButtonBase from "@mui/material/ButtonBase";
import IconButton from "@mui/material/IconButton";
import { styled } from "@mui/material/styles";
import type { FileThumbnailProps } from "./types";

export const ThumbnailRoot = styled("span")(({ theme }) => ({
  width: 36,
  height: 36,
  flexShrink: 0,
  alignItems: "center",
  position: "relative",
  display: "inline-flex",
  justifyContent: "center",
  borderRadius: Number(theme.shape.borderRadius) * 1.25,
}));

export const ThumbnailImage = styled("img", {
  shouldForwardProp: (prop: string) => !["showImage", "sx"].includes(prop),
})<Pick<FileThumbnailProps, "showImage">>({
  width: "100%",
  height: "100%",
  variants: [
    {
      props: (props) => !!props.showImage,
      style: {
        objectFit: "cover",
        borderRadius: "inherit",
      },
    },
  ],
});

export const RemoveButton = styled(IconButton)(({ theme }) => ({
  top: 4,
  right: 4,
  position: "absolute",
  padding: theme.spacing(0.5),
  color: theme.vars.palette.common.white,
  backgroundColor: rgbaFromChannel(theme.vars.palette.grey["900Channel"], 0.48),
  "&:hover": {
    backgroundColor: rgbaFromChannel(theme.vars.palette.grey["900Channel"], 0.72),
  },
}));

export const DownloadButton = styled(ButtonBase)(({ theme }) => ({
  top: 0,
  right: 0,
  zIndex: 9,
  padding: 0,
  opacity: 0,
  width: "100%",
  height: "100%",
  position: "absolute",
  borderRadius: "inherit",
  color: theme.vars.palette.common.white,
  transition: theme.transitions.create(["opacity"]),
  "&:hover": {
    ...theme.mixins.bgBlur({
      color: rgbaFromChannel(theme.vars.palette.grey["900Channel"], 0.64),
    }),
    opacity: 1,
  },
}));

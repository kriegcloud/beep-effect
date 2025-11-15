import { rgbaFromChannel } from "@beep/ui-core/utils";
import IconButton from "@mui/material/IconButton";
import { styled } from "@mui/material/styles";

import { uploadClasses } from "../classes";

export const UploadWrapper = styled("div")({
  width: "100%",
  position: "relative",
});

export const UploadArea = styled("div")(({ theme }) => ({
  minHeight: 280,
  outline: "none",
  display: "flex",
  cursor: "pointer",
  overflow: "hidden",
  position: "relative",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  transition: theme.transitions.create(["opacity"]),
  backgroundColor: rgbaFromChannel(theme.vars.palette.grey["500Channel"], 0.08),
  border: `1px dashed ${rgbaFromChannel(theme.vars.palette.grey["500Channel"], 0.2)}`,
  "&:hover": {
    opacity: 0.72,
  },
  [`&.${uploadClasses.state.dragActive}`]: {
    opacity: 0.72,
  },
  [`&.${uploadClasses.state.disabled}`]: {
    opacity: 0.48,
    pointerEvents: "none",
  },
  [`&.${uploadClasses.state.error}`]: {
    color: theme.vars.palette.error.main,
    borderColor: theme.vars.palette.error.main,
    backgroundColor: rgbaFromChannel(theme.vars.palette.error.mainChannel, 0.08),
  },
}));

export const PlaceholderContainer = styled("div")(({ theme }) => ({
  width: "100%",
  display: "flex",
  alignItems: "center",
  flexDirection: "column",
  justifyContent: "center",
  [`& .${uploadClasses.placeholder.content}`]: {
    display: "flex",
    textAlign: "center",
    flexDirection: "column",
    gap: theme.spacing(1),
  },
  [`& .${uploadClasses.placeholder.title}`]: {
    ...theme.typography.h6,
  },
  [`& .${uploadClasses.placeholder.description}`]: {
    ...theme.typography.body2,
    color: theme.vars.palette.text.secondary,
    "& span": {
      textDecoration: "underline",
      color: theme.vars.palette.primary.main,
    },
  },
}));

export const DeleteButton = styled(IconButton)(({ theme }) => ({
  top: 16,
  right: 16,
  zIndex: 9,
  position: "absolute",
  color: rgbaFromChannel(theme.vars.palette.common.whiteChannel, 0.8),
  backgroundColor: rgbaFromChannel(theme.vars.palette.grey["900Channel"], 0.72),
  "&:hover": {
    backgroundColor: rgbaFromChannel(theme.vars.palette.grey["900Channel"], 0.48),
  },
}));

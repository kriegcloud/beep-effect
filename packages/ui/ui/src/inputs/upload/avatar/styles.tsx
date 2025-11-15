import { rgbaFromChannel } from "@beep/ui-core/utils";

import { styled } from "@mui/material/styles";

import { uploadClasses } from "../classes";

export const UploadWrapper = styled("div")({
  width: "100%",
  position: "relative",
});

export const UploadArea = styled("div")(({ theme }) => ({
  width: 144,
  height: 144,
  margin: "auto",
  cursor: "pointer",
  borderRadius: "50%",
  position: "relative",
  padding: theme.spacing(1),
  border: `1px dashed ${rgbaFromChannel(theme.vars.palette.grey["500Channel"], 0.2)}`,
  [`&.${uploadClasses.state.dragActive}`]: {
    opacity: 0.72,
  },
  [`&.${uploadClasses.state.disabled}`]: {
    opacity: 0.48,
    pointerEvents: "none",
  },
  [`&.${uploadClasses.state.error}`]: {
    borderColor: theme.vars.palette.error.main,
    [`& .${uploadClasses.placeholder.root}`]: {
      color: theme.vars.palette.error.main,
      backgroundColor: rgbaFromChannel(theme.vars.palette.error.mainChannel, 0.08),
    },
    [`&.${uploadClasses.state.hasFile}`]: {
      backgroundColor: rgbaFromChannel(theme.vars.palette.error.mainChannel, 0.08),
    },
  },
  [`&.${uploadClasses.state.hasFile}`]: {
    [`& .${uploadClasses.placeholder.root}`]: {
      opacity: 0,
      color: theme.vars.palette.common.white,
      backgroundColor: rgbaFromChannel(theme.vars.palette.grey["900Channel"], 0.64),
    },
    [`&:hover .${uploadClasses.placeholder.root}`]: {
      opacity: 1,
    },
  },
}));

export const UploadContent = styled("div")({
  width: "100%",
  height: "100%",
  position: "relative",
  borderRadius: "inherit",
});

export const PreviewImage = styled("img")({
  width: "100%",
  height: "100%",
  objectFit: "cover",
  borderRadius: "inherit",
});

export const PlaceholderContainer = styled("div")(({ theme }) => ({
  top: 0,
  left: 0,
  zIndex: 9,
  width: "100%",
  height: "100%",
  display: "flex",
  position: "absolute",
  alignItems: "center",
  borderRadius: "inherit",
  flexDirection: "column",
  justifyContent: "center",
  gap: theme.spacing(1),
  color: theme.vars.palette.text.disabled,
  backgroundColor: rgbaFromChannel(theme.vars.palette.grey["500Channel"], 0.08),
  transition: theme.transitions.create(["opacity"], {
    duration: theme.transitions.duration.shorter,
  }),
  "&:hover": {
    opacity: 0.72,
  },
}));

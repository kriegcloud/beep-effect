import { rgbaFromChannel } from "@beep/ui-core/utils";

import { styled } from "@mui/material/styles";

import { uploadClasses } from "../classes";

export const UploadArea = styled("div")(({ theme }) => ({
  width: 64,
  height: 64,
  flexShrink: 0,
  display: "flex",
  cursor: "pointer",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: theme.shape.borderRadius,
  color: theme.vars.palette.text.disabled,
  backgroundColor: rgbaFromChannel(theme.vars.palette.grey["500Channel"], 0.08),
  border: `dashed 1px ${rgbaFromChannel(theme.vars.palette.grey["500Channel"], 0.2)}`,
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

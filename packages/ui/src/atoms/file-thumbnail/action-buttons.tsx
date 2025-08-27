import type { ButtonBaseProps } from "@mui/material/ButtonBase";
import ButtonBase from "@mui/material/ButtonBase";
import type { IconButtonProps } from "@mui/material/IconButton";
import IconButton from "@mui/material/IconButton";
import { rgbaFromChannel } from "../../utils";

import { Iconify } from "../iconify";

export function DownloadButton({ sx, ...other }: ButtonBaseProps) {
  return (
    <ButtonBase
      sx={[
        (theme) => ({
          p: 0,
          top: 0,
          right: 0,
          width: 1,
          height: 1,
          zIndex: 9,
          opacity: 0,
          position: "absolute",
          color: "common.white",
          borderRadius: "inherit",
          transition: theme.transitions.create(["opacity"]),
          "&:hover": {
            ...theme.mixins.bgBlur({
              color: rgbaFromChannel(theme.vars.palette.grey["900Channel"], 0.64),
            }),
            opacity: 1,
          },
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <Iconify width={24} icon="eva:cloud-download-fill" />
    </ButtonBase>
  );
}

export function RemoveButton({ sx, ...other }: IconButtonProps) {
  return (
    <IconButton
      size="small"
      sx={[
        (theme) => ({
          p: 0.35,
          top: 4,
          right: 4,
          position: "absolute",
          color: "common.white",
          bgcolor: rgbaFromChannel(theme.vars.palette.grey["900Channel"], 0.48),
          "&:hover": {
            bgcolor: rgbaFromChannel(theme.vars.palette.grey["900Channel"], 0.72),
          },
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <Iconify icon="mingcute:close-line" width={12} />
    </IconButton>
  );
}

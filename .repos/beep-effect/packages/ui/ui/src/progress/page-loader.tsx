"use client";

import { cssVarRgba } from "@beep/ui-core/utils";
import type { StackOwnProps } from "@mui/material";
import { Box, CircularProgress, Stack } from "@mui/material";

export const PageLoader = (props: StackOwnProps) => {
  return (
    <Stack
      {...props}
      sx={[
        {
          alignItems: "center",
          justifyContent: "center",
          height: 1,
          flex: 1,
        },
        ...(Array.isArray(props.sx) ? props.sx : [props.sx]),
      ]}
    >
      <Box sx={{ position: "relative" }}>
        <CircularProgress
          variant="determinate"
          value={100}
          sx={(theme) => ({
            color: cssVarRgba(theme.vars.palette.primary.mainChannel, 0.1),
          })}
          size={74}
          thickness={4}
        />
        <CircularProgress
          size={74}
          sx={(theme) => ({
            position: "absolute",
            left: 0,
            color: cssVarRgba(theme.vars.palette.primary.mainChannel, 0.6),
          })}
        />
      </Box>
    </Stack>
  );
};

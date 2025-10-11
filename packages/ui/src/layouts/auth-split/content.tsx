"use client";

import { mergeClasses } from "@beep/ui-core/utils";
import type { BoxProps } from "@mui/material/Box";
import Box from "@mui/material/Box";
import type { Breakpoint } from "@mui/material/styles";

import { layoutClasses } from "../core";

// ----------------------------------------------------------------------

export type AuthSplitContentProps = BoxProps & { layoutQuery?: Breakpoint };

export function AuthSplitContent({ sx, children, className, layoutQuery = "md", ...other }: AuthSplitContentProps) {
  return (
    <Box
      className={mergeClasses([layoutClasses.content, className])}
      sx={[
        (theme) => ({
          display: "flex",
          flex: "1 1 auto",
          alignItems: "center",
          flexDirection: "column",
          p: theme.spacing(3, 2, 10, 2),
          [theme.breakpoints.up(layoutQuery)]: {
            justifyContent: "center",
            p: theme.spacing(10, 2, 10, 2),
          },
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <Box
        sx={{
          width: 1,
          display: "flex",
          flexDirection: "column",
          maxWidth: "var(--layout-auth-content-width)",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

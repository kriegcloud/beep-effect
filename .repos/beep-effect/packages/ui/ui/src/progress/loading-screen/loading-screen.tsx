"use client";

import LinearProgress from "@mui/material/LinearProgress";
import Portal from "@mui/material/Portal";
import type { SxProps, Theme } from "@mui/material/styles";
import { styled } from "@mui/material/styles";
import type React from "react";
import { Fragment } from "react";

export type LoadingScreenProps = React.ComponentProps<"div"> & {
  portal?: boolean | undefined;
  sx?: SxProps<Theme> | undefined;
};

export function LoadingScreen({ portal, sx, ...other }: LoadingScreenProps) {
  const PortalWrapper = portal ? Portal : Fragment;

  return (
    <PortalWrapper>
      <LoadingContent {...(sx ? { sx } : {})} {...other}>
        <LinearProgress color="inherit" sx={{ width: 1, maxWidth: 360 }} />
      </LoadingContent>
    </PortalWrapper>
  );
}

const LoadingContent = styled("div")(({ theme }) => ({
  flexGrow: 1,
  width: "100%",
  display: "flex",
  minHeight: "100%",
  alignItems: "center",
  justifyContent: "center",
  paddingLeft: theme.spacing(5),
  paddingRight: theme.spacing(5),
}));

"use client";

import Portal from "@mui/material/Portal";
import type { SxProps, Theme } from "@mui/material/styles";
import { styled } from "@mui/material/styles";
import type React from "react";
import { Fragment } from "react";

import { AnimateLogoZoom } from "../../animate";

export type SplashScreenProps = React.ComponentProps<"div"> & {
  portal?: boolean | undefined;
  sx?: SxProps<Theme> | undefined;
  slotProps?:
    | {
        wrapper?: React.ComponentProps<typeof LoadingWrapper> | undefined;
      }
    | undefined;
};

export function SplashScreen({
  portal = true,
  slotProps,
  sx,
  ...other
}: SplashScreenProps) {
  const PortalWrapper = portal ? Portal : Fragment;

  return (
    <PortalWrapper>
      <LoadingWrapper {...slotProps?.wrapper}>
        <LoadingContent {...(sx ? { sx } : {})} {...other}>
          <AnimateLogoZoom />
        </LoadingContent>
      </LoadingWrapper>
    </PortalWrapper>
  );
}

const LoadingWrapper = styled("div")({
  flexGrow: 1,
  display: "flex",
  flexDirection: "column",
});

const LoadingContent = styled("div")(({ theme }) => ({
  right: 0,
  bottom: 0,
  zIndex: 9998,
  flexGrow: 1,
  width: "100%",
  height: "100%",
  display: "flex",
  position: "fixed",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: theme.vars.palette.background.default,
}));

"use client";

import Box, { type BoxProps } from "@mui/material/Box";
import type { Theme } from "@mui/material/styles";
import { alpha, keyframes, styled } from "@mui/material/styles";
import type { PropsWithChildren } from "react";

const backdropFadeIn = keyframes`
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
`;

const glowPulse = keyframes`
  0% {
    opacity: 0.15;
  }
  50% {
    opacity: 0.25;
  }
  100% {
    opacity: 0.15;
  }
`;

const createCenteredGlow = (theme: Theme) => {
  const isDark = theme.palette.mode === "dark";
  return isDark
    ? `radial-gradient(ellipse 80% 60% at 50% 50%,
        rgba(100, 150, 255, 0.18) 0%,
        rgba(80, 120, 200, 0.10) 30%,
        rgba(60, 90, 150, 0.04) 55%,
        transparent 75%)`
    : `radial-gradient(ellipse 80% 60% at 50% 50%,
        ${alpha(theme.palette.primary.light, 0.22)} 0%,
        ${alpha(theme.palette.primary.main, 0.12)} 30%,
        ${alpha(theme.palette.primary.dark, 0.05)} 55%,
        transparent 75%)`;
};

const Root = styled(Box)(({ theme }) => {
  const isDark = theme.palette.mode === "dark";
  const backgroundColor = isDark ? "#17191c" : alpha(theme.palette.background.paper, 0.88);

  return {
    position: "relative",
    overflow: "hidden",
    isolation: "isolate",
    backgroundColor,
    boxShadow: "none",
  };
});

const GlowBackdrop = styled(Box)({
  position: "absolute",
  inset: 0,
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
  opacity: 0,
  animation: `${backdropFadeIn} 1200ms ease-out forwards`,
  zIndex: 1,
  "@media (prefers-reduced-motion: reduce)": {
    animation: "none",
    opacity: 1,
  },
});

const CenteredGlow = styled("div")(({ theme }) => ({
  position: "absolute",
  inset: 0,
  background: createCenteredGlow(theme),
  filter: "blur(80px)",
  opacity: 0.2,
  animation: `${backdropFadeIn} 1000ms ease-out forwards, ${glowPulse} 8s ease-in-out infinite`,
  animationDelay: "0ms, 1000ms",
  "@media (prefers-reduced-motion: reduce)": {
    animation: "none",
    opacity: 0.2,
  },
}));

const Content = styled(Box)({
  position: "absolute",
  inset: 0,
  zIndex: 2,
  display: "flex",
  flexDirection: "column",
});

export type GlowEffectPaperProps = PropsWithChildren<BoxProps>;

export const GlowEffectPaper = ({ children, sx, ...containerProps }: GlowEffectPaperProps) => {
  return (
    <Root {...(sx ? { sx } : {})} {...containerProps}>
      <GlowBackdrop aria-hidden="true">
        <CenteredGlow />
      </GlowBackdrop>
      <Content>{children}</Content>
    </Root>
  );
};

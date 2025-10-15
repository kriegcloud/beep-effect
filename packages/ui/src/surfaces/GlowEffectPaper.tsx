"use client";

import Box, { type BoxProps } from "@mui/material/Box";
import { alpha, keyframes, styled, type Theme } from "@mui/material/styles";
import type { PropsWithChildren } from "react";

const backdropFadeIn = keyframes`
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
`;

const haloPulse = keyframes`
  0% {
    opacity: 0.28;
    transform: scale(0.96);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.02);
  }
  100% {
    opacity: 0.28;
    transform: scale(0.96);
  }
`;

const floatPrimary = keyframes`
  0% {
    transform: translate(-52%, -10%) rotate(12deg) scale(1);
  }
  40% {
    transform: translate(-50%, 8%) rotate(72deg) scale(1.06);
  }
  70% {
    transform: translate(-58%, -4%) rotate(128deg) scale(1.02);
  }
  100% {
    transform: translate(-52%, -10%) rotate(192deg) scale(1);
  }
`;

const floatSecondary = keyframes`
  0% {
    transform: translate(-28%, 6%) rotate(-24deg) scale(1);
  }
  45% {
    transform: translate(-32%, 22%) rotate(18deg) scale(1.08);
  }
  85% {
    transform: translate(-22%, 12%) rotate(-42deg) scale(0.96);
  }
  100% {
    transform: translate(-28%, 6%) rotate(-24deg) scale(1);
  }
`;

const floatAccent = keyframes`
  0% {
    transform: translate(28%, 24%) rotate(16deg) scale(0.98);
  }
  50% {
    transform: translate(32%, 8%) rotate(-28deg) scale(1.08);
  }
  100% {
    transform: translate(28%, 24%) rotate(16deg) scale(0.98);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

const createPrimaryGlow = (theme: Theme) => {
  const isDark = theme.palette.mode === "dark";
  return `radial-gradient(120% 120% at 50% 50%, ${alpha(
    theme.palette.primary.main,
    isDark ? 0.55 : 0.48
  )} 0%, ${alpha(theme.palette.primary.light, isDark ? 0.22 : 0.32)} 32%, ${alpha(
    theme.palette.primary.light,
    isDark ? 0.05 : 0.12
  )} 58%, transparent 78%)`;
};

const createSecondaryGlow = (theme: Theme) => {
  const isDark = theme.palette.mode === "dark";
  return `radial-gradient(120% 120% at 50% 50%, ${alpha(
    theme.palette.primary.light,
    isDark ? 0.35 : 0.3
  )} 0%, ${alpha(theme.palette.primary.main, isDark ? 0.18 : 0.22)} 28%, ${alpha(
    theme.palette.primary.main,
    isDark ? 0.05 : 0.08
  )} 56%, transparent 78%)`;
};

const createAccentGlow = (theme: Theme) => {
  const isDark = theme.palette.mode === "dark";
  return `radial-gradient(120% 120% at 50% 40%, ${alpha(
    theme.palette.primary.light,
    isDark ? 0.34 : 0.5
  )} 0%, ${alpha(theme.palette.primary.main, isDark ? 0.2 : 0.26)} 36%, ${alpha(
    theme.palette.primary.light,
    isDark ? 0.04 : 0.06
  )} 60%, transparent 80%)`;
};

const Root = styled(Box)(({ theme }) => {
  const isDark = theme.palette.mode === "dark";
  const backgroundColor = isDark ? "#03080A" : alpha(theme.palette.background.paper, 0.88);
  const secondaryLayer = isDark
    ? "none"
    : `radial-gradient(circle at 45% 8%, ${alpha(theme.palette.primary.light, 0.18)} 0%, transparent 55%), radial-gradient(circle at 60% 90%, ${alpha(theme.palette.primary.dark, 0.16)} 0%, transparent 62%)`;

  return {
    position: "relative",
    overflow: "hidden",
    isolation: "isolate",
    backgroundColor,
    backgroundImage: secondaryLayer,
    boxShadow: "none",
    "&::before": {
      content: '""',
      position: "absolute",
      inset: "-45%",
      borderRadius: "50%",
      background: `radial-gradient(circle, ${alpha(theme.palette.primary.dark, isDark ? 0.32 : 0.32)} 0%, ${alpha(
        theme.palette.primary.main,
        isDark ? 0.18 : 0.24
      )} 28%, transparent 70%)`,
      filter: `blur(${isDark ? 180 : 140}px)`,
      opacity: isDark ? 0.24 : 0.35,
      animation: `${haloPulse} 22s ease-in-out infinite`,
      pointerEvents: "none",
      zIndex: 0,
    },
    "&::after": {
      content: '""',
      position: "absolute",
      inset: "12%",
      borderRadius: "32%",
      background: `linear-gradient(140deg, ${alpha(
        isDark ? theme.palette.primary.dark : theme.palette.primary.light,
        isDark ? 0.1 : 0.16
      )}, ${alpha(theme.palette.primary.dark, isDark ? 0.03 : 0.06)}, transparent 72%)`,
      mixBlendMode: isDark ? "normal" : "lighten",
      filter: `blur(${isDark ? 80 : 60}px)`,
      opacity: isDark ? 0.12 : 0.22,
      animation: isDark ? "none" : `${shimmer} 28s ease-in-out infinite`,
      pointerEvents: "none",
      zIndex: 0,
    },
    "@media (prefers-reduced-motion: reduce)": {
      "&::before": {
        animation: "none",
      },
      "&::after": {
        animation: "none",
      },
    },
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

const GlowPrimary = styled("div")(({ theme }) => ({
  position: "absolute",
  width: theme.palette.mode === "dark" ? "280px" : "360px",
  height: theme.palette.mode === "dark" ? "420px" : "520px",
  top: "18%",
  left: "50%",
  borderRadius: "280px",
  background: createPrimaryGlow(theme),
  mixBlendMode: theme.palette.mode === "dark" ? "normal" : "lighten",
  filter: `blur(${theme.palette.mode === "dark" ? 50 : 60}px)`,
  opacity: 0,
  transform: "translate(-52%, -10%) rotate(12deg)",
  animation: `${backdropFadeIn} 1600ms ease-out forwards, ${floatPrimary} 15000ms ease-in-out infinite`,
  animationDelay: "280ms, 1600ms",
  willChange: "transform, opacity",
  "@media (prefers-reduced-motion: reduce)": {
    animation: "none",
    opacity: 0.85,
  },
}));

const GlowSecondary = styled("div")(({ theme }) => ({
  position: "absolute",
  width: "260px",
  height: "420px",
  top: "26%",
  left: "28%",
  borderRadius: "260px",
  background: createSecondaryGlow(theme),
  mixBlendMode: theme.palette.mode === "dark" ? "normal" : "lighten",
  filter: `blur(${theme.palette.mode === "dark" ? 55 : 70}px)`,
  opacity: 0,
  transform: "translate(-28%, 6%) rotate(-24deg)",
  animation: `${backdropFadeIn} 1800ms ease-out forwards, ${floatSecondary} 13000ms ease-in-out infinite`,
  animationDelay: "420ms, 1800ms",
  willChange: "transform, opacity",
  "@media (prefers-reduced-motion: reduce)": {
    animation: "none",
    opacity: 0.75,
  },
}));

const GlowAccent = styled("div")(({ theme }) => ({
  position: "absolute",
  width: "220px",
  height: "300px",
  bottom: "18%",
  right: "18%",
  borderRadius: "220px",
  background: createAccentGlow(theme),
  mixBlendMode: theme.palette.mode === "dark" ? "normal" : "lighten",
  filter: `blur(${theme.palette.mode === "dark" ? 60 : 75}px)`,
  opacity: 0,
  transform: "translate(28%, 24%) rotate(16deg)",
  animation: `${backdropFadeIn} 2000ms ease-out forwards, ${floatAccent} 17000ms ease-in-out infinite`,
  animationDelay: "640ms, 2000ms",
  willChange: "transform, opacity",
  "@media (prefers-reduced-motion: reduce)": {
    animation: "none",
    opacity: 0.6,
  },
}));

const GlowRing = styled("div")(({ theme }) => ({
  position: "absolute",
  width: "70%",
  maxWidth: "960px",
  aspectRatio: "1 / 1",
  bottom: "-42%",
  borderRadius: "50%",
  background:
    theme.palette.mode === "dark"
      ? `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.16)} 0%, transparent 58%)`
      : `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.3)} 0%, transparent 58%)`,
  filter: `blur(${theme.palette.mode === "dark" ? 120 : 100}px)`,
  opacity: 0,
  animation: `${backdropFadeIn} 2200ms ease-out forwards`,
  animationDelay: "900ms",
  "@media (prefers-reduced-motion: reduce)": {
    animation: "none",
    opacity: 0.45,
  },
}));

const Content = styled(Box)({
  position: "relative",
  zIndex: 2,
});

export type GlowEffectPaperProps = PropsWithChildren<BoxProps>;

export const GlowEffectPaper = ({ children, sx, ...containerProps }: GlowEffectPaperProps) => {
  return (
    <Root sx={{ background: "inherit", ...sx }} {...containerProps}>
      <GlowBackdrop aria-hidden>
        <GlowPrimary />
        <GlowSecondary />
        <GlowAccent />
        <GlowRing />
      </GlowBackdrop>
      <Content>{children}</Content>
    </Root>
  );
};

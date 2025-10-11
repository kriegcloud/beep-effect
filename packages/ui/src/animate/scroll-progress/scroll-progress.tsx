import type { PaletteColorKey } from "@beep/ui/theme/core";
import { createClasses } from "@beep/ui/theme/create-classes";
import { mergeClasses } from "@beep/ui-core/utils";
import type { BoxProps } from "@mui/material/Box";
import Box from "@mui/material/Box";
import Portal from "@mui/material/Portal";
import type { SxProps, Theme } from "@mui/material/styles";
import { styled, useTheme } from "@mui/material/styles";
import type { MotionProps, MotionValue } from "framer-motion";
import { m, useSpring, useTransform } from "framer-motion";
import type React from "react";
import { Fragment } from "react";

export const scrollProgressClasses = {
  circular: createClasses("scroll__progress__circular"),
  linear: createClasses("scroll__progress__linear"),
};

type BaseProps = MotionProps & React.ComponentProps<"svg"> & React.ComponentProps<"div">;

export interface ScrollProgressProps extends BaseProps {
  readonly size?: undefined | number;
  readonly portal?: undefined | boolean;
  readonly thickness?: undefined | number;
  readonly whenScroll?: undefined | "x" | "y";
  readonly sx?: undefined | SxProps<Theme>;
  readonly progress: MotionValue<number>;
  readonly variant: "linear" | "circular";
  readonly color?: undefined | PaletteColorKey | "inherit";
  readonly slotProps?:
    | undefined
    | {
        readonly wrapper?: undefined | BoxProps;
      };
}

export function ScrollProgress({
  sx,
  size,
  portal,
  variant,
  slotProps,
  className,
  progress,
  thickness = 3.6,
  whenScroll = "y",
  color = "primary",
  ...other
}: ScrollProgressProps) {
  const theme = useTheme();

  const isRtl = theme.direction === "rtl";

  const transformProgress = useTransform(progress, [0, -1], [0, 1]);

  const progressValue = isRtl && whenScroll === "x" ? transformProgress : progress;
  const progressSize = variant === "circular" ? (size ?? 64) : (size ?? 3);

  const scaleX = useSpring(progressValue, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const renderCircular = () => (
    <CircularRoot
      viewBox={`0 0 ${progressSize} ${progressSize}`}
      xmlns="http://www.w3.org/2000/svg"
      className={mergeClasses([scrollProgressClasses.circular, className])}
      sx={[
        {
          width: progressSize,
          height: progressSize,
          ...(color !== "inherit" && { color: theme.vars.palette[color].main }),
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <circle
        cx={progressSize / 2}
        cy={progressSize / 2}
        r={progressSize / 2 - thickness - 4}
        strokeWidth={thickness}
        strokeOpacity={0.2}
      />

      <m.circle
        cx={progressSize / 2}
        cy={progressSize / 2}
        r={progressSize / 2 - thickness - 4}
        strokeWidth={thickness}
        style={{ pathLength: progressValue }}
      />
    </CircularRoot>
  );

  const renderLinear = () => (
    <LinearRoot
      className={mergeClasses([scrollProgressClasses.linear, className])}
      sx={[
        {
          height: progressSize,
          ...(color !== "inherit" && {
            background: `linear-gradient(135deg, ${theme.vars.palette[color].light}, ${theme.vars.palette[color].main})`,
          }),
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      style={{ scaleX }}
      {...other}
    />
  );

  const PortalWrapper = portal ? Portal : Fragment;

  return (
    <PortalWrapper>
      <Box {...slotProps?.wrapper}>{variant === "circular" ? renderCircular() : renderLinear()}</Box>
    </PortalWrapper>
  );
}

const CircularRoot = styled(m.svg)(({ theme }) => ({
  transform: "rotate(-90deg)",
  color: theme.vars.palette.text.primary,
  circle: { fill: "none", strokeDashoffset: 0, stroke: "currentColor" },
}));

const LinearRoot = styled(m.div)(({ theme }) => ({
  top: 0,
  left: 0,
  right: 0,
  transformOrigin: "0%",
  backgroundColor: theme.vars.palette.text.primary,
}));

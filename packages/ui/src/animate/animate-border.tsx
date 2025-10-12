"use client";

import { createClasses } from "@beep/ui-core/theme/create-classes";
import { mergeClasses } from "@beep/ui-core/utils";
import type { BoxProps } from "@mui/material/Box";
import Box from "@mui/material/Box";
import type { CSSObject, SxProps, Theme } from "@mui/material/styles";
import { useTheme } from "@mui/material/styles";
import { m, useAnimationFrame, useMotionTemplate, useMotionValue, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const animateBorderClasses = {
  root: createClasses("border__animation__root"),
  primaryBorder: createClasses("border__animation__primary"),
  secondaryBorder: createClasses("border__animation__secondary"),
  svgWrapper: createClasses("border__animation__svg__wrapper"),
  movingShape: createClasses("border__animation__moving__shape"),
};

type BorderStyleProps = {
  readonly width?: undefined | string;
  readonly size?: undefined | number;
  readonly sx?: undefined | SxProps<Theme>;
};

type AnimateBorderProps = BoxProps & {
  readonly duration?: undefined | number;
  readonly slotProps?:
    | undefined
    | {
        readonly primaryBorder?: undefined | BorderStyleProps;
        readonly secondaryBorder?: undefined | BorderStyleProps;
        readonly outlineColor?: undefined | string | ((theme: Theme) => string);
        readonly svgSettings?:
          | undefined
          | {
              readonly rx?: undefined | string;
              readonly ry?: undefined | string;
            };
      };
};

export function AnimateBorder({ sx, children, duration, slotProps, className, ...other }: AnimateBorderProps) {
  const theme = useTheme();

  const rootRef = useRef<HTMLDivElement>(null);
  const primaryBorderRef = useRef<HTMLSpanElement>(null);

  const [isHidden, setIsHidden] = useState(false);

  const secondaryBorderStyles = useComputedElementStyles(theme, primaryBorderRef);

  useEffect(() => {
    const handleVisibility = () => {
      if (rootRef.current) {
        const displayStyle = getComputedStyle(rootRef.current).display;
        setIsHidden(displayStyle === "none");
      }
    };

    handleVisibility();

    window.addEventListener("resize", handleVisibility);

    return () => {
      window.removeEventListener("resize", handleVisibility);
    };
  }, []);

  const outlineColor =
    typeof slotProps?.outlineColor === "function" ? slotProps?.outlineColor(theme) : slotProps?.outlineColor;

  const borderProps = {
    duration,
    isHidden,
    rx: slotProps?.svgSettings?.rx,
    ry: slotProps?.svgSettings?.ry,
  };

  const renderPrimaryBorder = () => (
    <MovingBorder
      {...borderProps}
      ref={primaryBorderRef}
      size={slotProps?.primaryBorder?.size}
      sx={[
        {
          ...theme.mixins.borderGradient({
            padding: slotProps?.primaryBorder?.width,
          }),
        },
        ...(Array.isArray(slotProps?.primaryBorder?.sx) ? slotProps.primaryBorder.sx : [slotProps?.primaryBorder?.sx]),
      ]}
    />
  );

  const renderSecondaryBorder = () =>
    slotProps?.secondaryBorder && (
      <MovingBorder
        {...borderProps}
        size={slotProps?.secondaryBorder?.size ?? slotProps?.primaryBorder?.size}
        sx={[
          {
            ...theme.mixins.borderGradient({
              padding: slotProps?.secondaryBorder?.width ?? secondaryBorderStyles.padding,
            }),
            borderRadius: secondaryBorderStyles.borderRadius,
            transform: "scale(-1, -1)",
          },
          ...(Array.isArray(slotProps?.secondaryBorder?.sx)
            ? slotProps.secondaryBorder.sx
            : [slotProps?.secondaryBorder?.sx]),
        ]}
      />
    );

  return (
    <Box
      dir="ltr"
      ref={rootRef}
      className={mergeClasses([animateBorderClasses.root, className])}
      sx={[
        {
          minWidth: 40,
          minHeight: 40,
          overflow: "hidden",
          position: "relative",
          width: "fit-content",
          "&::before": theme.mixins.borderGradient({
            color: outlineColor,
            padding: slotProps?.primaryBorder?.width,
          }),
          ...(!!children && {
            minWidth: "unset",
            minHeight: "unset",
          }),
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      {renderPrimaryBorder()}
      {renderSecondaryBorder()}
      {children}
    </Box>
  );
}

type MovingBorderProps = BoxProps<"span"> & {
  readonly rx?: undefined | string;
  readonly ry?: undefined | string;
  readonly duration?: undefined | number;
  readonly isHidden?: undefined | boolean;
  readonly size?: undefined | BorderStyleProps["size"];
};

function MovingBorder({ sx, size, isHidden, rx = "30%", ry = "30%", duration = 8, ...other }: MovingBorderProps) {
  const svgRectRef = useRef<SVGRectElement>(null);
  const progress = useMotionValue<number>(0);

  const updateAnimationFrame = (time: number) => {
    if (!svgRectRef.current) return;
    try {
      const pathLength = svgRectRef.current.getTotalLength();
      const pixelsPerMs = pathLength / (duration * 1000);
      progress.set((time * pixelsPerMs) % pathLength);
    } catch {
      return;
    }
  };

  const calculateTransform = (val: number) => {
    if (!svgRectRef.current) return { x: 0, y: 0 };
    try {
      const point = svgRectRef.current.getPointAtLength(val);
      return point ? { x: point.x, y: point.y } : { x: 0, y: 0 };
    } catch {
      return { x: 0, y: 0 };
    }
  };

  useAnimationFrame((time) => (!isHidden ? updateAnimationFrame(time) : undefined));

  const x = useTransform(progress, (val) => calculateTransform(val).x);
  const y = useTransform(progress, (val) => calculateTransform(val).y);
  const transform = useMotionTemplate`translateX(${x}px) translateY(${y}px) translateX(-50%) translateY(-50%)`;

  return (
    <Box component="span" sx={[{ textAlign: "initial" }, ...(Array.isArray(sx) ? sx : [sx])]} {...other}>
      <svg
        role={"img"}
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        width="100%"
        height="100%"
        className={animateBorderClasses.svgWrapper}
        style={{ position: "absolute" }}
      >
        <rect ref={svgRectRef} fill="none" width="100%" height="100%" rx={rx} ry={ry} />
      </svg>

      <Box
        component={m.span}
        style={{ transform }}
        className={animateBorderClasses.movingShape}
        sx={{
          width: size,
          height: size,
          filter: "blur(8px)",
          position: "absolute",
          background: `radial-gradient(currentColor 40%, transparent 80%)`,
        }}
      />
    </Box>
  );
}

function useComputedElementStyles(theme: Theme, ref: React.RefObject<HTMLSpanElement | null>) {
  const [computedStyles, setComputedStyles] = useState<CSSObject | null>(null);

  const isRtl = theme.direction === "rtl";

  useEffect(() => {
    if (ref.current) {
      const style = getComputedStyle(ref.current);
      setComputedStyles({
        paddingTop: style.paddingBottom,
        paddingBottom: style.paddingTop,
        paddingLeft: isRtl ? style.paddingLeft : style.paddingRight,
        paddingRight: isRtl ? style.paddingRight : style.paddingLeft,
        borderTopLeftRadius: isRtl ? style.borderBottomLeftRadius : style.borderBottomRightRadius,
        borderTopRightRadius: isRtl ? style.borderBottomRightRadius : style.borderBottomLeftRadius,
        borderBottomLeftRadius: isRtl ? style.borderTopLeftRadius : style.borderTopRightRadius,
        borderBottomRightRadius: isRtl ? style.borderTopRightRadius : style.borderTopLeftRadius,
      });
    }
  }, [ref, isRtl]);

  return {
    padding: `${computedStyles?.paddingTop} ${computedStyles?.paddingRight} ${computedStyles?.paddingBottom} ${computedStyles?.paddingLeft}`,
    borderRadius: `${computedStyles?.borderTopLeftRadius} ${computedStyles?.borderTopRightRadius} ${computedStyles?.borderBottomRightRadius} ${computedStyles?.borderBottomLeftRadius}`,
  };
}

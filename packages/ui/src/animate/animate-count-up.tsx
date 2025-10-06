import type { TypographyProps } from "@mui/material/Typography";
import Typography from "@mui/material/Typography";
import type { UseInViewOptions } from "framer-motion";
import { animate, m, useInView, useMotionValue, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";

export type AnimateCountUpProps = TypographyProps & {
  readonly to: number;
  readonly from?: undefined | number;
  readonly toFixed?: undefined | number;
  readonly duration?: undefined | number;
  readonly unit?: undefined | "k" | "m" | "b" | string;
  readonly once?: undefined | UseInViewOptions["once"];
  readonly amount?: undefined | UseInViewOptions["amount"];
};

export function AnimateCountUp({
  to,
  sx,
  from = 0,
  toFixed = 0,
  once = true,
  duration = 2,
  amount = 0.5,
  unit: unitProp,
  component = "p",
  ...other
}: AnimateCountUpProps) {
  const countRef = useRef(null);

  const shortNumber = shortenNumber(to);

  const startCount = useMotionValue<number>(from);
  const endCount = shortNumber ? shortNumber.value : to;

  const unit = unitProp ?? shortNumber?.unit;

  const inView = useInView(countRef, { once, amount });

  const rounded = useTransform(startCount, (latest) => latest.toFixed(isFloat(latest) ? toFixed : 0));

  useEffect(() => {
    if (inView) {
      animate(startCount, endCount, { duration });
    }
  }, [duration, endCount, inView, startCount]);

  return (
    <Typography
      component={component}
      sx={[
        {
          p: 0,
          m: 0,
          display: "inline-flex",
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <m.span ref={countRef}>{rounded}</m.span>
      {unit}
    </Typography>
  );
}

function isFloat(n: number | string) {
  return typeof n === "number" && !Number.isInteger(n);
}

function shortenNumber(value: number): { unit: string; value: number } | undefined {
  if (value >= 1e9) {
    return { unit: "b", value: value / 1e9 };
  }
  if (value >= 1e6) {
    return { unit: "m", value: value / 1e6 };
  }
  if (value >= 1e3) {
    return { unit: "k", value: value / 1e3 };
  }
  return undefined;
}

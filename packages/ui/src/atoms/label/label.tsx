import { mergeClasses } from "@beep/ui-core/utils";
import * as Str from "effect/String";

import { labelClasses } from "./classes";
import { LabelIcon, LabelRoot } from "./styles";

import type { LabelProps } from "./types";

export function Label({
  sx,
  endIcon,
  children,
  startIcon,
  className,
  disabled,
  variant = "soft",
  color = "default",
  ...other
}: LabelProps) {
  return (
    <LabelRoot
      color={color}
      variant={variant}
      disabled={disabled}
      className={mergeClasses([labelClasses.root, className])}
      {...(sx ? { sx } : {})}
      {...other}
    >
      {startIcon && <LabelIcon className={labelClasses.icon}>{startIcon}</LabelIcon>}

      {typeof children === "string" ? Str.capitalize(children) : children}

      {endIcon && <LabelIcon className={labelClasses.icon}>{endIcon}</LabelIcon>}
    </LabelRoot>
  );
}

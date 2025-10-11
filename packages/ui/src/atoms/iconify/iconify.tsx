"use client";
import { mergeClasses } from "@beep/ui-core/utils";
import type { IconProps } from "@iconify/react";
import { Icon } from "@iconify/react";
import { styled } from "@mui/material/styles";
import type React from "react";
import { useId } from "react";

import { iconifyClasses } from "./classes";
import type { IconifyName } from "./register-icons";
import { allIconNames, registerIcons } from "./register-icons";

export type IconifyProps = React.ComponentProps<typeof IconRoot> &
  Omit<IconProps, "icon"> & {
    icon: IconifyName;
  };

export function Iconify({ className, icon, width = 20, height, sx, ...other }: IconifyProps) {
  const id = useId();

  if (!allIconNames.includes(icon)) {
    console.warn(
      [
        `Icon "${icon}" is currently loaded online, which may cause flickering effects.`,
        `To ensure a smoother experience, please register your icon collection for offline use.`,
        `More information is available at`,
      ].join("\n")
    );
  }

  registerIcons();

  return (
    <IconRoot
      ssr
      id={id}
      icon={icon}
      className={mergeClasses([iconifyClasses.root, className])}
      sx={[
        {
          width,
          flexShrink: 0,
          height: height ?? width,
          display: "inline-flex",
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    />
  );
}

const IconRoot = styled(Icon)``;

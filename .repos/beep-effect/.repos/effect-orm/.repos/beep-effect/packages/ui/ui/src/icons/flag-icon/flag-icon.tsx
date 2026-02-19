"use client";

import { mergeClasses } from "@beep/ui-core/utils";
import { styled } from "@mui/material/styles";
import type React from "react";
import { flagIconClasses } from "./classes";

export type FlagIconProps = React.ComponentProps<typeof FlagRoot> & {
  readonly code?: string | undefined;
};

export function FlagIcon({ code, className, sx, ...other }: FlagIconProps) {
  if (!code) {
    return null;
  }

  return (
    <FlagRoot className={mergeClasses([flagIconClasses.root, className])} {...(sx ? { sx } : {})} {...other}>
      <FlagImg
        loading="lazy"
        alt={code}
        src={`https://purecatamphetamine.github.io/country-flag-icons/3x2/${code?.toUpperCase()}.svg`}
        className={flagIconClasses.img}
      />
    </FlagRoot>
  );
}

const FlagRoot = styled("span")(({ theme }) => ({
  width: 26,
  height: 20,
  flexShrink: 0,
  overflow: "hidden",
  borderRadius: "5px",
  alignItems: "center",
  display: "inline-flex",
  justifyContent: "center",
  backgroundColor: theme.vars.palette.background.neutral,
}));

const FlagImg = styled("img")(() => ({
  width: "100%",
  height: "100%",
  maxWidth: "unset",
  objectFit: "cover",
}));

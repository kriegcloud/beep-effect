"use client";
import type { SxProps, Theme } from "@mui/material/styles";
import { styled } from "@mui/material/styles";
import type React from "react";

export type FilterBlockProps = React.ComponentProps<"div"> & {
  readonly label: string;
  readonly isShow: boolean;
  readonly sx?: SxProps<Theme> | undefined;
  readonly children: React.ReactNode;
};

export function FiltersBlock({ label, children, isShow, sx, ...other }: FilterBlockProps) {
  if (!isShow) {
    return null;
  }

  return (
    <BlockRoot sx={sx ?? {}} {...other}>
      <BlockLabel>{label}</BlockLabel>
      <BlockContent>{children}</BlockContent>
    </BlockRoot>
  );
}

const BlockRoot = styled("div")(({ theme }) => ({
  display: "flex",
  overflow: "hidden",
  gap: theme.spacing(1),
  padding: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  border: `dashed 1px ${theme.vars.palette.divider}`,
}));

const BlockLabel = styled("span")(({ theme }) => ({
  height: 24,
  lineHeight: "24px",
  fontSize: theme.typography.subtitle2.fontSize,
  fontWeight: theme.typography.subtitle2.fontWeight,
}));

const BlockContent = styled("div")(({ theme }) => ({
  display: "flex",
  flexWrap: "wrap",
  gap: theme.spacing(1),
}));

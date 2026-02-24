"use client";
import Button from "@mui/material/Button";
import type { ChipProps } from "@mui/material/Chip";
import type { SxProps, Theme } from "@mui/material/styles";
import { styled } from "@mui/material/styles";
import { TrashIcon } from "@phosphor-icons/react";
import type React from "react";

export const chipProps: ChipProps = { size: "small", variant: "soft" };

export type FiltersResultProps = React.ComponentProps<"div"> & {
  readonly totalResults: number;
  readonly onReset?: (() => void) | undefined;
  readonly sx?: SxProps<Theme> | undefined;
};

export function FiltersResult({ sx, onReset, children, totalResults, ...other }: FiltersResultProps) {
  return (
    <ResultRoot sx={sx ?? {}} {...other}>
      <ResultLabel>
        <strong>{totalResults}</strong>
        <span> results found</span>
      </ResultLabel>

      <ResultContent>
        {children}

        <Button color="error" onClick={onReset} startIcon={<TrashIcon weight="bold" />}>
          Clear
        </Button>
      </ResultContent>
    </ResultRoot>
  );
}

const ResultRoot = styled("div")``;

const ResultLabel = styled("div")(({ theme }) => ({
  ...theme.typography.body2,
  marginBottom: theme.spacing(1.5),
  "& span": { color: theme.vars.palette.text.secondary },
}));

const ResultContent = styled("div")(({ theme }) => ({
  flexGrow: 1,
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: theme.spacing(1),
}));

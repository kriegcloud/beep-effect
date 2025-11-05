"use client";
import { assetPaths } from "@beep/constants";
import { rgbaFromChannel } from "@beep/ui-core/utils";
import type { BoxProps } from "@mui/material/Box";
import Box from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";
import { styled } from "@mui/material/styles";
import type { TypographyProps } from "@mui/material/Typography";
import Typography from "@mui/material/Typography";
import type React from "react";

export type EmptyContentProps = React.ComponentProps<"div"> & {
  readonly title?: string | undefined;
  readonly imgUrl?: string | undefined;
  readonly filled?: boolean | undefined;
  readonly sx?: SxProps<Theme> | undefined;
  readonly description?: string | undefined;
  readonly action?: React.ReactNode | undefined;
  readonly slotProps?:
    | {
        readonly img?: BoxProps<"img"> | undefined;
        readonly title?: TypographyProps | undefined;
        readonly description?: TypographyProps | undefined;
      }
    | undefined;
};

export function EmptyContent({
  sx,
  imgUrl,
  action,
  filled,
  slotProps,
  description,
  title = "No data",
  ...other
}: EmptyContentProps) {
  return (
    <ContentRoot filled={filled} sx={sx ?? {}} {...other}>
      <Box
        component="img"
        alt="Empty content"
        src={imgUrl ?? assetPaths.assets.icons.empty.icContent}
        {...slotProps?.img}
        sx={[
          {
            width: 1,
            maxWidth: 160,
          },
          ...(Array.isArray(slotProps?.img?.sx) ? (slotProps?.img?.sx ?? []) : [slotProps?.img?.sx]),
        ]}
      />

      {title && (
        <Typography
          variant="h6"
          {...slotProps?.title}
          sx={[
            {
              mt: 1,
              textAlign: "center",
              color: "text.disabled",
            },
            ...(Array.isArray(slotProps?.title?.sx) ? (slotProps?.title?.sx ?? []) : [slotProps?.title?.sx]),
          ]}
        >
          {title}
        </Typography>
      )}

      {description && (
        <Typography
          variant="body2"
          {...slotProps?.description}
          sx={[
            {
              mt: 1,
              textAlign: "center",
              color: "text.disabled",
            },
            ...(Array.isArray(slotProps?.description?.sx)
              ? (slotProps?.description?.sx ?? [])
              : [slotProps?.description?.sx]),
          ]}
        >
          {description}
        </Typography>
      )}

      {action && action}
    </ContentRoot>
  );
}

const ContentRoot = styled("div", {
  shouldForwardProp: (prop: string) => !["filled", "sx"].includes(prop),
})<Pick<EmptyContentProps, "filled">>(({ filled, theme }) => ({
  flexGrow: 1,
  height: "100%",
  display: "flex",
  alignItems: "center",
  flexDirection: "column",
  justifyContent: "center",
  padding: theme.spacing(0, 3),
  ...(filled && {
    borderRadius: Number(theme.shape.borderRadius) * 2,
    backgroundColor: rgbaFromChannel(theme.vars.palette.grey["500Channel"], 0.04),
    border: `dashed 1px ${rgbaFromChannel(theme.vars.palette.grey["500Channel"], 0.08)}`,
  }),
}));

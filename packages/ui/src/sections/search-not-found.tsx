"use client";

import type { BoxProps } from "@mui/material/Box";
import Box from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";
import type { TypographyProps } from "@mui/material/Typography";
import Typography from "@mui/material/Typography";

type SearchNotFoundProps = BoxProps & {
  readonly query?: string | undefined;
  readonly sx?: SxProps<Theme> | undefined;
  readonly slotProps?:
    | {
        readonly title?: TypographyProps | undefined;
        readonly description?: TypographyProps | undefined;
      }
    | undefined;
};

export function SearchNotFound({ query, sx, slotProps, ...other }: SearchNotFoundProps) {
  if (!query) {
    return (
      <Typography variant="body2" {...slotProps?.description}>
        Please enter keywords
      </Typography>
    );
  }

  return (
    <Box
      sx={[
        {
          gap: 1,
          display: "flex",
          borderRadius: 1.5,
          textAlign: "center",
          flexDirection: "column",
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <Typography
        variant="h6"
        {...slotProps?.title}
        sx={[
          { color: "text.primary" },
          ...(Array.isArray(slotProps?.title?.sx) ? slotProps.title.sx : [slotProps?.title?.sx]),
        ]}
      >
        Not found
      </Typography>

      <Typography variant="body2" {...slotProps?.description}>
        No results found for &nbsp;
        <strong>{`"${query}"`}</strong>
        .
        <br /> Try checking for typos or using complete words.
      </Typography>
    </Box>
  );
}

import { rgbaFromChannel } from "@beep/ui-core/utils";
import type { BoxProps } from "@mui/material/Box";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";

// ----------------------------------------------------------------------

type MailNavItemSkeletonProps = BoxProps & {
  readonly itemCount?: undefined | number;
};

export function MailNavItemSkeleton({ itemCount = 6, sx, ...other }: MailNavItemSkeletonProps) {
  return Array.from({ length: itemCount }, (_, index) => (
    <Box
      key={index}
      sx={[
        (theme) => ({
          py: 1,
          gap: 2,
          display: "flex",
          alignItems: "center",
          color: rgbaFromChannel(theme.vars.palette.grey["500Channel"], 0.24),
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <Skeleton variant="circular" sx={{ width: 32, height: 32, bgcolor: "currentColor" }} />

      <Skeleton sx={{ width: 0.5, height: 10, bgcolor: "currentColor" }} />
    </Box>
  ));
}

// ----------------------------------------------------------------------

type MailItemSkeletonProps = BoxProps & {
  readonly itemCount?: undefined | number;
};

export function MailItemSkeleton({ sx, itemCount = 6, ...other }: MailItemSkeletonProps) {
  return Array.from({ length: itemCount }, (_, index) => (
    <Box
      key={index}
      sx={[
        {
          py: 1,
          gap: 2,
          display: "flex",
          alignItems: "center",
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <Skeleton variant="circular" sx={{ width: 40, height: 40 }} />

      <Box sx={{ flex: "1 1 auto" }}>
        <Skeleton sx={{ mb: 1, width: 0.75, height: 10 }} />
        <Skeleton sx={{ width: 0.5, height: 10 }} />
      </Box>
    </Box>
  ));
}

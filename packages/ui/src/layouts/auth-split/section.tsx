import { assetPaths } from "@beep/constants";
import { RouterLink } from "@beep/ui/routing";

import { rgbaFromChannel } from "@beep/ui/utils";
import type { BoxProps } from "@mui/material/Box";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import type { Breakpoint } from "@mui/material/styles";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

// ----------------------------------------------------------------------

export type AuthSplitSectionProps = BoxProps & {
  title?: string;
  method?: string;
  imgUrl?: string;
  subtitle?: string;
  layoutQuery?: Breakpoint;
  methods?: {
    path: string;
    icon: string;
    label: string;
  }[];
};

export function AuthSplitSection({
  sx,
  method,
  methods,
  layoutQuery = "md",
  title = "Manage the job",
  imgUrl = assetPaths.assets.illustrations.illustrationDashboard,
  subtitle = "More effectively with optimized workflows.",
  ...other
}: AuthSplitSectionProps) {
  return (
    <Box
      sx={[
        (theme) => ({
          ...theme.mixins.bgGradient({
            images: [
              `linear-gradient(0deg, ${rgbaFromChannel(theme.vars.palette.background.defaultChannel, 0.92)}, ${rgbaFromChannel(theme.vars.palette.background.defaultChannel, 0.92)})`,
              `url(${assetPaths.assets.background.background3Blur})`,
            ],
          }),
          px: 3,
          pb: 3,
          width: 1,
          maxWidth: 480,
          display: "none",
          position: "relative",
          pt: "var(--layout-header-desktop-height)",
          [theme.breakpoints.up(layoutQuery)]: {
            gap: 8,
            display: "flex",
            alignItems: "center",
            flexDirection: "column",
            justifyContent: "center",
          },
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <div>
        <Typography variant="h3" sx={{ textAlign: "center" }}>
          {title}
        </Typography>

        {subtitle && <Typography sx={{ color: "text.secondary", textAlign: "center", mt: 2 }}>{subtitle}</Typography>}
      </div>

      <Box
        component="img"
        alt="Dashboard illustration"
        src={imgUrl}
        sx={{ width: 1, aspectRatio: "4/3", objectFit: "cover" }}
      />

      {!!methods?.length && method && (
        <Box component="ul" sx={{ gap: 2, display: "flex" }}>
          {methods.map((option) => {
            const selected = method === option.label.toLowerCase();

            return (
              <Box
                key={option.label}
                component="li"
                sx={{
                  ...(!selected && {
                    cursor: "not-allowed",
                    filter: "grayscale(1)",
                  }),
                }}
              >
                <Tooltip title={option.label} placement="top">
                  <Link component={RouterLink} href={option.path} sx={{ ...(!selected && { pointerEvents: "none" }) }}>
                    <Box component="img" alt={option.label} src={option.icon} sx={{ width: 32, height: 32 }} />
                  </Link>
                </Tooltip>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
}

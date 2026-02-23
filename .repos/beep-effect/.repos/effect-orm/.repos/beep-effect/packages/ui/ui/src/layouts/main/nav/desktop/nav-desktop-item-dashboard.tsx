import { assetPaths } from "@beep/constants";
import { transitionTap, varHover, varTap } from "@beep/ui/animate";
import { RouterLink } from "@beep/ui/routing";
import { rgbaFromChannel } from "@beep/ui-core/utils";
import type { BoxProps } from "@mui/material/Box";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import { m } from "framer-motion";

type NavItemDashboardProps = BoxProps & {
  readonly path: string;
};

export function NavItemDashboard({ path, sx, ...other }: NavItemDashboardProps) {
  return (
    <Link component={RouterLink} href={path}>
      <Box
        sx={[
          (theme) => ({
            height: 360,
            display: "flex",
            borderRadius: 1.5,
            alignItems: "center",
            color: "text.disabled",
            justifyContent: "center",
            bgcolor: "background.neutral",
            px: { md: 3, lg: 10 },
            transition: theme.transitions.create("background-color", {
              duration: theme.transitions.duration.shortest,
              easing: theme.transitions.easing.sharp,
            }),
            "&:hover": {
              bgcolor: rgbaFromChannel(theme.vars.palette.grey["500Channel"], 0.12),
            },
          }),
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
        {...other}
      >
        <Box
          component={m.img}
          whileTap={varTap(0.98)}
          whileHover={varHover(1.02)}
          transition={transitionTap()}
          alt="Dashboard illustration"
          src={assetPaths.assets.illustrations.illustrationDashboard}
          sx={{ width: 640, objectFit: "cover", aspectRatio: "4/3" }}
        />
      </Box>
    </Link>
  );
}

import { transitionTap, varHover, varTap } from "@beep/ui/animate";
import { Image, Label } from "@beep/ui/atoms";
import { RouterLink } from "@beep/ui/routing";
import { rgbaFromChannel } from "@beep/ui-core/utils";
import type { BoxProps } from "@mui/material/Box";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { m } from "framer-motion";

import type { NavItemData } from "../layout/nav-config-components";

type ComponentCardProps = BoxProps<"a"> & {
  item: NavItemData;
};

export function ComponentCard({ item, sx, ...other }: ComponentCardProps) {
  return (
    <Box
      component={RouterLink}
      href={item.href}
      sx={[
        (theme) => ({
          color: "inherit",
          borderRadius: 1.25,
          overflow: "hidden",
          textAlign: "center",
          position: "relative",
          textDecoration: "none",
          border: `solid 1px ${rgbaFromChannel(theme.vars?.palette.grey["500Channel"], 0.12)}`,
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      {["MUI X", "3rd Party"].includes(item.packageType!) && (
        <Label
          color={item.packageType === "MUI X" ? "info" : "default"}
          sx={{
            top: 8,
            right: 8,
            zIndex: 9,
            position: "absolute",
          }}
        >
          {item.packageType}
        </Label>
      )}

      <Box
        sx={[
          (theme) => ({
            overflow: "hidden",
            bgcolor: rgbaFromChannel(theme.vars.palette.grey["500Channel"], 0.06),
            transition: theme.transitions.create("background-color", {
              duration: theme.transitions.duration.shortest,
              easing: theme.transitions.easing.sharp,
            }),
            "&:hover": {
              bgcolor: rgbaFromChannel(theme.vars.palette.grey["500Channel"], 0.12),
            },
            ...theme.applyStyles("dark", {
              bgcolor: rgbaFromChannel(theme.vars.palette.grey["500Channel"], 0.04),
            }),
          }),
        ]}
      >
        <m.div whileTap={varTap(0.98)} whileHover={varHover()} transition={transitionTap()}>
          <Image alt={item.name} src={item.icon} ratio="1/1" disablePlaceholder />
        </m.div>
      </Box>

      <Typography variant="subtitle2" sx={{ p: 2 }}>
        {item.name}
      </Typography>
    </Box>
  );
}

import type { NavSectionProps } from "@beep/ui/routing";
import { NavSectionHorizontal } from "@beep/ui/routing";

import { mergeClasses, rgbaFromChannel } from "@beep/ui-core/utils";

import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import type { Breakpoint } from "@mui/material/styles";

import { layoutClasses } from "../core";

export type NavHorizontalProps = NavSectionProps & {
  layoutQuery?: Breakpoint;
};

export function NavHorizontal({
  sx,
  data,
  className,
  checkPermissions,
  layoutQuery = "md",
  ...other
}: NavHorizontalProps) {
  return (
    <Box
      className={mergeClasses([layoutClasses.nav.root, layoutClasses.nav.horizontal, className])}
      sx={[
        (theme) => ({
          width: 1,
          position: "relative",
          flexDirection: "column",
          display: { xs: "none", [layoutQuery]: "flex" },
          borderBottom: `solid 1px ${rgbaFromChannel(theme.vars.palette.grey["500Channel"], 0.08)}`,
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Divider
        sx={{
          top: 0,
          left: 0,
          width: 1,
          zIndex: 9,
          position: "absolute",
          borderStyle: "dashed",
        }}
      />

      <Box
        sx={{
          px: 1.5,
          height: "var(--layout-nav-horizontal-height)",
          backgroundColor: "var(--layout-nav-horizontal-bg)",
          backdropFilter: `blur(var(--layout-header-blur))`,
          WebkitBackdropFilter: `blur(var(--layout-header-blur))`,
        }}
      >
        <NavSectionHorizontal data={data} checkPermissions={checkPermissions} {...other} />
      </Box>
    </Box>
  );
}

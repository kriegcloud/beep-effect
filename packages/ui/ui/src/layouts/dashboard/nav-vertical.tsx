import { Logo } from "@beep/ui/branding";
import { Scrollbar } from "@beep/ui/molecules";
import type { NavSectionProps } from "@beep/ui/routing";
import { NavSectionMini, NavSectionVertical } from "@beep/ui/routing";
import { mergeClasses, rgbaFromChannel } from "@beep/ui-core/utils";
import Box from "@mui/material/Box";
import type { Breakpoint } from "@mui/material/styles";
import { styled, useTheme } from "@mui/material/styles";
import { NavToggleButton } from "../components/nav-toggle-button";
import { NavUpgrade } from "../components/nav-upgrade";
import { layoutClasses } from "../core";

export type NavVerticalProps = React.ComponentProps<"div"> &
  NavSectionProps & {
    readonly isNavMini: boolean;
    readonly layoutQuery?: Breakpoint | undefined;
    readonly onToggleNav: () => void;
    readonly slots?:
      | {
          readonly topArea?: React.ReactNode | undefined;
          readonly bottomArea?: React.ReactNode | undefined;
        }
      | undefined;
  };

export function NavVertical({
  sx,
  data,
  slots,
  cssVars,
  className,
  isNavMini,
  onToggleNav,
  checkPermissions,
  layoutQuery = "md",
  ...other
}: NavVerticalProps) {
  const theme = useTheme();
  const renderNavVertical = () => (
    <>
      {slots?.topArea ?? (
        <Box sx={{ pl: 3.5, pt: 2.5, pb: 1 }}>
          <Logo />
        </Box>
      )}

      <Scrollbar fillContent>
        <NavSectionVertical
          data={data}
          cssVars={cssVars}
          checkPermissions={checkPermissions}
          sx={{ px: 2, flex: "1 1 auto" }}
        />

        {slots?.bottomArea ?? <NavUpgrade />}
      </Scrollbar>
    </>
  );

  const renderNavMini = () => (
    <>
      {slots?.topArea ?? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 2.5 }}>
          <Logo />
        </Box>
      )}

      <NavSectionMini
        data={data}
        cssVars={cssVars}
        checkPermissions={checkPermissions}
        sx={{
          ...theme.mixins.hideScrollY,
          pb: 2,
          px: 0.5,
          flex: "1 1 auto",
          overflowY: "auto",
        }}
      />

      {slots?.bottomArea}
    </>
  );

  return (
    <NavRoot
      isNavMini={isNavMini}
      layoutQuery={layoutQuery}
      className={mergeClasses([layoutClasses.nav.root, layoutClasses.nav.vertical, className])}
      sx={sx as Exclude<React.ComponentProps<typeof NavRoot>["sx"], undefined>}
      {...(other as Omit<React.ComponentProps<typeof NavRoot>, "isNavMini" | "layoutQuery" | "className" | "sx">)}
    >
      <NavToggleButton
        isNavMini={isNavMini}
        onClick={onToggleNav}
        sx={[
          (theme) => ({
            display: "none",
            [theme.breakpoints.up(layoutQuery)]: { display: "inline-flex" },
          }),
        ]}
      />
      {isNavMini ? renderNavMini() : renderNavVertical()}
    </NavRoot>
  );
}

const NavRoot = styled("div", {
  shouldForwardProp: (prop: string) => !["isNavMini", "layoutQuery", "sx"].includes(prop),
})<Pick<NavVerticalProps, "isNavMini" | "layoutQuery">>(({ isNavMini, layoutQuery = "md", theme }) => ({
  top: 0,
  left: 0,
  height: "100%",
  display: "none",
  position: "fixed",
  flexDirection: "column",
  zIndex: "var(--layout-nav-zIndex)",
  backgroundColor: "var(--layout-nav-bg)",
  width: isNavMini ? "var(--layout-nav-mini-width)" : "var(--layout-nav-vertical-width)",
  borderRight: `1px solid var(--layout-nav-border-color, ${rgbaFromChannel(theme.vars.palette.grey["500Channel"], 0.12)})`,
  transition: theme.transitions.create(["width"], {
    easing: "var(--layout-transition-easing)",
    duration: "var(--layout-transition-duration)",
  }),
  [theme.breakpoints.up(layoutQuery)]: { display: "flex" },
}));

import { VibrantBackground } from "@beep/ui/atoms";
import { useBreakpoints } from "@beep/ui/providers";
import { useSettingsContext } from "@beep/ui/settings-v2/SettingsProvider";
import { sidenavVibrantStyle } from "@beep/ui-core/theme/styles/vibrantNav";
import { Backdrop, useTheme } from "@mui/material";
import Box from "@mui/material/Box";
import Drawer, { drawerClasses } from "@mui/material/Drawer";
import SidenavCollapse from "./SidenavCollapse";
import SidenavDrawerContent from "./SidenavDrawerContent";

const Sidenav = () => {
  const {
    config: { sidenavCollapsed, drawerWidth, navColor },
    toggleNavbarCollapse,
  } = useSettingsContext();
  const { currentBreakpoint } = useBreakpoints();

  const theme = useTheme();

  return (
    <Box
      component="nav"
      className="default-sidenav"
      sx={[
        {
          width: { md: drawerWidth },
          flexShrink: { sm: 0 },
          transition: {
            xs: theme.transitions.create(["width"], {
              duration: theme.transitions.duration.standard,
            }),
            lg: "none",
          },
          position: { md: "absolute", lg: "static" },
        },
        navColor === "vibrant" && sidenavVibrantStyle,
      ]}
    >
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          [`& .${drawerClasses.paper}`]: {
            overflow: "visible",
            boxSizing: "border-box",
            width: drawerWidth,
            border: 0,
            borderRight: navColor === "vibrant" ? 0 : 1,
            borderColor: "divider",
            transition: {
              xs: theme.transitions.create(["width"], {
                duration: theme.transitions.duration.standard,
              }),
              lg: "none",
            },
          },
        }}
        open
      >
        {navColor === "vibrant" && <VibrantBackground position="side" />}
        <SidenavDrawerContent />
        <SidenavCollapse />
      </Drawer>
      {currentBreakpoint === "md" && (
        <Backdrop open={!sidenavCollapsed} sx={{ zIndex: 1199 }} onClick={toggleNavbarCollapse} />
      )}
    </Box>
  );
};

export default Sidenav;

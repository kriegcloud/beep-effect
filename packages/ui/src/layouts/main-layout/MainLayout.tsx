"use client";

import { VibrantBackground } from "@beep/ui/atoms";
import { useSettingsContext } from "@beep/ui/settings-v2/SettingsProvider";
import { mainDrawerWidth } from "@beep/ui-core/settings";
import { sidenavVibrantStyle } from "@beep/ui-core/theme/styles/vibrantNav";
import { Drawer, drawerClasses } from "@mui/material";
import Box from "@mui/material/Box";
import Toolbar, { type ToolbarOwnProps } from "@mui/material/Toolbar";
import clsx from "clsx";
import { type PropsWithChildren, useMemo } from "react";
import AppBar from "./app-bar";
import Footer from "./footer";
import NavProvider from "./NavProvider";
import Sidenav from "./sidenav";
import SidenavDrawerContent from "./sidenav/SidenavDrawerContent";
import SlimSidenav from "./sidenav/SlimSidenav";
import StackedSidenav from "./sidenav/StackedSidenav";
import Topnav from "./topnav";
import TopNavStacked from "./topnav/TopNavStacked";
import TopnavSlim from "./topnav/TopnavSlim";

const MainLayout = ({ children }: PropsWithChildren) => {
  const {
    config: { drawerWidth, sideNavType, navigationMenuType, topNavType, openNavbarDrawer, navColor },
    setConfig,
  } = useSettingsContext();

  const toggleNavbarDrawer = () => {
    setConfig({
      openNavbarDrawer: !openNavbarDrawer,
    });
  };

  const toolbarVarint: ToolbarOwnProps["variant"] = useMemo(() => {
    if (navigationMenuType !== "sidenav") {
      if (topNavType === "slim") {
        return "appbarSlim";
      }
      if (topNavType === "stacked") {
        return "appbarStacked";
      }
    }
    return "appbar";
  }, [navigationMenuType, topNavType]);

  return (
    <Box>
      <Box
        className={clsx({
          "nav-vibrant": navColor === "vibrant",
        })}
        sx={{ display: "flex", zIndex: 1, position: "relative" }}
      >
        <NavProvider>
          {navigationMenuType === "sidenav" && <AppBar />}

          {(navigationMenuType === "sidenav" || navigationMenuType === "combo") && (
            <>
              {sideNavType === "default" && <Sidenav />}
              {sideNavType === "slim" && <SlimSidenav />}
              {sideNavType === "stacked" && <StackedSidenav />}
            </>
          )}

          {(navigationMenuType === "topnav" || navigationMenuType === "combo") && (
            <>
              {topNavType === "default" && <Topnav />}
              {topNavType === "slim" && <TopnavSlim />}
              {topNavType === "stacked" && <TopNavStacked />}
            </>
          )}

          <Drawer
            variant="temporary"
            open={openNavbarDrawer}
            onClose={toggleNavbarDrawer}
            ModalProps={{
              keepMounted: true,
            }}
            sx={[
              {
                display: { xs: "block", md: "none" },
                [`& .${drawerClasses.paper}`]: {
                  pt: 3,
                  boxSizing: "border-box",
                  width: mainDrawerWidth.full,
                },
              },
              navigationMenuType === "topnav" && {
                display: { md: "block", lg: "none" },
              },
              navColor === "vibrant" && sidenavVibrantStyle,
            ]}
          >
            {navColor === "vibrant" && <VibrantBackground position="side" />}
            <SidenavDrawerContent variant="temporary" />
          </Drawer>

          <Box
            component="main"
            sx={[
              {
                flexGrow: 1,
                p: 0,
                minHeight: "100vh",
                width: { xs: "100%", md: `calc(100% - ${drawerWidth}px)` },
                display: "flex",
                flexDirection: "column",
              },
              sideNavType === "default" && {
                ml: { md: `${mainDrawerWidth.collapsed}px`, lg: 0 },
              },
              sideNavType === "stacked" && {
                ml: { md: `${mainDrawerWidth.stackedNavCollapsed}px`, lg: 0 },
              },
              sideNavType === "slim" && {
                ml: { xs: 0 },
              },
              navigationMenuType === "topnav" && {
                ml: { xs: 0 },
              },
            ]}
          >
            <Toolbar variant={toolbarVarint} />

            <Box sx={{ flex: 1 }}>
              <Box
                sx={[
                  {
                    height: 1,
                    bgcolor: "background.default",
                  },
                ]}
              >
                {children}
              </Box>
            </Box>
            <Footer />
          </Box>
        </NavProvider>
      </Box>
    </Box>
  );
};

export default MainLayout;

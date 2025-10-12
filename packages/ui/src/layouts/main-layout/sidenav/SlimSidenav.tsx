import { VibrantBackground } from "@beep/ui/atoms";
import { Logo } from "@beep/ui/branding";
import sitemap from "@beep/ui/layouts/main-layout/sitemap";
import { useSettingsContext } from "@beep/ui/settings-v2/SettingsProvider";
import { sidenavVibrantStyle } from "@beep/ui-core/theme/styles/vibrantNav";
import { useTheme } from "@mui/material";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Drawer, { drawerClasses } from "@mui/material/Drawer";
import List from "@mui/material/List";
import Toolbar from "@mui/material/Toolbar";
import { Fragment } from "react";
import { useNavContext } from "../NavProvider";
import SidenavSimpleBar from "./SidenavSimpleBar";
import SlimNavItem from "./SlimNavItem";

const SlimSidenav = () => {
  const {
    config: { sidenavCollapsed, drawerWidth, navColor, navigationMenuType },
  } = useSettingsContext();
  const { sidenavAppbarVariant } = useNavContext();

  const drawer = (
    <>
      <Box sx={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
        {navColor === "vibrant" && <VibrantBackground position="side" />}
        <Toolbar
          variant={sidenavAppbarVariant}
          sx={[
            {
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            },
          ]}
        >
          {navigationMenuType === "sidenav" && <Logo showName={false} />}
        </Toolbar>
        <Box
          sx={{
            flex: 1,
            overflow: "hidden",
          }}
        >
          <SidenavSimpleBar
            sx={{
              height: 1,
              "& .simplebar-horizontal": {
                display: "none",
              },
            }}
            autoHide={false}
          >
            <Box
              sx={{
                p: 2,
              }}
            >
              {sitemap.map((menu, index) => (
                <Fragment key={menu.id}>
                  <List
                    component="nav"
                    sx={{
                      py: 0,
                      display: "flex",
                      flexDirection: "column",
                      gap: "2px",
                    }}
                  >
                    {menu.items.map((item) => (
                      <SlimNavItem key={item.pathName} item={item} level={0} />
                    ))}
                  </List>
                  {index !== sitemap.length - 1 && <Divider sx={[{ my: 1.5 }]} />}
                </Fragment>
              ))}
            </Box>
          </SidenavSimpleBar>
        </Box>
      </Box>
    </>
  );

  const theme = useTheme();

  return (
    <Box
      component="nav"
      className="slim-sidenav"
      sx={[
        {
          width: { md: drawerWidth },
          flexShrink: { sm: 0 },
        },
        !sidenavCollapsed && {
          transition: {
            xs: theme.transitions.create(["width"], {
              duration: theme.transitions.duration.standard,
            }),
          },
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
            boxSizing: "border-box",
            width: drawerWidth,
            transition: {
              xs: theme.transitions.create(["width"], {
                duration: theme.transitions.duration.standard,
              }),
            },
          },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default SlimSidenav;

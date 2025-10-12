import { Iconify, VibrantBackground } from "@beep/ui/atoms";
import { Logo } from "@beep/ui/branding";
import { useBreakpoints } from "@beep/ui/providers";
import { useSettingsContext } from "@beep/ui/settings-v2/SettingsProvider";
import { topnavVibrantStyle } from "@beep/ui-core/theme/styles/vibrantNav";
import { Box, Divider, paperClasses, Stack } from "@mui/material";
import MuiAppBar from "@mui/material/AppBar";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";
import AppbarActionItems from "../common/AppbarActionItems";
import { SearchBoxButton } from "../common/search-box/SearchBox";
import TopnavItems from "./TopnavItems";

const Topnav = () => {
  const {
    config: { navigationMenuType, navColor },
    handleDrawerToggle,
  } = useSettingsContext();

  const { up } = useBreakpoints();
  const upSm = up("sm");
  const upLg = up("lg");

  return (
    <MuiAppBar
      position="fixed"
      sx={[
        {
          width: 1,
          [`&.${paperClasses.root}`]: {
            outline: "none",
          },
        },
        navigationMenuType === "combo" && {
          zIndex: ({ zIndex }) => zIndex.drawer + 1,
        },
        navColor === "vibrant" && topnavVibrantStyle,
      ]}
    >
      {navColor === "vibrant" && <VibrantBackground position="top" />}
      <Toolbar variant="appbar" sx={{ px: { xs: 3, md: 5, position: "relative" } }}>
        <Box
          sx={{
            display: { xs: "flex" },
            alignItems: "center",
            gap: 1,
            pr: 2,
            mr: 1,
          }}
        >
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            className="appbar-drawer-button"
            onClick={handleDrawerToggle}
            sx={[
              {
                display: "flex",
              },
              (navigationMenuType === "sidenav" || navigationMenuType === "combo") && {
                display: { md: "none" },
              },
              navigationMenuType === "topnav" && {
                display: { lg: "none" },
              },
            ]}
          >
            <Iconify icon="material-symbols:menu-rounded" sx={{ fontSize: 20 }} />
          </IconButton>

          <Logo showName={upSm} />
        </Box>
        <Stack
          direction="row"
          sx={{
            alignItems: "center",
            flex: 1,
            flexWrap: "nowrap",
          }}
        >
          {upLg && <TopnavItems />}
          <AppbarActionItems
            searchComponent={
              <Box sx={{ pr: 1.5 }}>
                <SearchBoxButton variant="soft" color="neutral" />
              </Box>
            }
          />
        </Stack>
      </Toolbar>
      <Divider />
    </MuiAppBar>
  );
};

export default Topnav;

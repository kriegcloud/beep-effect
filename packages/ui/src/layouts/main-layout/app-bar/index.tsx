import { Iconify, VibrantBackground } from "@beep/ui/atoms";
import { Logo } from "@beep/ui/branding";
import { useBreakpoints } from "@beep/ui/providers";
import { useSettingsContext } from "@beep/ui/settings-v2/SettingsProvider";
import { topnavVibrantStyle } from "@beep/ui-core/theme/styles/vibrantNav";
import { Box, Button, paperClasses, Stack } from "@mui/material";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import { useEffect, useRef } from "react";
import AppbarActionItems from "../common/AppbarActionItems";
import SearchBox, { SearchBoxButton } from "../common/search-box/SearchBox";

const AppBar = () => {
  const {
    config: { drawerWidth, sideNavType, navColor },
    handleDrawerToggle,
  } = useSettingsContext();

  const { up } = useBreakpoints();
  const upSm = up("sm");
  const upMd = up("md");

  const prevSidenavTypeRef = useRef(sideNavType);

  useEffect(() => {
    if (prevSidenavTypeRef.current !== sideNavType) {
      prevSidenavTypeRef.current = sideNavType;
    }
  }, [sideNavType]);

  return (
    <MuiAppBar
      position="fixed"
      sx={[
        {
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          borderBottom: `1px solid`,
          borderColor: "divider",
          [`&.${paperClasses.root}`]: {
            outline: "none",
          },
        },
        sideNavType === "stacked" &&
          sideNavType === prevSidenavTypeRef.current &&
          ((theme) => ({
            transition: theme.transitions.create(["width"], {
              duration: theme.transitions.duration.standard,
            }),
          })),
        navColor === "vibrant" && !upMd && topnavVibrantStyle,
      ]}
    >
      {navColor === "vibrant" && !upMd && <VibrantBackground position="top" />}
      <Toolbar variant="appbar" sx={{ px: { xs: 3, md: 5 } }}>
        <Box
          sx={{
            display: { xs: "flex", md: "none" },
            alignItems: "center",
            gap: 1,
            pr: 2,
          }}
        >
          <Button color="neutral" variant="soft" shape="circle" aria-label="open drawer" onClick={handleDrawerToggle}>
            <Iconify icon="material-symbols:menu-rounded" sx={{ fontSize: 20 }} />
          </Button>

          <Box>
            <Logo showName={upSm} />
          </Box>
        </Box>

        <Stack
          sx={{
            alignItems: "center",
            flex: 1,
          }}
        >
          {upMd ? (
            <SearchBox
              sx={{
                width: 1,
                maxWidth: 420,
              }}
            />
          ) : (
            <SearchBoxButton />
          )}
          <AppbarActionItems />
        </Stack>
      </Toolbar>
    </MuiAppBar>
  );
};

export default AppBar;

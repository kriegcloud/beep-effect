import { Iconify, VibrantBackground } from "@beep/ui/atoms";
import { Logo } from "@beep/ui/branding";
import { useBreakpoints } from "@beep/ui/providers";
import { useSettingsContext } from "@beep/ui/settings-v2/SettingsProvider";
import { topnavVibrantStyle } from "@beep/ui-core/theme/styles/vibrantNav";
import { Box, Divider, paperClasses, Stack, type SxProps } from "@mui/material";
import MuiAppBar from "@mui/material/AppBar";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";
import AppbarActionItems from "../common/AppbarActionItems";
import { SearchBoxButton } from "../common/search-box/SearchBox";
import TopnavItems from "./TopnavItems";

interface TopnavSlimProps {
  sx?: SxProps;
}

const TopnavSlim = ({ sx }: TopnavSlimProps) => {
  const {
    config: { navColor, navigationMenuType },
    handleDrawerToggle,
  } = useSettingsContext();

  const { up } = useBreakpoints();
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
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {navColor === "vibrant" && <VibrantBackground position="top" />}
      <Toolbar variant="appbarSlim" sx={{ px: { xs: 3, md: 5 }, maxHeight: 38 }}>
        <Box
          sx={{
            display: { xs: "flex" },
            alignItems: "center",
            gap: 1,
            mr: 3,
          }}
        >
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={[
              {
                display: { xs: "flex", lg: "none" },
              },
              navigationMenuType === "combo" && {
                display: { md: "none" },
              },
            ]}
          >
            <Iconify icon="material-symbols:menu-rounded" sx={{ fontSize: 20 }} />
          </IconButton>

          <Logo showName={false} sx={{ height: 24, width: 15 }} />
        </Box>

        <Stack
          sx={{
            alignItems: "center",
            flex: 1,
          }}
        >
          {upLg && <TopnavItems type="slim" />}
          <AppbarActionItems
            type="slim"
            searchComponent={
              <SearchBoxButton
                type="slim"
                variant="soft"
                color="neutral"
                sx={[
                  {
                    borderRadius: 11,
                  },
                ]}
              />
            }
          />
        </Stack>
      </Toolbar>
      <Divider />
    </MuiAppBar>
  );
};

export default TopnavSlim;

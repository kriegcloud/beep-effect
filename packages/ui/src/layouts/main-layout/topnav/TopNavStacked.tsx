import { Iconify, VibrantBackground } from "@beep/ui/atoms";
import { Logo } from "@beep/ui/branding";
import { useBreakpoints } from "@beep/ui/providers";
import { useSettingsContext } from "@beep/ui/settings-v2/SettingsProvider";
import { topnavVibrantStyle } from "@beep/ui-core/theme/styles/vibrantNav";
import { Box, Divider, IconButton, paperClasses } from "@mui/material";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import AppbarActionItems from "../common/AppbarActionItems";
import SearchBox from "../common/search-box/SearchBox";
import TopnavItems from "./TopnavItems";

const TopNavStacked = () => {
  const {
    config: { navColor },
    handleDrawerToggle,
  } = useSettingsContext();

  const { up } = useBreakpoints();
  const upSm = up("sm");
  const upMd = up("md");

  return (
    <>
      <MuiAppBar
        position="fixed"
        sx={[
          {
            width: 1,
            zIndex: ({ zIndex }) => ({
              md: zIndex.drawer + 1,
            }),
            [`&.${paperClasses.root}`]: {
              outline: "none",
            },
          },
          navColor === "vibrant" && topnavVibrantStyle,
        ]}
      >
        {navColor === "vibrant" && <VibrantBackground position="top" />}
        <Toolbar sx={{ height: 64, gap: 5, justifyContent: "space-between", px: { xs: 3, md: 5 } }}>
          <Box
            sx={{
              display: { xs: "flex" },
              alignItems: "center",
              gap: 1,
              mr: 5,
              justifyContent: { xs: "flex-start", md: "center" },
            }}
          >
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{
                display: { xs: "flex", md: "none" },
              }}
            >
              <Iconify icon="material-symbols:menu-rounded" sx={{ fontSize: 20 }} />
            </IconButton>
            <Logo showName={upSm} />
          </Box>

          {upMd && (
            <SearchBox
              sx={[
                {
                  width: 1,
                  maxWidth: 480,
                },
              ]}
            />
          )}

          <AppbarActionItems sx={{ ml: 0 }} />
        </Toolbar>
        <Toolbar
          className="MuiToolbar-bottom"
          variant={upMd ? "appbarSlim" : "appbar"}
          sx={{ justifyContent: "center", px: 2, bgcolor: "background.elevation1" }}
        >
          {upMd ? (
            <TopnavItems type="slim" />
          ) : (
            <SearchBox
              sx={[
                {
                  width: 1,
                  maxWidth: { sm: 480 },
                },
              ]}
            />
          )}
        </Toolbar>
        <Divider />
      </MuiAppBar>
    </>
  );
};

export default TopNavStacked;

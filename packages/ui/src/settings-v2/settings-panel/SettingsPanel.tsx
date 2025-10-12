"use client";

import { Iconify, type IconifyProps } from "@beep/ui/atoms";
import { useThemeMode } from "@beep/ui/hooks";
import { SimpleBar } from "@beep/ui/molecules";
import { blue, green } from "@beep/ui-core/theme/core/colors";
import { cssVarRgba } from "@beep/ui-core/utils";
import { Box, Button, paperClasses, Stack, Toolbar, Typography } from "@mui/material";
import Drawer from "@mui/material/Drawer";
import { usePathname, useRouter } from "next/navigation";
import type { PropsWithChildren } from "react";
import { useSettingsPanelContext } from "../SettingsPanelProvider";
import { useSettingsContext } from "../SettingsProvider";
import { RESET } from "../SettingsReducer";
import NavColorPanel from "./NavColorPanel";
import NavigationMenuPanel from "./NavigationMenuPanel";
import SidenavShapePanel from "./SidenavShapePanel";
import TextDirectionPanel from "./TextDirectionPanel";
import ThemeModeToggleTab from "./ThemeModeToggleTab";
import TopnavShapePanel from "./TopnavShapePanel";

const SettingsPanel = () => {
  const {
    config: { navigationMenuType },
    configDispatch,
  } = useSettingsContext();
  const router = useRouter();
  const pathname = usePathname();
  const { resetTheme } = useThemeMode();
  const {
    settingsPanelConfig: {
      openSettingPanel,
      disableNavigationMenuSection,
      disableNavColorSection,
      disableTopShapeSection,
      disableSidenavShapeSection,
    },
    setSettingsPanelConfig,
  } = useSettingsPanelContext();

  const handleReset = () => {
    router.replace(pathname);
    resetTheme();
    configDispatch({
      type: RESET,
    });
  };

  return (
    <div>
      <Drawer
        open={openSettingPanel}
        anchor="right"
        onClose={() => {
          setSettingsPanelConfig({ openSettingPanel: false });
        }}
        sx={({ zIndex }) => ({
          zIndex: zIndex.tooltip + 1,
          [`& .${paperClasses.root}`]: {
            width: 313,
          },
        })}
      >
        <Toolbar
          sx={(theme) => ({
            background: `linear-gradient(90.42deg, ${blue[300]} 13.1%, ${green[400]} 143.31%)`,
            gap: 1,

            ...theme.applyStyles("dark", {
              background: `linear-gradient(90.42deg, ${blue[900]} 13.1%, ${green[600]} 143.31%)`,
            }),
          })}
        >
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 700,
              flex: 1,
            }}
          >
            Customize
          </Typography>
          <Button
            variant="soft"
            sx={({ vars }) => ({
              bgcolor: cssVarRgba(vars.palette.common.whiteChannel, 0.1),
              color: vars.palette.common.white,
            })}
            startIcon={<Iconify icon="material-symbols:reset-settings-rounded" />}
            onClick={handleReset}
          >
            Reset
          </Button>
          <Button
            variant="soft"
            sx={({ vars }) => ({
              bgcolor: cssVarRgba(vars.palette.common.whiteChannel, 0.1),
              color: vars.palette.common.white,
            })}
            shape="square"
            onClick={() => {
              setSettingsPanelConfig({
                openSettingPanel: false,
              });
            }}
          >
            <Iconify icon="material-symbols:close-rounded" sx={{ fontSize: 20 }} />
          </Button>
        </Toolbar>
        <Box
          sx={{
            flex: 1,
            overflow: "hidden",
          }}
        >
          <SimpleBar
            sx={{
              height: 1,
              "& .simplebar-mask": {
                zIndex: "unset",
              },
            }}
            autoHide={false}
          >
            <Box sx={{ p: 3 }}>
              <Stack
                direction="column"
                sx={{
                  gap: 5,
                }}
              >
                <Section title="Theme Mode">
                  <ThemeModeToggleTab />
                </Section>

                <Section title="Text Direction">
                  <TextDirectionPanel />
                </Section>

                <Section title="Navigation Menu" disable={disableNavigationMenuSection}>
                  <NavigationMenuPanel />
                </Section>

                {navigationMenuType !== "topnav" && (
                  <Section title="Sidenav Shape" disable={disableSidenavShapeSection}>
                    <SidenavShapePanel />
                  </Section>
                )}
                {navigationMenuType !== "sidenav" && (
                  <Section title="Topnav Shape" disable={disableTopShapeSection}>
                    <TopnavShapePanel />
                  </Section>
                )}
                <Section title="Nav Color" disable={disableNavColorSection}>
                  <NavColorPanel />
                </Section>
              </Stack>
            </Box>
          </SimpleBar>
        </Box>
        <Toolbar
          sx={{
            display: "block",
            borderTop: 1,
            borderColor: "dividerLight",
            py: 2,
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 700,
              background: `linear-gradient(92.45deg, #20DE99 -0.35%, #7DB1F5 43.54%, #5A9EF6 78.08%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            And more
          </Typography>
          <Typography
            variant="body2"
            sx={{
              background: `linear-gradient(92.45deg, #5A9EF6 -0.35%, #7DB1F5 43.54%, #20DE99 78.91%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Coming Soon...
          </Typography>
        </Toolbar>
      </Drawer>
    </div>
  );
};

export default SettingsPanel;

const Section = ({ title, disable, children }: PropsWithChildren<{ title: string; disable?: boolean }>) => {
  return (
    <Box
      sx={[
        !!disable && {
          pointerEvents: "none",
          "& .SettingsItem": {
            "&:after": {
              bgcolor: "unset",
            },
          },
        },
      ]}
    >
      <Typography
        variant="subtitle1"
        sx={[
          {
            fontWeight: 700,
            mb: 2,
          },
          !!disable && { mb: 1, color: "text.disabled" },
        ]}
      >
        {title}
      </Typography>
      {disable && (
        <Stack sx={{ alignItems: "center", gap: 0.5, mb: 2, color: "info.main" }}>
          <Iconify icon={"material-symbols:info-outline" as IconifyProps["icon"]} sx={{ fontSize: 16 }} />
          <Typography variant="subtitle2">Not available in this layout.</Typography>
        </Stack>
      )}
      <Box sx={[!!disable && { opacity: 0.4 }]}>{children}</Box>
    </Box>
  );
};

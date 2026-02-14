"use client";

import { Label } from "@beep/ui/atoms";
import { Scrollbar } from "@beep/ui/molecules";
import type { SettingsDrawerProps, SettingsState } from "@beep/ui-core/settings/types";
import { themeConfig } from "@beep/ui-core/theme/theme-config";
import { primaryColorPresets } from "@beep/ui-core/theme/with-settings";
import { hasKeys, rgbaFromChannel } from "@beep/ui-core/utils";
import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import SvgIcon from "@mui/material/SvgIcon";
import { useColorScheme } from "@mui/material/styles";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { ArrowCounterClockwiseIcon, XIcon } from "@phosphor-icons/react";
import { useCallback, useEffect } from "react";
import { useSettingsContext } from "../context/use-settings-context";
import { BaseOption } from "./base-option";
import { FontFamilyOptions, FontSizeOptions } from "./font-options";
import { FullScreenButton } from "./fullscreen-button";
import { settingIcons } from "./icons";
import { NavColorOptions, NavLayoutOptions } from "./nav-layout-option";
import { PresetsOptions } from "./presets-options";
import { LargeBlock, SmallBlock } from "./styles";

export function SettingsDrawer({ sx, defaultSettings }: SettingsDrawerProps) {
  const settings = useSettingsContext();
  const { mode, setMode, colorScheme } = useColorScheme();

  // Visible options by default settings
  const visibility = {
    mode: hasKeys(defaultSettings, ["mode"]),
    contrast: hasKeys(defaultSettings, ["contrast"]),
    navColor: hasKeys(defaultSettings, ["navColor"]),
    fontSize: hasKeys(defaultSettings, ["fontSize"]),
    direction: hasKeys(defaultSettings, ["direction"]),
    navLayout: hasKeys(defaultSettings, ["navLayout"]),
    fontFamily: hasKeys(defaultSettings, ["fontFamily"]),
    primaryColor: hasKeys(defaultSettings, ["primaryColor"]),
    compactLayout: hasKeys(defaultSettings, ["compactLayout"]),
  };

  useEffect(() => {
    if (mode !== undefined && mode !== settings.state.mode) {
      settings.setState({ mode });
    }
  }, [mode, settings]);

  const handleReset = useCallback(() => {
    settings.onReset();
    setMode(null);
  }, [setMode, settings]);

  const renderHead = () => (
    <Box
      sx={{
        py: 2,
        pr: 1,
        pl: 2.5,
        display: "flex",
        alignItems: "center",
      }}
    >
      <Typography variant="h6" sx={{ flexGrow: 1 }}>
        Settings
      </Typography>

      <FullScreenButton />

      <Tooltip title="Reset all">
        <IconButton onClick={handleReset}>
          <Badge color="error" variant="dot" invisible={!settings.canReset}>
            <ArrowCounterClockwiseIcon weight="bold" />
          </Badge>
        </IconButton>
      </Tooltip>

      <Tooltip title="Close">
        <IconButton onClick={settings.onCloseDrawer}>
          <XIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );

  const renderMode = () => (
    <BaseOption
      label="Mode"
      selected={settings.state.mode === "dark"}
      icon={<SvgIcon>{settingIcons.moon}</SvgIcon>}
      action={
        mode === "system" ? (
          <Label
            sx={{
              height: 20,
              cursor: "inherit",
              borderRadius: "20px",
              fontWeight: "fontWeightSemiBold",
            }}
          >
            System
          </Label>
        ) : null
      }
      onChangeOption={() => {
        setMode(colorScheme === "light" ? "dark" : "light");
        settings.setState({ mode: colorScheme === "light" ? "dark" : "light" });
      }}
    />
  );

  const renderContrast = () => (
    <BaseOption
      label="Contrast"
      selected={settings.state.contrast === "high"}
      icon={<SvgIcon>{settingIcons.contrast}</SvgIcon>}
      onChangeOption={() => {
        settings.setState({
          contrast: settings.state.contrast === "default" ? "high" : "default",
        });
      }}
    />
  );

  const renderDirection = () => (
    <BaseOption
      label="Right to left"
      selected={settings.state.direction === "rtl"}
      icon={<SvgIcon>{settingIcons.alignRight}</SvgIcon>}
      onChangeOption={() => {
        settings.setState({
          direction: settings.state.direction === "ltr" ? "rtl" : "ltr",
        });
      }}
    />
  );

  const renderCompactLayout = () => (
    <BaseOption
      tooltip="Dashboard only and available at large resolutions > 1600px (xl)"
      label="Compact"
      selected={!!settings.state.compactLayout}
      icon={<SvgIcon>{settingIcons.autofitWidth}</SvgIcon>}
      onChangeOption={() => {
        settings.setState({ compactLayout: !settings.state.compactLayout });
      }}
    />
  );

  const renderPresets = () => (
    <LargeBlock
      title="Presets"
      canReset={settings.state.primaryColor !== defaultSettings.primaryColor}
      onReset={() => {
        settings.setState({ primaryColor: defaultSettings.primaryColor });
      }}
    >
      <PresetsOptions
        icon={<SvgIcon sx={{ width: 28, height: 28 }}>{settingIcons.siderbarDuotone}</SvgIcon>}
        options={(Object.keys(primaryColorPresets) as SettingsState["primaryColor"][]).map((key) => ({
          name: key,
          value: primaryColorPresets[key].main,
        }))}
        value={settings.state.primaryColor}
        onChangeOption={(newOption) => {
          settings.setState({ primaryColor: newOption });
        }}
      />
    </LargeBlock>
  );

  const renderNav = () => (
    <LargeBlock title="Nav" tooltip="Dashboard only" sx={{ gap: 2.5 }}>
      {visibility.navLayout && (
        <SmallBlock
          label="Layout"
          canReset={settings.state.navLayout !== defaultSettings.navLayout}
          onReset={() => {
            settings.setState({ navLayout: defaultSettings.navLayout });
          }}
        >
          <NavLayoutOptions
            value={settings.state.navLayout}
            onChangeOption={(newOption) => {
              settings.setState({ navLayout: newOption });
            }}
            options={[
              {
                value: "vertical",
                icon: <SvgIcon sx={{ width: 1, height: "auto" }}>{settingIcons.navVertical}</SvgIcon>,
              },
              {
                value: "horizontal",
                icon: <SvgIcon sx={{ width: 1, height: "auto" }}>{settingIcons.navHorizontal}</SvgIcon>,
              },
              {
                value: "mini",
                icon: <SvgIcon sx={{ width: 1, height: "auto" }}>{settingIcons.navMini}</SvgIcon>,
              },
            ]}
          />
        </SmallBlock>
      )}
      {visibility.navColor && (
        <SmallBlock
          label="Color"
          canReset={settings.state.navColor !== defaultSettings.navColor}
          onReset={() => {
            settings.setState({ navColor: defaultSettings.navColor });
          }}
        >
          <NavColorOptions
            value={settings.state.navColor}
            onChangeOption={(newOption) => {
              settings.setState({ navColor: newOption });
            }}
            options={[
              {
                label: "Integrate",
                value: "integrate",
                icon: <SvgIcon>{settingIcons.sidebarOutline}</SvgIcon>,
              },
              {
                label: "Apparent",
                value: "apparent",
                icon: <SvgIcon>{settingIcons.sidebarFill}</SvgIcon>,
              },
            ]}
          />
        </SmallBlock>
      )}
    </LargeBlock>
  );

  const renderFont = () => (
    <LargeBlock title="Font" sx={{ gap: 2.5 }}>
      {visibility.fontFamily && (
        <SmallBlock
          label="Family"
          canReset={settings.state.fontFamily !== defaultSettings.fontFamily}
          onReset={() => {
            settings.setState({ fontFamily: defaultSettings.fontFamily });
          }}
        >
          <FontFamilyOptions
            value={settings.state.fontFamily}
            onChangeOption={(newOption) => {
              settings.setState({ fontFamily: newOption });
            }}
            options={[themeConfig.fontFamily.primary, "Inter Variable", "DM Sans Variable", "Nunito Sans Variable"]}
            icon={<SvgIcon sx={{ width: 28, height: 28 }}>{settingIcons.font}</SvgIcon>}
          />
        </SmallBlock>
      )}
      {visibility.fontSize && (
        <SmallBlock
          label="Size"
          canReset={settings.state.fontSize !== defaultSettings.fontSize}
          onReset={() => {
            settings.setState({ fontSize: defaultSettings.fontSize });
          }}
          sx={{ gap: 5 }}
        >
          <FontSizeOptions
            options={[12, 20]}
            value={settings.state.fontSize}
            onChangeOption={(newOption) => {
              settings.setState({ fontSize: newOption });
            }}
          />
        </SmallBlock>
      )}
    </LargeBlock>
  );

  return (
    <Drawer
      anchor="right"
      open={settings.openDrawer}
      onClose={settings.onCloseDrawer}
      keepMounted={false}
      disableRestoreFocus
      slotProps={{
        backdrop: { invisible: true },
        paper: {
          sx: [
            (theme) => ({
              ...theme.mixins.paperStyles(theme, {
                color: rgbaFromChannel(theme.vars.palette.background.defaultChannel, 0.9),
              }),
              width: 360,
            }),
            ...(Array.isArray(sx) ? sx : [sx]),
          ],
        },
      }}
    >
      {renderHead()}

      <Scrollbar>
        <Box
          sx={{
            pb: 5,
            gap: 6,
            px: 2.5,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box
            sx={{
              gap: 2,
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
            }}
          >
            {visibility.mode && renderMode()}
            {visibility.contrast && renderContrast()}
            {visibility.direction && renderDirection()}
            {visibility.compactLayout && renderCompactLayout()}
          </Box>

          {(visibility.navColor || visibility.navLayout) && renderNav()}
          {visibility.primaryColor && renderPresets()}
          {(visibility.fontFamily || visibility.fontSize) && renderFont()}
        </Box>
      </Scrollbar>
    </Drawer>
  );
}

"use client";

import type { TopNavType } from "@beep/ui-core/settings";
import { FormControlLabel, Radio } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { usePathname, useRouter } from "next/navigation";
import type { ChangeEvent } from "react";
import { useSettingsContext } from "../SettingsProvider";
import SettingsItem from "./SettingsItem";
import SettingsPanelRadioGroup from "./SettingsPanelRadioGroup";

const SETTINGS_PANEL_IMAGE_BASE = "/assets/images/sections/settings-panel";

const TopnavShapePanel = () => {
  const {
    config: { topnavType, themeMode },
    setConfig,
  } = useSettingsContext();
  const router = useRouter();
  const pathname = usePathname();

  const theme = useTheme();
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    router.replace(pathname);
    const value = (event.target as HTMLInputElement).value as TopNavType.Type;
    setConfig({
      topnavType: value,
    });
  };

  return (
    <SettingsPanelRadioGroup name="sidenav-shape" value={topnavType} onChange={handleChange}>
      <FormControlLabel
        value="default"
        control={<Radio />}
        label={
          <SettingsItem
            label="Default"
            image={`${SETTINGS_PANEL_IMAGE_BASE}/topnav-default${theme.palette.mode === "dark" ? "-dark" : ""}.avif`}
            active={topnavType === "default"}
          />
        }
      />
      <FormControlLabel
        value="slim"
        control={<Radio />}
        label={
          <SettingsItem
            label="Slim"
            image={`${SETTINGS_PANEL_IMAGE_BASE}/topnav-slim${themeMode === "dark" ? "-dark" : ""}.avif`}
            active={topnavType === "slim"}
          />
        }
      />
      <FormControlLabel
        value="stacked"
        control={<Radio />}
        label={
          <SettingsItem
            label="Stacked"
            image={`${SETTINGS_PANEL_IMAGE_BASE}/topnav-stacked${themeMode === "dark" ? "-dark" : ""}.avif`}
            active={topnavType === "stacked"}
          />
        }
      />
    </SettingsPanelRadioGroup>
  );
};

export default TopnavShapePanel;

"use client";
import type { SideNavType } from "@beep/ui-core/settings";
import { FormControlLabel, Radio } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { usePathname, useRouter } from "next/navigation";
import type { ChangeEvent } from "react";
import { useSettingsPanelContext } from "../SettingsPanelProvider";
import { useSettingsContext } from "../SettingsProvider";
import { SET_SIDENAV_SHAPE } from "../SettingsReducer";
import SettingsItem from "./SettingsItem";
import SettingsPanelRadioGroup from "./SettingsPanelRadioGroup";

const SETTINGS_PANEL_IMAGE_BASE = "/assets/images/sections/settings-panel";

const SidenavShapePanel = () => {
  const {
    config: { sidenavType },
    configDispatch,
  } = useSettingsContext();
  const theme = useTheme();

  const {
    settingsPanelConfig: { disableSidenavShapeSection },
  } = useSettingsPanelContext();
  const router = useRouter();
  const pathname = usePathname();

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    router.replace(pathname);
    const value = (event.target as HTMLInputElement).value as SideNavType.Type;

    configDispatch({
      type: SET_SIDENAV_SHAPE,
      payload: value,
    });
  };

  return (
    <SettingsPanelRadioGroup name="sidenav-shape" value={sidenavType} onChange={handleChange}>
      <FormControlLabel
        value="default"
        control={<Radio />}
        label={
          <SettingsItem
            label="Default"
            image={`${SETTINGS_PANEL_IMAGE_BASE}/sidenav-default${theme.palette.mode === "dark" ? "-dark" : ""}.avif`}
            active={!disableSidenavShapeSection && sidenavType === "default"}
          />
        }
      />
      <FormControlLabel
        value="slim"
        control={<Radio />}
        label={
          <SettingsItem
            label="Slim"
            image={`${SETTINGS_PANEL_IMAGE_BASE}/slim${theme.palette.mode === "dark" ? "-dark" : ""}.avif`}
            active={!disableSidenavShapeSection && sidenavType === "slim"}
          />
        }
      />
      <FormControlLabel
        value="stacked"
        control={<Radio />}
        label={
          <SettingsItem
            label="Stacked"
            image={`${SETTINGS_PANEL_IMAGE_BASE}/stacked${theme.palette.mode === "dark" ? "-dark" : ""}.avif`}
            active={!disableSidenavShapeSection && sidenavType === "stacked"}
          />
        }
      />
    </SettingsPanelRadioGroup>
  );
};

export default SidenavShapePanel;

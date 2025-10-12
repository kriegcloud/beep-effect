"use client";
import { assetPaths } from "@beep/constants";
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

const SidenavShapePanel = () => {
  const {
    config: { sideNavType },
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
    <SettingsPanelRadioGroup name="sidenav-shape" value={sideNavType} onChange={handleChange}>
      <FormControlLabel
        value="default"
        control={<Radio />}
        label={
          <SettingsItem
            label="Default"
            image={
              theme.palette.mode === "light"
                ? assetPaths.assets.images.sections.sidenavDefault
                : assetPaths.assets.images.sections.sidenavDefaultDark
            }
            active={!disableSidenavShapeSection && sideNavType === "default"}
          />
        }
      />
      <FormControlLabel
        value="slim"
        control={<Radio />}
        label={
          <SettingsItem
            label="Slim"
            image={
              theme.palette.mode === "light"
                ? assetPaths.assets.images.sections.slim
                : assetPaths.assets.images.sections.slimDark
            }
            active={!disableSidenavShapeSection && sideNavType === "slim"}
          />
        }
      />
      <FormControlLabel
        value="stacked"
        control={<Radio />}
        label={
          <SettingsItem
            label="Stacked"
            image={
              theme.palette.mode === "light"
                ? assetPaths.assets.images.sections.stacked
                : assetPaths.assets.images.sections.stackedDark
            }
            active={!disableSidenavShapeSection && sideNavType === "stacked"}
          />
        }
      />
    </SettingsPanelRadioGroup>
  );
};

export default SidenavShapePanel;

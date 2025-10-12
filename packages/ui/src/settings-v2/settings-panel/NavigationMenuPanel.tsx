import { assetPaths } from "@beep/constants";
import type { NavigationMenuType } from "@beep/ui-core/settings";
import { FormControlLabel, Radio } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { usePathname, useRouter } from "next/navigation";
import type { ChangeEvent } from "react";
import { useSettingsPanelContext } from "../SettingsPanelProvider";
import { useSettingsContext } from "../SettingsProvider";
import { SET_NAVIGATION_MENU_TYPE } from "../SettingsReducer";
import SettingsItem from "./SettingsItem";
import SettingsPanelRadioGroup from "./SettingsPanelRadioGroup";

const NavigationMenuPanel = () => {
  const {
    config: { navigationMenuType },
    configDispatch,
  } = useSettingsContext();
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();

  const {
    settingsPanelConfig: { disableNavigationMenuSection },
  } = useSettingsPanelContext();

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    router.replace(pathname);
    const value = (event.target as HTMLInputElement).value as NavigationMenuType.Type;
    configDispatch({
      type: SET_NAVIGATION_MENU_TYPE,
      payload: value,
    });
  };

  return (
    <SettingsPanelRadioGroup name="text-direction" value={navigationMenuType} onChange={handleChange}>
      <FormControlLabel
        value="sidenav"
        control={<Radio />}
        label={
          <SettingsItem
            label="Sidenav"
            image={
              theme.palette.mode === "light"
                ? assetPaths.assets.images.sections.settingspanel.sidenav
                : assetPaths.assets.images.sections.settingspanel.sidenavDark
            }
            active={!disableNavigationMenuSection && navigationMenuType === "sidenav"}
          />
        }
      />
      <FormControlLabel
        value="topnav"
        control={<Radio />}
        label={
          <SettingsItem
            label="Topnav"
            image={
              theme.palette.mode === "light"
                ? assetPaths.assets.images.sections.settingspanel.topnav
                : assetPaths.assets.images.sections.settingspanel.topnavDark
            }
            active={!disableNavigationMenuSection && navigationMenuType === "topnav"}
          />
        }
      />
      <FormControlLabel
        value="combo"
        control={<Radio />}
        label={
          <SettingsItem
            label="Combo"
            image={
              theme.palette.mode === "light"
                ? assetPaths.assets.images.sections.settingspanel.combo
                : assetPaths.assets.images.sections.settingspanel.comboDark
            }
            active={!disableNavigationMenuSection && navigationMenuType === "combo"}
          />
        }
      />
    </SettingsPanelRadioGroup>
  );
};

export default NavigationMenuPanel;

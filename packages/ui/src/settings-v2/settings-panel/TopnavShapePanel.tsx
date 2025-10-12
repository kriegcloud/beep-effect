"use client";

import { assetPaths } from "@beep/constants";
import type { TopNavType } from "@beep/ui-core/settings";
import { FormControlLabel, Radio } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { usePathname, useRouter } from "next/navigation";
import type { ChangeEvent } from "react";
import { useSettingsContext } from "../SettingsProvider";
import SettingsItem from "./SettingsItem";
import SettingsPanelRadioGroup from "./SettingsPanelRadioGroup";

const TopnavShapePanel = () => {
  const {
    config: { topNavType },
    setConfig,
  } = useSettingsContext();
  const router = useRouter();
  const pathname = usePathname();

  const theme = useTheme();
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    router.replace(pathname);
    const value = (event.target as HTMLInputElement).value as TopNavType.Type;
    setConfig({
      topNavType: value,
    });
  };

  return (
    <SettingsPanelRadioGroup name="sidenav-shape" value={topNavType} onChange={handleChange}>
      <FormControlLabel
        value="default"
        control={<Radio />}
        label={
          <SettingsItem
            label="Default"
            image={
              theme.palette.mode === "light"
                ? assetPaths.assets.images.sections.topnavDefault
                : assetPaths.assets.images.sections.topnavDefaultDark
            }
            active={topNavType === "default"}
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
                ? assetPaths.assets.images.sections.topnavSlim
                : assetPaths.assets.images.sections.topnavSlimDark
            }
            active={topNavType === "slim"}
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
                ? assetPaths.assets.images.sections.topnavStacked
                : assetPaths.assets.images.sections.topnavStackedDark
            }
            active={topNavType === "stacked"}
          />
        }
      />
    </SettingsPanelRadioGroup>
  );
};

export default TopnavShapePanel;

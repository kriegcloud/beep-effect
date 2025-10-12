import type { TextDirection } from "@beep/ui-core/settings";
import { FormControlLabel, Radio } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { usePathname, useRouter } from "next/navigation";
import type { ChangeEvent } from "react";
import { useSettingsContext } from "../SettingsProvider";
import SettingsItem from "./SettingsItem";
import SettingsPanelRadioGroup from "./SettingsPanelRadioGroup";

const SETTINGS_PANEL_IMAGE_BASE = "/assets/images/sections/settings-panel";

const TextDirectionPanel = () => {
  const {
    config: { textDirection },
    setConfig,
  } = useSettingsContext();
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    router.replace(pathname);
    setConfig({
      textDirection: (event.target as HTMLInputElement).value as TextDirection.Type,
    });
  };

  return (
    <SettingsPanelRadioGroup name="text-direction" value={textDirection} onChange={handleChange}>
      <FormControlLabel
        value="ltr"
        control={<Radio />}
        label={
          <SettingsItem
            label="LTR"
            image={`${SETTINGS_PANEL_IMAGE_BASE}/ltr${theme.palette.mode === "dark" ? "-dark" : ""}.avif`}
            active={textDirection === "ltr"}
          />
        }
      />
      <FormControlLabel
        value="rtl"
        control={<Radio />}
        label={
          <SettingsItem
            label="RTL"
            image={`${SETTINGS_PANEL_IMAGE_BASE}/rtl${theme.palette.mode === "dark" ? "-dark" : ""}.avif`}
            active={textDirection === "rtl"}
          />
        }
      />
    </SettingsPanelRadioGroup>
  );
};

export default TextDirectionPanel;

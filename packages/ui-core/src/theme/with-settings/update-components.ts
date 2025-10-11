import type { SettingsState } from "@beep/ui-core/settings";
import { cardClasses } from "@mui/material/Card";
import type { Components, Theme } from "@mui/material/styles";

export function applySettingsToComponents(settingsState?: SettingsState): {
  components: Components<Theme>;
} {
  const MuiCssBaseline: Components<Theme>["MuiCssBaseline"] = {
    styleOverrides: (theme) => ({
      html: {
        fontSize: settingsState?.fontSize,
      },
      body: {
        [`& .${cardClasses.root}`]: {
          ...(settingsState?.contrast === "hight" && {
            "--card-shadow": theme.vars.customShadows.z1,
          }),
        },
      },
    }),
  };

  return {
    components: {
      MuiCssBaseline,
    },
  };
}

import type { SettingsState } from "@beep/ui-core/settings";
import { createPaletteChannel, hexToRgbChannel, setFont } from "@beep/ui-core/utils";
import type { ColorSystem, ColorSystemOptions, Shadows } from "@mui/material/styles";
import * as P from "effect/Predicate";
import type { CustomShadows } from "../core/custom-shadows";
import { createShadowColor } from "../core/custom-shadows";
import type { ThemeColorScheme, ThemeOptions } from "../types";
import { primaryColorPresets } from "./color-presets";
/**
 * Updates the core theme with the provided settings state.
 * @param theme - The base theme options to update.
 * @param settingsState - The settings state containing direction, fontFamily, contrast, and primaryColor.
 * @returns Updated theme options with applied settings.
 */

export function applySettingsToTheme(theme: ThemeOptions, settingsState?: SettingsState | undefined): ThemeOptions {
  const { direction, fontFamily, contrast = "default", primaryColor = "default" } = settingsState ?? {};

  const isDefaultContrast = contrast === "default";
  const isDefaultPrimaryColor = primaryColor === "default";

  const lightPalette = theme.colorSchemes?.light?.palette as ColorSystem["palette"];

  const primaryColorPalette = createPaletteChannel(primaryColorPresets[primaryColor]);
  // const secondaryColorPalette = createPaletteChannel(secondaryColorPresets[primaryColor]);

  const updateColorScheme = (schemeName: ThemeColorScheme) => {
    const currentScheme = theme.colorSchemes?.[schemeName];

    type CurrentSchemeType =
      | (boolean &
          ColorSystemOptions & {
            shadows?: Partial<Shadows>;
            customShadows?: Partial<CustomShadows>;
          })
      | (ColorSystemOptions & {
          shadows?: Partial<Shadows>;
          customShadows?: Partial<CustomShadows>;
        })
      | undefined;
    const handleCurrentSchema = (scheme: CurrentSchemeType) =>
      P.and(P.isNotNullable, P.isObject)(scheme) ? scheme : {};

    const updatedPalette = {
      ...currentScheme?.palette,
      ...(!isDefaultPrimaryColor && {
        primary: primaryColorPalette,
        // secondary: secondaryColorPalette,
      }),
      ...(schemeName === "light" && {
        background: {
          ...lightPalette?.background,
          ...(!isDefaultContrast && {
            default: lightPalette.grey[200],
            defaultChannel: hexToRgbChannel(lightPalette.grey[200]),
          }),
        },
      }),
    };

    const updatedCustomShadows = {
      ...currentScheme?.customShadows,
      ...(!isDefaultPrimaryColor && {
        primary: createShadowColor(primaryColorPalette.mainChannel),
        // secondary: createShadowColor(secondaryColorPalette.mainChannel),
      }),
    };

    return {
      ...(currentScheme ? handleCurrentSchema(currentScheme as CurrentSchemeType) : {}),
      palette: updatedPalette,
      customShadows: updatedCustomShadows,
    };
  };

  return {
    ...theme,
    direction,
    colorSchemes: {
      light: updateColorScheme("light"),
      dark: updateColorScheme("dark"),
    },
    typography: {
      ...theme.typography,
      fontFamily: setFont(fontFamily),
    },
  } as ThemeOptions;
}

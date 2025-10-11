import { rgbaFromChannel } from "@beep/ui-core/utils";
import type { ThemeColorScheme } from "../types";
import { common, error, grey, info, primary, secondary, success, warning } from "./palette";

export interface CustomShadows {
  z1?: string | undefined;
  z4?: string | undefined;
  z8?: string | undefined;
  z12?: string | undefined;
  z16?: string | undefined;
  z20?: string | undefined;
  z24?: string | undefined;
  primary?: string | undefined;
  secondary?: string | undefined;
  info?: string | undefined;
  success?: string | undefined;
  warning?: string | undefined;
  error?: string | undefined;
  card?: string | undefined;
  dialog?: string | undefined;
  dropdown?: string | undefined;
}

export function createShadowColor(colorChannel: string): string {
  return `0 8px 16px 0 ${rgbaFromChannel(colorChannel, 0.24)}`;
}

function createCustomShadows(colorChannel: string): CustomShadows {
  return {
    z1: `0 1px 2px 0 ${rgbaFromChannel(colorChannel, 0.16)}`,
    z4: `0 4px 8px 0 ${rgbaFromChannel(colorChannel, 0.16)}`,
    z8: `0 8px 16px 0 ${rgbaFromChannel(colorChannel, 0.16)}`,
    z12: `0 12px 24px -4px ${rgbaFromChannel(colorChannel, 0.16)}`,
    z16: `0 16px 32px -4px ${rgbaFromChannel(colorChannel, 0.16)}`,
    z20: `0 20px 40px -4px ${rgbaFromChannel(colorChannel, 0.16)}`,
    z24: `0 24px 48px 0 ${rgbaFromChannel(colorChannel, 0.16)}`,

    dialog: `-40px 40px 80px -8px ${rgbaFromChannel(common.blackChannel, 0.24)}`,
    card: `0 0 2px 0 ${rgbaFromChannel(colorChannel, 0.2)}, 0 12px 24px -4px ${rgbaFromChannel(colorChannel, 0.12)}`,
    dropdown: `0 0 2px 0 ${rgbaFromChannel(colorChannel, 0.24)}, -20px 20px 40px -4px ${rgbaFromChannel(colorChannel, 0.24)}`,

    primary: createShadowColor(primary.mainChannel),
    secondary: createShadowColor(secondary.mainChannel),
    info: createShadowColor(info.mainChannel),
    success: createShadowColor(success.mainChannel),
    warning: createShadowColor(warning.mainChannel),
    error: createShadowColor(error.mainChannel),
  };
}

export const customShadows: Record<ThemeColorScheme, CustomShadows> = {
  light: createCustomShadows(grey["500Channel"]),
  dark: createCustomShadows(common.blackChannel),
};

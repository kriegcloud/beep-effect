import { rgbaFromChannel } from "@beep/ui-core/utils";
import type { Theme } from "@mui/material/styles";

function desktopVars(theme: Theme) {
  const {
    shape,
    vars: { palette },
  } = theme;

  return {
    "--nav-dropdown-width": "200px",
    //
    "--nav-item-gap": "24px",
    "--nav-item-radius": "0",
    "--nav-item-caption-color": palette.text.disabled,
    // root
    "--nav-item-root-padding": "0",
    "--nav-item-root-active-color": palette.primary.main,
    // sub
    "--nav-item-sub-radius": `${Number(shape.borderRadius) * 0.75}px`,
    "--nav-item-sub-padding": "6px 8px 6px 8px",
    "--nav-item-sub-color": palette.text.secondary,
    "--nav-item-sub-hover-color": palette.text.primary,
    "--nav-item-sub-hover-bg": palette.action.hover,
    "--nav-item-sub-active-color": palette.text.primary,
    "--nav-item-sub-active-bg": palette.action.selected,
    "--nav-item-sub-open-color": palette.text.primary,
    "--nav-item-sub-open-bg": palette.action.hover,
    // icon
    "--nav-icon-size": "22px",
    "--nav-icon-margin": "0 8px 0 0",
  };
}

function mobileVars(theme: Theme) {
  const {
    shape,
    vars: { palette },
  } = theme;

  return {
    "--nav-item-gap": "4px",
    "--nav-item-radius": `${shape.borderRadius}px`,
    "--nav-item-pt": "4px",
    "--nav-item-pr": "8px",
    "--nav-item-pb": "4px",
    "--nav-item-pl": "12px",
    "--nav-item-color": palette.text.secondary,
    "--nav-item-hover-color": palette.action.hover,
    "--nav-item-caption-color": palette.text.disabled,
    // root
    "--nav-item-root-height": "44px",
    "--nav-item-root-active-color": palette.primary.main,
    "--nav-item-root-active-color-on-dark": palette.primary.light,
    "--nav-item-root-active-bg": rgbaFromChannel(palette.primary.mainChannel, 0.08),
    "--nav-item-root-active-hover-bg": rgbaFromChannel(palette.primary.mainChannel, 0.16),
    "--nav-item-root-open-color": palette.text.primary,
    "--nav-item-root-open-bg": palette.action.hover,
    // sub
    "--nav-item-sub-height": "36px",
    "--nav-item-sub-active-color": palette.text.primary,
    "--nav-item-sub-active-bg": palette.action.hover,
    "--nav-item-sub-open-color": palette.text.primary,
    "--nav-item-sub-open-bg": palette.action.hover,
    // icon
    "--nav-icon-size": "24px",
    "--nav-icon-margin": "0 12px 0 0",
  };
}

export const navBasicVars = { desktop: desktopVars, mobile: mobileVars };

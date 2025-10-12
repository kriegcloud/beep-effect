import type { Theme } from "@mui/material";

const emojiMart = ({ vars, typography }: Theme) => {
  return {
    "em-emoji-picker": {
      height: 400,
      "--font-family": typography.fontFamily,
      "--font-size": typography.subtitle2.fontSize,
      "--rgb-background": vars.palette.background.menu,
      // '--rgb-accent': palette.primary.main,
      "--rgb-color": vars.palette.text.primary,
      "--rgb-input": vars.palette.background.elevation3,
      "--color-border": vars.palette.background.elevation3,
    },
  };
};

export default emojiMart;

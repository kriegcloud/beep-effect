import type { SxProps, Theme } from "@mui/material/styles";
import "@mui/material/themeCssVarsAugmentation";

declare module "@mui/material-pigment-css" {
  interface ThemeArgs {
    readonly theme: Theme;
  }
}

declare global {
  namespace React {
    interface HTMLAttributes {
      readonly sx?: undefined | SxProps<Theme>;
    }
    interface SVGProps {
      readonly sx?: undefined | SxProps<Theme>;
    }
  }
}

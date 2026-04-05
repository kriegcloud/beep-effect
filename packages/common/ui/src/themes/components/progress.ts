import type { ThemeComponents } from "../types.ts";

export const progressTheme: ThemeComponents = {
  MuiCircularProgress: {
    styleOverrides: {
      circle: {
        strokeLinecap: "round",
      },
    },
  },
};

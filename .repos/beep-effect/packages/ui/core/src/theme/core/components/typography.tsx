import type { Components, Theme } from "@mui/material/styles";

const MuiTypography: Components<Theme>["MuiTypography"] = {
  defaultProps: {
    variantMapping: {
      subtitle2: "p",
    },
  },
};

export const typography: Components<Theme> = {
  MuiTypography,
};

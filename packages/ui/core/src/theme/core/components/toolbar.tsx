import type { Components, Theme } from "@mui/material/styles";

declare module "@mui/material/Toolbar" {
  interface ToolbarPropsVariantOverrides {
    appbar: true;
    appbarSlim: true;
    appbarStacked: true;
  }
}

export const MuiToolbar: Components<Theme>["MuiToolbar"] = {
  variants: [
    {
      props: { variant: "appbar" },
      style: ({ theme }) => ({
        minHeight: 64,
        [theme.breakpoints.up("md")]: {
          minHeight: 82,
        },
      }),
    },
    {
      props: { variant: "appbarSlim" },
      style: () => ({
        minHeight: 38,
      }),
    },
    {
      props: { variant: "appbarStacked" },
      style: ({ theme }) => ({
        minHeight: 129,
        [theme.breakpoints.up("md")]: {
          minHeight: 103,
        },
      }),
    },
  ],
};

export const toolbar: Components<Theme> = {
  MuiToolbar,
};

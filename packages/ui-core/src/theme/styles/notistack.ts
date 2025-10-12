import type { Theme } from "@mui/material";

const notistack = (theme: Theme) => ({
  ".notistack-Snackbar": {
    "& #notistack-snackbar": {
      padding: 0,
    },
    "& .notistack-MuiContent": {
      backgroundColor: theme.vars.palette.background.menu,
      color: theme.vars.palette.text.primary,
      flexWrap: "nowrap",
      boxShadow: theme.vars.shadows[3],
      borderRadius: (theme.shape.borderRadius as number) * 7,
      border: 0,
      ...theme.applyStyles("dark", { border: 1 }),
      borderStyle: "solid",
      borderColor: theme.vars.palette.menuDivider,
      ...theme.typography.body2,
      padding: theme.spacing(1),
      justifyContent: "space-between",
      "& > div:last-of-type": {
        padding: 0,
        margin: 0,
      },
      "&.notistack-MuiContent-default": {
        backgroundColor: theme.vars.palette.neutral.darker,
        color: theme.vars.palette.common.white,
        "& .notistack-close-btn": {
          color: theme.vars.palette.common.white,
        },
      },
      "& .notistack-Icon": {
        flexShrink: 0,
      },
    },
  },
});
export default notistack;

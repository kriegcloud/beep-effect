import type { Components, Theme } from "@mui/material/styles";

const MuiBreadcrumbs: Components<Theme>["MuiBreadcrumbs"] = {
  // ▼▼▼▼▼▼▼▼ 🎨 STYLE ▼▼▼▼▼▼▼▼
  styleOverrides: {
    ol: ({ theme }) => ({
      rowGap: theme.spacing(0.5),
      columnGap: theme.spacing(2),
    }),
    li: ({ theme }) => ({
      display: "inline-flex",
      "& > *": { ...theme.typography.body2 },
    }),
    separator: { margin: 0 },
  },
};

/* **********************************************************************
 * 🚀 Export
 * **********************************************************************/
export const breadcrumbs: Components<Theme> = {
  MuiBreadcrumbs,
};

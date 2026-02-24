import { svgIconClasses } from "@mui/material";
import type { Components, ComponentsVariants, Theme } from "@mui/material/styles";
import { tabClasses } from "@mui/material/Tab";
import type { TabsClassKey } from "@mui/material/Tabs";
/**
 * TypeScript extension for MUI theme augmentation.
 * @to {@link file://./../../extend-theme-types.d.ts}
 */
export type TabsExtendIndicatorColor = { custom: true; inherit: true };

type TabsVariants = ComponentsVariants<Theme>["MuiTabs"];
type TabVariants = ComponentsVariants<Theme>["MuiTab"];

const customTabsIndicatorStyles = {
  root: (theme: Theme) => {
    const cssVars = {
      "--item-padding-x": "16px",
      "--list-padding-x": "8px",
      "--indicator-radius": "8px",
      "--indicator-shadow": theme.vars.customShadows.z1,
      "--indicator-bg": theme.vars.palette.common.white,
      ...theme.applyStyles("dark", {
        "--indicator-bg": theme.vars.palette.grey[900],
      }),
    };

    return {
      ...cssVars,
      backgroundColor: theme.vars.palette.background.neutral,
      [`& .${tabClasses.root}`]: {
        zIndex: 1,
        minHeight: 52,
        paddingLeft: "var(--item-padding-x)",
        paddingRight: "var(--item-padding-x)",
      },
    };
  },
  listHorizontal: {
    height: "100%",
    paddingLeft: "var(--list-padding-x)",
    paddingRight: "var(--list-padding-x)",
  },
  listVertical: {
    paddingTop: "var(--list-padding-x)",
    paddingBottom: "var(--list-padding-x)",
  },
  indicator: {
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    "&::before": {
      content: '""',
      width: "100%",
      boxShadow: "var(--indicator-shadow)",
      backgroundColor: "var(--indicator-bg)",
      borderRadius: "var(--indicator-radius)",
      height: "calc(100% - calc(var(--list-padding-x) * 2))",
    },
  },
  indicatorVertical: {
    width: "100%",
    "&::before": {
      height: "100%",
      width: "calc(100% - calc(var(--list-padding-x) * 2))",
    },
  },
};

/* **********************************************************************
 * 🗳️ Variants
 * **********************************************************************/
const tabsVariants = {
  root: [
    {
      props: (props) => props.textColor === "inherit",
      style: {
        [`& .${tabClasses.root}`]: {
          [`&.${tabClasses.selected}`]: {
            color: "inherit",
          },
        },
      },
    },
    {
      props: (props) => props.indicatorColor === "custom",
      style: ({ theme }) => ({ ...customTabsIndicatorStyles.root(theme) }),
    },
  ],
  list: [
    {
      props: (props) =>
        props.indicatorColor !== "custom" && props.variant !== "fullWidth" && props.orientation !== "vertical",
      style: ({ theme }) => ({
        gap: theme.spacing(5),
        [theme.breakpoints.down("sm")]: { gap: theme.spacing(3) },
      }),
    },
    {
      props: (props) => props.indicatorColor === "custom" && props.orientation === "horizontal",
      style: { ...customTabsIndicatorStyles.listHorizontal },
    },
    {
      props: (props) => props.indicatorColor === "custom" && props.orientation === "vertical",
      style: { ...customTabsIndicatorStyles.listVertical },
    },
  ],
  indicator: [
    {
      props: (props) => props.indicatorColor === "inherit",
      style: { backgroundColor: "currentColor" },
    },
    {
      props: (props) => props.indicatorColor === "custom",
      style: { ...customTabsIndicatorStyles.indicator },
    },
    {
      props: (props) => props.indicatorColor === "custom" && props.orientation === "vertical",
      style: { ...customTabsIndicatorStyles.indicatorVertical },
    },
  ],
} satisfies Partial<Record<TabsClassKey, TabsVariants>>;

const tabVariants = [
  {
    props: {},
    style: ({ theme }) => ({
      [`&.${tabClasses.selected}`]: {
        fontWeight: theme.typography.fontWeightSemiBold,
      },
    }),
  },
  {
    props: (props) => !!props.icon && !!props.label,
    style: {
      minHeight: "auto",
    },
  },
] satisfies TabVariants;

/* **********************************************************************
 * 🧩 Components
 * **********************************************************************/
const MuiTabs: Components<Theme>["MuiTabs"] = {
  // ▼▼▼▼▼▼▼▼ ⚙️ PROPS ▼▼▼▼▼▼▼▼
  defaultProps: {
    variant: "scrollable",
    textColor: "inherit",
    indicatorColor: "inherit",
    allowScrollButtonsMobile: true,
  },
  // ▼▼▼▼▼▼▼▼ 🎨 STYLE ▼▼▼▼▼▼▼▼
  styleOverrides: {
    root: {
      variants: [...tabsVariants.root],
    },
    list: {
      gap: "8px",
      variants: [...tabsVariants.list],
    },
    indicator: {
      variants: [...tabsVariants.indicator],
    },
  },
};

const MuiTab: Components<Theme>["MuiTab"] = {
  // ▼▼▼▼▼▼▼▼ ⚙️ PROPS ▼▼▼▼▼▼▼▼
  defaultProps: {
    disableRipple: true,
    iconPosition: "start",
  },
  // ▼▼▼▼▼▼▼▼ 🎨 STYLE ▼▼▼▼▼▼▼▼
  styleOverrides: {
    root: ({ theme }) => ({
      opacity: 1,
      padding: "8px",
      minWidth: "36px",
      [`.${svgIconClasses.root}`]: {
        fontSize: 20,
      },
      paddingLeft: 0,
      paddingRight: 0,
      minHeight: "36px",
      color: theme.vars.palette.text.secondary,
      fontWeight: theme.typography.fontWeightMedium,
      lineHeight: theme.typography.body2.lineHeight,
      variants: [...tabVariants],
    }),
  },
};

/* **********************************************************************
 * 🚀 Export
 * **********************************************************************/
export const tabs: Components<Theme> = {
  MuiTab,
  MuiTabs,
};

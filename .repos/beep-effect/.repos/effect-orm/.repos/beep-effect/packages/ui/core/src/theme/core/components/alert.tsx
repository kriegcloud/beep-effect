"use client";
import { parseCssVar, rgbaFromChannel } from "@beep/ui-core/utils";
import type { SvgIconProps } from "@mui/material/SvgIcon";
import SvgIcon from "@mui/material/SvgIcon";
import type { Components, ComponentsVariants, Theme } from "@mui/material/styles";

const SEVERITIES = ["info", "success", "warning", "error"] as const;

type AlertVariants = ComponentsVariants<Theme>["MuiAlert"];

/* **********************************************************************
 * ♉️ Custom icons
 * **********************************************************************/
const InfoIcon = (props: SvgIconProps) => (
  // https://icon-sets.iconify.design/solar/info-circle-bold/
  <SvgIcon {...props}>
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12S6.477 2 12 2s10 4.477 10 10m-10 5.75a.75.75 0 0 0 .75-.75v-6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75M12 7a1 1 0 1 1 0 2a1 1 0 0 1 0-2"
      clipRule="evenodd"
    />
  </SvgIcon>
);

const SuccessIcon = (props: SvgIconProps) => (
  // https://icon-sets.iconify.design/solar/check-circle-bold/
  <SvgIcon {...props}>
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12S6.477 2 12 2s10 4.477 10 10m-5.97-3.03a.75.75 0 0 1 0 1.06l-5 5a.75.75 0 0 1-1.06 0l-2-2a.75.75 0 1 1 1.06-1.06l1.47 1.47l2.235-2.235L14.97 8.97a.75.75 0 0 1 1.06 0"
      clipRule="evenodd"
    />
  </SvgIcon>
);

const WarningIcon = (props: SvgIconProps) => (
  // https://icon-sets.iconify.design/solar/danger-triangle-bold/
  <SvgIcon {...props}>
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M5.312 10.762C8.23 5.587 9.689 3 12 3c2.31 0 3.77 2.587 6.688 7.762l.364.644c2.425 4.3 3.638 6.45 2.542 8.022S17.786 21 12.364 21h-.728c-5.422 0-8.134 0-9.23-1.572s.117-3.722 2.542-8.022zM12 7.25a.75.75 0 0 1 .75.75v5a.75.75 0 0 1-1.5 0V8a.75.75 0 0 1 .75-.75M12 17a1 1 0 1 0 0-2a1 1 0 0 0 0 2"
      clipRule="evenodd"
    />
  </SvgIcon>
);

const ErrorIcon = (props: SvgIconProps) => (
  // https://icon-sets.iconify.design/solar/danger-bold/
  <SvgIcon {...props}>
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M7.843 3.802C9.872 2.601 10.886 2 12 2c1.114 0 2.128.6 4.157 1.802l.686.406c2.029 1.202 3.043 1.803 3.6 2.792c.557.99.557 2.19.557 4.594v.812c0 2.403 0 3.605-.557 4.594c-.557.99-1.571 1.59-3.6 2.791l-.686.407C14.128 21.399 13.114 22 12 22c-1.114 0-2.128-.6-4.157-1.802l-.686-.407c-2.029-1.2-3.043-1.802-3.6-2.791C3 16.01 3 14.81 3 12.406v-.812C3 9.19 3 7.989 3.557 7c.557-.99 1.571-1.59 3.6-2.792zM13 16a1 1 0 1 1-2 0a1 1 0 0 1 2 0m-1-9.75a.75.75 0 0 1 .75.75v6a.75.75 0 0 1-1.5 0V7a.75.75 0 0 1 .75-.75"
      clipRule="evenodd"
    />
  </SvgIcon>
);

/* **********************************************************************
 * 🗳️ Variants
 * **********************************************************************/
const standardVariants = [
  ...(SEVERITIES.map((colorKey) => ({
    props: (props) => props.variant === "standard" && props.severity === colorKey,
    style: ({ theme }) => ({
      color: theme.vars.palette[colorKey].darker,
      backgroundColor: theme.vars.palette[colorKey].lighter,
      ...theme.applyStyles("dark", {
        color: theme.vars.palette[colorKey].lighter,
        backgroundColor: theme.vars.palette[colorKey].darker,
      }),
    }),
  })) satisfies AlertVariants),
] satisfies AlertVariants;

const filledVariants = [
  ...(SEVERITIES.map((colorKey) => ({
    props: (props) => props.variant === "filled" && props.severity === colorKey,
    style: ({ theme }) => ({
      color: theme.vars.palette[colorKey].contrastText,
    }),
  })) satisfies AlertVariants),
] satisfies AlertVariants;

const outlinedVariants = [
  ...(SEVERITIES.map((colorKey) => ({
    props: (props) => props.variant === "outlined" && props.severity === colorKey,
    style: ({ theme }) => ({
      color: theme.vars.palette[colorKey].dark,
      backgroundColor: rgbaFromChannel(theme.vars.palette[colorKey].mainChannel, 0.08),
      border: `solid 1px ${rgbaFromChannel(theme.vars.palette[colorKey].mainChannel, 0.16)}`,
      ...theme.applyStyles("dark", {
        color: theme.vars.palette[colorKey].light,
      }),
    }),
  })) satisfies AlertVariants),
] satisfies AlertVariants;

/* **********************************************************************
 * 🧩 Components
 * **********************************************************************/
const MuiAlert: Components<Theme>["MuiAlert"] = {
  // ▼▼▼▼▼▼▼▼ ⚙️ PROPS ▼▼▼▼▼▼▼▼
  defaultProps: {
    iconMapping: {
      info: <InfoIcon />,
      error: <ErrorIcon />,
      success: <SuccessIcon />,
      warning: <WarningIcon />,
    },
  },
  // ▼▼▼▼▼▼▼▼ 🎨 STYLE ▼▼▼▼▼▼▼▼
  styleOverrides: {
    root: {
      variants: [...standardVariants, ...filledVariants, ...outlinedVariants],
    },
    icon: ({ theme }) => ({
      opacity: 1,
      ...theme.applyStyles("dark", {
        [parseCssVar(theme.vars.palette.Alert.infoIconColor)]: theme.vars.palette.info.light,
        [parseCssVar(theme.vars.palette.Alert.errorIconColor)]: theme.vars.palette.error.light,
        [parseCssVar(theme.vars.palette.Alert.successIconColor)]: theme.vars.palette.success.light,
        [parseCssVar(theme.vars.palette.Alert.warningIconColor)]: theme.vars.palette.warning.light,
      }),
    }),
  },
};

const MuiAlertTitle: Components<Theme>["MuiAlertTitle"] = {
  // ▼▼▼▼▼▼▼▼ 🎨 STYLE ▼▼▼▼▼▼▼▼
  styleOverrides: {
    root: ({ theme }) => ({
      marginBottom: theme.spacing(0.5),
      fontWeight: theme.typography.fontWeightSemiBold,
    }),
  },
};

/* **********************************************************************
 * 🚀 Export
 * **********************************************************************/
export const alert: Components<Theme> = {
  MuiAlert,
  MuiAlertTitle,
};

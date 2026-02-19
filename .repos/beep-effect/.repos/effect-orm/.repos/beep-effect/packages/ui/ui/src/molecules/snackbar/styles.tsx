import { rgbaFromChannel } from "@beep/ui-core/utils";
import type { CSSObject, Theme } from "@mui/material/styles";
import { styled } from "@mui/material/styles";
import { Toaster } from "sonner";

import { snackbarClasses } from "./classes";

const loadingIconStyles = (theme: Theme): CSSObject => ({
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  display: "none",
  transform: "none",
  overflow: "hidden",
  alignItems: "center",
  position: "relative",
  borderRadius: "inherit",
  justifyContent: "center",
  background: theme.vars.palette.background.neutral,
  [snackbarClasses.loaderVisible]: {
    display: "inline-flex",
  },
  [`& .${snackbarClasses.loadingIcon}`]: {
    zIndex: 9,
    width: 24,
    height: 24,
    borderRadius: "50%",
    animation: "rotate 3s infinite linear",
    background: `conic-gradient(transparent, ${rgbaFromChannel(theme.vars.palette.text.disabledChannel, 0.64)})`,
  },
});

const iconStyles = (theme: Theme): CSSObject => ({
  [`& .${snackbarClasses.icon}`]: {
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    alignSelf: "flex-start",
    justifyContent: "center",
    [`&:not(.${snackbarClasses.unset})`]: {
      width: 48,
      height: 48,
      borderRadius: "inherit",
      backgroundColor: rgbaFromChannel("currentColor", 0.08),
      [`& .${snackbarClasses.iconSvg}`]: {
        width: 24,
        height: 24,
      },
      [`& .${snackbarClasses.loader}`]: {
        ...loadingIconStyles(theme),
      },
    },
  },
});

const contentStyles = (theme: Theme): CSSObject => ({
  [`& .${snackbarClasses.content}`]: {
    gap: 2,
    display: "flex",
    flex: "1 1 auto",
    flexDirection: "column",
  },
  [`& .${snackbarClasses.title}`]: {
    lineHeight: 20 / 13,
    fontSize: theme.typography.pxToRem(13),
    fontWeight: theme.typography.fontWeightMedium,
  },
  [`& .${snackbarClasses.description}`]: {
    opacity: 0.64,
    lineHeight: 18 / 13,
    fontSize: theme.typography.pxToRem(13),
  },
});

const actionsStyles = (theme: Theme): CSSObject => ({
  [`& .${snackbarClasses.actionButton}, .${snackbarClasses.closeButton}`]: {
    color: "inherit",
    cursor: "pointer",
    alignItems: "center",
    display: "inline-flex",
    justifyContent: "center",
    backgroundColor: "transparent",
    border: `solid 1px ${rgbaFromChannel("currentColor", 0.16)}`,
    transition: theme.transitions.create(["background-color", "border-color"]),
    "&:hover": {
      borderColor: rgbaFromChannel("currentColor", 0.24),
      backgroundColor: rgbaFromChannel("currentColor", 0.08),
    },
  },
  [`& .${snackbarClasses.actionButton}`]: {
    borderRadius: 6,
    lineHeight: 18 / 13,
    padding: " 2px 8px",
    fontSize: theme.typography.pxToRem(13),
    fontWeight: theme.typography.fontWeightSemiBold,
  },
  [`& .${snackbarClasses.closeButton}`]: {
    top: 0,
    right: 0,
    width: 20,
    height: 20,
    padding: 0,
    borderRadius: "50%",
    position: "absolute",
    transform: "translate(-6px, 6px)",
    "& > svg": { width: 14, height: 14, opacity: 0.8 },
  },
});

const toastStyles = (theme: Theme): CSSObject => ({
  [`& .${snackbarClasses.toast}`]: {
    gap: 12,
    minHeight: 52,
    borderRadius: 12,
    width: "100%",
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(0.5, 1, 0.5, 0.5),
    boxShadow: theme.vars.customShadows.z8,
    backgroundColor: theme.vars.palette.background.paper,
    [`&:has(${snackbarClasses.closeBtnVisible})`]: {
      [`& .${snackbarClasses.content}`]: { paddingRight: 24 },
    },
    [snackbarClasses.default]: {
      padding: theme.spacing(1, 1, 1, 1.5),
      color: theme.vars.palette.background.paper,
      backgroundColor: theme.vars.palette.text.primary,
    },
    [`&.${snackbarClasses.info} .${snackbarClasses.icon}`]: {
      color: theme.vars.palette.info.main,
    },
    [`&.${snackbarClasses.success} .${snackbarClasses.icon}`]: {
      color: theme.vars.palette.success.main,
    },
    [`&.${snackbarClasses.warning} .${snackbarClasses.icon}`]: {
      color: theme.vars.palette.warning.main,
    },
    [`&.${snackbarClasses.error} .${snackbarClasses.icon}`]: {
      color: theme.vars.palette.error.main,
    },
  },
});

export const SnackbarRoot = styled(Toaster)(({ theme }) => ({
  "@keyframes rotate": {
    to: { transform: "rotate(1turn)" },
  },
  width: 300,
  ...toastStyles(theme),
  ...iconStyles(theme),
  ...contentStyles(theme),
  ...actionsStyles(theme),
}));

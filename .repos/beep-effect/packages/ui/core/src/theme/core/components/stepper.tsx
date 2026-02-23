import { parseCssVar } from "@beep/ui-core/utils";
import type { Components, Theme } from "@mui/material/styles";

const MuiStepConnector: Components<Theme>["MuiStepConnector"] = {
  // ▼▼▼▼▼▼▼▼ 🎨 STYLE ▼▼▼▼▼▼▼▼
  styleOverrides: {
    root: ({ theme }) => ({
      [parseCssVar(theme.vars.palette.StepConnector.border)]: theme.vars.palette.divider,
    }),
  },
};

const MuiStepContent: Components<Theme>["MuiStepContent"] = {
  // ▼▼▼▼▼▼▼▼ 🎨 STYLE ▼▼▼▼▼▼▼▼
  styleOverrides: {
    root: ({ theme }) => ({
      [parseCssVar(theme.vars.palette.StepContent.border)]: theme.vars.palette.divider,
    }),
  },
};

/* **********************************************************************
 * 🚀 Export
 * **********************************************************************/
export const stepper: Components<Theme> = {
  MuiStepConnector,
  MuiStepContent,
};

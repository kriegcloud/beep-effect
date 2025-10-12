import { cssVarRgba } from "@beep/ui-core/utils";
import type { Theme } from "@mui/material";

const projectTimelineChart = (theme: Theme) => {
  const { vars } = theme;
  return {
    "& .sg-task.ongoing": {
      backgroundColor: vars.palette.chBlue["100Channel"],
      color: `${vars.palette.primary.darker} !important`,
    },
    "& .sg-task.complete": {
      backgroundColor: vars.palette.chGreen["100Channel"],
      color: `${vars.palette.success.darker} !important`,
    },
    "& .sg-task.due": {
      backgroundColor: vars.palette.chOrange["100Channel"],
      color: `${vars.palette.warning.darker} !important`,
    },
    "& .sg-cell-inner": {
      paddingLeft: theme.direction === "ltr" ? "24px !important" : "unset",
      paddingRight: theme.direction === "rtl" ? "24px !important" : "unset",
      whiteSpace: "pre-line",
      fontWeight: 400,
      color: vars.palette.text.secondary,
      overflow: "hidden",
      textOverflow: "ellipsis",
      display: "-webkit-box !important",
      WebkitLineClamp: "2",
      WebkitBoxOrient: "vertical",
    },
    "& .sg-foreground": {
      "& .sg-time-range": {
        width: "1px !important",
        backgroundImage: "none !important",
        backgroundColor: vars.palette.divider,
        transform: "scaleY(0.94)",
      },
      "& .due .sg-task-background": {
        borderRadius: "4px !important",
        backgroundColor: `${cssVarRgba(vars.palette.warning.lightChannel, 0.15)} !important`,
      },
      "& .complete .sg-task-background": {
        borderRadius: "4px !important",
        backgroundColor: `${vars.palette.chGreen["100Channel"]} !important`,
      },
      "& .ongoing .sg-task-background": {
        borderRadius: "4px !important",
        backgroundColor: `${vars.palette.chBlue["100Channel"]} !important`,
      },
    },
    "& .sg-table-rows": {
      "& .sg-table-row": {
        position: "relative",
        "&:before": {
          content: '""',
          position: "absolute",
          left: theme.direction === "ltr" ? 0 : "unset",
          right: theme.direction === "rtl" ? 0 : "unset",
          height: "100%",
          width: "4px",
          backgroundColor: vars.palette.divider,
        },
        "&.task-divider-end:before": {
          top: 0,
          height: "86%",
        },
        "&.task-divider-start:before": {
          bottom: 0,
          height: "86%",
        },
        "&.task-divider-end.task-divider-start:before": {
          height: "80%",
          top: "50%",
          transform: "translateY(-50%)",
        },
      },
      "& .complete": {
        "&:before": {
          backgroundColor: vars.palette.success.main,
        },
      },
      "& .due": {
        "&:before": {
          backgroundColor: vars.palette.warning.main,
        },
      },
      "& .ongoing": {
        "&:before": {
          backgroundColor: vars.palette.primary.main,
        },
      },
    },
    "& .sg-table-rows .due": {
      "&.due-divider": {
        paddingBottom: "18px",
      },
      "& .sg-tree-expander": {
        backgroundColor: vars.palette.warning.main,
      },
    },
    "& .sg-table-rows .complete": {
      "&.complete-divider": {
        paddingBottom: 0,
      },
      "& .sg-tree-expander": {
        backgroundColor: vars.palette.success.main,
      },
    },
  };
};

export default projectTimelineChart;

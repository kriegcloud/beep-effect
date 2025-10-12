import type { Theme } from "@mui/material";

const reactFc = (theme: Theme) => {
  const { vars, spacing, breakpoints, typography, shape, transitions } = theme;

  return {
    "& .fc": {
      "--fc-page-bg-color": vars.palette.background.menu,
      "--fc-now-indicator-color": vars.palette.warning.main,
      "--fc-highlight-color": vars.palette.background.elevation1,
      "--fc-border-color": vars.palette.dividerLight,
      "--fc-event-text-color": vars.palette.common.white,
      "--fc-event-bg-color": vars.palette.primary.main,

      // General styles
      "& .fc-day-grid-container.fc-scroller": {
        height: "auto !important",
        overflowY: "auto",
      },
      "& .fc-scroller": {
        overflowY: "auto",
      },
      ".fc .fc-toolbar.fc-header-toolbar": {
        position: "sticky",
        top: 0,
        zIndex: 100,
      },
      "& .fc-scrollgrid-section-header.fc-scrollgrid-section-sticky>*": {
        top: 64,
        [breakpoints.up("md")]: { top: 82 },
      },
      "& .fc-daygrid-body": {
        backgroundColor: vars.palette.background.default,
        width: "100% !important",
      },
      "& .fc-timegrid-body": {
        backgroundColor: vars.palette.background.default,
        zIndex: 2,
      },
      "& .fc-scrollgrid": {
        border: "none",
        borderColor: vars.palette.dividerLight,
        backgroundColor: vars.palette.background.menu,
      },
      "& .fc-timegrid-axis ~ .fc-day .fc-daygrid-day-frame.fc-scrollgrid-sync-inner": {
        borderBottom: `1px solid ${vars.palette.dividerLight} !important`,
      },
      "& .fc-col-header-cell .fc-scrollgrid-sync-inner": {
        borderBottom: `1px solid ${vars.palette.dividerLight} !important`,
      },

      // Column header styles
      "& .fc-col-header": {
        backgroundColor: vars.palette.background.menu,
        "& th": {
          borderBottomWidth: 1,
          fontWeight: typography.fontWeightBold,
          color: vars.palette.text.secondary,
          lineHeight: 1.5,
          backgroundColor: vars.palette.background.elevation1,
        },
        "& .fc-timegrid-axis-frame-liquid": {
          borderBottom: `1px solid ${vars.palette.dividerLight}`,
        },
      },
      "& .fc-timegrid .fc-col-header-cell-cushion": {
        textDecoration: "none !important",
        paddingTop: 18,
        paddingBottom: 18,
      },

      "& .fc-col-header-cell-cushion": {
        textDecoration: "none !important",
        paddingTop: 11,
        paddingBottom: 11,
      },
      "& .time .fc-col-header-cell-cushion": {
        textDecoration: "none !important",
        paddingTop: 12,
        paddingBottom: 12,
      },

      // Event styles
      "& .fc-h-event .fc-event-title": {
        width: "100%",
        [breakpoints.only("xs")]: { width: "calc(100% - 5px)" },
        whiteSpace: "normal",
        textOverflow: "ellipsis",
        fontWeight: typography.fontWeightRegular,
      },
      "& .fc-daygrid-event": {
        marginTop: 0,
        marginBottom: spacing(0.5),
        padding: spacing(0.75, 1.5),
        [breakpoints.down("xl")]: {
          padding: spacing(0.5, 1),
        },
        "& .fc-event-title, .fc-event-time": {
          padding: "0 !important",
        },
        ...typography.subtitle2,
      },
      "&.fc-direction-rtl, &.fc-direction-ltr": {
        "& .fc-timegrid-col-events": {
          marginLeft: spacing(1),
          marginRight: spacing(1),
          [breakpoints.down("xl")]: {
            marginLeft: spacing(0.5),
            marginRight: spacing(0.5),
          },
        },
        "& .fc-daygrid-event": {
          borderRadius: shape.borderRadius,
          border: "none",
          "&.fc-event-start, &.fc-event-end": {
            marginLeft: 0,
            marginRight: 0,
          },
        },
      },

      // Day grid styles
      "& .fc-daygrid-day-frame": {
        padding: spacing(1),
        [breakpoints.down("xl")]: { padding: spacing(0.5) },
        cursor: "pointer",
        "& .fc-daygrid-day-events": {
          marginBottom: 0,
        },
        "&:active, &:hover": {
          backgroundColor: "unset",
        },
      },
      "& .fc-daygrid-day-bottom": {
        display: "flex",
        justifyContent: "center",
        fontWeight: typography.fontWeightBold,
        color: vars.palette.primary.main,
      },
      "& .fc-daygrid-day-top": {
        marginBottom: spacing(0.5),
        padding: spacing(1, 1.5),
        [breakpoints.down("lg")]: {
          padding: spacing(0.5, 1),
        },
      },
      "& .fc-daygrid-day-number": {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: spacing(5),
        height: spacing(5),
        [breakpoints.down("lg")]: {
          width: spacing(4),
          height: spacing(4),
        },
        borderRadius: "50%",
        transition: transitions.create(["background-color"], {
          duration: transitions.duration.short,
        }),
      },
      "& .fc-day-today:not(.fc-popover)": {
        "& .fc-daygrid-day-number": {
          backgroundColor: vars.palette.primary.main,
          color: vars.palette.background.menu,
          "&:hover, &:focus": {
            backgroundColor: vars.palette.primary.dark,
          },
        },
      },
      ".fc-daygrid-body.fc-daygrid-body-unbalanced.fc-daygrid-body-natural": {
        ".fc-scrollgrid-sync-table": {
          height: spacing(9),
        },
      },

      // Time grid styles
      "& .fc-v-event": {
        border: "none !important",
        borderRadius: shape.borderRadius,
        "& .fc-event-time": { textOverflow: "ellipsis" },
      },
      "& .fc-timegrid-event-harness-inset .fc-timegrid-event": {
        boxShadow: `0 0 0 2px ${vars.palette.background.default}`,
      },
      "& .fc-timegrid-event": {
        "& .fc-event-main": {
          padding: spacing(0.75, 1.5),
          [breakpoints.down("xl")]: { padding: spacing(0.5, 1) },
        },
      },
      "& .fc-v-event .fc-event-title-container": {
        "& .fc-event-title": { whiteSpace: "nowrap", textOverflow: "ellipsis" },
        flexGrow: 0,
      },
      "& .fc-h-event .fc-event-main-frame, & .fc-v-event .fc-event-main-frame": {
        display: "flex",
        flexDirection: "column-reverse",
        gap: spacing(0.5),
        justifyContent: "flex-end",
        "& .fc-event-time": {
          marginRight: 0,
          ...typography.caption,
          lineHeight: "1.5 !important",
        },
      },

      // Task styles
      "& .fc-h-event.task": {
        backgroundColor: `${vars.palette.neutral.lighter} !important`,
        overflow: "hidden",
        whiteSpace: "normal",
        textOverflow: "ellipsis",
        "& .fc-event-main .fc-event-main-frame": {
          display: "flex !important",
          alignItems: "flex-start",
          flexGrow: 1,
          justifyContent: "space-between",
          gap: spacing(0.5),
          flexDirection: "row-reverse",
          [breakpoints.down("lg")]: {
            flexDirection: "column-reverse",
          },
          color: `${vars.palette.text.primary} !important`,
          "& .fc-event-time": {
            flexShrink: 0,
            ...typography.caption,
          },
          "& .fc-event-title-container": {
            width: "100%",
            [breakpoints.only("xs")]: { width: "calc(100% - 5px)" },
            whiteSpace: "normal",
            textOverflow: "ellipsis",
            flexGrow: 1,
            "& .fc-event-title": {
              ...typography.subtitle2,
              fontWeight: typography.fontWeightRegular,
            },
          },
          "& .fc-event-main": {
            fontWeight: `${typography.fontWeightRegular} !important`,
            color: `${vars.palette.text.primary} !important`,
          },
        },
      },

      "& .fc-v-event.task": {
        boxShadow: `0 0 0 2px ${vars.palette.background.default}`,
        "& .fc-event-title-container": {
          width: "100%",
          [breakpoints.only("xs")]: { width: "calc(100% - 5px)" },
          whiteSpace: "normal",
          textOverflow: "ellipsis",
          "& .fc-event-title": {
            ...typography.subtitle2,
            fontWeight: typography.fontWeightRegular,
          },
        },
        "& .fc-event-main": {
          fontWeight: `${typography.fontWeightRegular} !important`,
          color: `${vars.palette.text.primary} !important`,
        },
      },

      // Week and day view styles
      "& .fc-timegrid-axis-cushion": {
        padding: spacing(0, 1),
        maxWidth: "100%",
        ...typography.subtitle2,
        fontWeight: typography.fontWeightBold,
      },
      "& .fc-scrollgrid-shrink-cushion": {
        textAlign: "right",
        minWidth: 0,
      },
      "& .fc-timegrid-divider": {
        display: "none !important",
        height: "unset !important",
        border: 0,
      },
      "& .fc-timegrid-slot-minor": {
        borderTopStyle: "none !important",
      },
      "& .fc-timegrid-slot": {
        verticalAlign: "top",
        borderBottom: "none !important",
      },
      "& .fc-timegrid-axis": {
        borderRight: `1px solid ${vars.palette.dividerLight} !important`,
      },
      "& .fc-timeGridWeek-view .fc-timegrid-slot-lane, & .fc-timeGridDay-view .fc-timegrid-slot-lane": {
        borderBottom: "none !important",
      },
      "& .fc-timeGridWeek-view .fc-day-today": {
        backgroundColor: vars.palette.primary.lighter,
        color: vars.palette.primary.main,
      },
      "& .fc-dayGridMonth-view .fc-day-today, & .fc-timeGridDay-view .fc-day-today": {
        backgroundColor: "unset",
      },
      "& .fc-timeGridDay-view .fc-timegrid-slot, & .fc-timeGridWeek-view .fc-timegrid-slot": {
        height: spacing(10),
        padding: spacing(0.5),
      },
      "& .fc-timeGridDay-view .fc-col-header th": {
        backgroundColor: vars.palette.common.white,
      },
      "&.fc-theme-standard td, &.fc-theme-standard th": {
        borderBottom: "none !important",
        borderLeft: "none !important",
      },
      "& .fc-timegrid-slot-label": {
        border: "none !important",
      },
      "& .fc-scroller-harness": {
        overflow: "visible !important",
      },

      "& .fc-scrollgrid-section, .fc .fc-scrollgrid-section table, .fc .fc-scrollgrid-section > td": {
        height: "0px !important",
      },
      "& .fc-timegrid-axis-frame": {
        "& a": {
          display: "inline-block",
          maxWidth: spacing(7.5),
          textAlign: "center",
        },
      },
      "& .fc-daygrid-body .fc-timegrid-axis-frame-liquid": {
        justifyContent: "flex-end !important",
      },
      "& .fc-timeGridDay-view .fc-timegrid-axis-frame-liquid, & .fc-timeGridWeek-view .fc-timegrid-axis-frame-liquid": {
        justifyContent: "center",
      },
      "& .fc-scrollgrid table": {
        borderBottomStyle: "solid !important",
      },
      "& .fc-scrollgrid-sync-table td": {
        borderBottom: "none !important",
      },
      "& .fc-scroller table": {
        borderBottomStyle: "hidden !important",
        width: "100% !important",
      },

      // Now indicator styles
      "& .fc-timegrid-now-indicator-arrow": {
        display: "none",
      },
      "& .fc-timegrid-now-indicator-line": {
        borderWidth: "2px",
        "&::after": {
          content: '""',
          position: "absolute",
          left: "-20px",
          top: "-21px",
          width: "42px",
          height: "42px",
          backgroundColor: vars.palette.warning.main,
          maskImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='black' d='M10 17V7l5 5z'/%3E%3C/svg%3E")`,
          WebkitMaskImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='black' d='M10 17V7l5 5z'/%3E%3C/svg%3E")`,
          maskSize: "contain",
          maskRepeat: "no-repeat",
        },
      },

      // Day colors
      "&.fc-theme-standard": {
        "& .fc-daygrid-day": {
          fontWeight: typography.fontWeightMedium,
          color: vars.palette.text.secondary,
          "&.fc-day-other": {
            color: vars.palette.text.disabled,
            "& .fc-daygrid-day-top": {
              opacity: 1,
            },
          },
        },
      },
    },

    // custom calendar in project module
    "& .custom-calendar": {
      "& .fc-scroller ": {
        height: "auto !important",
        overflow: "hidden !important",
      },
      "& .fc-scrollgrid": {
        border: "none",
      },
      "& .fc-scrollgrid-section": {
        maxHeight: "303px",
      },
      "& td, & th": {
        verticalAlign: "middle",
      },
      ".fc-daygrid-day-frame": {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        maxHeight: "61.5px",
        border: "none !important",
      },
      ".fc-daygrid-day-number": {
        fontWeight: typography.fontWeightRegular,
      },
      "& .fc-daygrid-body .fc-daygrid-day-frame.fc-scrollgrid-sync-inner, .fc-col-header-cell .fc-scrollgrid-sync-inner":
        { border: "none !important" },
      ".fc-col-header": {
        backgroundColor: vars.palette.background.elevation1,
        borderRadius: (shape.borderRadius as number) * 2,

        marginBottom: spacing(1),
      },
      ".fc-col-header-cell": {
        backgroundColor: `${vars.palette.background.elevation1} !important`,
        borderRadius: "none !important",
      },
      ".fc-col-header-cell-cushion": {
        padding: spacing(2.75, 0),
        color: vars.palette.text.primary,
      },
      ".fc-theme-standard td, .fc-theme-standard th": {
        border: "none",
        borderRadius: (shape.borderRadius as number) * 2,
        cursor: "pointer",
      },
      ".fc-daygrid-day.fc-day-today": {
        backgroundColor: vars.palette.primary.light,
        color: vars.palette.primary.contrastText,
      },
      ".fc-daygrid-day.fc-day-other .MuiTypography-root": {
        color: vars.palette.action.disabled,
      },
      ".fc-daygrid-body-unbalanced .fc-daygrid-day-events": {
        display: "none",
      },
      "& .fc-bg-event": {
        borderRadius: (shape.borderRadius as number) * 2,
        "& .fc-event-title": {
          display: "none",
        },
      },
      ".fc-daygrid-event .fc-event-title": {
        overflow: "hidden",
        whiteSpace: "nowrap",
        textOverflow: "ellipsis",
      },
      ".fc-highlight": {
        borderRadius: (shape.borderRadius as number) * 2,
      },
      ".fc-day-today": {
        backgroundColor: "inherit !important",
      },
    },
  };
};

export default reactFc;

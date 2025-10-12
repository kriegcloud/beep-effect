import { cssVarRgba } from "@beep/ui-core/utils";
import { inputBaseClasses, type Theme } from "@mui/material";

const reactDatepicker = (theme: Theme) => {
  const { vars, shadows, spacing, shape, typography, direction, zIndex } = theme;
  const closeButtonStyles = direction === "rtl" && {
    left: 0,
    right: "unset",
    paddingRight: 0,
    paddingLeft: spacing(2),
  };

  return {
    "& .react-datepicker-wrapper": {
      width: "100%",
      "& .react-datepicker__input-container": {
        "& .react-datepicker__close-icon": {
          paddingRight: spacing(2),
          paddingLeft: 0,
          ...closeButtonStyles,

          "&::after": {
            backgroundColor: "transparent",
            color: vars.palette.text.secondary,
            height: spacing(3),
            width: spacing(3),
            fontSize: spacing(3),
          },
        },
      },
      "&.clearable": {
        [`& .${inputBaseClasses.root}`]: {
          paddingLeft: spacing(2),
          paddingRight: spacing(3),
          ...(direction === "rtl" && {
            paddingLeft: spacing(3),
            paddingRight: spacing(2),
          }),
        },
      },
    },

    "& .react-datepicker__portal": {
      backgroundColor: cssVarRgba(vars.palette.common.blackChannel, 0.2),
      backdropFilter: "blur(4px)",
    },

    "& .react-datepicker-popper, & .react-datepicker__portal": {
      zIndex: zIndex.modal,
      "& .react-datepicker": {
        width: 352,
        fontFamily: "inherit",
        backgroundColor: vars.palette.background.menu,
        color: vars.palette.text.primary,
        border: 0,
        ...theme.applyStyles("dark", {
          border: 1,
        }),
        borderStyle: "solid",
        borderColor: vars.palette.menuDivider,
        boxShadow: shadows[6],
        borderRadius: (shape.borderRadius as number) * 2,
        overflow: "hidden",

        "& .react-datepicker__month-container": {
          width: "100%",

          ".react-datepicker__header": {
            backgroundColor: vars.palette.background.menu,
            border: "none",
            padding: spacing(3, 3, 0, 3),

            "& .react-datepicker__current-month": {
              color: vars.palette.text.primary,
              fontSize: typography.button.fontSize,
              fontWeight: 600,
              padding: spacing(1.5, 0, 3.5, 0),
            },
          },

          "& .react-datepicker__day-names": {
            marginLeft: spacing(3),
            marginRight: spacing(3),
            height: spacing(5),
            borderRadius: spacing(1),
            backgroundColor: vars.palette.background.elevation2,
            marginBottom: 0,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",

            "& .react-datepicker__day-name": {
              color: vars.palette.text.disabled,
              fontWeight: 500,
              fontSize: typography.overline.fontSize,
              margin: 0,
              width: spacing(5),
              varticalAlign: "center",
            },
          },

          "& .react-datepicker__month": {
            margin: 0,
            padding: spacing(2, 3, 3, 3),
            display: "flex",
            flexDirection: "column",
            gap: spacing(0.5),

            "& .react-datepicker__week": {
              display: "flex",
              gap: spacing(0.5),
              justifyContent: "space-between",

              "& .react-datepicker__day": {
                fontSize: typography.body1.fontSize,
                flexShrink: 0,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                textAlign: "center",
                margin: 0,
                height: spacing(5),
                width: spacing(5),
                borderRadius: spacing(0.5),

                "&.react-datepicker__day--outside-month": {
                  color: vars.palette.text.disabled,
                },
              },
            },
          },
        },

        "& .react-datepicker__day": {
          color: vars.palette.text.primary,
          "&:hover": {
            backgroundColor: vars.palette.background.elevation1,
          },
          "&.react-datepicker__day--today": {
            fontWeight: 700,
          },
          "&.react-datepicker__day--in-selecting-range, &.react-datepicker__day--in-range:not(.react-datepicker__day--range-start):not(.react-datepicker__day--range-end)":
            {
              backgroundColor: vars.palette.primary.lighter,
              color: vars.palette.text.primary,
            },
          "&.react-datepicker__day--selecting-range-start, &.react-datepicker__day--selecting-range-end, &.react-datepicker__day--keyboard-selected, &.react-datepicker__day--range-start, &.react-datepicker__day--range-end":
            {
              backgroundColor: vars.palette.primary.main,
              color: vars.palette.common.white,
            },
        },

        "& .react-datepicker__navigation": {
          height: spacing(4.5),
          width: spacing(4.5),
          top: spacing(3.5),

          "&.react-datepicker__navigation--previous": {
            left: spacing(3),
          },

          "&.react-datepicker__navigation--next": {
            right: spacing(3),
          },

          "&.react-datepicker__navigation--previous, &.react-datepicker__navigation--next": {
            "& .react-datepicker__navigation-icon": {
              "&::before": {
                borderColor: vars.palette.text.secondary,
                borderWidth: "2px 2px 0 0",
              },
            },
          },
        },
      },

      "&[data-placement^=bottom] .react-datepicker__triangle, &[data-placement^=top] .react-datepicker__triangle": {
        stroke: vars.palette.menuDivider,
        fill: vars.palette.background.menu,
        color: vars.palette.background.menu,
      },
    },
  };
};

export default reactDatepicker;

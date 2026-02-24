import { buttonClasses } from "@mui/material/Button";
import { inputLabelClasses } from "@mui/material/InputLabel";
import type { SvgIconProps } from "@mui/material/SvgIcon";

import SvgIcon from "@mui/material/SvgIcon";
import type { Components, Theme } from "@mui/material/styles";
import type { TextFieldProps } from "@mui/material/TextField";
import { pickersSectionListClasses } from "@mui/x-date-pickers/PickersSectionList";
import {
  pickersFilledInputClasses,
  pickersInputBaseClasses,
  pickersOutlinedInputClasses,
} from "@mui/x-date-pickers/PickersTextField";

import {
  filledInputStyles,
  filledInputVariants,
  inputBaseStyles,
  inputBaseVariants,
  inputStyles,
  outlinedInputStyles,
  outlinedInputVariants,
} from "./text-field";

/* **********************************************************************
 * ♉️ Custom icons
 * **********************************************************************/
const SwitchViewIcon = (props: SvgIconProps) => (
  // https://icon-sets.iconify.design/eva/chevron-down-fill/
  <SvgIcon {...props}>
    <path
      fill="currentColor"
      d="M12 15.5a1 1 0 0 1-.71-.29l-4-4a1 1 0 1 1 1.42-1.42L12 13.1l3.3-3.18a1 1 0 1 1 1.38 1.44l-4 3.86a1 1 0 0 1-.68.28"
    />
  </SvgIcon>
);

const LeftArrowIcon = (props: SvgIconProps) => (
  // https://icon-sets.iconify.design/eva/arrow-ios-back-fill/
  <SvgIcon {...props}>
    <path
      fill="currentColor"
      d="M13.83 19a1 1 0 0 1-.78-.37l-4.83-6a1 1 0 0 1 0-1.27l5-6a1 1 0 0 1 1.54 1.28L10.29 12l4.32 5.36a1 1 0 0 1-.78 1.64"
    />
  </SvgIcon>
);

const RightArrowIcon = (props: SvgIconProps) => (
  // https://icon-sets.iconify.design/eva/arrow-ios-forward-fill/
  <SvgIcon {...props}>
    <path
      fill="currentColor"
      d="M10 19a1 1 0 0 1-.64-.23a1 1 0 0 1-.13-1.41L13.71 12L9.39 6.63a1 1 0 0 1 .15-1.41a1 1 0 0 1 1.46.15l4.83 6a1 1 0 0 1 0 1.27l-5 6A1 1 0 0 1 10 19"
    />
  </SvgIcon>
);

const CalendarIcon = (props: SvgIconProps) => (
  // https://icon-sets.iconify.design/solar/calendar-mark-bold-duotone/
  <SvgIcon {...props}>
    <path
      fill="currentColor"
      d="M6.96 2c.418 0 .756.31.756.692V4.09c.67-.012 1.422-.012 2.268-.012h4.032c.846 0 1.597 0 2.268.012V2.692c0-.382.338-.692.756-.692s.756.31.756.692V4.15c1.45.106 2.403.368 3.103 1.008c.7.641.985 1.513 1.101 2.842v1H2V8c.116-1.329.401-2.2 1.101-2.842c.7-.64 1.652-.902 3.103-1.008V2.692c0-.382.339-.692.756-.692"
    />
    <path
      fill="currentColor"
      d="M22 14v-2c0-.839-.013-2.335-.026-3H2.006c-.013.665 0 2.161 0 3v2c0 3.771 0 5.657 1.17 6.828C4.349 22 6.234 22 10.004 22h4c3.77 0 5.654 0 6.826-1.172C22 19.657 22 17.771 22 14"
      opacity="0.5"
    />
    <path fill="currentColor" d="M18 16.5a1.5 1.5 0 1 1-3 0a1.5 1.5 0 0 1 3 0" />
  </SvgIcon>
);

const ClockIcon = (props: SvgIconProps) => (
  // https://icon-sets.iconify.design/solar/clock-circle-outline/
  <SvgIcon {...props}>
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M12 2.75a9.25 9.25 0 1 0 0 18.5a9.25 9.25 0 0 0 0-18.5M1.25 12C1.25 6.063 6.063 1.25 12 1.25S22.75 6.063 22.75 12S17.937 22.75 12 22.75S1.25 17.937 1.25 12M12 7.25a.75.75 0 0 1 .75.75v3.69l2.28 2.28a.75.75 0 1 1-1.06 1.06l-2.5-2.5a.75.75 0 0 1-.22-.53V8a.75.75 0 0 1 .75-.75"
      clipRule="evenodd"
    />
  </SvgIcon>
);

const baseSlots = {
  switchViewIcon: SwitchViewIcon,
  leftArrowIcon: LeftArrowIcon,
  rightArrowIcon: RightArrowIcon,
};

const defaultProps = {
  dateSlots: { ...baseSlots, openPickerIcon: CalendarIcon },
  timeSlots: { ...baseSlots, openPickerIcon: ClockIcon },
  tabs: { dateIcon: <CalendarIcon />, timeIcon: <ClockIcon /> },
  baseField: {
    slotProps: {
      textField: { fullWidth: true } satisfies Partial<TextFieldProps>,
    },
  },
};

/* **********************************************************************
 * 🧩 Components
 * **********************************************************************/
const MuiPickersLayout: Components<Theme>["MuiPickersLayout"] = {
  // ▼▼▼▼▼▼▼▼ 🎨 STYLE ▼▼▼▼▼▼▼▼
  styleOverrides: {
    actionBar: ({ theme }) => ({
      padding: theme.spacing(2),
      "& > :not(:first-of-type)": {
        marginLeft: theme.spacing(1),
      },
      [`& .${buttonClasses.root}`]: {
        "&:last-of-type": {
          ...theme.mixins.filledStyles(theme, "inherit", {
            hover: {
              boxShadow: theme.vars.customShadows.z8,
            },
          }),
        },
      },
    }),
  },
};

const MuiPickerPopper: Components<Theme>["MuiPickerPopper"] = {
  // ▼▼▼▼▼▼▼▼ 🎨 STYLE ▼▼▼▼▼▼▼▼
  styleOverrides: {
    paper: ({ theme }) => ({
      boxShadow: theme.vars.customShadows.dropdown,
      borderRadius: Number(theme.shape.borderRadius) * 1.5,
    }),
  },
};

const MuiDateTimePickerTabs: Components<Theme>["MuiDateTimePickerTabs"] = {
  // ▼▼▼▼▼▼▼▼ ⚙️ PROPS ▼▼▼▼▼▼▼▼
  defaultProps: { ...defaultProps.tabs },
};

const MuiClock: Components<Theme>["MuiClock"] = {
  // ▼▼▼▼▼▼▼▼ 🎨 STYLE ▼▼▼▼▼▼▼▼
  styleOverrides: {
    clock: ({ theme }) => ({
      backgroundColor: theme.vars.palette.background.neutral,
    }),
  },
};

const inputComponents: Components<Theme> = {
  MuiPickersTextField: {
    defaultProps: {
      variant: "outlined",
    },
    styleOverrides: {
      root: {
        variants: [
          {
            props: (props) => !props.isFieldFocused && !props.isFieldValueEmpty,
            style: {
              [`& .${inputLabelClasses.root}[data-shrink="false"] + .${pickersInputBaseClasses.root} > .${pickersSectionListClasses.root}`]:
                {
                  opacity: 0,
                },
            },
          },
        ],
      },
    },
  },
  MuiPickersInputBase: {
    styleOverrides: {
      root: ({ theme }) => ({
        ...inputBaseStyles.root("picker", theme, {
          input: pickersSectionListClasses.root,
          disabled: pickersInputBaseClasses.disabled,
        }),
      }),
      sectionsContainer: ({ theme }) => ({
        ...inputBaseStyles.input("picker", theme),
        variants: [
          ...inputBaseVariants.input,
          {
            props: (props) => !props.isFieldFocused && !!props.isFieldValueEmpty,
            style: {
              opacity: 1,
              color: theme.vars.palette.text.disabled,
            },
          },
        ],
      }),
    },
  },
  MuiPickersInput: {
    styleOverrides: {
      root: ({ theme }) => inputStyles.root(theme),
    },
  },
  MuiPickersOutlinedInput: {
    styleOverrides: {
      root: ({ theme }) => outlinedInputStyles.root(theme, pickersOutlinedInputClasses),
      sectionsContainer: { variants: [...outlinedInputVariants.input] },
      notchedOutline: ({ theme }) => outlinedInputStyles.notchedOutline(theme),
    },
  },
  MuiPickersFilledInput: {
    defaultProps: {
      disableUnderline: true,
    },
    styleOverrides: {
      root: ({ theme }) => filledInputStyles.root(theme, pickersFilledInputClasses),
      sectionsContainer: { variants: [...filledInputVariants.input] },
    },
  },
};

const toolbarComponents: Components<Theme> = {
  MuiPickersToolbar: {
    styleOverrides: {
      content: { marginTop: 8 },
    },
  },
  MuiPickersToolbarButton: {
    styleOverrides: {
      root: { minWidth: 36 },
    },
  },
  MuiTimePickerToolbar: {
    styleOverrides: {
      separator: { marginLeft: 2, marginRight: 2 },
      ampmLandscape: { gap: 16, justifyContent: "flex-start" },
      ampmLabel: ({ theme }) => ({ ...theme.typography.subtitle1 }),
    },
  },
  MuiDateTimePickerToolbar: {
    styleOverrides: {
      separator: { marginLeft: 2, marginRight: 2 },
      ampmLandscape: { gap: 16, justifyContent: "flex-start" },
      ampmLabel: ({ theme }) => ({ ...theme.typography.subtitle1 }),
      timeDigitsContainer: { alignItems: "center" },
    },
  },
};

/**
 * ➤ Date picker
 * - https://mui.com/x/react-date-pickers/date-picker/
 */
const datePickerComponents: Components<Theme> = {
  MuiDateField: { defaultProps: { ...defaultProps.baseField } },
  MuiDatePicker: { defaultProps: { slots: { ...defaultProps.dateSlots } } },
  MuiDesktopDatePicker: {
    defaultProps: { slots: { ...defaultProps.dateSlots } },
  },
  MuiMobileDatePicker: {
    defaultProps: { slots: { ...defaultProps.dateSlots } },
  },
  MuiStaticDatePicker: {
    defaultProps: { slots: { ...defaultProps.dateSlots } },
  },
};

/**
 * ➤ Time picker
 * - https://mui.com/x/react-date-pickers/time-picker/
 */
const timePickerComponents: Components<Theme> = {
  MuiTimeField: { defaultProps: { ...defaultProps.baseField } },
  MuiTimePicker: { defaultProps: { slots: { ...defaultProps.timeSlots } } },
  MuiDesktopTimePicker: {
    defaultProps: { slots: { ...defaultProps.timeSlots } },
  },
  MuiMobileTimePicker: {
    defaultProps: { slots: { ...defaultProps.timeSlots } },
  },
  MuiStaticTimePicker: {
    defaultProps: { slots: { ...defaultProps.timeSlots } },
  },
};

/**
 * ➤ Date & Time picker
 * - https://mui.com/x/react-date-pickers/date-time-picker/
 */
const dateTimePickerComponents: Components<Theme> = {
  MuiDateTimeField: { defaultProps: { ...defaultProps.baseField } },
  MuiDateTimePicker: { defaultProps: { slots: { ...defaultProps.dateSlots } } },
  MuiDesktopDateTimePicker: {
    defaultProps: { slots: { ...defaultProps.dateSlots } },
  },
  MuiMobileDateTimePicker: {
    defaultProps: { slots: { ...defaultProps.dateSlots } },
  },
  MuiStaticDateTimePicker: {
    defaultProps: { slots: { ...defaultProps.dateSlots } },
  },
};

/* **********************************************************************
 * 🚀 Export
 * **********************************************************************/
export const datePicker: Components<Theme> = {
  ...toolbarComponents,
  MuiClock,
  MuiPickerPopper,
  MuiPickersLayout,
  MuiDateTimePickerTabs,

  ...inputComponents,
  ...datePickerComponents,
  ...timePickerComponents,
  ...dateTimePickerComponents,
};

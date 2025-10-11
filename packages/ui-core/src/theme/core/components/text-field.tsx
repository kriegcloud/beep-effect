import { rgbaFromChannel } from "@beep/ui-core/utils";
import type { FilledInputClasses, FilledInputProps } from "@mui/material/FilledInput";
import { filledInputClasses } from "@mui/material/FilledInput";
import { inputAdornmentClasses } from "@mui/material/InputAdornment";
import type { InputBaseClasses } from "@mui/material/InputBase";
import { inputBaseClasses } from "@mui/material/InputBase";
import type { OutlinedInputClasses } from "@mui/material/OutlinedInput";
import { outlinedInputClasses } from "@mui/material/OutlinedInput";
import type { Components, ComponentsVariants, CSSObject, Theme } from "@mui/material/styles";
import type { PickerTextFieldOwnerState } from "@mui/x-date-pickers/models";

type InputContext = "standard" | "picker";

type InputSizeProps = Pick<FilledInputProps, "size" | "hiddenLabel"> & {
  ownerState?: PickerTextFieldOwnerState;
};

type InputBaseVariants = ComponentsVariants<Theme>["MuiInputBase"];
type PickersInputBaseVariants = InputBaseVariants | ComponentsVariants<Theme>["MuiPickersInputBase"];

type OutlinedInputVariants = ComponentsVariants<Theme>["MuiOutlinedInput"];
type PickersOutlinedInputVariants = OutlinedInputVariants | ComponentsVariants<Theme>["MuiPickersOutlinedInput"];

type FilledInputVariants = ComponentsVariants<Theme>["MuiFilledInput"];
type PickersFilledInputVariants = FilledInputVariants | ComponentsVariants<Theme>["MuiPickersFilledInput"];

export const INPUT_TYPOGRAPHY = {
  fontSize: { base: 15, responsive: 16 },
  lineHeight: 24,
} as const;

export const INPUT_PADDING = {
  base: {
    small: { paddingTop: 0, paddingBottom: 4 },
    medium: { paddingTop: 4, paddingBottom: 4 },
  },
  outlined: {
    small: { paddingTop: 8, paddingBottom: 8 },
    medium: { paddingTop: 16, paddingBottom: 16 },
  },
  filled: {
    small: { paddingTop: 20 },
    medium: { paddingTop: 24 },
    smallHidden: { paddingTop: 8, paddingBottom: 8 },
    mediumHidden: { paddingTop: 16, paddingBottom: 16 },
  },
};

export function getInputTypography(theme: Theme, keys: Array<"fontSize" | "height" | "lineHeight">): CSSObject {
  const { fontSize, lineHeight } = INPUT_TYPOGRAPHY;

  const baseStyles = {
    fontSize: theme.typography.pxToRem(fontSize.base),
    height: `${lineHeight}px`,
    lineHeight: `${lineHeight}px`,
  };

  const responsiveStyles = {
    fontSize: theme.typography.pxToRem(fontSize.responsive),
    height: `${lineHeight}px`,
    lineHeight: `${lineHeight}px`,
  };

  return {
    ...Object.fromEntries(keys.map((k) => [k, baseStyles[k]])),
    [theme.breakpoints.down("sm")]: Object.fromEntries(keys.map((k) => [k, responsiveStyles[k]])),
  };
}

/* **********************************************************************
 * 🧩 InputBase
 * **********************************************************************/
export const inputBaseStyles = {
  root: (context: InputContext, theme: Theme, classes: Partial<InputBaseClasses>): CSSObject => ({
    "--disabled-color": theme.vars.palette.action.disabled,
    ...getInputTypography(theme, ["lineHeight"]),
    [`&.${classes.disabled}`]: {
      [`& .${inputAdornmentClasses.root} *`]: {
        color: "var(--disabled-color)",
      },
      [`& .${classes.input}`]: {
        ...(context === "standard" && {
          WebkitTextFillColor: "var(--disabled-color)",
        }),
        ...(context === "picker" && {
          "& span": { color: "var(--disabled-color)" },
        }),
      },
    },
  }),
  input: (context: InputContext, theme: Theme): CSSObject => ({
    ...(context === "standard" && {
      ...getInputTypography(theme, ["fontSize", "height", "lineHeight"]),
      "&:focus": { borderRadius: "inherit" },
      "&::placeholder, &::-webkit-input-placeholder, &::-moz-placeholder, &:-ms-input-placeholder, &::-ms-input-placeholder":
        { color: theme.vars.palette.text.disabled },
    }),
    ...(context === "picker" && {
      ...getInputTypography(theme, ["fontSize", "lineHeight"]),
      "& span": { lineHeight: "inherit" },
    }),
  }),
};

export const inputBaseVariants = {
  root: [
    {
      props: (props) => !!props.multiline,
      style: { ...INPUT_PADDING.base!.medium },
    },
    {
      props: (props) => !!props.multiline && props.size === "small",
      style: { ...INPUT_PADDING.base!.small },
    },
  ],
  input: [
    {
      props: {},
      style: { ...INPUT_PADDING.base.medium },
    },
    {
      props: ({ size, ownerState }: InputSizeProps) => (size || ownerState?.inputSize) === "small",
      style: { ...INPUT_PADDING.base.small },
    },
  ],
} satisfies {
  root: InputBaseVariants;
  input: PickersInputBaseVariants;
};

const multilineInputVariants = [
  {
    props: (props) => !!props.multiline,
    style: { padding: 0 },
  },
] satisfies InputBaseVariants;

const MuiInputBase: Components<Theme>["MuiInputBase"] = {
  // ▼▼▼▼▼▼▼▼ 🎨 STYLE ▼▼▼▼▼▼▼▼
  styleOverrides: {
    root: ({ theme }) => ({
      ...inputBaseStyles.root("standard", theme, inputBaseClasses),
      variants: inputBaseVariants.root,
    }),
    input: ({ theme }) => ({
      ...inputBaseStyles.input("standard", theme),
      variants: [...inputBaseVariants.input, ...multilineInputVariants],
    }),
  },
};

/* **********************************************************************
 * 🧩 Input
 * **********************************************************************/
export const inputStyles = {
  root: (theme: Theme): CSSObject => ({
    "&::before": {
      borderBottomColor: theme.vars.palette.shared.inputUnderline,
    },
    "&::after": {
      borderBottomColor: theme.vars.palette.text.primary,
    },
  }),
};

const MuiInput: Components<Theme>["MuiInput"] = {
  // ▼▼▼▼▼▼▼▼ 🎨 STYLE ▼▼▼▼▼▼▼▼
  styleOverrides: {
    root: ({ theme }) => inputStyles.root(theme),
  },
};

/* **********************************************************************
 * 🧩 OutlinedInput
 * **********************************************************************/
export const outlinedInputStyles = {
  root: (theme: Theme, classes: Partial<OutlinedInputClasses>): CSSObject => ({
    [`&.${classes.focused}:not(.${classes.error})`]: {
      [`& .${classes.notchedOutline}`]: {
        borderColor: theme.vars.palette.text.primary,
      },
    },
    [`&.${classes.disabled}`]: {
      [`& .${classes.notchedOutline}`]: {
        borderColor: theme.vars.palette.action.disabledBackground,
      },
    },
  }),
  notchedOutline: (theme: Theme): CSSObject => ({
    borderColor: theme.vars.palette.shared.inputOutlined,
    transition: theme.transitions.create(["border-color"], {
      duration: theme.transitions.duration.shortest,
    }),
  }),
};

export const outlinedInputVariants = {
  root: [
    {
      props: (props) => !!props.multiline,
      style: { ...INPUT_PADDING.outlined.medium },
    },
    {
      props: (props) => !!props.multiline && props.size === "small",
      style: { ...INPUT_PADDING.outlined.small },
    },
  ],
  input: [
    {
      props: {},
      style: { ...INPUT_PADDING.outlined.medium },
    },
    {
      props: ({ size, ownerState }: InputSizeProps) => (size || ownerState?.inputSize) === "small",
      style: { ...INPUT_PADDING.outlined.small },
    },
  ],
} satisfies {
  root: OutlinedInputVariants;
  input: PickersOutlinedInputVariants;
};

const MuiOutlinedInput: Components<Theme>["MuiOutlinedInput"] = {
  // ▼▼▼▼▼▼▼▼ 🎨 STYLE ▼▼▼▼▼▼▼▼
  styleOverrides: {
    root: ({ theme }) => ({
      ...outlinedInputStyles.root(theme, outlinedInputClasses),
      variants: outlinedInputVariants.root,
    }),
    input: {
      variants: [...outlinedInputVariants.input, ...multilineInputVariants],
    },
    notchedOutline: ({ theme }) => outlinedInputStyles.notchedOutline(theme),
  },
};

/* **********************************************************************
 * 🧩 FilledInput
 * **********************************************************************/
export const filledInputStyles = {
  root: (theme: Theme, classes: Partial<FilledInputClasses>): CSSObject => {
    const baseBg = rgbaFromChannel(theme.vars.palette.grey["500Channel"], 0.08);
    const hoverBg = rgbaFromChannel(theme.vars.palette.grey["500Channel"], 0.16);
    const errorBg = rgbaFromChannel(theme.vars.palette.error.mainChannel, 0.08);
    const errorHoverBg = rgbaFromChannel(theme.vars.palette.error.mainChannel, 0.16);
    const disabledBg = theme.vars.palette.action.disabledBackground;

    return {
      backgroundColor: baseBg,
      borderRadius: theme.shape.borderRadius,
      [`&:hover, &.${classes.focused}`]: { backgroundColor: hoverBg },
      [`&.${classes.error}`]: {
        backgroundColor: errorBg,
        [`&:hover, &.${classes.focused}`]: { backgroundColor: errorHoverBg },
      },
      [`&.${classes.disabled}`]: { backgroundColor: disabledBg },
    };
  },
};

export const filledInputVariants = {
  root: [
    {
      props: (props) => !!props.multiline,
      style: { ...INPUT_PADDING.filled.medium },
    },
    {
      props: (props) => !!props.multiline && props.size === "small",
      style: { ...INPUT_PADDING.filled.small },
    },
    {
      props: (props) => !!props.multiline && !!props.hiddenLabel,
      style: { ...INPUT_PADDING.filled.mediumHidden },
    },
    {
      props: (props) => !!props.multiline && !!props.hiddenLabel && props.size === "small",
      style: { ...INPUT_PADDING.filled.smallHidden },
    },
  ],
  input: [
    {
      props: {},
      style: { ...INPUT_PADDING.filled.medium },
    },
    {
      props: ({ size, ownerState }: InputSizeProps) => (size || ownerState?.inputSize) === "small",
      style: { ...INPUT_PADDING.filled.small },
    },
    {
      props: ({ hiddenLabel }: InputSizeProps) => !!hiddenLabel,
      style: { ...INPUT_PADDING.filled.mediumHidden },
    },
    {
      props: ({ size, hiddenLabel, ownerState }: InputSizeProps) =>
        !!hiddenLabel && (size || ownerState?.inputSize) === "small",
      style: { ...INPUT_PADDING.filled.smallHidden },
    },
  ],
} satisfies {
  root: FilledInputVariants;
  input: PickersFilledInputVariants;
};

const MuiFilledInput: Components<Theme>["MuiFilledInput"] = {
  // ▼▼▼▼▼▼▼▼ ⚙️ PROPS ▼▼▼▼▼▼▼▼
  defaultProps: {
    disableUnderline: true,
  },
  // ▼▼▼▼▼▼▼▼ 🎨 STYLE ▼▼▼▼▼▼▼▼
  styleOverrides: {
    root: ({ theme }) => ({
      ...filledInputStyles.root(theme, filledInputClasses),
      variants: filledInputVariants.root,
    }),
    input: {
      variants: [...filledInputVariants.input, ...multilineInputVariants],
    },
  },
};

/* **********************************************************************
 * 🧩 TextField
 * **********************************************************************/
const MuiTextField: Components<Theme>["MuiTextField"] = {
  // ▼▼▼▼▼▼▼▼ ⚙️ PROPS ▼▼▼▼▼▼▼▼
  defaultProps: {
    variant: "outlined",
  },
};

/* **********************************************************************
 * 🚀 Export
 * **********************************************************************/
export const textField: Components<Theme> = {
  MuiInput,
  MuiInputBase,
  MuiTextField,
  MuiFilledInput,
  MuiOutlinedInput,
};

"use client";

import {
  autocompleteClasses,
  formLabelClasses,
  inputBaseClasses,
  inputLabelClasses,
  selectClasses,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import TextField, { type TextFieldProps } from "@mui/material/TextField";

type StyledTextFieldProps = TextFieldProps & {
  disabledSpinButton?: boolean;
};

export const StyledTextField = styled(
  ({ ref, ...rest }: StyledTextFieldProps) => (
    <TextField
      sx={{}}
      ref={ref}
      slotProps={{
        inputLabel: {
          shrink: true,
        },
      }}
      {...rest}
    />
  ),
  {
    shouldForwardProp: (prop) => prop !== "disabledSpinButton",
  }
)(({ theme, disabledSpinButton }) => ({
  [`& .${formLabelClasses.root}`]: {
    fontWeight: theme.typography.fontWeightMedium,
    transform: "none",
    position: "static",
    marginBottom: theme.spacing(0.5),
    marginLeft: theme.spacing(2),
    fontSize: 12,
    "&.MuiInputLabel-sizeLarge": {
      marginLeft: theme.spacing(2.5),
    },
    [`&.${inputLabelClasses.sizeSmall}`]: {
      marginLeft: theme.spacing(1.5),
    },
    [`&.${inputLabelClasses.shrink}`]: {
      transform: "none !important",
    },
  },
  [`& .${inputBaseClasses.root}`]: {
    [`&.${autocompleteClasses.inputRoot}`]: {
      paddingLeft: 16,
      paddingTop: 8,
      paddingBottom: 8,
      rowGap: 4,

      [`& .${autocompleteClasses.tag}`]: {
        marginTop: 0,
      },
      [`&.${inputBaseClasses.sizeSmall}`]: {
        paddingLeft: 12,
        paddingTop: 6,
        paddingBottom: 6,
      },
      "&.MuiFilledInput-root": {
        paddingTop: 8,
        [`&.MuiInputBase-sizeLarge` as const]: {
          paddingLeft: 20,
          paddingTop: 6,
          paddingBottom: 6,
        },
      },
    },
    [`&.${inputBaseClasses.adornedStart} > .${inputBaseClasses.input}`]: {
      paddingLeft: "0px !important",
    },
    [`& .${inputBaseClasses.input}`]: {
      padding: "8px 16px",
      height: "1.25rem",
      lineHeight: 1.45,
      fontSize: 14,
      "&.MuiSelect-select": {
        padding: "8px 16px",
        paddingRight: "40px !important",
      },
      "&.MuiAutocomplete-input": {
        padding: "8px",
      },
      "&::-webkit-input-placeholder": {
        opacity: "1 !important",
        color: theme.vars.palette.text.secondary,
      },
      "&::-moz-placeholder": {
        opacity: "1 !important",
        color: theme.vars.palette.text.secondary,
      },
      ...(disabledSpinButton && {
        "&[type=number]": {
          MozAppearance: "textfield",
        },
        "&[type=number]::-webkit-outer-spin-button": {
          WebkitAppearance: "none",
          margin: 0,
          display: "none",
        },
        "&[type=number]::-webkit-inner-spin-button": {
          WebkitAppearance: "none",
          margin: 0,
          display: "none",
        },
      }),
    },
    [`&.${inputBaseClasses.sizeSmall} > .${inputBaseClasses.input}`]: {
      padding: "6px 12px",
      height: "1.125rem",
      fontSize: 14,
      [`&.${selectClasses.select}`]: {
        paddingTop: 5,
        paddingBottom: 5,
        paddingRight: "32px !important",
      },
      "&.MuiAutocomplete-input": {
        height: "1.125rem",
        padding: "6px 8px",
      },
    },
    [`&.${inputBaseClasses.sizeSmall}`]: {
      [`& .${selectClasses.icon}`]: {
        fontSize: 16,
        right: 12,
      },
    },
    [`& .${selectClasses.icon}`]: {
      fontSize: 20,
      right: 16,
    },
    "&.MuiInputBase-sizeLarge": {
      [`& .${inputBaseClasses.input}`]: {
        paddingLeft: 16,
        padding: "6px 12px",
        height: "1.875rem",
        fontSize: 16,
        "&.MuiSelect-select": {
          lineHeight: 1.875,
          paddingRight: "48px !important",
        },
        "&.MuiAutocomplete-input": {
          height: "1.875rem",
          padding: "6px 12px",
          paddingLeft: "0px !important",
        },
      },
      [`& .${selectClasses.icon}`]: {
        fontSize: 24,
        right: 20,
      },
    },
    [`&.${inputBaseClasses.focused}`]: {
      backgroundColor: theme.vars.palette.primary.lighter,
    },
  },
}));

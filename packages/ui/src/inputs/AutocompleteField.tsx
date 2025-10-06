import type { UnsafeTypes } from "@beep/types";
import { useFieldContext } from "@beep/ui/form";
import type { DefaultOmit } from "@beep/ui/inputs/Field";
import type { AutocompleteProps as MuiAutocompleteProps } from "@mui/material/Autocomplete";
import Autocomplete from "@mui/material/Autocomplete";
import type { TextFieldProps } from "@mui/material/TextField";
import TextField from "@mui/material/TextField";
import { useStore } from "@tanstack/react-form";
import * as F from "effect/Function";
import type React from "react";

export type AutocompleteBaseProps = Omit<
  MuiAutocompleteProps<UnsafeTypes.UnsafeAny, boolean, boolean, boolean>,
  "renderInput"
>;

export type AutocompleteProps = AutocompleteBaseProps & {
  label?: string;
  placeholder?: string;
  helperText?: React.ReactNode;
  slotProps?: AutocompleteBaseProps["slotProps"] & {
    textfield?: TextFieldProps;
  };
};

function AutocompleteField({ label, slotProps, helperText, placeholder, ...other }: DefaultOmit<AutocompleteProps>) {
  const field = useFieldContext();
  const { error, isError } = useStore(field.form.store, (state) =>
    F.pipe(
      state.errorMap.onSubmit?.[field.name],
      (error) =>
        ({
          error,
          isError: !!error,
        }) as const
    )
  );
  const { textfield, ...otherSlotProps } = slotProps ?? {};

  return (
    <Autocomplete
      value={field.state.value}
      id={field.name}
      defaultValue={field.state.value}
      onChange={(_, newValue) => field.handleChange(newValue)}
      onBlur={field.handleBlur}
      renderInput={(params) => (
        <TextField
          {...params}
          {...textfield}
          label={label}
          placeholder={placeholder}
          error={isError}
          helperText={error ?? helperText}
          slotProps={{
            ...textfield?.slotProps,
            htmlInput: {
              ...params.inputProps,
              autoComplete: "new-password",
              ...textfield?.slotProps?.htmlInput,
            },
          }}
        />
      )}
      {...other}
      {...otherSlotProps}
    />
  );
}

export default AutocompleteField;

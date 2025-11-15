import type { DefaultOmit } from "@beep/ui/inputs/Field";
import { RecordUtils } from "@beep/utils/data";
import type { TextFieldProps } from "@mui/material/TextField";
import TextField from "@mui/material/TextField";
import { useStore } from "@tanstack/react-form";
import type React from "react";
import { useFieldContext } from "../form";

type SelectFieldProps = DefaultOmit<TextFieldProps> & {
  children: React.ReactNode;
};

function SelectField({ children, helperText, slotProps = {}, ...other }: SelectFieldProps) {
  const field = useFieldContext();
  const { error, isError } = useStore(
    field.form.store,
    (state) =>
      ({
        isError: !!state.errorMap.onSubmit?.[field.name],
        error: state.errorMap.onSubmit?.[field.name],
      }) as const
  );
  const labelId = `${field.name}-select`;

  const baseSlotProps: TextFieldProps["slotProps"] = {
    select: {
      sx: { textTransform: "capitalize" },
      MenuProps: {
        slotProps: {
          paper: {
            sx: [{ maxHeight: 220 }],
          },
        },
      },
    },
    htmlInput: { id: labelId },
    inputLabel: { htmlFor: labelId },
  };

  return (
    <TextField
      id={field.name}
      name={field.name}
      value={field.state.value}
      select
      fullWidth
      onBlur={field.handleBlur}
      onChange={(e) => field.handleChange(e.target.value)}
      error={isError}
      helperText={error ?? helperText}
      slotProps={RecordUtils.merge(baseSlotProps, slotProps)}
      {...other}
    >
      {children}
    </TextField>
  );
}

export default SelectField;

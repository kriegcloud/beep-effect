import type { DefaultOmit } from "@beep/ui/inputs/Field";
import { formatPatterns } from "@beep/ui-core/utils";
import type { TextFieldProps } from "@mui/material/TextField";
import type { DatePickerProps } from "@mui/x-date-pickers/DatePicker";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useStore } from "@tanstack/react-form";
import dayjs from "dayjs";
import * as F from "effect/Function";
import { useFieldContext } from "../form";

function DatePickerField({ slotProps, ...other }: DefaultOmit<DatePickerProps>) {
  const field = useFieldContext<string>();
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
  return (
    <DatePicker
      name={field.name}
      value={dayjs(field.state.value)}
      onChange={(newValue) => field.handleChange(dayjs(newValue).format())}
      format={formatPatterns.split.date}
      slotProps={{
        ...slotProps,
        textField: {
          fullWidth: true,
          error: isError,
          helperText: error ?? (slotProps?.textField as TextFieldProps)?.helperText,
          ...slotProps?.textField,
        },
      }}
      {...other}
    />
  );
}

export default DatePickerField;

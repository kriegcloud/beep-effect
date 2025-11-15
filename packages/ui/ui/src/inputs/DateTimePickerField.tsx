import type { DefaultOmit } from "@beep/ui/inputs/Field";
import { formatPatterns } from "@beep/ui-core/utils";
import type { TextFieldProps } from "@mui/material/TextField";
import type { MobileDateTimePickerProps } from "@mui/x-date-pickers/MobileDateTimePicker";
import { MobileDateTimePicker } from "@mui/x-date-pickers/MobileDateTimePicker";
import { useStore } from "@tanstack/react-form";
import dayjs from "dayjs";
import * as F from "effect/Function";
import { useFieldContext } from "../form";

function DateTimePickerField({ slotProps, ...other }: DefaultOmit<MobileDateTimePickerProps>) {
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
    <MobileDateTimePicker
      name={field.name}
      value={dayjs(field.state.value)}
      onChange={(newValue) => field.handleChange(dayjs(newValue).format())}
      format={formatPatterns.split.dateTime}
      slotProps={{
        textField: {
          onBlur: field.handleBlur,
          fullWidth: true,
          error: isError,
          helperText: error ?? (slotProps?.textField as TextFieldProps)?.helperText,
          ...slotProps?.textField,
        },
        ...slotProps,
      }}
      {...other}
    />
  );
}

export default DateTimePickerField;

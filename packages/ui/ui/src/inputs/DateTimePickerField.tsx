import type { DefaultOmit } from "@beep/ui/inputs/Field";
import { formatPatterns } from "@beep/ui-core/utils";
import type { TextFieldProps } from "@mui/material/TextField";
import type { MobileDateTimePickerProps } from "@mui/x-date-pickers/MobileDateTimePicker";
import { MobileDateTimePicker } from "@mui/x-date-pickers/MobileDateTimePicker";
import { useStore } from "@tanstack/react-form";
import * as DateTime from "effect/DateTime";
import * as F from "effect/Function";
import * as Option from "effect/Option";
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

  // Convert string to Date for MUI
  const dateValue = F.pipe(DateTime.make(field.state.value), Option.map(DateTime.toDate), Option.getOrNull);

  return (
    <MobileDateTimePicker
      name={field.name}
      value={dateValue}
      onChange={(newValue) => {
        if (newValue) {
          const dt = DateTime.unsafeFromDate(newValue);
          field.handleChange(DateTime.formatIso(dt));
        }
      }}
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

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

/**
 * DateTime picker field that works natively with Effect DateTime.
 *
 * With AdapterEffectDateTime, the picker now works directly with DateTime.DateTime values,
 * eliminating the need for Date <-> DateTime conversions at component boundaries.
 */
function DateTimePickerField({ slotProps, ...other }: DefaultOmit<MobileDateTimePickerProps>) {
  const field = useFieldContext<string>();

  const { error, isError } = useStore(field.form.store, (state) =>
    F.pipe(
      state.errorMap.onSubmit?.[field.name],
      (error_) =>
        ({
          error: error_,
          isError: !!error_,
        }) as const
    )
  );

  // Convert string to DateTime for MUI (native adapter support)
  const dateTimeValue = F.pipe(DateTime.make(field.state.value), Option.getOrNull);

  return (
    <MobileDateTimePicker
      name={field.name}
      value={dateTimeValue}
      onChange={(newValue) => {
        if (newValue && DateTime.isDateTime(newValue)) {
          field.handleChange(DateTime.formatIso(newValue));
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

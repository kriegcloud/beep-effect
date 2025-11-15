import { useStore } from "@tanstack/react-form";
import * as F from "effect/Function";
import type { E164Number } from "libphonenumber-js/core";
import type { Value } from "react-phone-number-input";
import { useFieldContext } from "../form";
import type { PhoneInputProps } from "./phone-input";
import { PhoneInput } from "./phone-input";

// ----------------------------------------------------------------------

export type PhoneFieldProps = Omit<PhoneInputProps, "value" | "onChange">;

function PhoneField({ name, helperText, ...other }: PhoneFieldProps) {
  const field = useFieldContext<Value>();
  const { error } = useStore(field.form.store, (state) =>
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
    <PhoneInput
      name={field.name}
      id={field.name}
      value={field.state.value ?? ""}
      onBlur={field.handleBlur}
      onChange={(inputValue) => field.handleChange(inputValue ?? ("" as E164Number))}
      fullWidth
      error={!!error}
      helperText={error?.message ?? helperText}
      {...other}
    />
  );
}

export default PhoneField;

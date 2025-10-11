import { useFieldContext } from "@beep/ui/form";
import { transformValue, transformValueOnChange } from "@beep/ui-core/utils";
import MuiTextField, { type TextFieldProps } from "@mui/material/TextField";
import { useStore } from "@tanstack/react-form";
import * as A from "effect/Array";
import * as P from "effect/Predicate";
import type React from "react";
import type { DefaultOmit } from "./Field";

const TextField: React.FC<DefaultOmit<TextFieldProps>> = ({ helperText, slotProps, type = "text", ...props }) => {
  const field = useFieldContext<string>();
  const isNumberType = P.isNumber(field.state.value);

  const { isError, error } = useStore(
    field.form.store,
    (state) =>
      ({
        isError: !!state.errorMap.onSubmit?.[field.name],
        error: state.errorMap.onSubmit?.[field.name],
      }) as const
  );

  return (
    <MuiTextField
      id={field.name}
      name={field.name}
      fullWidth
      value={isNumberType ? transformValue(field.state.value) : field.state.value}
      onChange={(event) => {
        const transformedValue = isNumberType ? transformValueOnChange(event.target.value) : event.target.value;

        field.handleChange(transformedValue);
      }}
      onBlur={field.handleBlur}
      type={isNumberType ? "text" : type}
      error={isError || A.length(field.state.meta.errors) > 0}
      helperText={
        (error || A.length(field.state.meta.errors)
          ? `${error ? `${error}` : ""} ${A.join(", ")(field.state.meta.errors)}`
          : undefined) ?? helperText
      }
      slotProps={{
        ...slotProps,
        htmlInput: {
          autoComplete: "off",
          ...slotProps?.htmlInput,
          ...(isNumberType && {
            inputMode: "decimal",
            pattern: "[0-9]*\\.?[0-9]*",
          }),
        },
      }}
      {...props}
    />
  );
};

export default TextField;

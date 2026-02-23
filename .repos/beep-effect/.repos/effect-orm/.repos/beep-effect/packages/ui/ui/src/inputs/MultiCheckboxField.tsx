import type { DefaultOmit } from "@beep/ui/inputs/Field";
import type { CheckboxProps } from "@mui/material/Checkbox";
import Checkbox from "@mui/material/Checkbox";
import type { FormControlProps } from "@mui/material/FormControl";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import type { FormGroupProps } from "@mui/material/FormGroup";
import FormGroup from "@mui/material/FormGroup";
import type { FormHelperTextProps } from "@mui/material/FormHelperText";
import type { FormLabelProps } from "@mui/material/FormLabel";
import FormLabel from "@mui/material/FormLabel";
import { useStore } from "@tanstack/react-form";
import * as A from "effect/Array";
import type React from "react";
import { useFieldContext } from "../form";
import { HelperText } from "./components";

type MultiCheckboxProps = FormGroupProps & {
  readonly label?: string | undefined;
  readonly helperText?: React.ReactNode | undefined;
  readonly options: A.NonEmptyReadonlyArray<{
    readonly label: string;
    readonly value: string;
  }>;
  readonly slotProps?: {
    readonly wrapper?: FormControlProps | undefined;
    readonly checkbox?: DefaultOmit<CheckboxProps> | undefined;
    readonly formLabel?: FormLabelProps | undefined;
    readonly helperText?: FormHelperTextProps | undefined;
  };
};

function MultiCheckbox({ label, options, slotProps, helperText, ...other }: MultiCheckboxProps) {
  const field = useFieldContext<Array<string>>();

  const getSelected = (selectedItems: string[], item: string) =>
    selectedItems.includes(item) ? selectedItems.filter((value) => value !== item) : [...selectedItems, item];
  const { error } = useStore(field.form.store, (state) => ({ error: state.errorMap.onSubmit?.[field.name] }) as const);
  return (
    <FormControl component="fieldset" {...slotProps?.wrapper}>
      {label && (
        <FormLabel
          component="legend"
          {...slotProps?.formLabel}
          sx={[
            { mb: 1, typography: "body2" },
            ...(Array.isArray(slotProps?.formLabel?.sx)
              ? (slotProps?.formLabel?.sx ?? [])
              : [slotProps?.formLabel?.sx]),
          ]}
        >
          {label}
        </FormLabel>
      )}

      <FormGroup {...other}>
        {A.map(options, (option) => (
          <FormControlLabel
            key={option.value}
            control={
              <Checkbox
                checked={field.state.value.includes(option.value)}
                defaultValue={field.state.value}
                onBlur={field.handleBlur}
                onChange={() => field.handleChange(getSelected(field.state.value, option.value))}
                {...slotProps?.checkbox}
                slotProps={{
                  ...slotProps?.checkbox?.slotProps,
                  input: {
                    id: `${option.label}-checkbox`,
                    ...(!option.label && {
                      "aria-label": `${option.label} checkbox`,
                    }),
                    ...slotProps?.checkbox?.slotProps?.input,
                  },
                }}
              />
            }
            label={option.label}
          />
        ))}
      </FormGroup>
      <HelperText {...slotProps?.helperText} disableGutters errorMessage={error} helperText={helperText} />
    </FormControl>
  );
}

export default MultiCheckbox;

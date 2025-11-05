import type { DefaultOmit } from "@beep/ui/inputs/Field";
import type { FormControlProps } from "@mui/material/FormControl";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import type { FormGroupProps } from "@mui/material/FormGroup";
import FormGroup from "@mui/material/FormGroup";
import type { FormHelperTextProps } from "@mui/material/FormHelperText";
import type { FormLabelProps } from "@mui/material/FormLabel";
import FormLabel from "@mui/material/FormLabel";
import type { SwitchProps } from "@mui/material/Switch";
import Switch from "@mui/material/Switch";
import { useStore } from "@tanstack/react-form";
import * as A from "effect/Array";
import * as F from "effect/Function";
import type React from "react";
import { useFieldContext } from "../form";
import { HelperText } from "./components";

type MultiSwitchProps = FormGroupProps & {
  readonly label?: string | undefined;
  readonly helperText?: React.ReactNode | undefined;
  readonly options: A.NonEmptyReadonlyArray<{
    readonly label: string;
    readonly value: string;
  }>;
  readonly slotProps?:
    | {
        readonly wrapper?: FormControlProps | undefined;
        readonly switch: DefaultOmit<SwitchProps>;
        readonly formLabel?: FormLabelProps | undefined;
        readonly helperText?: FormHelperTextProps | undefined;
      }
    | undefined;
};

function MultiSwitchField({ label, options, helperText, slotProps, ...other }: MultiSwitchProps) {
  const field = useFieldContext<Array<string>>();

  const getSelected = (selectedItems: string[], item: string) =>
    F.pipe(selectedItems.includes(item), (contains) =>
      contains ? A.filter(selectedItems, (value) => value !== item) : [...selectedItems, item]
    );
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
        {options.map((option) => (
          <FormControlLabel
            key={option.value}
            control={
              <Switch
                checked={field.state.value.includes(option.value)}
                onChange={() => field.handleChange(getSelected(field.state.value, option.value))}
                {...slotProps?.switch}
                slotProps={{
                  ...slotProps?.switch?.slotProps,
                  input: {
                    id: `${option.label}-switch`,
                    ...(!option.label && {
                      "aria-label": `${option.label} switch`,
                    }),
                    ...slotProps?.switch?.slotProps?.input,
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

export default MultiSwitchField;

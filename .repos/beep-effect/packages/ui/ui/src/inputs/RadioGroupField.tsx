import type { DefaultOmit } from "@beep/ui/inputs/Field";
import type { FormControlProps } from "@mui/material/FormControl";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import type { FormHelperTextProps } from "@mui/material/FormHelperText";
import type { FormLabelProps } from "@mui/material/FormLabel";
import FormLabel from "@mui/material/FormLabel";
import type { RadioProps } from "@mui/material/Radio";
import Radio from "@mui/material/Radio";
import type { RadioGroupProps } from "@mui/material/RadioGroup";
import RadioGroup from "@mui/material/RadioGroup";
import { useStore } from "@tanstack/react-form";
import type React from "react";
import { useFieldContext } from "../form";
import { HelperText } from "./components";

export type RadioGroupFieldProps = DefaultOmit<RadioGroupProps> & {
  readonly label?: string | undefined;
  readonly options: { label: string; value: string }[];
  readonly helperText?: React.ReactNode | undefined;
  readonly slotProps?:
    | {
        readonly wrapper?: FormControlProps | undefined;
        readonly radio?: RadioProps | undefined;
        readonly formLabel?: FormLabelProps | undefined;
        readonly helperText?: FormHelperTextProps | undefined;
      }
    | undefined;
};

function RadioGroupField({ sx, label, options, helperText, slotProps, ...other }: RadioGroupFieldProps) {
  const field = useFieldContext();
  const { error } = useStore(
    field.form.store,
    (state) =>
      ({
        error: state.errorMap.onSubmit?.[field.name],
      }) as const
  );
  const labelledby = `${field.name}-radios`;

  return (
    <FormControl component="fieldset" {...slotProps?.wrapper}>
      {label && (
        <FormLabel
          id={labelledby}
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

      <RadioGroup
        id={field.name}
        name={field.name}
        value={field.state.value}
        onChange={(e) => field.handleChange(e.target.value)}
        onBlur={field.handleBlur}
        aria-labelledby={labelledby}
        sx={sx ?? {}}
        {...other}
      >
        {options.map((option) => (
          <FormControlLabel
            key={option.value}
            value={option.value}
            control={
              <Radio
                {...slotProps?.radio}
                slotProps={{
                  ...slotProps?.radio?.slotProps,
                  input: {
                    id: `${option.label}-radio`,
                    ...(!option.label && {
                      "aria-label": `${option.label} radio`,
                    }),
                    ...slotProps?.radio?.slotProps?.input,
                  },
                }}
              />
            }
            label={option.label}
          />
        ))}
      </RadioGroup>

      <HelperText {...slotProps?.helperText} disableGutters errorMessage={error} helperText={helperText} />
    </FormControl>
  );
}

export default RadioGroupField;

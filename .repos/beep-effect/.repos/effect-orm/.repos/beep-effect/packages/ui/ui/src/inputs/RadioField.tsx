import { useFieldContext } from "@beep/ui/form";
import { HelperText } from "@beep/ui/inputs/components";
import type { BoxProps } from "@mui/material/Box";
import Box from "@mui/material/Box";
import type { FormControlLabelProps } from "@mui/material/FormControlLabel";
import FormControlLabel from "@mui/material/FormControlLabel";
import type { FormHelperTextProps } from "@mui/material/FormHelperText";
import MuiRadioField, { type RadioProps as MuiRadioProps } from "@mui/material/Radio";
import { useStore } from "@tanstack/react-form";
import type React from "react";
import type { DefaultOmit } from "./Field";

export type RadioProps = Omit<FormControlLabelProps, "control" | "label"> & {
  readonly helperText?: React.ReactNode | undefined;
  readonly label?: string | undefined;
  readonly slotProps?:
    | {
        readonly wrapper?: BoxProps | undefined;
        readonly switch?: DefaultOmit<MuiRadioProps> | undefined;
        readonly helperText?: FormHelperTextProps | undefined;
      }
    | undefined;
};

function RadioField({ name, helperText, label, slotProps, sx, ...other }: RadioProps) {
  const field = useFieldContext<boolean>();
  const { error } = useStore(
    field.form.store,
    (state) =>
      ({
        error: state.errorMap.onSubmit?.[field.name],
      }) as const
  );
  return (
    <Box {...slotProps?.wrapper}>
      <FormControlLabel
        label={label}
        control={
          <MuiRadioField
            id={field.name}
            name={field.name}
            checked={field.state.value}
            onChange={(e) => field.handleChange(e.target.checked)}
            onBlur={field.handleBlur}
            {...slotProps?.switch}
            slotProps={{
              ...slotProps?.switch?.slotProps,
              input: {
                id: `${name}-switch`,
                ...(!label && { "aria-label": `${name} switch` }),
                ...slotProps?.switch?.slotProps?.input,
              },
            }}
          />
        }
        sx={[{ mx: 0 }, ...(Array.isArray(sx) ? (sx ?? []) : [sx])]}
        {...other}
      />

      <HelperText {...slotProps?.helperText} errorMessage={error} helperText={helperText} />
    </Box>
  );
}

export default RadioField;

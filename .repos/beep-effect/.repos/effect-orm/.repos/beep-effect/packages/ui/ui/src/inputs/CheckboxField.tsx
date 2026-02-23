import { useFieldContext } from "@beep/ui/form";
import { HelperText } from "@beep/ui/inputs/components";
import type { DefaultOmit } from "@beep/ui/inputs/Field";
import type { BoxProps } from "@mui/material/Box";
import Box from "@mui/material/Box";
import type { CheckboxProps as MuiCheckboxProps } from "@mui/material/Checkbox";
import MuiCheckbox from "@mui/material/Checkbox";
import type { FormControlLabelProps } from "@mui/material/FormControlLabel";
import FormControlLabel from "@mui/material/FormControlLabel";
import type { FormHelperTextProps } from "@mui/material/FormHelperText";
import { useStore } from "@tanstack/react-form";
import type React from "react";

type CheckboxProps = Omit<FormControlLabelProps, "control"> & {
  readonly helperText?: React.ReactNode | undefined;
  readonly slotProps?:
    | {
        readonly wrapper?: BoxProps | undefined;
        readonly checkbox?: DefaultOmit<MuiCheckboxProps> | undefined;
        readonly helperText?: FormHelperTextProps | undefined;
      }
    | undefined;
};

function CheckboxField({ sx, name, label, slotProps, helperText, ...other }: CheckboxProps) {
  const field = useFieldContext<boolean>();
  const { error } = useStore(field.form.store, (state) => ({ error: state.errorMap.onSubmit?.[field.name] }) as const);
  return (
    <Box {...slotProps?.wrapper}>
      <FormControlLabel
        label={label}
        control={
          <MuiCheckbox
            id={field.name}
            name={field.name}
            onChange={(e) => field.handleChange(e.target.checked)}
            onBlur={field.handleBlur}
            checked={field.state.value}
            {...slotProps?.checkbox}
            slotProps={{
              ...slotProps?.checkbox?.slotProps,
              input: {
                id: `${name}-checkbox`,
                ...(!label && { "aria-label": `${name} checkbox` }),
                ...slotProps?.checkbox?.slotProps?.input,
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

export default CheckboxField;

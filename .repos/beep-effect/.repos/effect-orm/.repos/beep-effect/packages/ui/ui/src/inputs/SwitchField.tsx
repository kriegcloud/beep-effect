import { useFieldContext } from "@beep/ui/form";
import { HelperText } from "@beep/ui/inputs/components";
import type { DefaultOmit } from "@beep/ui/inputs/Field";
import type { BoxProps } from "@mui/material/Box";
import Box from "@mui/material/Box";
import type { FormControlLabelProps } from "@mui/material/FormControlLabel";
import FormControlLabel from "@mui/material/FormControlLabel";
import type { FormHelperTextProps } from "@mui/material/FormHelperText";
import type { SwitchProps as MuiSwitchProps } from "@mui/material/Switch";
import MuiSwitch from "@mui/material/Switch";
import { useStore } from "@tanstack/react-form";
import type React from "react";

export type SwitchProps = Omit<FormControlLabelProps, "control"> & {
  readonly helperText?: React.ReactNode | undefined;
  readonly slotProps?:
    | {
        readonly wrapper?: BoxProps | undefined;
        readonly switch?: DefaultOmit<MuiSwitchProps> | undefined;
        readonly helperText?: FormHelperTextProps | undefined;
      }
    | undefined;
};

function Switch({ helperText, label, slotProps, sx, ...other }: SwitchProps) {
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
          <MuiSwitch
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

export default Switch;

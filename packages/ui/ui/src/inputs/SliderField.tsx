import type { DefaultOmit } from "@beep/ui/inputs/Field";
import type { BoxProps } from "@mui/material/Box";
import Box from "@mui/material/Box";
import type { FormHelperTextProps } from "@mui/material/FormHelperText";
import type { SliderProps as MuiSliderProps } from "@mui/material/Slider";
import MuiSlider from "@mui/material/Slider";
import { useStore } from "@tanstack/react-form";
import type React from "react";
import { useFieldContext } from "../form";
import { HelperText } from "./components";

export type SliderProps = DefaultOmit<MuiSliderProps> & {
  readonly label: string;
  readonly helperText?: React.ReactNode | undefined;
  readonly slotProps?:
    | {
        readonly wrapper?: BoxProps | undefined;
        readonly helperText?: FormHelperTextProps | undefined;
      }
    | undefined;
};

function Slider({ helperText, slotProps, ...other }: SliderProps) {
  const field = useFieldContext();
  const { error } = useStore(
    field.form.store,
    (state) =>
      ({
        error: state.errorMap.onSubmit?.[field.name],
      }) as const
  );
  return (
    <Box {...slotProps?.wrapper}>
      <MuiSlider
        id={field.name}
        name={field.name}
        onChange={(_, value) => field.handleChange(value)}
        onBlur={field.handleBlur}
        valueLabelDisplay="auto"
        {...other}
      />

      <HelperText {...slotProps?.helperText} disableGutters errorMessage={error} helperText={helperText} />
    </Box>
  );
}

export default Slider;

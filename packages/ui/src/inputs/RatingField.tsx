import type { DefaultOmit } from "@beep/ui/inputs/Field";
import type { BoxProps } from "@mui/material/Box";
import Box from "@mui/material/Box";
import type { FormHelperTextProps } from "@mui/material/FormHelperText";
import type { RatingProps as MuiRatingProps } from "@mui/material/Rating";
import MuiRating from "@mui/material/Rating";
import { useStore } from "@tanstack/react-form";
import type React from "react";
import { useFieldContext } from "../form";
import { HelperText } from "./components";

export type RatingProps = DefaultOmit<MuiRatingProps> & {
  helperText?: React.ReactNode;
  slotProps?: {
    wrapper?: BoxProps;
    helperText?: FormHelperTextProps;
  };
};

function RatingField({ helperText, slotProps, ...other }: RatingProps) {
  const field = useFieldContext<number | null | undefined>();
  const { error } = useStore(
    field.form.store,
    (state) =>
      ({
        error: state.errorMap.onSubmit?.[field.name],
      }) as const
  );
  return (
    <Box
      {...slotProps?.wrapper}
      sx={[
        { display: "flex", flexDirection: "column" },
        ...(Array.isArray(slotProps?.wrapper?.sx) ? (slotProps?.wrapper?.sx ?? []) : [slotProps?.wrapper?.sx]),
      ]}
    >
      <MuiRating
        id={field.name}
        name={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(_, newValue) => field.handleChange(Number(newValue))}
        {...other}
      />

      <HelperText {...slotProps?.helperText} disableGutters errorMessage={error} helperText={helperText} />
    </Box>
  );
}

export default RatingField;

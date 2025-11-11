import type { DefaultOmit } from "@beep/ui/inputs/Field";
import type { BoxProps } from "@mui/material/Box";
import Box from "@mui/material/Box";
import type { FormHelperTextProps } from "@mui/material/FormHelperText";
import { inputBaseClasses } from "@mui/material/InputBase";
import { useStore } from "@tanstack/react-form";
import * as F from "effect/Function";
import type { MuiOtpInputProps } from "mui-one-time-password-input";
import { MuiOtpInput } from "mui-one-time-password-input";
import type React from "react";
import { useFieldContext } from "../form";
import { HelperText } from "./components";

export interface OTPFieldProps extends Omit<DefaultOmit<MuiOtpInputProps>, "sx"> {
  readonly maxSize?: number | undefined;
  readonly placeholder?: string | undefined;
  readonly helperText?: React.ReactNode | undefined;
  readonly slotProps?:
    | {
        readonly wrapper?: BoxProps | undefined;
        readonly helperText?: FormHelperTextProps | undefined;
        readonly textfield?: DefaultOmit<MuiOtpInputProps["TextFieldsProps"]> | undefined;
      }
    | undefined;
}

function OTPField({ slotProps, helperText, maxSize = 56, placeholder = "-" }: OTPFieldProps) {
  const field = useFieldContext<string>();
  const { error, isError } = useStore(field.form.store, (state) =>
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
    <Box
      {...slotProps?.wrapper}
      sx={[
        {
          [`& .${inputBaseClasses.input}`]: {
            p: 0,
            height: "auto",
            aspectRatio: "1/1",
            maxWidth: maxSize,
          },
        },
        ...(Array.isArray(slotProps?.wrapper?.sx) ? (slotProps?.wrapper?.sx ?? []) : [slotProps?.wrapper?.sx]),
      ]}
    >
      <MuiOtpInput
        id={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(i) => field.handleChange(i)}
        autoFocus
        gap={1.5}
        length={6}
        TextFieldsProps={{
          placeholder,
          error: isError,
          ...slotProps?.textfield,
        }}
      />

      <HelperText {...slotProps?.helperText} errorMessage={error} helperText={helperText} />
    </Box>
  );
}

export default OTPField;

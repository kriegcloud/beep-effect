import type { BoxProps as MuiBoxProps } from "@mui/material/Box";
import type { TextFieldProps as MuiTextFieldProps } from "@mui/material/TextField";

type TextFieldProps = Omit<
  MuiTextFieldProps,
  "onChange" | "select" | "multiline" | "defaultValue" | "value" | "autoFocus"
>;

type BoxProps = Omit<MuiBoxProps, "onChange" | "onBlur">;

export interface BaseMuiOtpInputProps {
  readonly value?: undefined | string;
  readonly length?: undefined | number;
  readonly autoFocus?: undefined | boolean;
  readonly TextFieldsProps?: undefined | TextFieldProps | ((index: number) => TextFieldProps);
  readonly onComplete?: undefined | ((value: string) => void);
  readonly validateChar?: undefined | ((character: string, index: number) => boolean);
  readonly onChange?: undefined | ((value: string) => void);
  readonly onBlur?: undefined | ((value: string, isCompleted: boolean) => void);
}

export type MuiOtpInputProps = BoxProps & BaseMuiOtpInputProps;

import type { ButtonBaseProps } from "@mui/material/ButtonBase";
import type { SxProps, Theme } from "@mui/material/styles";
import type { TextFieldProps } from "@mui/material/TextField";
import type * as A from "effect/Array";
import type { Country, Props, Value } from "react-phone-number-input/input";
// ----------------------------------------------------------------------

export type PhoneInputProps = Props<TextFieldProps> & {
  hideSelect?: boolean;
};

export type PhoneValue = Value;
export type PhoneCountry = Country;

export type CountryListProps = ButtonBaseProps & {
  sx?: SxProps<Theme>;
  searchCountry: string;
  selectedCountry?: Country;
  onSearchCountry: (inputValue: string) => void;
  onSelectedCountry: (inputValue: Country) => void;
  options: A.NonEmptyReadonlyArray<{ label: string; code: string; phone: string }>;
};

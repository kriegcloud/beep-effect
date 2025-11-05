import type { ButtonBaseProps } from "@mui/material/ButtonBase";
import type { SxProps, Theme } from "@mui/material/styles";
import type { TextFieldProps } from "@mui/material/TextField";
import type * as A from "effect/Array";
import type { Country, Props, Value } from "react-phone-number-input/input";
// ----------------------------------------------------------------------

export type PhoneInputProps = Props<TextFieldProps> & {
  readonly hideSelect?: boolean | undefined;
};

export type PhoneValue = Value;
export type PhoneCountry = Country;

export type CountryListProps = ButtonBaseProps & {
  readonly sx?: SxProps<Theme> | undefined;
  readonly searchCountry: string;
  readonly selectedCountry?: Country | undefined;
  readonly onSearchCountry: (inputValue: string) => void;
  readonly onSelectedCountry: (inputValue: Country) => void;
  readonly options: A.NonEmptyReadonlyArray<{
    readonly label: string;
    readonly code: string;
    readonly phone: string;
  }>;
};

import { countries } from "@beep/ui/assets/data/countries";
import { Iconify } from "@beep/ui/atoms";

import { debounce } from "@beep/utils";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import { inputBaseClasses } from "@mui/material/InputBase";
import { useTheme } from "@mui/material/styles";
import type { TextFieldProps } from "@mui/material/TextField";
import TextField from "@mui/material/TextField";
import { forwardRef, useCallback, useMemo, useState } from "react";
import PhoneNumberInput, { parsePhoneNumber } from "react-phone-number-input/input";
import { CountryListPopover } from "./list-popover";
import type { PhoneCountry, PhoneInputProps, PhoneValue } from "./types";

// ----------------------------------------------------------------------

export function PhoneInput({
  sx,
  size,
  label,
  placeholder,
  fullWidth = true,
  variant: variantProp,
  /********/
  value,
  country,
  onChange,
  defaultCountry,
  /********/
  hideSelect,
  ...other
}: PhoneInputProps) {
  const theme = useTheme();
  const variant = variantProp ?? theme.components?.MuiTextField?.defaultProps?.variant;

  const normalizedValue = value ? value.trim().replace(/[\s-]+/g, "") : undefined;

  const [searchCountry, setSearchCountry] = useState("");
  const lockedCountry = country ?? undefined;

  const [selectedCountry, setSelectedCountry] = useState<PhoneCountry | undefined>(
    parseCountryFromPhone(normalizedValue) ?? lockedCountry ?? defaultCountry
  );

  const hasLabel = !!label;
  const isCountryLocked = !!lockedCountry;

  const activeCountry = useMemo(() => {
    const parsedCountry = parseCountryFromPhone(normalizedValue);
    return parsedCountry ?? lockedCountry ?? selectedCountry;
  }, [lockedCountry, selectedCountry, normalizedValue]);

  const debouncedChange = useMemo(
    () =>
      debounce((...args: readonly unknown[]) => {
        const [rawValue] = args;
        if (typeof rawValue === "string") {
          onChange(rawValue as PhoneValue);
          return;
        }
        if (rawValue === undefined || rawValue === null) {
          onChange(undefined);
        }
      }, 200),
    [onChange]
  );

  const handleChangeInput = useCallback(
    (inputValue: PhoneValue | undefined) => {
      debouncedChange(inputValue ?? "");
    },
    [debouncedChange]
  );

  const handleClearInput = useCallback(() => {
    handleChangeInput(undefined);
  }, [handleChangeInput]);

  const handleSearchCountry = useCallback((inputQuery: string) => {
    setSearchCountry(inputQuery);
  }, []);

  const handleSelectedCountry = useCallback(
    (countryCode: PhoneCountry) => {
      setSearchCountry("");
      handleClearInput();
      setSelectedCountry(countryCode);
    },
    [handleClearInput]
  );

  const renderSelect = () => (
    <CountryListPopover
      options={countries}
      searchCountry={searchCountry}
      selectedCountry={activeCountry}
      onSearchCountry={handleSearchCountry}
      onSelectedCountry={handleSelectedCountry}
      disabled={Boolean(isCountryLocked)}
      sx={{
        pl: variant === "standard" ? 0 : 1.5,
        ...(variant === "standard" && hasLabel && { mt: size === "small" ? "16px" : "20px" }),
        ...((variant === "filled" || variant === "outlined") && {
          mt: size === "small" ? "8px" : "16px",
        }),
        ...(variant === "filled" && hasLabel && { mt: size === "small" ? "21px" : "25px" }),
      }}
    />
  );

  const renderInput = () => {
    const textFieldProps: Omit<TextFieldProps, "value" | "onChange"> = {
      ...(size ? { size } : {}),
      label,
      ...(variant ? { variant } : {}),
      fullWidth,
      hiddenLabel: !label,
      placeholder: placeholder ?? "Enter phone number",
      slotProps: {
        inputLabel: { shrink: true },
        input: {
          endAdornment: normalizedValue && (
            <InputAdornment position="end">
              <IconButton size="small" edge="end" onClick={handleClearInput}>
                <Iconify width={16} icon="mingcute:close-line" />
              </IconButton>
            </InputAdornment>
          ),
        },
      },
    };

    const phoneInputProps: PhoneInputProps = {
      value: normalizedValue,
      onChange: handleChangeInput,
      inputComponent: CustomInput,
      ...(activeCountry ? { country: activeCountry } : defaultCountry ? { defaultCountry } : {}),
    } as PhoneInputProps;

    return <PhoneNumberInput {...textFieldProps} {...phoneInputProps} {...other} />;
  };

  const baseButtonWidth = variant === "standard" ? "48px" : "60px";
  const disabledButtonWidth = `calc(${baseButtonWidth} - 16px)`;
  const buttonWidth = isCountryLocked ? disabledButtonWidth : baseButtonWidth;

  return (
    <Box
      sx={[
        {
          "--popover-button-mr": "12px",
          "--popover-button-height": "22px",
          "--popover-button-width": buttonWidth,
          position: "relative",
          ...(fullWidth && { width: 1 }),
          ...(!hideSelect && {
            [`& .${inputBaseClasses.input}`]: {
              pl: "calc(var(--popover-button-width) + var(--popover-button-mr))",
            },
          }),
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {!hideSelect && renderSelect()}
      {renderInput()}
    </Box>
  );
}

// ----------------------------------------------------------------------

const CustomInput = forwardRef<HTMLInputElement, TextFieldProps>(function CustomInput(props, ref) {
  return <TextField {...props} inputRef={ref} />;
});

// ----------------------------------------------------------------------

function parseCountryFromPhone(inputValue?: PhoneInputProps["value"]): PhoneCountry | undefined {
  const parsed = inputValue ? parsePhoneNumber(inputValue) : undefined;
  return parsed?.country ?? undefined;
}

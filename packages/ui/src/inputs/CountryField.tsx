import type { UnsafeTypes } from "@beep/types";
import { countries } from "@beep/ui/assets/data";
import { FlagIcon, flagIconClasses } from "@beep/ui/icons";
import type { DefaultOmit } from "@beep/ui/inputs/Field";
import type {
  AutocompleteProps,
  AutocompleteRenderGetTagProps,
  AutocompleteRenderInputParams,
} from "@mui/material/Autocomplete";
import Autocomplete from "@mui/material/Autocomplete";
import Chip from "@mui/material/Chip";
import { filledInputClasses } from "@mui/material/FilledInput";
import InputAdornment from "@mui/material/InputAdornment";
import { outlinedInputClasses } from "@mui/material/OutlinedInput";
import type { TextFieldProps } from "@mui/material/TextField";
import TextField from "@mui/material/TextField";
import { useStore } from "@tanstack/react-form";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as O from "effect/Option";
import type React from "react";
import { useCallback, useMemo } from "react";
import { useFieldContext } from "../form";

type Value = string;

export type AutocompleteBaseProps = Omit<
  AutocompleteProps<UnsafeTypes.UnsafeAny, boolean, boolean, boolean>,
  "options" | "renderOption" | "renderInput" | "renderTags" | "getOptionLabel"
>;

export type CountrySelectProps = AutocompleteBaseProps & {
  readonly label?: string | undefined;
  readonly error?: boolean | undefined;
  readonly placeholder?: string | undefined;
  readonly hiddenLabel?: boolean | undefined;
  readonly getValue?: "label" | "code" | undefined;
  readonly helperText?: React.ReactNode | undefined;
  readonly variant?: TextFieldProps["variant"] | undefined;
};

export function CountrySelect({
  id,
  label,
  error,
  variant,
  multiple,
  helperText,
  hiddenLabel,
  placeholder,
  getValue = "label",
  ...other
}: CountrySelectProps) {
  const options = useMemo(
    () => A.map(countries, (country) => (getValue === "label" ? country.label : country.code)),
    [getValue]
  );

  const getCountry = useCallback(
    (inputValue: string) =>
      F.pipe(
        A.findFirst(countries, (op) => op.label === inputValue || op.code === inputValue || op.phone === inputValue),
        O.match({
          onNone: () => ({ code: "", label: "", phone: "" }),
          onSome: (op) => ({
            code: op.code,
            label: op.label,
            phone: op.phone,
          }),
        })
      ),
    []
  );

  const renderOption = useCallback(
    (props: React.HTMLAttributes<HTMLLIElement>, option: Value) => {
      const country = getCountry(option);

      return (
        <li {...props} key={country.label}>
          <FlagIcon
            key={country.label}
            code={country.code}
            sx={{
              mr: 1,
              width: 22,
              height: 22,
              borderRadius: "50%",
            }}
          />
          {country.label} ({country.code}) +{country.phone}
        </li>
      );
    },
    [getCountry]
  );

  const renderInput = useCallback(
    (params: AutocompleteRenderInputParams) => {
      const country = getCountry(params.inputProps.value as Value);

      const baseField = {
        ...params,
        label,
        variant,
        placeholder,
        helperText,
        hiddenLabel,
        error: !!error,
        inputProps: { ...params.inputProps, autoComplete: "new-password" },
      };

      if (multiple) {
        return <TextField {...(baseField as React.ComponentProps<typeof TextField>)} />;
      }

      return (
        <TextField
          {...(baseField as React.ComponentProps<typeof TextField>)}
          slotProps={{
            input: {
              ...params.InputProps,
              startAdornment: (
                <InputAdornment position="start" sx={{ ...(!country.code && { display: "none" }) }}>
                  <FlagIcon
                    key={country.label}
                    code={country.code}
                    sx={{ width: 22, height: 22, borderRadius: "50%" }}
                  />
                </InputAdornment>
              ),
            },
          }}
          sx={{
            [`& .${outlinedInputClasses.root}`]: {
              [`& .${flagIconClasses.root}`]: { ml: 0.5, mr: -0.5 },
            },
            [`& .${filledInputClasses.root}`]: {
              [`& .${flagIconClasses.root}`]: {
                ml: 0.5,
                mr: -0.5,
                mt: hiddenLabel ? 0 : -2,
              },
            },
          }}
        />
      );
    },
    [getCountry, label, variant, placeholder, helperText, hiddenLabel, error, multiple]
  );

  const renderTags = useCallback(
    (selected: Value[], getTagProps: AutocompleteRenderGetTagProps) =>
      A.map(selected, (option, index) => {
        const country = getCountry(option);

        return (
          <Chip
            {...getTagProps({ index })}
            key={country.label}
            label={country.label}
            size="small"
            variant="soft"
            icon={
              <FlagIcon key={country.label} code={country.code} sx={{ width: 16, height: 16, borderRadius: "50%" }} />
            }
          />
        );
      }),
    [getCountry]
  );

  const getOptionLabel = useCallback(
    (option: Value) =>
      getValue === "code"
        ? F.pipe(
            A.findFirst(countries, (op) => op.code === option),
            O.match({
              onNone: () => "",
              onSome: (op) => op.label,
            })
          )
        : option,
    [getValue]
  );

  return (
    <Autocomplete
      id={`${id}-country-select`}
      multiple={Boolean(multiple)}
      options={options}
      autoHighlight={!multiple}
      disableCloseOnSelect={Boolean(multiple)}
      renderOption={renderOption}
      renderInput={renderInput}
      {...(multiple ? { renderTags } : {})}
      getOptionLabel={getOptionLabel}
      {...other}
    />
  );
}

function CountryField({ helperText, ...other }: DefaultOmit<CountrySelectProps>) {
  const field = useFieldContext();
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
    <CountrySelect
      id={field.name}
      value={field.state.value}
      onBlur={field.handleBlur}
      defaultValue={field.state.value}
      onChange={(_, newValue) => field.handleChange(newValue)}
      error={isError}
      helperText={error ?? helperText}
      {...other}
    />
  );
}

export default CountryField;

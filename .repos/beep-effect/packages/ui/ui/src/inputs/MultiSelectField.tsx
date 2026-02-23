import type { UnsafeTypes } from "@beep/types";
import type { DefaultOmit } from "@beep/ui/inputs/Field";
import Box from "@mui/material/Box";
import type { CheckboxProps } from "@mui/material/Checkbox";
import Checkbox from "@mui/material/Checkbox";
import type { ChipProps } from "@mui/material/Chip";
import Chip from "@mui/material/Chip";
import type { FormControlProps } from "@mui/material/FormControl";
import FormControl from "@mui/material/FormControl";
import type { FormHelperTextProps } from "@mui/material/FormHelperText";
import type { InputLabelProps } from "@mui/material/InputLabel";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import type { SelectProps } from "@mui/material/Select";
import Select from "@mui/material/Select";
import { useStore } from "@tanstack/react-form";
import * as A from "effect/Array";
import * as F from "effect/Function";
import type React from "react";
import { useFieldContext } from "../form";
import { HelperText } from "./components";

type MultiSelectProps = FormControlProps & {
  readonly label?: string | undefined;
  readonly chip?: boolean | undefined;
  readonly checkbox?: boolean | undefined;
  readonly placeholder?: string | undefined;
  readonly helperText?: React.ReactNode | undefined;
  readonly options: A.NonEmptyReadonlyArray<{
    readonly label: string;
    readonly value: string;
  }>;
  readonly slotProps?:
    | {
        readonly chip?: ChipProps | undefined;
        readonly select?: DefaultOmit<SelectProps> | undefined;
        readonly checkbox?: CheckboxProps | undefined;
        readonly inputLabel?: InputLabelProps | undefined;
        readonly helperText?: FormHelperTextProps | undefined;
      }
    | undefined;
};

function MultiSelect({
  chip,
  label,
  options,
  checkbox,
  placeholder,
  slotProps,
  helperText,
  ...other
}: MultiSelectProps) {
  const field = useFieldContext<UnsafeTypes.UnsafeArray>();
  const labelId = `${field.name}-multi-select`;
  const renderLabel = () => (
    <InputLabel htmlFor={labelId} {...slotProps?.inputLabel}>
      {label}
    </InputLabel>
  );
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
  const renderOptions = () =>
    A.map(options, (option, i) => (
      <MenuItem key={option.value} value={option.value}>
        {checkbox && (
          <Checkbox
            size="small"
            disableRipple
            checked={field.state.value[i] === option.value}
            {...slotProps?.checkbox}
          />
        )}
      </MenuItem>
    ));

  return (
    <FormControl error={isError} {...other}>
      {label && renderLabel()}
      <Select
        id={field.name}
        name={field.name}
        value={field.state.value}
        multiple
        displayEmpty={!!placeholder}
        label={label}
        renderValue={(selected) => {
          const selectedItems = A.filter(options, (item) => selected.includes(item.value));

          if (!selectedItems.length && placeholder) {
            return <Box sx={{ color: "text.disabled" }}>{placeholder}</Box>;
          }

          if (chip) {
            return (
              <Box sx={{ gap: 0.5, display: "flex", flexWrap: "wrap" }}>
                {A.map(selectedItems, (item) => (
                  <Chip key={item.value} size="small" variant="soft" label={item.label} {...slotProps?.chip} />
                ))}
              </Box>
            );
          }

          return A.join(", ")(A.map(selectedItems, (item) => item.label));
        }}
        {...slotProps?.select}
        inputProps={{
          id: labelId,
          ...slotProps?.select?.inputProps,
        }}
      >
        {renderOptions()}
      </Select>

      <HelperText {...slotProps?.helperText} errorMessage={error} helperText={helperText} />
    </FormControl>
  );
}

export default MultiSelect;

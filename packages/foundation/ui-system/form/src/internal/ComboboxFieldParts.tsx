/**
 * Shared combobox field rendering parts.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
"use client";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@beep/ui/components/combobox";
import * as A from "effect/Array";
import { BoundField } from "./FieldBinding.tsx";
import type React from "react";
import type { FieldOption } from "../core/Options.ts";
import type { BoundFieldState } from "./FieldBinding.tsx";

export const optionValues = (options: ReadonlyArray<FieldOption>): ReadonlyArray<string> =>
  A.map(options, (option) => option.value);

type ComboboxOptionsContentProps = {
  readonly anchor?: React.ComponentProps<typeof ComboboxContent>["anchor"] | undefined;
  readonly emptyLabel: string;
  readonly options: ReadonlyArray<FieldOption>;
};

export const ComboboxOptionsContent: React.FC<ComboboxOptionsContentProps> = ({ anchor, emptyLabel, options }) => (
  <ComboboxContent anchor={anchor}>
    <ComboboxEmpty>{emptyLabel}</ComboboxEmpty>
    <ComboboxList>
      {options.map((option) => (
        <ComboboxItem key={option.value} value={option.value} disabled={option.disabled}>
          {option.label}
        </ComboboxItem>
      ))}
    </ComboboxList>
  </ComboboxContent>
);

type StringComboboxMode = "autocomplete" | "selected";

type StringComboboxFieldProps = {
  readonly comboboxProps: Omit<
    React.ComponentProps<typeof Combobox>,
    "inputValue" | "items" | "name" | "onInputValueChange" | "onValueChange" | "value"
  >;
  readonly description?: React.ReactNode | undefined;
  readonly emptyLabel: string;
  readonly label?: React.ReactNode | undefined;
  readonly mode: StringComboboxMode;
  readonly options: ReadonlyArray<FieldOption>;
  readonly placeholder?: string | undefined;
};

const comboboxValueBinding = (mode: StringComboboxMode, field: BoundFieldState<string>["field"]) =>
  mode === "autocomplete"
    ? {
        inputValue: field.state.value,
        onInputValueChange: (inputValue: string) => field.handleChange(inputValue),
      }
    : {
        value: field.state.value,
      };

export const StringComboboxField: React.FC<StringComboboxFieldProps> = ({
  comboboxProps,
  description,
  emptyLabel,
  label,
  mode,
  options,
  placeholder,
}) => (
  <BoundField<string> label={label} description={description}>
    {({ field, hasErrors }) => (
      <Combobox
        {...comboboxProps}
        {...comboboxValueBinding(mode, field)}
        items={optionValues(options)}
        name={field.name}
        onValueChange={(value) => field.handleChange(value === null ? "" : String(value))}
      >
        <ComboboxInput
          id={field.name}
          placeholder={placeholder}
          onBlur={field.handleBlur}
          aria-invalid={hasErrors || undefined}
        />
        <ComboboxOptionsContent emptyLabel={emptyLabel} options={options} />
      </Combobox>
    )}
  </BoundField>
);

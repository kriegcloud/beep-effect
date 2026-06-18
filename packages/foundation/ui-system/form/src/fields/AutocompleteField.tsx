/**
 * Free-text field with suggestions bound to the `@beep/ui` `Combobox` primitive.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
"use client";

import { StringComboboxField } from "../internal/ComboboxFieldParts.tsx";
import type { Combobox } from "@beep/ui/components/combobox";
import type React from "react";
import type { FieldOption } from "../core/Options.ts";

/**
 * Props for {@link AutocompleteField}: `Combobox` props plus
 * label/description/options/placeholder; binding props
 * (`items`/`inputValue`/`onInputValueChange`/`onValueChange`/`name`) are owned
 * by the field.
 *
 * @category models
 * @since 0.0.0
 */
export interface AutocompleteFieldProps
  extends Omit<
    React.ComponentProps<typeof Combobox>,
    "items" | "inputValue" | "onInputValueChange" | "onValueChange" | "value" | "name"
  > {
  readonly description?: React.ReactNode | undefined;
  readonly label?: React.ReactNode | undefined;
  readonly options: ReadonlyArray<FieldOption>;
  readonly placeholder?: string | undefined;
}

/**
 * Schema-bound free-text autocomplete: the value is whatever the user types,
 * with the options offered as filtered suggestions.
 *
 * @example
 * ```tsx
 * import { AutocompleteField } from "@beep/form/fields/AutocompleteField"
 *
 * console.log(AutocompleteField)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
export const AutocompleteField: React.FC<AutocompleteFieldProps> = ({
  label,
  description,
  options,
  placeholder,
  ...props
}) => (
  <StringComboboxField
    comboboxProps={props}
    description={description}
    emptyLabel="No suggestions."
    label={label}
    mode="autocomplete"
    options={options}
    placeholder={placeholder}
  />
);

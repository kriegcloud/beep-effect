/**
 * Single, filterable select field bound to the `@beep/ui` `Combobox` primitive.
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
 * Props for {@link ComboboxField}: `Combobox` props plus
 * label/description/options/placeholder; binding props
 * (`items`/`value`/`onValueChange`/`name`) are owned by the field.
 *
 * @category models
 * @since 0.0.0
 */
export interface ComboboxFieldProps
  extends Omit<React.ComponentProps<typeof Combobox>, "items" | "value" | "onValueChange" | "name"> {
  readonly description?: React.ReactNode | undefined;
  readonly label?: React.ReactNode | undefined;
  readonly options: ReadonlyArray<FieldOption>;
  readonly placeholder?: string | undefined;
}

/**
 * Schema-bound single-select combobox with base-ui's built-in filtering over a
 * fixed option set.
 *
 * @example
 * ```tsx
 * import { ComboboxField } from "@beep/form/fields/ComboboxField"
 *
 * console.log(ComboboxField)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
export const ComboboxField: React.FC<ComboboxFieldProps> = ({ label, description, options, placeholder, ...props }) => (
  <StringComboboxField
    comboboxProps={props}
    description={description}
    emptyLabel="No results found."
    label={label}
    mode="selected"
    options={options}
    placeholder={placeholder}
  />
);

/**
 * Free-text field with suggestions bound to the `@beep/ui` `Combobox` primitive.
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
import { useFieldContext } from "../core/contexts.ts";
import { toFieldErrors } from "../core/Errors.ts";
import { FieldShell } from "../internal/FieldShell.tsx";
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
}) => {
  const field = useFieldContext<string>();
  const errors = toFieldErrors(field.state.meta.errors);
  const hasErrors = A.isReadonlyArrayNonEmpty(errors);
  return (
    <FieldShell htmlFor={field.name} label={label} description={description} errors={errors}>
      <Combobox
        {...props}
        items={A.map(options, (option) => option.value)}
        name={field.name}
        inputValue={field.state.value}
        onInputValueChange={(inputValue) => field.handleChange(inputValue)}
        onValueChange={(value) => field.handleChange(value === null ? "" : String(value))}
      >
        <ComboboxInput
          id={field.name}
          placeholder={placeholder}
          onBlur={field.handleBlur}
          aria-invalid={hasErrors || undefined}
        />
        <ComboboxContent>
          <ComboboxEmpty>No suggestions.</ComboboxEmpty>
          <ComboboxList>
            {options.map((option) => (
              <ComboboxItem key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </ComboboxItem>
            ))}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </FieldShell>
  );
};

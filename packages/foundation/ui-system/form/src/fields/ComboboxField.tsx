/**
 * Single, filterable select field bound to the `@beep/ui` `Combobox` primitive.
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
export const ComboboxField: React.FC<ComboboxFieldProps> = ({ label, description, options, placeholder, ...props }) => {
  const field = useFieldContext<string>();
  const errors = toFieldErrors(field.state.meta.errors);
  const hasErrors = A.isReadonlyArrayNonEmpty(errors);
  return (
    <FieldShell htmlFor={field.name} label={label} description={description} errors={errors}>
      <Combobox
        {...props}
        items={A.map(options, (option) => option.value)}
        name={field.name}
        value={field.state.value}
        onValueChange={(value) => field.handleChange(value === null ? "" : String(value))}
      >
        <ComboboxInput
          id={field.name}
          placeholder={placeholder}
          onBlur={field.handleBlur}
          aria-invalid={hasErrors || undefined}
        />
        <ComboboxContent>
          <ComboboxEmpty>No results found.</ComboboxEmpty>
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

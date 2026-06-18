/**
 * Country field bound to the `@beep/ui` `CountrySelect` primitive.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
"use client";

import { CountrySelect, isCountryCode } from "@beep/ui/components/country-select";
import * as A from "effect/Array";
import { useFieldContext } from "../core/contexts.ts";
import { toFieldErrors } from "../core/Errors.ts";
import { FieldShell } from "../internal/FieldShell.tsx";
import type React from "react";

/**
 * Props for {@link CountryField}: `CountrySelect` props plus
 * label/description; binding props are owned by the field.
 *
 * @example
 * ```ts
 * import type { CountryFieldProps } from "@beep/form/fields/CountryField"
 *
 * const props = {
 *   label: "Country",
 *   description: "Stores an ISO alpha-2 country code.",
 * } satisfies CountryFieldProps
 *
 * console.log(props.description) // "Stores an ISO alpha-2 country code."
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export interface CountryFieldProps
  extends Omit<React.ComponentProps<typeof CountrySelect>, "id" | "name" | "onBlur" | "onValueChange" | "value"> {
  readonly description?: React.ReactNode | undefined;
  readonly label?: React.ReactNode | undefined;
}

/**
 * Schema-bound country combobox whose value is an ISO alpha-2 code.
 *
 * @example
 * ```tsx
 * import { CountryField } from "@beep/form/fields/CountryField"
 *
 * console.log(CountryField)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
export const CountryField: React.FC<CountryFieldProps> = ({ label, description, ...props }) => {
  const field = useFieldContext<string>();
  const errors = toFieldErrors(field.state.meta.errors);
  const value = isCountryCode(field.state.value) ? field.state.value : "";
  return (
    <FieldShell htmlFor={field.name} label={label} description={description} errors={errors}>
      <CountrySelect
        {...props}
        id={field.name}
        name={field.name}
        value={value}
        onValueChange={(value) => field.handleChange(value)}
        onBlur={field.handleBlur}
        aria-invalid={A.isReadonlyArrayNonEmpty(errors) || undefined}
      />
    </FieldShell>
  );
};

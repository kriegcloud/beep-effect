/**
 * Phone field bound to the `@beep/ui` `PhoneInput` primitive.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
"use client";

import { PhoneInput } from "@beep/ui/components/phone-input";
import * as A from "effect/Array";
import { useFieldContext } from "../core/contexts.ts";
import { toFieldErrors } from "../core/Errors.ts";
import { FieldShell } from "../internal/FieldShell.tsx";
import type React from "react";

/**
 * Props for {@link PhoneField}: `PhoneInput` props plus label/description;
 * binding props are owned by the field.
 *
 * @category models
 * @since 0.0.0
 */
export interface PhoneFieldProps
  extends Omit<
    React.ComponentProps<typeof PhoneInput>,
    "defaultValue" | "id" | "name" | "onBlur" | "onValueChange" | "value"
  > {
  readonly description?: React.ReactNode | undefined;
  readonly label?: React.ReactNode | undefined;
}

/**
 * Schema-bound phone input whose canonical value is an E.164 string.
 *
 * @example
 * ```tsx
 * import { PhoneField } from "@beep/form/fields/PhoneField"
 *
 * console.log(PhoneField)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
export const PhoneField: React.FC<PhoneFieldProps> = ({ label, description, ...props }) => {
  const field = useFieldContext<string>();
  const errors = toFieldErrors(field.state.meta.errors);
  return (
    <FieldShell htmlFor={field.name} label={label} description={description} errors={errors}>
      <PhoneInput
        {...props}
        id={field.name}
        name={field.name}
        value={field.state.value}
        onValueChange={(value) => field.handleChange(value)}
        onBlur={field.handleBlur}
        aria-invalid={A.isReadonlyArrayNonEmpty(errors) || undefined}
      />
    </FieldShell>
  );
};

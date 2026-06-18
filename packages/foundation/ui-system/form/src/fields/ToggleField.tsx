/**
 * Boolean field bound to the `@beep/ui` `Toggle` primitive.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
"use client";

import { Field, FieldError, FieldLabel } from "@beep/ui/components/field";
import { Toggle } from "@beep/ui/components/toggle";
import * as A from "effect/Array";
import { useFieldContext } from "../core/contexts.ts";
import { toFieldErrors } from "../core/Errors.ts";
import type React from "react";

/**
 * Props for {@link ToggleField}.
 *
 * @category models
 * @since 0.0.0
 */
export interface ToggleFieldProps
  extends Omit<React.ComponentProps<typeof Toggle>, "pressed" | "onPressedChange" | "name" | "id"> {
  readonly label?: React.ReactNode | undefined;
}

/**
 * Schema-bound toggle rendered inline with its label.
 *
 * @example
 * ```tsx
 * import { ToggleField } from "@beep/form/fields/ToggleField"
 *
 * console.log(ToggleField)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
export const ToggleField: React.FC<ToggleFieldProps> = ({ label, children, ...props }) => {
  const field = useFieldContext<boolean>();
  const errors = toFieldErrors(field.state.meta.errors);
  const hasErrors = A.isReadonlyArrayNonEmpty(errors);
  return (
    <Field orientation="horizontal" data-invalid={hasErrors || undefined}>
      <Toggle
        {...props}
        id={field.name}
        name={field.name}
        pressed={field.state.value}
        onPressedChange={(pressed) => field.handleChange(pressed)}
        onBlur={field.handleBlur}
        aria-invalid={hasErrors || undefined}
      >
        {children}
      </Toggle>
      {label !== undefined ? <FieldLabel htmlFor={field.name}>{label}</FieldLabel> : null}
      <FieldError errors={[...errors]} />
    </Field>
  );
};

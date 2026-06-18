/**
 * Boolean field bound to the `@beep/ui` `Checkbox` primitive.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
"use client";

import { Checkbox } from "@beep/ui/components/checkbox";
import { Field, FieldError, FieldLabel } from "@beep/ui/components/field";
import * as A from "effect/Array";
import { useFieldContext } from "../core/contexts.ts";
import { toFieldErrors } from "../core/Errors.ts";
import type React from "react";

/**
 * Props for {@link CheckboxField}.
 *
 * @category models
 * @since 0.0.0
 */
export interface CheckboxFieldProps
  extends Omit<React.ComponentProps<typeof Checkbox>, "checked" | "onCheckedChange" | "name" | "id"> {
  readonly label?: React.ReactNode | undefined;
}

/**
 * Schema-bound checkbox rendered inline with its label.
 *
 * @example
 * ```tsx
 * import { CheckboxField } from "@beep/form/fields/CheckboxField"
 *
 * console.log(CheckboxField)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
export const CheckboxField: React.FC<CheckboxFieldProps> = ({ label, ...props }) => {
  const field = useFieldContext<boolean>();
  const errors = toFieldErrors(field.state.meta.errors);
  const hasErrors = A.isReadonlyArrayNonEmpty(errors);
  return (
    <Field orientation="horizontal" data-invalid={hasErrors || undefined}>
      <Checkbox
        {...props}
        id={field.name}
        name={field.name}
        checked={field.state.value}
        onCheckedChange={(checked) => field.handleChange(checked)}
        aria-invalid={hasErrors || undefined}
      />
      {label !== undefined ? <FieldLabel htmlFor={field.name}>{label}</FieldLabel> : null}
      <FieldError errors={[...errors]} />
    </Field>
  );
};

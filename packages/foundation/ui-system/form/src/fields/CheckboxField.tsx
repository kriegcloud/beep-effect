/**
 * Boolean field bound to the `@beep/ui` `Checkbox` primitive.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
"use client";

import { Checkbox } from "@beep/ui/components/checkbox";
import { InlineBooleanField, useBoundField } from "../internal/FieldBinding.tsx";
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
  const { errors, field, hasErrors } = useBoundField<boolean>();
  return (
    <InlineBooleanField htmlFor={field.name} label={label} errors={errors} hasErrors={hasErrors}>
      <Checkbox
        {...props}
        id={field.name}
        name={field.name}
        checked={field.state.value}
        onCheckedChange={(checked) => field.handleChange(checked)}
        aria-invalid={hasErrors || undefined}
      />
    </InlineBooleanField>
  );
};

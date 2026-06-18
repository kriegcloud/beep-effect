/**
 * Boolean field bound to the `@beep/ui` `Switch` primitive.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
"use client";

import { Field, FieldError, FieldLabel } from "@beep/ui/components/field";
import { Switch } from "@beep/ui/components/switch";
import * as A from "effect/Array";
import { useFieldContext } from "../core/contexts.ts";
import { toFieldErrors } from "../core/Errors.ts";
import type React from "react";

/**
 * Props for {@link SwitchField}.
 *
 * @category models
 * @since 0.0.0
 */
export interface SwitchFieldProps
  extends Omit<React.ComponentProps<typeof Switch>, "checked" | "onCheckedChange" | "name" | "id"> {
  readonly label?: React.ReactNode | undefined;
}

/**
 * Schema-bound switch rendered inline with its label.
 *
 * @example
 * ```tsx
 * import { SwitchField } from "@beep/form/fields/SwitchField"
 *
 * console.log(SwitchField)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
export const SwitchField: React.FC<SwitchFieldProps> = ({ label, ...props }) => {
  const field = useFieldContext<boolean>();
  const errors = toFieldErrors(field.state.meta.errors);
  const hasErrors = A.isReadonlyArrayNonEmpty(errors);
  return (
    <Field orientation="horizontal" data-invalid={hasErrors || undefined}>
      <Switch
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

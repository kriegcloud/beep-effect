/**
 * Multi-line text field bound to the `@beep/ui` `Textarea` primitive.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
"use client";

import { Textarea } from "@beep/ui/components/textarea";
import * as A from "effect/Array";
import { useFieldContext } from "../core/contexts.ts";
import { toFieldErrors } from "../core/Errors.ts";
import { FieldShell } from "../internal/FieldShell.tsx";
import type React from "react";

/**
 * Props for {@link TextareaField}.
 *
 * @category models
 * @since 0.0.0
 */
export interface TextareaFieldProps
  extends Omit<React.ComponentProps<typeof Textarea>, "value" | "onChange" | "onBlur" | "name" | "id"> {
  readonly description?: React.ReactNode | undefined;
  readonly label?: React.ReactNode | undefined;
}

/**
 * Schema-bound multi-line text input.
 *
 * @example
 * ```tsx
 * import { TextareaField } from "@beep/form/fields/TextareaField"
 *
 * console.log(TextareaField)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
export const TextareaField: React.FC<TextareaFieldProps> = ({ label, description, ...props }) => {
  const field = useFieldContext<string>();
  const errors = toFieldErrors(field.state.meta.errors);
  return (
    <FieldShell htmlFor={field.name} label={label} description={description} errors={errors}>
      <Textarea
        {...props}
        id={field.name}
        name={field.name}
        value={field.state.value}
        onChange={(event) => field.handleChange(event.target.value)}
        onBlur={field.handleBlur}
        aria-invalid={A.isReadonlyArrayNonEmpty(errors) || undefined}
      />
    </FieldShell>
  );
};

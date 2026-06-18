/**
 * Text field bound to the `@beep/ui` `Input` primitive.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
"use client";

import { Input } from "@beep/ui/components/input";
import * as A from "effect/Array";
import { useFieldContext } from "../core/contexts.ts";
import { toFieldErrors } from "../core/Errors.ts";
import { FieldShell } from "../internal/FieldShell.tsx";
import type React from "react";

/**
 * Props for {@link TextField}: `Input` props plus label/description; binding
 * props (`value`/`onChange`/`onBlur`/`name`/`id`) are owned by the field.
 *
 * @category models
 * @since 0.0.0
 */
export interface TextFieldProps
  extends Omit<React.ComponentProps<typeof Input>, "value" | "onChange" | "onBlur" | "name" | "id"> {
  readonly description?: React.ReactNode | undefined;
  readonly label?: React.ReactNode | undefined;
}

/**
 * Schema-bound single-line text input.
 *
 * @example
 * ```tsx
 * import { TextField } from "@beep/form/fields/TextField"
 *
 * console.log(TextField)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
export const TextField: React.FC<TextFieldProps> = ({ label, description, ...props }) => {
  const field = useFieldContext<string>();
  const errors = toFieldErrors(field.state.meta.errors);
  return (
    <FieldShell htmlFor={field.name} label={label} description={description} errors={errors}>
      <Input
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

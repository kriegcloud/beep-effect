/**
 * Color field bound to the `@beep/ui` `ColorPicker` primitive.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
"use client";

import { ColorPicker } from "@beep/ui/components/color-picker";
import * as A from "effect/Array";
import { useFieldContext } from "../core/contexts.ts";
import { toFieldErrors } from "../core/Errors.ts";
import { FieldShell } from "../internal/FieldShell.tsx";
import type React from "react";

/**
 * Props for {@link ColorField}: `ColorPicker` props plus label/description;
 * binding props are owned by the field.
 *
 * @category models
 * @since 0.0.0
 */
export interface ColorFieldProps
  extends Omit<
    React.ComponentProps<typeof ColorPicker>,
    "defaultValue" | "id" | "name" | "onBlur" | "onValueChange" | "value"
  > {
  readonly description?: React.ReactNode | undefined;
  readonly label?: React.ReactNode | undefined;
}

/**
 * Schema-bound color picker whose value is a canonical hex color string.
 *
 * @example
 * ```tsx
 * import { ColorField } from "@beep/form/fields/ColorField"
 *
 * console.log(ColorField)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
export const ColorField: React.FC<ColorFieldProps> = ({ label, description, ...props }) => {
  const field = useFieldContext<string>();
  const errors = toFieldErrors(field.state.meta.errors);
  return (
    <FieldShell htmlFor={field.name} label={label} description={description} errors={errors}>
      <ColorPicker
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

/**
 * Rating field bound to the `@beep/ui` `Rating` primitive.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
"use client";

import { Rating } from "@beep/ui/components/rating";
import * as A from "effect/Array";
import { useFieldContext } from "../core/contexts.ts";
import { toFieldErrors } from "../core/Errors.ts";
import { FieldShell } from "../internal/FieldShell.tsx";
import type React from "react";

/**
 * Props for {@link RatingField}: `Rating` props plus label/description; binding
 * props are owned by the field.
 *
 * @category models
 * @since 0.0.0
 */
export interface RatingFieldProps
  extends Omit<React.ComponentProps<typeof Rating>, "name" | "onBlur" | "onValueChange" | "value"> {
  readonly description?: React.ReactNode | undefined;
  readonly label?: React.ReactNode | undefined;
}

/**
 * Schema-bound numeric rating field.
 *
 * @example
 * ```tsx
 * import { RatingField } from "@beep/form/fields/RatingField"
 *
 * console.log(RatingField)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
export const RatingField: React.FC<RatingFieldProps> = ({ label, description, ...props }) => {
  const field = useFieldContext<number>();
  const errors = toFieldErrors(field.state.meta.errors);
  return (
    <FieldShell htmlFor={field.name} label={label} description={description} errors={errors}>
      <Rating
        {...props}
        name={field.name}
        value={field.state.value}
        onValueChange={(value) => field.handleChange(value)}
        onBlur={field.handleBlur}
        aria-invalid={A.isReadonlyArrayNonEmpty(errors) || undefined}
      />
    </FieldShell>
  );
};

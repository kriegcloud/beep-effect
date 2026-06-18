/**
 * Numeric field bound to the `@beep/ui` `Slider` primitive.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
"use client";

import { Slider } from "@beep/ui/components/slider";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import { BoundField } from "../internal/FieldBinding.tsx";
import type React from "react";

/**
 * Props for {@link SliderField}: `Slider` props plus label/description; binding
 * props (`value`/`onValueChange`/`onBlur`/`name`) are owned by the field.
 *
 * @category models
 * @since 0.0.0
 */
export interface SliderFieldProps
  extends Omit<React.ComponentProps<typeof Slider>, "value" | "onValueChange" | "onBlur" | "name"> {
  readonly description?: React.ReactNode | undefined;
  readonly label?: React.ReactNode | undefined;
}

/**
 * Schema-bound slider. The form value stays a single `number`; the base-ui
 * thumb value array is collapsed to its first element on change.
 *
 * @example
 * ```tsx
 * import { SliderField } from "@beep/form/fields/SliderField"
 *
 * console.log(SliderField)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
export const SliderField: React.FC<SliderFieldProps> = ({ label, description, ...props }) => (
  <BoundField<number> label={label} description={description}>
    {({ field, hasErrors }) => (
      <Slider
        {...props}
        name={field.name}
        value={[field.state.value]}
        onValueChange={(value: number | ReadonlyArray<number>) =>
          field.handleChange(P.isNumber(value) ? value : O.getOrElse(A.head(value), () => field.state.value))
        }
        onBlur={field.handleBlur}
        aria-invalid={hasErrors || undefined}
      />
    )}
  </BoundField>
);

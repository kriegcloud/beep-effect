/**
 * Rating field bound to the `@beep/ui` `Rating` primitive.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
"use client";

import { Rating } from "@beep/ui/components/rating";
import { createBoundField } from "../internal/FieldBinding.tsx";
import type React from "react";
import type { BoundFieldState } from "../internal/FieldBinding.tsx";

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
interface RatingControlProps {
  readonly "aria-invalid"?: boolean | undefined;
  readonly name: string;
  readonly onBlur: () => void;
  readonly onValueChange: (value: number) => void;
  readonly value: number;
}

const bindRatingControl = ({ field, hasErrors }: BoundFieldState<number>): RatingControlProps => ({
  name: field.name,
  value: field.state.value,
  onValueChange: (value) => field.handleChange(value),
  onBlur: field.handleBlur,
  "aria-invalid": hasErrors || undefined,
});

export const RatingField: React.FC<RatingFieldProps> = createBoundField<number, RatingFieldProps, RatingControlProps>({
  Control: Rating,
  bindControl: bindRatingControl,
});

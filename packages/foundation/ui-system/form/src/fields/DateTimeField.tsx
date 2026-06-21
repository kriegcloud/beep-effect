/**
 * Date-time field bound to the `@beep/ui` Effect DateTime picker primitive.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
"use client";

// cspell:ignore ampm

import { EffectDateTimePicker } from "@beep/ui/components/effect-date-time-picker";
import { createDateTimePickerField } from "../internal/FieldBinding.tsx";
import type React from "react";

/**
 * Props for {@link DateTimeField}: `EffectDateTimePicker` props plus
 * label/description; binding props are owned by the field.
 *
 * @example
 * ```ts
 * import type { DateTimeFieldProps } from "@beep/form/fields/DateTimeField"
 *
 * const props = {
 *   label: "Starts at",
 *   description: "Date and time in one control.",
 *   ampm: true,
 * } satisfies DateTimeFieldProps
 *
 * console.log(props.ampm) // true
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export interface DateTimeFieldProps
  extends Omit<
    React.ComponentProps<typeof EffectDateTimePicker>,
    "defaultValue" | "label" | "name" | "onBlur" | "onValueChange" | "value"
  > {
  readonly description?: React.ReactNode | undefined;
  readonly label?: React.ReactNode | undefined;
}

/**
 * Schema-bound date-time picker whose canonical value is Effect `DateTime`.
 *
 * @example
 * ```tsx
 * import { DateTimeField } from "@beep/form/fields/DateTimeField"
 *
 * console.log(DateTimeField)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
export const DateTimeField: React.FC<DateTimeFieldProps> =
  createDateTimePickerField<DateTimeFieldProps>(EffectDateTimePicker);

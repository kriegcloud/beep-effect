/**
 * Time field bound to the `@beep/ui` Effect DateTime picker primitive.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
"use client";

import { EffectTimePicker } from "@beep/ui/components/effect-date-time-picker";
import { createDateTimePickerField } from "../internal/FieldBinding.tsx";
import type React from "react";

/**
 * Props for {@link TimeField}: `EffectTimePicker` props plus label/description;
 * binding props are owned by the field.
 *
 * @example
 * ```ts
 * import type { TimeFieldProps } from "@beep/form/fields/TimeField"
 *
 * const props = {
 *   label: "Reminder time",
 *   description: "Stores the selected time as Effect DateTime.",
 *   ampm: true,
 * } satisfies TimeFieldProps
 *
 * console.log(props.label) // "Reminder time"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export interface TimeFieldProps
  extends Omit<
    React.ComponentProps<typeof EffectTimePicker>,
    "defaultValue" | "label" | "name" | "onBlur" | "onValueChange" | "value"
  > {
  readonly description?: React.ReactNode | undefined;
  readonly label?: React.ReactNode | undefined;
}

/**
 * Schema-bound time picker whose canonical value is Effect `DateTime`.
 *
 * @example
 * ```tsx
 * import { TimeField } from "@beep/form/fields/TimeField"
 *
 * console.log(TimeField)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
export const TimeField: React.FC<TimeFieldProps> = createDateTimePickerField<TimeFieldProps>(EffectTimePicker);

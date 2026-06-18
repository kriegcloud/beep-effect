/**
 * Date field bound to the `@beep/ui` Effect DateTime picker primitive.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
"use client";

import { EffectDatePicker } from "@beep/ui/components/effect-date-time-picker";
import { createDateTimePickerField } from "../internal/FieldBinding.tsx";
import type React from "react";

/**
 * Props for {@link DateField}: `EffectDatePicker` props plus
 * label/description; binding props are owned by the field.
 *
 * @example
 * ```ts
 * import type { DateFieldProps } from "@beep/form/fields/DateField"
 *
 * const props = {
 *   label: "Due date",
 *   description: "Date-only calendar selection.",
 *   disablePast: true,
 * } satisfies DateFieldProps
 *
 * console.log(props.disablePast) // true
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export interface DateFieldProps
  extends Omit<
    React.ComponentProps<typeof EffectDatePicker>,
    "defaultValue" | "label" | "name" | "onBlur" | "onValueChange" | "value"
  > {
  readonly description?: React.ReactNode | undefined;
  readonly label?: React.ReactNode | undefined;
}

/**
 * Schema-bound date picker whose canonical value is Effect `DateTime`.
 *
 * @example
 * ```tsx
 * import { DateField } from "@beep/form/fields/DateField"
 *
 * console.log(DateField)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
export const DateField: React.FC<DateFieldProps> = createDateTimePickerField<DateFieldProps>(EffectDatePicker);

/**
 * Date-time field bound to the `@beep/ui` Effect DateTime picker primitive.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
"use client";

import { EffectDateTimePicker } from "@beep/ui/components/effect-date-time-picker";
import * as A from "effect/Array";
import { useFieldContext } from "../core/contexts.ts";
import { toFieldErrors } from "../core/Errors.ts";
import { FieldShell } from "../internal/FieldShell.tsx";
import type * as DateTime from "effect/DateTime";
import type React from "react";

/**
 * Props for {@link DateTimeField}: `EffectDateTimePicker` props plus
 * label/description; binding props are owned by the field.
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
export const DateTimeField: React.FC<DateTimeFieldProps> = ({ label, description, slotProps, ...props }) => {
  const field = useFieldContext<DateTime.DateTime | null>();
  const errors = toFieldErrors(field.state.meta.errors);
  const hasErrors = A.isReadonlyArrayNonEmpty(errors);
  const textFieldProps =
    typeof slotProps?.textField === "object" && slotProps.textField !== null ? slotProps.textField : {};

  return (
    <FieldShell htmlFor={field.name} label={label} description={description} errors={errors}>
      <EffectDateTimePicker
        {...props}
        value={field.state.value}
        onValueChange={(value) => field.handleChange(value)}
        slotProps={{
          ...slotProps,
          textField: {
            ...textFieldProps,
            id: field.name,
            name: field.name,
            onBlur: field.handleBlur,
            error: hasErrors,
            "aria-invalid": hasErrors || undefined,
          },
        }}
      />
    </FieldShell>
  );
};

/**
 * Date field bound to the `@beep/ui` Effect DateTime picker primitive.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
"use client";

import { EffectDatePicker } from "@beep/ui/components/effect-date-time-picker";
import * as A from "effect/Array";
import * as P from "effect/Predicate";
import { useFieldContext } from "../core/contexts.ts";
import { toFieldErrors } from "../core/Errors.ts";
import { FieldShell } from "../internal/FieldShell.tsx";
import type * as DateTime from "effect/DateTime";
import type React from "react";

/**
 * Props for {@link DateField}: `EffectDatePicker` props plus
 * label/description; binding props are owned by the field.
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
export const DateField: React.FC<DateFieldProps> = ({ label, description, slotProps, ...props }) => {
  const field = useFieldContext<DateTime.DateTime | null>();
  const errors = toFieldErrors(field.state.meta.errors);
  const hasErrors = A.isReadonlyArrayNonEmpty(errors);
  const textFieldSlotProps = slotProps?.textField;
  const textFieldProps = P.isObject(textFieldSlotProps) ? textFieldSlotProps : {};

  return (
    <FieldShell htmlFor={field.name} label={label} description={description} errors={errors}>
      <EffectDatePicker
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

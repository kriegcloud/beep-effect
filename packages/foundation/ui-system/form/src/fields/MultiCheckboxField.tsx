/**
 * Multi-select field rendering one `@beep/ui` `Checkbox` per option.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
"use client";

import { Checkbox } from "@beep/ui/components/checkbox";
import { Field, FieldLabel } from "@beep/ui/components/field";
import * as A from "effect/Array";
import { useFieldContext } from "../core/contexts.ts";
import { toFieldErrors } from "../core/Errors.ts";
import { FieldShell } from "../internal/FieldShell.tsx";
import type React from "react";
import type { FieldOption } from "../core/Options.ts";

/**
 * Props for {@link MultiCheckboxField}: label/description/options. The bound
 * value is the array of checked option values.
 *
 * @category models
 * @since 0.0.0
 */
export interface MultiCheckboxFieldProps {
  readonly description?: React.ReactNode | undefined;
  readonly label?: React.ReactNode | undefined;
  readonly options: ReadonlyArray<FieldOption>;
}

/**
 * Schema-bound checkbox list: the value is the array of checked option values.
 *
 * @example
 * ```tsx
 * import { MultiCheckboxField } from "@beep/form/fields/MultiCheckboxField"
 *
 * console.log(MultiCheckboxField)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
export const MultiCheckboxField: React.FC<MultiCheckboxFieldProps> = ({ label, description, options }) => {
  const field = useFieldContext<ReadonlyArray<string>>();
  const errors = toFieldErrors(field.state.meta.errors);
  const hasErrors = A.isReadonlyArrayNonEmpty(errors);
  return (
    <FieldShell htmlFor={field.name} label={label} description={description} errors={errors}>
      {options.map((option) => {
        const checked = A.contains(field.state.value, option.value);
        return (
          <Field key={option.value} orientation="horizontal">
            <Checkbox
              id={`${field.name}-${option.value}`}
              name={field.name}
              checked={checked}
              disabled={option.disabled}
              onCheckedChange={() =>
                field.handleChange(
                  checked
                    ? A.filter(field.state.value, (value) => value !== option.value)
                    : A.append(field.state.value, option.value)
                )
              }
              aria-invalid={hasErrors || undefined}
            />
            <FieldLabel htmlFor={`${field.name}-${option.value}`}>{option.label}</FieldLabel>
          </Field>
        );
      })}
    </FieldShell>
  );
};

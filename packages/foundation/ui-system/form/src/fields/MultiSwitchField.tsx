/**
 * Multi-select field rendering one `@beep/ui` `Switch` per option.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
"use client";

import { Field, FieldLabel } from "@beep/ui/components/field";
import { Switch } from "@beep/ui/components/switch";
import * as A from "effect/Array";
import { useFieldContext } from "../core/contexts.ts";
import { toFieldErrors } from "../core/Errors.ts";
import { FieldShell } from "../internal/FieldShell.tsx";
import type React from "react";
import type { FieldOption } from "../core/Options.ts";

/**
 * Props for {@link MultiSwitchField}: label/description/options. The bound value
 * is the array of switched-on option values.
 *
 * @category models
 * @since 0.0.0
 */
export interface MultiSwitchFieldProps {
  readonly description?: React.ReactNode | undefined;
  readonly label?: React.ReactNode | undefined;
  readonly options: ReadonlyArray<FieldOption>;
}

/**
 * Schema-bound switch list: the value is the array of switched-on option values.
 *
 * @example
 * ```tsx
 * import { MultiSwitchField } from "@beep/form/fields/MultiSwitchField"
 *
 * console.log(MultiSwitchField)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
export const MultiSwitchField: React.FC<MultiSwitchFieldProps> = ({ label, description, options }) => {
  const field = useFieldContext<ReadonlyArray<string>>();
  const errors = toFieldErrors(field.state.meta.errors);
  const hasErrors = A.isReadonlyArrayNonEmpty(errors);
  return (
    <FieldShell htmlFor={field.name} label={label} description={description} errors={errors}>
      {options.map((option) => {
        const checked = A.contains(field.state.value, option.value);
        return (
          <Field key={option.value} orientation="horizontal">
            <Switch
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

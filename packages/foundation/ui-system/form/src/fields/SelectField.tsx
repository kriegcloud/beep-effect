/**
 * Single-select field bound to the `@beep/ui` `Select` primitive.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@beep/ui/components/select";
import * as A from "effect/Array";
import { useFieldContext } from "../core/contexts.ts";
import { toFieldErrors } from "../core/Errors.ts";
import { FieldShell } from "../internal/FieldShell.tsx";
import type React from "react";
import type { FieldOption } from "../core/Options.ts";

/**
 * Props for {@link SelectField}: `Select` props plus label/description/options;
 * binding props (`value`/`onValueChange`/`name`/`id`) are owned by the field.
 *
 * @example
 * ```ts
 * import type { SelectFieldProps } from "@beep/form/fields/SelectField"
 *
 * const props = {
 *   label: "Status",
 *   options: [
 *     { value: "draft", label: "Draft" },
 *     { value: "published", label: "Published" },
 *   ],
 *   placeholder: "Choose status",
 * } satisfies SelectFieldProps
 *
 * console.log(props.placeholder) // "Choose status"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export interface SelectFieldProps
  extends Omit<React.ComponentProps<typeof Select>, "value" | "onValueChange" | "name" | "id"> {
  readonly description?: React.ReactNode | undefined;
  readonly label?: React.ReactNode | undefined;
  readonly options: ReadonlyArray<FieldOption>;
  readonly placeholder?: string | undefined;
}

/**
 * Schema-bound single-select dropdown.
 *
 * @example
 * ```tsx
 * import { SelectField } from "@beep/form/fields/SelectField"
 *
 * console.log(SelectField)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
export const SelectField: React.FC<SelectFieldProps> = ({ label, description, options, placeholder, ...props }) => {
  const field = useFieldContext<string>();
  const errors = toFieldErrors(field.state.meta.errors);
  return (
    <FieldShell htmlFor={field.name} label={label} description={description} errors={errors}>
      <Select
        {...props}
        name={field.name}
        value={field.state.value}
        onValueChange={(value) => field.handleChange(String(value))}
      >
        <SelectTrigger
          id={field.name}
          onBlur={field.handleBlur}
          aria-invalid={A.isReadonlyArrayNonEmpty(errors) || undefined}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FieldShell>
  );
};

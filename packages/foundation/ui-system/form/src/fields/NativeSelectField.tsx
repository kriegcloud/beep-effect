/**
 * Single-select field bound to the `@beep/ui` `NativeSelect` primitive.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
"use client";

import { NativeSelect, NativeSelectOption } from "@beep/ui/components/native-select";
import * as A from "effect/Array";
import { useFieldContext } from "../core/contexts.ts";
import { toFieldErrors } from "../core/Errors.ts";
import { FieldShell } from "../internal/FieldShell.tsx";
import type React from "react";
import type { FieldOption } from "../core/Options.ts";

/**
 * Props for {@link NativeSelectField}: `NativeSelect` props plus
 * label/description/options; binding props (`value`/`onChange`/`onBlur`/`name`/
 * `id`) are owned by the field.
 *
 * @category models
 * @since 0.0.0
 */
export interface NativeSelectFieldProps
  extends Omit<React.ComponentProps<typeof NativeSelect>, "value" | "onChange" | "onBlur" | "name" | "id"> {
  readonly description?: React.ReactNode | undefined;
  readonly label?: React.ReactNode | undefined;
  readonly options: ReadonlyArray<FieldOption>;
}

/**
 * Schema-bound native `<select>` dropdown.
 *
 * @example
 * ```tsx
 * import { NativeSelectField } from "@beep/form/fields/NativeSelectField"
 *
 * console.log(NativeSelectField)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
export const NativeSelectField: React.FC<NativeSelectFieldProps> = ({ label, description, options, ...props }) => {
  const field = useFieldContext<string>();
  const errors = toFieldErrors(field.state.meta.errors);
  return (
    <FieldShell htmlFor={field.name} label={label} description={description} errors={errors}>
      <NativeSelect
        {...props}
        id={field.name}
        name={field.name}
        value={field.state.value}
        onChange={(event) => field.handleChange(event.target.value)}
        onBlur={field.handleBlur}
        aria-invalid={A.isReadonlyArrayNonEmpty(errors) || undefined}
      >
        {options.map((option) => (
          <NativeSelectOption key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </NativeSelectOption>
        ))}
      </NativeSelect>
    </FieldShell>
  );
};

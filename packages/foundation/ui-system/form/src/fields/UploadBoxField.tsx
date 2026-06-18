/**
 * Upload box field bound to the `@beep/ui` `UploadBox` primitive.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
"use client";

import { UploadBox } from "@beep/ui/components/upload";
import * as A from "effect/Array";
import { useFieldContext } from "../core/contexts.ts";
import { toFieldErrors } from "../core/Errors.ts";
import { FieldShell } from "../internal/FieldShell.tsx";
import type React from "react";

/**
 * Props for {@link UploadBoxField}: `UploadBox` props plus label/description;
 * binding props are owned by the field.
 *
 * @category models
 * @since 0.0.0
 */
export interface UploadBoxFieldProps
  extends Omit<
    React.ComponentProps<typeof UploadBox>,
    "inputId" | "inputName" | "onInputBlur" | "onValueChange" | "value"
  > {
  readonly description?: React.ReactNode | undefined;
  readonly label?: React.ReactNode | undefined;
}

/**
 * Schema-bound upload box field whose value is an array of `File` objects.
 *
 * @example
 * ```tsx
 * import { UploadBoxField } from "@beep/form/fields/UploadBoxField"
 *
 * console.log(UploadBoxField)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
export const UploadBoxField: React.FC<UploadBoxFieldProps> = ({ label, description, ...props }) => {
  const field = useFieldContext<ReadonlyArray<File>>();
  const errors = toFieldErrors(field.state.meta.errors);
  return (
    <FieldShell htmlFor={field.name} label={label} description={description} errors={errors}>
      <UploadBox
        {...props}
        inputId={field.name}
        inputName={field.name}
        value={field.state.value}
        onValueChange={(value) => field.handleChange(value)}
        onInputBlur={field.handleBlur}
        aria-invalid={A.isReadonlyArrayNonEmpty(errors) || undefined}
      />
    </FieldShell>
  );
};

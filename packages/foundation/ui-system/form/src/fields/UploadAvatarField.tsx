/**
 * Upload avatar field bound to the `@beep/ui` `UploadAvatar` primitive.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
"use client";

import { UploadAvatar } from "@beep/ui/components/upload";
import * as A from "effect/Array";
import { useFieldContext } from "../core/contexts.ts";
import { toFieldErrors } from "../core/Errors.ts";
import { FieldShell } from "../internal/FieldShell.tsx";
import type React from "react";

/**
 * Props for {@link UploadAvatarField}: `UploadAvatar` props plus
 * label/description; binding props are owned by the field.
 *
 * @category models
 * @since 0.0.0
 */
export interface UploadAvatarFieldProps
  extends Omit<
    React.ComponentProps<typeof UploadAvatar>,
    "inputId" | "inputName" | "onInputBlur" | "onValueChange" | "value"
  > {
  readonly description?: React.ReactNode | undefined;
  readonly label?: React.ReactNode | undefined;
}

/**
 * Schema-bound single avatar upload field whose value is an array of `File`
 * objects with at most one entry.
 *
 * @example
 * ```tsx
 * import { UploadAvatarField } from "@beep/form/fields/UploadAvatarField"
 *
 * console.log(UploadAvatarField)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
export const UploadAvatarField: React.FC<UploadAvatarFieldProps> = ({ label, description, ...props }) => {
  const field = useFieldContext<ReadonlyArray<File>>();
  const errors = toFieldErrors(field.state.meta.errors);
  return (
    <FieldShell htmlFor={field.name} label={label} description={description} errors={errors}>
      <UploadAvatar
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

/**
 * Upload avatar field bound to the `@beep/ui` `UploadAvatar` primitive.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
"use client";

import { UploadAvatar } from "@beep/ui/components/upload";
import { bindUploadControl, createBoundField } from "../internal/FieldBinding.tsx";
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
export const UploadAvatarField: React.FC<UploadAvatarFieldProps> = createBoundField<
  ReadonlyArray<File>,
  UploadAvatarFieldProps,
  ReturnType<typeof bindUploadControl>
>({ Control: UploadAvatar, bindControl: bindUploadControl });

/**
 * Upload field bound to the `@beep/ui` `Upload` primitive.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
"use client";

import { Upload } from "@beep/ui/components/upload";
import { bindUploadControl, createBoundField } from "../internal/FieldBinding.tsx";
import type React from "react";

/**
 * Props for {@link UploadField}: `Upload` props plus label/description; binding
 * props are owned by the field.
 *
 * @category models
 * @since 0.0.0
 */
export interface UploadFieldProps
  extends Omit<
    React.ComponentProps<typeof Upload>,
    "inputId" | "inputName" | "onInputBlur" | "onValueChange" | "value"
  > {
  readonly description?: React.ReactNode | undefined;
  readonly label?: React.ReactNode | undefined;
}

/**
 * Schema-bound upload field whose value is an array of `File` objects.
 *
 * @example
 * ```tsx
 * import { UploadField } from "@beep/form/fields/UploadField"
 *
 * console.log(UploadField)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
export const UploadField: React.FC<UploadFieldProps> = createBoundField<
  ReadonlyArray<File>,
  UploadFieldProps,
  ReturnType<typeof bindUploadControl>
>({ Control: Upload, bindControl: bindUploadControl });

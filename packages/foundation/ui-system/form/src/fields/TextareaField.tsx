/**
 * Multi-line text field bound to the `@beep/ui` `Textarea` primitive.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
"use client";

import { Textarea } from "@beep/ui/components/textarea";
import { bindStringChangeControl, createBoundField } from "../internal/FieldBinding.tsx";
import type React from "react";

/**
 * Props for {@link TextareaField}.
 *
 * @category models
 * @since 0.0.0
 */
export interface TextareaFieldProps
  extends Omit<React.ComponentProps<typeof Textarea>, "value" | "onChange" | "onBlur" | "name" | "id"> {
  readonly description?: React.ReactNode | undefined;
  readonly label?: React.ReactNode | undefined;
}

/**
 * Schema-bound multi-line text input.
 *
 * @example
 * ```tsx
 * import { TextareaField } from "@beep/form/fields/TextareaField"
 *
 * console.log(TextareaField)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
export const TextareaField: React.FC<TextareaFieldProps> = createBoundField<
  string,
  TextareaFieldProps,
  ReturnType<typeof bindStringChangeControl>
>({ Control: Textarea, bindControl: bindStringChangeControl });

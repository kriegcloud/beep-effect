/**
 * Text field bound to the `@beep/ui` `Input` primitive.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
"use client";

import { Input } from "@beep/ui/components/input";
import { bindStringChangeControl, createBoundField } from "../internal/FieldBinding.tsx";
import type React from "react";

/**
 * Props for {@link TextField}: `Input` props plus label/description; binding
 * props (`value`/`onChange`/`onBlur`/`name`/`id`) are owned by the field.
 *
 * @category models
 * @since 0.0.0
 */
export interface TextFieldProps
  extends Omit<React.ComponentProps<typeof Input>, "value" | "onChange" | "onBlur" | "name" | "id"> {
  readonly description?: React.ReactNode | undefined;
  readonly label?: React.ReactNode | undefined;
}

/**
 * Schema-bound single-line text input.
 *
 * @example
 * ```tsx
 * import { TextField } from "@beep/form/fields/TextField"
 *
 * console.log(TextField)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
export const TextField: React.FC<TextFieldProps> = createBoundField<
  string,
  TextFieldProps,
  ReturnType<typeof bindStringChangeControl>
>({ Control: Input, bindControl: bindStringChangeControl });

/**
 * Emoji field bound to the `@beep/ui` `EmojiPicker` primitive.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
"use client";

import { EmojiPicker } from "@beep/ui/components/emoji-picker";
import * as A from "effect/Array";
import { useFieldContext } from "../core/contexts.ts";
import { toFieldErrors } from "../core/Errors.ts";
import { FieldShell } from "../internal/FieldShell.tsx";
import type React from "react";

/**
 * Props for {@link EmojiField}: `EmojiPicker` props plus label/description;
 * binding props are owned by the field.
 *
 * @category models
 * @since 0.0.0
 */
export interface EmojiFieldProps extends Omit<React.ComponentProps<typeof EmojiPicker>, "onValueChange" | "value"> {
  readonly description?: React.ReactNode | undefined;
  readonly label?: React.ReactNode | undefined;
}

/**
 * Schema-bound emoji picker whose value is the selected emoji string.
 *
 * @example
 * ```tsx
 * import { EmojiField } from "@beep/form/fields/EmojiField"
 *
 * console.log(EmojiField)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
export const EmojiField: React.FC<EmojiFieldProps> = ({ label, description, ...props }) => {
  const field = useFieldContext<string>();
  const errors = toFieldErrors(field.state.meta.errors);
  return (
    <FieldShell htmlFor={field.name} label={label} description={description} errors={errors}>
      <EmojiPicker
        {...props}
        value={field.state.value}
        onValueChange={(value) => field.handleChange(value)}
        aria-invalid={A.isReadonlyArrayNonEmpty(errors) || undefined}
      />
    </FieldShell>
  );
};

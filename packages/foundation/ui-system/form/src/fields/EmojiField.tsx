/**
 * Emoji field bound to the `@beep/ui` `EmojiPicker` primitive.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
"use client";

import { EmojiPicker } from "@beep/ui/components/emoji-picker";
import { createBoundField } from "../internal/FieldBinding.tsx";
import type React from "react";
import type { BoundFieldState } from "../internal/FieldBinding.tsx";

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
interface EmojiControlProps {
  readonly "aria-invalid"?: boolean | undefined;
  readonly onValueChange: (value: string) => void;
  readonly value: string;
}

const bindEmojiControl = ({ field, hasErrors }: BoundFieldState<string>): EmojiControlProps => ({
  value: field.state.value,
  onValueChange: (value) => field.handleChange(value),
  "aria-invalid": hasErrors || undefined,
});

export const EmojiField: React.FC<EmojiFieldProps> = createBoundField<string, EmojiFieldProps, EmojiControlProps>({
  Control: EmojiPicker,
  bindControl: bindEmojiControl,
});

/**
 * Color field bound to the `@beep/ui` `ColorPicker` primitive.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
"use client";

import { ColorPicker } from "@beep/ui/components/color-picker";
import { bindNamedValueControl, createBoundField } from "../internal/FieldBinding.tsx";
import type React from "react";

/**
 * Props for {@link ColorField}: `ColorPicker` props plus label/description;
 * binding props are owned by the field.
 *
 * @category models
 * @since 0.0.0
 */
export interface ColorFieldProps
  extends Omit<
    React.ComponentProps<typeof ColorPicker>,
    "defaultValue" | "id" | "name" | "onBlur" | "onValueChange" | "value"
  > {
  readonly description?: React.ReactNode | undefined;
  readonly label?: React.ReactNode | undefined;
}

type ColorControlProps = {
  readonly "aria-invalid"?: boolean | undefined;
  readonly id: string;
  readonly name: string;
  readonly onBlur: () => void;
  readonly onValueChange: (value: string) => void;
  readonly value: string;
};

/**
 * Schema-bound color picker whose value is a canonical hex color string.
 *
 * @example
 * ```tsx
 * import { ColorField } from "@beep/form/fields/ColorField"
 *
 * console.log(ColorField)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
export const ColorField: React.FC<ColorFieldProps> = createBoundField<string, ColorFieldProps, ColorControlProps>({
  Control: ColorPicker,
  bindControl: bindNamedValueControl,
});

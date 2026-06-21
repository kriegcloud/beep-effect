/**
 * Phone field bound to the `@beep/ui` `PhoneInput` primitive.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
"use client";

import { PhoneInput } from "@beep/ui/components/phone-input";
import { bindNamedValueControl, createBoundField } from "../internal/FieldBinding.tsx";
import type React from "react";

/**
 * Props for {@link PhoneField}: `PhoneInput` props plus label/description;
 * binding props are owned by the field.
 *
 * @example
 * ```ts
 * import type { PhoneFieldProps } from "@beep/form/fields/PhoneField"
 *
 * const props = {
 *   label: "Mobile phone",
 *   description: "Stores an E.164 phone number string.",
 * } satisfies PhoneFieldProps
 *
 * console.log(props.label) // "Mobile phone"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export interface PhoneFieldProps
  extends Omit<
    React.ComponentProps<typeof PhoneInput>,
    "defaultValue" | "id" | "name" | "onBlur" | "onValueChange" | "value"
  > {
  readonly description?: React.ReactNode | undefined;
  readonly label?: React.ReactNode | undefined;
}

type PhoneControlProps = {
  readonly "aria-invalid"?: boolean | undefined;
  readonly id: string;
  readonly name: string;
  readonly onBlur: () => void;
  readonly onValueChange: (value: string) => void;
  readonly value: string;
};

/**
 * Schema-bound phone input whose canonical value is an E.164 string.
 *
 * @example
 * ```tsx
 * import { PhoneField } from "@beep/form/fields/PhoneField"
 *
 * console.log(PhoneField)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
export const PhoneField: React.FC<PhoneFieldProps> = createBoundField<string, PhoneFieldProps, PhoneControlProps>({
  Control: PhoneInput,
  bindControl: bindNamedValueControl,
});

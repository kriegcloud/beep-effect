/**
 * Multi-select field rendering one `@beep/ui` `Checkbox` per option.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
"use client";

import { Checkbox } from "@beep/ui/components/checkbox";
import { MultiBooleanOptionField } from "../internal/FieldBinding.tsx";
import type React from "react";
import type { FieldOption } from "../core/Options.ts";

/**
 * Props for {@link MultiCheckboxField}: label/description/options. The bound
 * value is the array of checked option values.
 *
 * @example
 * ```ts
 * import type { MultiCheckboxFieldProps } from "@beep/form/fields/MultiCheckboxField"
 *
 * const props = {
 *   label: "Channels",
 *   options: [
 *     { value: "email", label: "Email" },
 *     { value: "sms", label: "SMS", disabled: true },
 *   ],
 * } satisfies MultiCheckboxFieldProps
 *
 * console.log(props.options[1]?.disabled) // true
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export interface MultiCheckboxFieldProps {
  readonly description?: React.ReactNode | undefined;
  readonly label?: React.ReactNode | undefined;
  readonly options: ReadonlyArray<FieldOption>;
}

/**
 * Schema-bound checkbox list: the value is the array of checked option values.
 *
 * @example
 * ```tsx
 * import { MultiCheckboxField } from "@beep/form/fields/MultiCheckboxField"
 *
 * console.log(MultiCheckboxField)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
export const MultiCheckboxField: React.FC<MultiCheckboxFieldProps> = (props) => (
  <MultiBooleanOptionField {...props} Control={Checkbox} />
);

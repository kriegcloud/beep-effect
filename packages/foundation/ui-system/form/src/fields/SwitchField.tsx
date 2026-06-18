/**
 * Boolean field bound to the `@beep/ui` `Switch` primitive.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
"use client";

import { Switch } from "@beep/ui/components/switch";
import { InlineBooleanField, useBoundField } from "../internal/FieldBinding.tsx";
import type React from "react";

/**
 * Props for {@link SwitchField}.
 *
 * @example
 * ```ts
 * import type { SwitchFieldProps } from "@beep/form/fields/SwitchField"
 *
 * const props = {
 *   label: "Enabled",
 *   disabled: false,
 * } satisfies SwitchFieldProps
 *
 * console.log(props.label) // "Enabled"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export interface SwitchFieldProps
  extends Omit<React.ComponentProps<typeof Switch>, "checked" | "onCheckedChange" | "name" | "id"> {
  readonly label?: React.ReactNode | undefined;
}

/**
 * Schema-bound switch rendered inline with its label.
 *
 * @example
 * ```tsx
 * import { SwitchField } from "@beep/form/fields/SwitchField"
 *
 * console.log(SwitchField)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
export const SwitchField: React.FC<SwitchFieldProps> = ({ label, ...props }) => {
  const { errors, field, hasErrors } = useBoundField<boolean>();
  return (
    <InlineBooleanField htmlFor={field.name} label={label} errors={errors} hasErrors={hasErrors}>
      <Switch
        {...props}
        id={field.name}
        name={field.name}
        checked={field.state.value}
        onCheckedChange={(checked) => field.handleChange(checked)}
        aria-invalid={hasErrors || undefined}
      />
    </InlineBooleanField>
  );
};

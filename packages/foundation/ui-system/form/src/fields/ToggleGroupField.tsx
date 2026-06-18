/**
 * Single-select field bound to the `@beep/ui` `ToggleGroup` primitive.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
"use client";

import { ToggleGroup, ToggleGroupItem } from "@beep/ui/components/toggle-group";
import * as A from "effect/Array";
import * as O from "effect/Option";
import { BoundField } from "../internal/FieldBinding.tsx";
import type React from "react";
import type { FieldOption } from "../core/Options.ts";

/**
 * Props for {@link ToggleGroupField}: `ToggleGroup` props plus
 * label/description/options; binding props (`value`/`onValueChange`) are owned
 * by the field.
 *
 * @example
 * ```ts
 * import type { ToggleGroupFieldProps } from "@beep/form/fields/ToggleGroupField"
 *
 * const props = {
 *   label: "Text alignment",
 *   options: [
 *     { value: "left", label: "Left" },
 *     { value: "center", label: "Center" },
 *   ],
 * } satisfies ToggleGroupFieldProps
 *
 * console.log(props.options[0]?.value) // "left"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export interface ToggleGroupFieldProps
  extends Omit<React.ComponentProps<typeof ToggleGroup>, "value" | "onValueChange"> {
  readonly description?: React.ReactNode | undefined;
  readonly label?: React.ReactNode | undefined;
  readonly options: ReadonlyArray<FieldOption>;
}

/**
 * Schema-bound single-select toggle group. The form value stays a single
 * `string`; the base-ui group value array is collapsed to its first element.
 *
 * @example
 * ```tsx
 * import { ToggleGroupField } from "@beep/form/fields/ToggleGroupField"
 *
 * console.log(ToggleGroupField)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
export const ToggleGroupField: React.FC<ToggleGroupFieldProps> = ({ label, description, options, ...props }) => (
  <BoundField<string> label={label} description={description}>
    {({ field, hasErrors }) => (
      <>
        <input type="hidden" name={field.name} value={field.state.value} />
        <ToggleGroup
          {...props}
          value={[field.state.value]}
          onValueChange={(value) => field.handleChange(O.getOrElse(A.head(value), () => ""))}
          onBlur={field.handleBlur}
          aria-invalid={hasErrors || undefined}
        >
          {options.map((option) => (
            <ToggleGroupItem key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </>
    )}
  </BoundField>
);

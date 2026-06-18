/**
 * Multiple-selection field with chips bound to the `@beep/ui` `Combobox`
 * primitive.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
"use client";

import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxValue,
  useComboboxAnchor,
} from "@beep/ui/components/combobox";
import * as A from "effect/Array";
import { ComboboxOptionsContent, optionValues } from "../internal/ComboboxFieldParts.tsx";
import { BoundField } from "../internal/FieldBinding.tsx";
import type React from "react";
import type { FieldOption } from "../core/Options.ts";

/**
 * Props for {@link MultiSelectField}: `Combobox` props plus
 * label/description/options/placeholder; binding props
 * (`items`/`value`/`onValueChange`/`name`/`multiple`) are owned by the field.
 *
 * @category models
 * @since 0.0.0
 */
export interface MultiSelectFieldProps
  extends Omit<
    React.ComponentProps<typeof Combobox>,
    "items" | "value" | "defaultValue" | "onValueChange" | "name" | "multiple"
  > {
  readonly description?: React.ReactNode | undefined;
  readonly label?: React.ReactNode | undefined;
  readonly options: ReadonlyArray<FieldOption>;
  readonly placeholder?: string | undefined;
}

/**
 * Schema-bound multi-select combobox: the value is the array of selected option
 * values, rendered as removable chips.
 *
 * @example
 * ```tsx
 * import { MultiSelectField } from "@beep/form/fields/MultiSelectField"
 *
 * console.log(MultiSelectField)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
export const MultiSelectField: React.FC<MultiSelectFieldProps> = ({
  label,
  description,
  options,
  placeholder,
  ...props
}) => {
  const anchor = useComboboxAnchor();
  return (
    <BoundField<ReadonlyArray<string>> label={label} description={description}>
      {({ field, hasErrors }) => (
        <Combobox
          {...props}
          multiple
          items={optionValues(options)}
          name={field.name}
          value={[...field.state.value]}
          onValueChange={(value) => field.handleChange(A.map(value, String))}
        >
          <ComboboxChips ref={anchor}>
            <ComboboxValue>
              {(value: ReadonlyArray<string>) =>
                A.map(value, (selected) => (
                  <ComboboxChip key={selected} aria-label={selected}>
                    {selected}
                  </ComboboxChip>
                ))
              }
            </ComboboxValue>
            <ComboboxChipsInput
              id={field.name}
              placeholder={placeholder}
              onBlur={field.handleBlur}
              aria-invalid={hasErrors || undefined}
            />
          </ComboboxChips>
          <ComboboxOptionsContent anchor={anchor} emptyLabel="No results found." options={options} />
        </Combobox>
      )}
    </BoundField>
  );
};

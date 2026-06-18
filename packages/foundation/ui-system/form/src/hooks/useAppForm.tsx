/**
 * The centralized `@beep/form` form hook.
 *
 * One {@link createFormHook} call registers every bound field component and the
 * form-level components, producing {@link useAppForm}, {@link withForm}, and
 * {@link withFieldGroup}. Apps call {@link useAppForm}; they never call
 * `createFormHook` themselves.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
"use client";

import { createFormHook } from "@tanstack/react-form";
import { SubmitButton } from "../components/SubmitButton.tsx";
import { fieldContext, formContext } from "../core/contexts.ts";
import { AutocompleteField } from "../fields/AutocompleteField.tsx";
import { CheckboxField } from "../fields/CheckboxField.tsx";
import { ComboboxField } from "../fields/ComboboxField.tsx";
import { MultiCheckboxField } from "../fields/MultiCheckboxField.tsx";
import { MultiSelectField } from "../fields/MultiSelectField.tsx";
import { MultiSwitchField } from "../fields/MultiSwitchField.tsx";
import { NativeSelectField } from "../fields/NativeSelectField.tsx";
import { NumberField } from "../fields/NumberField.tsx";
import { OTPField } from "../fields/OTPField.tsx";
import { RadioGroupField } from "../fields/RadioGroupField.tsx";
import { SelectField } from "../fields/SelectField.tsx";
import { SliderField } from "../fields/SliderField.tsx";
import { SwitchField } from "../fields/SwitchField.tsx";
import { TextareaField } from "../fields/TextareaField.tsx";
import { TextField } from "../fields/TextField.tsx";
import { ToggleField } from "../fields/ToggleField.tsx";
import { ToggleGroupField } from "../fields/ToggleGroupField.tsx";

const formHook = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    Text: TextField,
    Number: NumberField,
    Textarea: TextareaField,
    Checkbox: CheckboxField,
    Switch: SwitchField,
    Select: SelectField,
    NativeSelect: NativeSelectField,
    Combobox: ComboboxField,
    Autocomplete: AutocompleteField,
    MultiSelect: MultiSelectField,
    RadioGroup: RadioGroupField,
    Slider: SliderField,
    Toggle: ToggleField,
    ToggleGroup: ToggleGroupField,
    OTP: OTPField,
    MultiCheckbox: MultiCheckboxField,
    MultiSwitch: MultiSwitchField,
  },
  formComponents: {
    Submit: SubmitButton,
  },
});

/**
 * Creates a typed form instance with every `@beep/form` field/form component
 * pre-registered. Pair with the schema-first builders in
 * `@beep/form/core/FormOptions`.
 *
 * @example
 * ```tsx
 * import { useAppForm } from "@beep/form/hooks/useAppForm"
 *
 * console.log(useAppForm)
 * ```
 *
 * @category hooks
 * @since 0.0.0
 */
export const useAppForm = formHook.useAppForm;

/**
 * Builds a reusable sub-form component over a shared form instance.
 *
 * @example
 * ```tsx
 * import { withForm } from "@beep/form/hooks/useAppForm"
 *
 * console.log(withForm)
 * ```
 *
 * @category hooks
 * @since 0.0.0
 */
export const withForm = formHook.withForm;

/**
 * Builds a reusable, remappable field-group component (address, password +
 * confirm, amount + currency, …).
 *
 * @example
 * ```tsx
 * import { withFieldGroup } from "@beep/form/hooks/useAppForm"
 *
 * console.log(withFieldGroup)
 * ```
 *
 * @category hooks
 * @since 0.0.0
 */
export const withFieldGroup = formHook.withFieldGroup;

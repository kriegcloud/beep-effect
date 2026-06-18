/**
 * Internal helpers for binding TanStack field state to `@beep/ui` controls.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
"use client";

import { Field, FieldError, FieldLabel } from "@beep/ui/components/field";
import * as A from "effect/Array";
import * as P from "effect/Predicate";
import { useFieldContext } from "../core/contexts.ts";
import { toFieldErrors } from "../core/Errors.ts";
import { FieldShell } from "./FieldShell.tsx";
import type * as DateTime from "effect/DateTime";
import type React from "react";
import type { FieldErrorEntry } from "../core/Errors.ts";
import type { FieldOption } from "../core/Options.ts";

type FieldChromeProps = {
  readonly description?: React.ReactNode | undefined;
  readonly label?: React.ReactNode | undefined;
};

export const useBoundField = <TValue,>() => {
  const field = useFieldContext<TValue>();
  const errors = toFieldErrors(field.state.meta.errors);
  const hasErrors = A.isReadonlyArrayNonEmpty(errors);

  return { errors, field, hasErrors };
};

export type BoundFieldState<TValue> = ReturnType<typeof useBoundField<TValue>>;

type BoundFieldProps<TValue> = FieldChromeProps & {
  readonly children: (binding: BoundFieldState<TValue>) => React.ReactNode;
};

export function BoundField<TValue>({ children, description, label }: BoundFieldProps<TValue>): React.ReactElement {
  const binding = useBoundField<TValue>();

  return (
    <FieldShell htmlFor={binding.field.name} label={label} description={description} errors={binding.errors}>
      {children(binding)}
    </FieldShell>
  );
}

export type FieldControlBinder<TValue, TBoundProps extends object> = (binding: BoundFieldState<TValue>) => TBoundProps;

type CreateBoundFieldOptions<TValue, TProps extends FieldChromeProps, TBoundProps extends object> = {
  readonly bindControl: FieldControlBinder<TValue, TBoundProps>;
  readonly Control: React.ComponentType<Omit<TProps, keyof FieldChromeProps> & TBoundProps>;
};

export function createBoundField<TValue, TProps extends FieldChromeProps, TBoundProps extends object>({
  bindControl,
  Control,
}: CreateBoundFieldOptions<TValue, TProps, TBoundProps>): React.FC<TProps> {
  const BoundControlField: React.FC<TProps> = ({ description, label, ...props }) => (
    <BoundField<TValue> label={label} description={description}>
      {(binding) => <Control {...(props as Omit<TProps, keyof FieldChromeProps>)} {...bindControl(binding)} />}
    </BoundField>
  );

  return BoundControlField;
}

type NamedValueControlProps<TValue> = {
  readonly "aria-invalid"?: boolean | undefined;
  readonly id: string;
  readonly name: string;
  readonly onBlur: () => void;
  readonly onValueChange: (value: TValue) => void;
  readonly value: TValue;
};

export const bindNamedValueControl = <TValue,>({
  field,
  hasErrors,
}: BoundFieldState<TValue>): NamedValueControlProps<TValue> => ({
  id: field.name,
  name: field.name,
  value: field.state.value,
  onValueChange: (value) => field.handleChange(value),
  onBlur: field.handleBlur,
  "aria-invalid": hasErrors || undefined,
});

type NamedChangeControlProps<TValue> = {
  readonly "aria-invalid"?: boolean | undefined;
  readonly id: string;
  readonly name: string;
  readonly onBlur: () => void;
  readonly onChange: React.ChangeEventHandler<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>;
  readonly value: TValue;
};

export const bindStringChangeControl = ({
  field,
  hasErrors,
}: BoundFieldState<string>): NamedChangeControlProps<string> => ({
  id: field.name,
  name: field.name,
  value: field.state.value,
  onChange: (event) => field.handleChange(event.target.value),
  onBlur: field.handleBlur,
  "aria-invalid": hasErrors || undefined,
});

type UploadControlProps = {
  readonly "aria-invalid"?: boolean | undefined;
  readonly inputId: string;
  readonly inputName: string;
  readonly onInputBlur: () => void;
  readonly onValueChange: (value: ReadonlyArray<File>) => void;
  readonly value: ReadonlyArray<File>;
};

export const bindUploadControl = ({ field, hasErrors }: BoundFieldState<ReadonlyArray<File>>): UploadControlProps => ({
  inputId: field.name,
  inputName: field.name,
  value: field.state.value,
  onValueChange: (value) => field.handleChange(value),
  onInputBlur: field.handleBlur,
  "aria-invalid": hasErrors || undefined,
});

type PickerSlotProps = {
  readonly textField?: unknown;
};

type DateTimePickerControlProps = {
  readonly onValueChange: (value: DateTime.DateTime | null) => void;
  readonly slotProps: PickerSlotProps;
  readonly value: DateTime.DateTime | null;
};

type DateTimePickerFieldProps = FieldChromeProps & {
  readonly slotProps?: PickerSlotProps | undefined;
};

const pickerTextFieldProps = (
  slotProps: PickerSlotProps | undefined,
  binding: BoundFieldState<DateTime.DateTime | null>
): PickerSlotProps => {
  const textFieldProps = P.isObject(slotProps?.textField) ? slotProps.textField : {};

  return {
    ...slotProps,
    textField: {
      ...textFieldProps,
      id: binding.field.name,
      name: binding.field.name,
      onBlur: binding.field.handleBlur,
      error: binding.hasErrors,
      "aria-invalid": binding.hasErrors || undefined,
    },
  };
};

export function createDateTimePickerField<TProps extends DateTimePickerFieldProps>(
  Control: React.ComponentType<Omit<TProps, keyof FieldChromeProps> & DateTimePickerControlProps>
): React.FC<TProps> {
  const BoundDateTimePickerField: React.FC<TProps> = ({ description, label, slotProps, ...props }) => (
    <BoundField<DateTime.DateTime | null> label={label} description={description}>
      {(binding) => (
        <Control
          {...(props as Omit<TProps, keyof FieldChromeProps>)}
          value={binding.field.state.value}
          onValueChange={(value) => binding.field.handleChange(value)}
          slotProps={pickerTextFieldProps(slotProps, binding)}
        />
      )}
    </BoundField>
  );

  return BoundDateTimePickerField;
}

type InlineBooleanFieldProps = FieldChromeProps & {
  readonly children: React.ReactNode;
  readonly errors: ReadonlyArray<FieldErrorEntry>;
  readonly hasErrors: boolean;
  readonly htmlFor: string;
};

export const InlineBooleanField: React.FC<InlineBooleanFieldProps> = ({
  children,
  errors,
  hasErrors,
  htmlFor,
  label,
}) => (
  <Field orientation="horizontal" data-invalid={hasErrors || undefined}>
    {children}
    {label !== undefined ? <FieldLabel htmlFor={htmlFor}>{label}</FieldLabel> : null}
    <FieldError errors={[...errors]} />
  </Field>
);

const updateSelectedValues = (
  value: ReadonlyArray<string>,
  optionValue: string,
  checked: boolean
): ReadonlyArray<string> =>
  checked ? A.filter(value, (selected) => selected !== optionValue) : A.append(value, optionValue);

type BooleanOptionControlProps = {
  readonly "aria-invalid"?: boolean | undefined;
  readonly checked: boolean;
  readonly disabled?: boolean | undefined;
  readonly id: string;
  readonly name: string;
  readonly onCheckedChange: (checked: boolean) => void;
};

type MultiBooleanOptionFieldProps = FieldChromeProps & {
  readonly Control: React.ComponentType<BooleanOptionControlProps>;
  readonly options: ReadonlyArray<FieldOption>;
};

export const MultiBooleanOptionField: React.FC<MultiBooleanOptionFieldProps> = ({
  Control,
  description,
  label,
  options,
}) => (
  <BoundField<ReadonlyArray<string>> label={label} description={description}>
    {({ field, hasErrors }) =>
      options.map((option) => {
        const checked = A.contains(field.state.value, option.value);
        const id = `${field.name}-${option.value}`;

        return (
          <Field key={option.value} orientation="horizontal">
            <Control
              id={id}
              name={field.name}
              checked={checked}
              disabled={option.disabled}
              onCheckedChange={() => field.handleChange(updateSelectedValues(field.state.value, option.value, checked))}
              aria-invalid={hasErrors || undefined}
            />
            <FieldLabel htmlFor={id}>{option.label}</FieldLabel>
          </Field>
        );
      })
    }
  </BoundField>
);

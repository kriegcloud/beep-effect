---
title: FormAtoms.ts
nav_order: 4
parent: "@beep/form"
---

## FormAtoms.ts overview

Atom graph construction for schema-backed forms.

Since v0.0.0

---
## Exports Grouped by Category
- [atoms](#atoms)
  - [FieldAtoms (interface)](#fieldatoms-interface)
  - [FormAtoms (interface)](#formatoms-interface)
  - [PublicFieldAtoms (interface)](#publicfieldatoms-interface)
- [constructors](#constructors)
  - [make](#make)
- [models](#models)
  - [FormAtomsConfig (interface)](#formatomsconfig-interface)
- [type-level](#type-level)
  - [FieldRefs (type alias)](#fieldrefs-type-alias)
- [utilities](#utilities)
  - [FormOperations (interface)](#formoperations-interface)
---

# atoms

## FieldAtoms (interface)

Internal atom bundle backing a single field path.

**Example**

```ts
import type { FieldAtoms } from "@beep/form/core/FormAtoms"

type FieldAtomKeys = keyof FieldAtoms
const key: FieldAtomKeys = "valueAtom"
console.log(key) // "valueAtom"
```

**Signature**

```ts
export interface FieldAtoms {
  readonly displayErrorAtom: Atom.Atom<O.Option<string>>;
  readonly errorAtom: Atom.Atom<O.Option<Validation.ErrorEntry>>;
  readonly fieldValidationCountAtom: Atom.Writable<number, number>;
  readonly initialValueAtom: Atom.Atom<unknown>;
  readonly isDirtyAtom: Atom.Atom<boolean>;
  readonly shouldValidateAtom: Atom.Atom<boolean>;
  readonly touchedAtom: Atom.Writable<boolean, boolean>;
  readonly triggerValidationAtom: Atom.Atom<void>;
  readonly validationAtom: Atom.AtomResultFn<unknown, void, S.SchemaError>;
  readonly valueAtom: Atom.Writable<unknown, unknown>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/ui-system/form/src/core/FormAtoms.ts#L39)

Since v0.0.0

## FormAtoms (interface)

Complete atom graph for a form.

**Example**

```ts
import type { FormAtoms } from "@beep/form/core/FormAtoms"
import type { FieldsRecord } from "@beep/form/core/Field"

type Atoms = FormAtoms<FieldsRecord, never>
const key: keyof Atoms = "submitAtom"
console.log(key) // "submitAtom"
```

**Signature**

```ts
export interface FormAtoms<TFields extends Field.FieldsRecord, R, A = void, E = never, SubmitArgs = void> {
  /**
   * Root anchor atom for the form's dependency graph.
   * Mount this atom to keep all form state alive even when field components unmount.
   *
   * Useful for:
   * - Multi-step wizards where steps unmount but state should persist
   * - Conditional fields (toggles) where state should survive visibility changes
   *
   * @example
   * ```tsx
   * // Keep form state alive at wizard root level
   * function Wizard() {
   *   useAtomMount(step1Form.mount)
   *   useAtomMount(step2Form.mount)
   *   return currentStep === 1 ? <Step1 /> : <Step2 />
   * }
   * ```
   */
  readonly autoSubmitAtom: Atom.Atom<void>;
  readonly changedSinceSubmitFieldsAtom: Atom.Atom<HashSet.HashSet<string>>;

  readonly combinedSchema: S.Codec<Field.DecodedFromFields<TFields>, Field.EncodedFromFields<TFields>, R>;
  readonly dirtyFieldsAtom: Atom.Atom<HashSet.HashSet<string>>;
  readonly errorsAtom: Atom.Writable<
    HashMap.HashMap<string, Validation.ErrorEntry>,
    HashMap.HashMap<string, Validation.ErrorEntry>
  >;
  readonly fieldAtomsRegistry: WeakRegistry<FieldAtoms>;

  readonly fieldRefs: FieldRefs<TFields>;

  readonly getFieldAtoms: <S>(field: FormBuilder.FieldRef<S>) => PublicFieldAtoms<S>;

  readonly getOrCreateFieldAtoms: (fieldPath: string, schema: S.Top) => FieldAtoms;

  readonly getOrCreateValidationAtom: (
    fieldPath: string,
    schema: S.Top
  ) => Atom.AtomResultFn<unknown, void, S.SchemaError>;
  readonly hasChangedSinceSubmitAtom: Atom.Atom<boolean>;
  readonly isDirtyAtom: Atom.Atom<boolean>;

  readonly keepAliveActiveAtom: Atom.Writable<boolean, boolean>;
  readonly lastSubmittedValuesAtom: Atom.Atom<O.Option<FormBuilder.SubmittedValues<TFields>>>;

  readonly mountAtom: Atom.Atom<void>;
  readonly onBlurSubmitAtom: Atom.Writable<void, void>;

  readonly operations: FormOperations<TFields>;

  readonly resetAtom: Atom.Writable<void, void>;

  readonly resetValidationAtoms: (ctx: { set: <R, W>(atom: Atom.Writable<R, W>, value: W) => void }) => void;
  readonly revertToLastSubmitAtom: Atom.Writable<void, void>;
  readonly rootErrorAtom: Atom.Atom<O.Option<string>>;
  readonly setValuesAtom: Atom.Writable<Field.EncodedFromFields<TFields>>;
  readonly stateAtom: Atom.Writable<O.Option<FormBuilder.FormState<TFields>>, O.Option<FormBuilder.FormState<TFields>>>;

  readonly submitAtom: Atom.AtomResultFn<SubmitArgs, A, E | S.SchemaError>;
  readonly submitCountAtom: Atom.Atom<number>;
  readonly validateAtom: Atom.AtomResultFn<void, void>;

  readonly validationAtomsRegistry: WeakRegistry<Atom.AtomResultFn<unknown, void, S.SchemaError>>;
  readonly validationCountAtom: Atom.Atom<number>;
  readonly valuesAtom: Atom.Atom<O.Option<Field.EncodedFromFields<TFields>>>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/ui-system/form/src/core/FormAtoms.ts#L151)

Since v0.0.0

## PublicFieldAtoms (interface)

Public atom bundle exposed to field components.

**Example**

```ts
import type { PublicFieldAtoms } from "@beep/form/core/FormAtoms"

type PublicFieldAtomKeys = keyof PublicFieldAtoms<string>
const key: PublicFieldAtomKeys = "value"
console.log(key) // "value"
```

**Signature**

```ts
export interface PublicFieldAtoms<E> {
  readonly error: Atom.Atom<O.Option<string>>;
  readonly isDirty: Atom.Atom<boolean>;
  readonly isTouched: Atom.Atom<boolean>;
  readonly isValidating: Atom.Atom<boolean>;
  readonly setTouched: Atom.Writable<void, boolean>;
  readonly setValue: Atom.Writable<void, E | ((prev: E) => E)>;
  readonly validate: Atom.Writable<void, void>;
  readonly value: Atom.Atom<O.Option<E>>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/ui-system/form/src/core/FormAtoms.ts#L67)

Since v0.0.0

# constructors

## make

Creates a form atom graph from a form builder and runtime.

**Example**

```ts
import { make } from "@beep/form/core/FormAtoms"
import { empty } from "@beep/form/core/FormBuilder"
import { Layer } from "effect"
import * as Atom from "effect/unstable/reactivity/Atom"

const atoms = make({ runtime: Atom.runtime(Layer.empty), formBuilder: empty, onSubmit: () => undefined })
console.log(atoms.fieldRefs)
```

**Signature**

```ts
declare const make: <TFields extends Field.FieldsRecord, R, A, E, SubmitArgs = void>(config: FormAtomsConfig<TFields, R, A, E, SubmitArgs>) => FormAtoms<TFields, R, A, E, SubmitArgs>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/ui-system/form/src/core/FormAtoms.ts#L305)

Since v0.0.0

# models

## FormAtomsConfig (interface)

Configuration accepted by `make`.

**Example**

```ts
import type { FormAtomsConfig } from "@beep/form/core/FormAtoms"
import type { FieldsRecord } from "@beep/form/core/Field"

type Config = FormAtomsConfig<FieldsRecord, never, void, never>
const key: keyof Config = "formBuilder"
console.log(key) // "formBuilder"
```

**Signature**

```ts
export interface FormAtomsConfig<TFields extends Field.FieldsRecord, R, A, E, SubmitArgs = void> {
  readonly formBuilder: FormBuilder.FormBuilder<TFields, R>;
  readonly mode?: Mode.FormMode;
  readonly onSubmit: (
    args: SubmitArgs,
    ctx: {
      readonly decoded: Field.DecodedFromFields<TFields>;
      readonly encoded: Field.EncodedFromFields<TFields>;
      readonly get: Atom.FnContext;
    }
  ) => A | Effect.Effect<A, E, R>;
  readonly reactivityKeys?: ReadonlyArray<unknown> | Readonly<Record<string, ReadonlyArray<unknown>>> | undefined;
  readonly runtime: Atom.AtomRuntime<R>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/ui-system/form/src/core/FormAtoms.ts#L94)

Since v0.0.0

# type-level

## FieldRefs (type alias)

Field references derived from a form field record.

**Example**

```ts
import type { FieldRefs } from "@beep/form/core/FormAtoms"
import { makeField } from "@beep/form/core/Field"
import * as S from "effect/Schema"

const fields = { name: makeField("name", S.String) }
type Refs = FieldRefs<typeof fields>
const key: keyof Refs = "name"
console.log(key) // "name"
```

**Signature**

```ts
type FieldRefs<TFields> = {
  readonly [K in keyof TFields]: TFields[K] extends Field.FieldDef<string, S.Codec<unknown, infer Encoded>>
    ? FormBuilder.FieldRef<Encoded>
    : TFields[K] extends Field.ArrayFieldDef<string, S.Codec<unknown, infer Encoded>>
      ? FormBuilder.FieldRef<ReadonlyArray<Encoded>>
      : never;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/ui-system/form/src/core/FormAtoms.ts#L127)

Since v0.0.0

# utilities

## FormOperations (interface)

Pure state transition helpers used by the atom graph.

**Example**

```ts
import type { FormOperations } from "@beep/form/core/FormAtoms"
import type { FieldsRecord } from "@beep/form/core/Field"

type OperationKeys = keyof FormOperations<FieldsRecord>
const key: OperationKeys = "setFieldValue"
console.log(key) // "setFieldValue"
```

**Signature**

```ts
export interface FormOperations<TFields extends Field.FieldsRecord> {
  readonly appendArrayItem: (
    state: FormBuilder.FormState<TFields>,
    arrayPath: string,
    itemSchema: S.Top,
    value?: unknown
  ) => FormBuilder.FormState<TFields>;
  readonly createInitialState: (defaultValues: Field.EncodedFromFields<TFields>) => FormBuilder.FormState<TFields>;

  readonly createResetState: (state: FormBuilder.FormState<TFields>) => FormBuilder.FormState<TFields>;

  readonly createSubmitState: (state: FormBuilder.FormState<TFields>) => FormBuilder.FormState<TFields>;

  readonly moveArrayItem: (
    state: FormBuilder.FormState<TFields>,
    arrayPath: string,
    fromIndex: number,
    toIndex: number
  ) => FormBuilder.FormState<TFields>;

  readonly removeArrayItem: (
    state: FormBuilder.FormState<TFields>,
    arrayPath: string,
    index: number
  ) => FormBuilder.FormState<TFields>;

  readonly revertToLastSubmit: (state: FormBuilder.FormState<TFields>) => FormBuilder.FormState<TFields>;

  readonly setFieldTouched: (
    state: FormBuilder.FormState<TFields>,
    fieldPath: string,
    touched: boolean
  ) => FormBuilder.FormState<TFields>;

  readonly setFieldValue: (
    state: FormBuilder.FormState<TFields>,
    fieldPath: string,
    value: unknown
  ) => FormBuilder.FormState<TFields>;

  readonly setFormValues: (
    state: FormBuilder.FormState<TFields>,
    values: Field.EncodedFromFields<TFields>
  ) => FormBuilder.FormState<TFields>;

  readonly swapArrayItems: (
    state: FormBuilder.FormState<TFields>,
    arrayPath: string,
    indexA: number,
    indexB: number
  ) => FormBuilder.FormState<TFields>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/ui-system/form/src/core/FormAtoms.ts#L235)

Since v0.0.0
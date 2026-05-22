import type { TUnsafe } from "@beep/types";
import { RegistryContext, useAtom, useAtomMount, useAtomSet, useAtomValue } from "@effect/atom-react";
import type * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import type * as S from "effect/Schema";
import * as Atom from "effect/unstable/reactivity/Atom";
import type * as AtomRegistry from "effect/unstable/reactivity/AtomRegistry";
import * as React from "react";
import { createContext, useContext } from "react";
import * as Field from "../core/Field.ts";
import type * as FieldStateModule from "../core/FieldState.ts";
import * as FormAtoms from "../core/FormAtoms.ts";
import type * as FormBuilder from "../core/FormBuilder.ts";
import type * as Mode from "../core/Mode.ts";
import { getNestedValue } from "../core/Path.ts";

export type FieldValue<T> = FieldStateModule.FieldValue<T>;

export type FieldState<E> = FieldStateModule.FieldState<E>;

export type ArrayFieldOperations<TItem> = FieldStateModule.ArrayFieldOperations<TItem>;

export interface FieldComponentProps<E, P = Record<string, never>> {
  readonly field: FieldState<E>;
  readonly props: P;
}

export type FieldComponent<T, P = Record<string, never>> = React.FC<FieldComponentProps<FieldValue<T>, P>>;

export type ExtractExtraProps<C> =
  C extends React.FC<FieldComponentProps<TUnsafe.Any, infer P>> ? P : Record<string, never>;

type StructFieldsFromSchema<S> =
  S extends S.Struct<infer Fields>
    ? Fields
    : S extends { readonly from: infer From }
      ? StructFieldsFromSchema<From>
      : never;

export type ArrayItemComponentMap<Schema extends S.Top> =
  StructFieldsFromSchema<Schema> extends S.Struct.Fields
    ? {
        readonly [K in keyof StructFieldsFromSchema<Schema>]: StructFieldsFromSchema<Schema>[K] extends S.Top
          ? React.FC<FieldComponentProps<S.Codec.Encoded<StructFieldsFromSchema<Schema>[K]>, TUnsafe.Any>>
          : never;
      }
    : React.FC<FieldComponentProps<S.Codec.Encoded<Schema>, TUnsafe.Any>>;

export type FieldComponentMap<TFields extends Field.FieldsRecord> = {
  readonly [K in keyof TFields]: TFields[K] extends Field.FieldDef<string, infer Schema>
    ? React.FC<FieldComponentProps<S.Codec.Encoded<Schema>, TUnsafe.Any>>
    : TFields[K] extends Field.ArrayFieldDef<string, infer Schema>
      ? ArrayItemComponentMap<Schema>
      : never;
};

export type FieldRefs<TFields extends Field.FieldsRecord> = FormAtoms.FieldRefs<TFields>;

export type BuiltForm<
  TFields extends Field.FieldsRecord,
  R,
  A = void,
  E = never,
  SubmitArgs = void,
  CM extends FieldComponentMap<TFields> = FieldComponentMap<TFields>,
> = {
  readonly values: Atom.Atom<O.Option<Field.EncodedFromFields<TFields>>>;
  readonly isDirty: Atom.Atom<boolean>;
  readonly hasChangedSinceSubmit: Atom.Atom<boolean>;
  readonly lastSubmittedValues: Atom.Atom<O.Option<FormBuilder.SubmittedValues<TFields>>>;
  readonly submitCount: Atom.Atom<number>;
  readonly validationCount: Atom.Atom<number>;

  readonly schema: S.Codec<Field.DecodedFromFields<TFields>, Field.EncodedFromFields<TFields>, R>;
  readonly fields: FieldRefs<TFields>;

  readonly Initialize: React.FC<{
    readonly defaultValues: Field.EncodedFromFields<TFields>;
    readonly validateOnInit?: boolean;
    readonly children: React.ReactNode;
  }>;

  readonly submit: Atom.AtomResultFn<SubmitArgs, A, E | S.SchemaError>;
  readonly validate: Atom.AtomResultFn<void, void>;
  readonly reset: Atom.Writable<void, void>;
  readonly revertToLastSubmit: Atom.Writable<void, void>;
  readonly setValues: Atom.Writable<Field.EncodedFromFields<TFields>>;
  readonly getFieldAtoms: <S>(field: FormBuilder.FieldRef<S>) => FormAtoms.PublicFieldAtoms<S>;

  readonly mount: Atom.Atom<void>;
  readonly KeepAlive: React.FC;
} & FieldComponents<TFields, CM>;

type FieldComponents<TFields extends Field.FieldsRecord, CM extends FieldComponentMap<TFields>> = {
  readonly [K in keyof TFields]: TFields[K] extends Field.FieldDef<string, S.Top>
    ? React.FC<ExtractExtraProps<CM[K]>>
    : TFields[K] extends Field.ArrayFieldDef<string, infer Schema>
      ? ArrayFieldComponent<Schema, ExtractArrayItemExtraProps<CM[K], Schema>>
      : never;
};

type ExtractArrayItemExtraProps<CM, Schema extends S.Top> =
  StructFieldsFromSchema<Schema> extends S.Struct.Fields
    ? {
        readonly [K in keyof StructFieldsFromSchema<Schema>]: CM extends { readonly [P in K]: infer C }
          ? ExtractExtraProps<C>
          : never;
      }
    : CM extends React.FC<FieldComponentProps<TUnsafe.Any, infer P>>
      ? P
      : never;

type ArrayFieldComponent<Schema extends S.Top, ExtraPropsMap> = React.FC<{
  readonly children: (ops: ArrayFieldOperations<S.Codec.Encoded<Schema>>) => React.ReactNode;
}> & {
  readonly Item: React.FC<{
    readonly index: number;
    readonly children: React.ReactNode | ((props: { readonly remove: () => void }) => React.ReactNode);
  }>;
} & (StructFieldsFromSchema<Schema> extends S.Struct.Fields
    ? {
        readonly [K in keyof StructFieldsFromSchema<Schema>]: React.FC<
          ExtraPropsMap extends { readonly [P in K]: infer EP } ? EP : Record<string, never>
        >;
      }
    : unknown);

interface ArrayItemContextValue {
  readonly index: number;
  readonly parentPath: string;
}

const ArrayItemContext = createContext<ArrayItemContextValue | null>(null);

const makeFieldComponent = <Schema extends S.Top, P>(
  fieldKey: string,
  fieldDef: Field.FieldDef<string, Schema>,
  getOrCreateFieldAtoms: (fieldPath: string, schema: S.Top) => FormAtoms.FieldAtoms,
  Component: React.FC<FieldComponentProps<S.Codec.Encoded<Schema>, P>>,
  onBlurSubmitAtom: Atom.Writable<void, void>
): React.FC<P> => {
  const FieldComponent: React.FC<P> = (extraProps) => {
    const arrayCtx = useContext(ArrayItemContext);
    const fieldPath = arrayCtx !== null ? `${arrayCtx.parentPath}.${fieldKey}` : fieldKey;

    const fieldAtoms = React.useMemo(() => getOrCreateFieldAtoms(fieldPath, fieldDef.schema), [fieldPath]);

    const [value, setValue] = useAtom(fieldAtoms.valueAtom) as [S.Codec.Encoded<Schema>, (v: unknown) => void];
    const [isTouched, setTouched] = useAtom(fieldAtoms.touchedAtom);
    const displayError = useAtomValue(fieldAtoms.displayErrorAtom);
    const isDirty = useAtomValue(fieldAtoms.isDirtyAtom);
    const isValidating = useAtomValue(fieldAtoms.validationAtom).waiting;
    const setOnBlurSubmit = useAtomSet(onBlurSubmitAtom);

    useAtomMount(fieldAtoms.triggerValidationAtom);

    const onChange = React.useCallback((newValue: S.Codec.Encoded<Schema>) => setValue(newValue), [setValue]);

    const onBlur = React.useCallback(() => {
      setTouched(true);
      setOnBlurSubmit();
    }, [setTouched, setOnBlurSubmit]);

    const fieldState = React.useMemo(
      () => ({
        path: fieldPath,
        value,
        onChange,
        onBlur,
        error: displayError,
        isTouched,
        isValidating,
        isDirty,
      }),
      [fieldPath, value, onChange, onBlur, displayError, isTouched, isValidating, isDirty]
    );

    return <Component field={fieldState} props={extraProps} />;
  };
  return React.memo(FieldComponent) as React.FC<P>;
};

const makeArrayFieldComponent = <Schema extends S.Top>(
  fieldKey: string,
  def: Field.ArrayFieldDef<string, Schema>,
  stateAtom: Atom.Writable<O.Option<FormBuilder.FormState<TUnsafe.Any>>, O.Option<FormBuilder.FormState<TUnsafe.Any>>>,
  getOrCreateFieldAtoms: (fieldPath: string, schema: S.Top) => FormAtoms.FieldAtoms,
  operations: FormAtoms.FormOperations<TUnsafe.Any>,
  componentMap: ArrayItemComponentMap<Schema>,
  onBlurSubmitAtom: Atom.Writable<void, void>
): ArrayFieldComponent<Schema, TUnsafe.Any> => {
  const ArrayWrapper: React.FC<{
    readonly children: (ops: ArrayFieldOperations<S.Codec.Encoded<Schema>>) => React.ReactNode;
  }> = ({ children }) => {
    const arrayCtx = useContext(ArrayItemContext);
    const [formStateOption, setFormState] = useAtom(stateAtom);
    const formState = O.getOrThrow(formStateOption);

    const fieldPath = arrayCtx !== null ? `${arrayCtx.parentPath}.${fieldKey}` : fieldKey;
    const items = React.useMemo(
      () => (getNestedValue(formState.values, fieldPath) ?? []) as ReadonlyArray<S.Codec.Encoded<Schema>>,
      [formState.values, fieldPath]
    );

    const append = React.useCallback(
      (value?: S.Codec.Encoded<Schema>) => {
        setFormState((prev) => {
          if (O.isNone(prev)) return prev;
          return O.some(operations.appendArrayItem(prev.value, fieldPath, def.itemSchema, value));
        });
      },
      [fieldPath, setFormState]
    );

    const remove = React.useCallback(
      (index: number) => {
        setFormState((prev) => {
          if (O.isNone(prev)) return prev;
          return O.some(operations.removeArrayItem(prev.value, fieldPath, index));
        });
      },
      [fieldPath, setFormState]
    );

    const swap = React.useCallback(
      (indexA: number, indexB: number) => {
        setFormState((prev) => {
          if (O.isNone(prev)) return prev;
          return O.some(operations.swapArrayItems(prev.value, fieldPath, indexA, indexB));
        });
      },
      [fieldPath, setFormState]
    );

    const move = React.useCallback(
      (from: number, to: number) => {
        setFormState((prev) => {
          if (O.isNone(prev)) return prev;
          return O.some(operations.moveArrayItem(prev.value, fieldPath, from, to));
        });
      },
      [fieldPath, setFormState]
    );

    return <>{children({ items, append, remove, swap, move })}</>;
  };

  const ItemWrapper: React.FC<{
    readonly index: number;
    readonly children: React.ReactNode | ((props: { readonly remove: () => void }) => React.ReactNode);
  }> = ({ children, index }) => {
    const arrayCtx = useContext(ArrayItemContext);
    const setFormState = useAtomSet(stateAtom);

    const parentPath = arrayCtx !== null ? `${arrayCtx.parentPath}.${fieldKey}` : fieldKey;
    const itemPath = `${parentPath}[${index}]`;

    const remove = React.useCallback(() => {
      setFormState((prev) => {
        if (O.isNone(prev)) return prev;
        return O.some(operations.removeArrayItem(prev.value, parentPath, index));
      });
    }, [parentPath, index, setFormState]);

    return (
      <ArrayItemContext.Provider value={{ index, parentPath: itemPath }}>
        {typeof children === "function" ? children({ remove }) : children}
      </ArrayItemContext.Provider>
    );
  };

  const itemFieldComponents: Record<string, React.FC> = {};

  const subFieldDefs = Field.extractStructFieldDefs(def.itemSchema);
  if (subFieldDefs !== undefined) {
    for (const subDef of subFieldDefs) {
      const itemComponent = (componentMap as Record<string, React.FC<FieldComponentProps<TUnsafe.Any, TUnsafe.Any>>>)[
        subDef.key
      ];
      itemFieldComponents[subDef.key] = makeFieldComponent(
        subDef.key,
        subDef,
        getOrCreateFieldAtoms,
        itemComponent,
        onBlurSubmitAtom
      );
    }
  }

  const properties: Record<string, TUnsafe.Any> = {
    Item: ItemWrapper,
    ...itemFieldComponents,
  };

  return new Proxy(ArrayWrapper, {
    get(target, prop) {
      if (prop in properties) {
        return properties[prop as string];
      }
      return Reflect.get(target, prop);
    },
  }) as ArrayFieldComponent<Schema, TUnsafe.Any>;
};

const makeFieldComponents = <TFields extends Field.FieldsRecord, CM extends FieldComponentMap<TFields>>(
  fields: TFields,
  stateAtom: Atom.Writable<O.Option<FormBuilder.FormState<TFields>>, O.Option<FormBuilder.FormState<TFields>>>,
  getOrCreateFieldAtoms: (fieldPath: string, schema: S.Top) => FormAtoms.FieldAtoms,
  operations: FormAtoms.FormOperations<TFields>,
  componentMap: CM,
  onBlurSubmitAtom: Atom.Writable<void, void>
): FieldComponents<TFields, CM> => {
  const components: Record<string, TUnsafe.Any> = {};

  for (const [key, def] of Object.entries(fields)) {
    if (Field.isArrayFieldDef(def)) {
      const arrayComponentMap = (componentMap as Record<string, TUnsafe.Any>)[key];
      components[key] = makeArrayFieldComponent(
        key,
        def as Field.ArrayFieldDef<string, S.Top>,
        stateAtom,
        getOrCreateFieldAtoms,
        operations,
        arrayComponentMap,
        onBlurSubmitAtom
      );
    } else if (Field.isFieldDef(def)) {
      const fieldComponent = (componentMap as Record<string, React.FC<FieldComponentProps<TUnsafe.Any, TUnsafe.Any>>>)[
        key
      ];
      components[key] = makeFieldComponent(key, def, getOrCreateFieldAtoms, fieldComponent, onBlurSubmitAtom);
    }
  }

  return components as FieldComponents<TFields, CM>;
};

export const make: {
  <
    TFields extends Field.FieldsRecord,
    R extends AtomRegistry.AtomRegistry,
    A,
    E,
    SubmitArgs = void,
    CM extends FieldComponentMap<TFields> = FieldComponentMap<TFields>,
  >(
    self: FormBuilder.FormBuilder<TFields, R>,
    options: {
      readonly runtime?: Atom.AtomRuntime<TUnsafe.Any, TUnsafe.Any>;
      readonly fields: CM;
      readonly mode?: SubmitArgs extends void ? Mode.FormMode : Mode.FormModeWithoutAutoSubmit;
      readonly reactivityKeys?: ReadonlyArray<unknown> | Readonly<Record<string, ReadonlyArray<unknown>>> | undefined;
      readonly onSubmit: (
        args: SubmitArgs,
        ctx: {
          readonly decoded: Field.DecodedFromFields<TFields>;
          readonly encoded: Field.EncodedFromFields<TFields>;
          readonly get: Atom.FnContext;
        }
      ) => A | Effect.Effect<A, E, R>;
    }
  ): BuiltForm<TFields, R, A, E, SubmitArgs, CM>;

  <
    TFields extends Field.FieldsRecord,
    R,
    A,
    E,
    SubmitArgs = void,
    ER = never,
    CM extends FieldComponentMap<TFields> = FieldComponentMap<TFields>,
  >(
    self: FormBuilder.FormBuilder<TFields, R>,
    options: {
      readonly runtime: Atom.AtomRuntime<R, ER>;
      readonly fields: CM;
      readonly mode?: SubmitArgs extends void ? Mode.FormMode : Mode.FormModeWithoutAutoSubmit;
      readonly reactivityKeys?: ReadonlyArray<unknown> | Readonly<Record<string, ReadonlyArray<unknown>>> | undefined;
      readonly onSubmit: (
        args: SubmitArgs,
        ctx: {
          readonly decoded: Field.DecodedFromFields<TFields>;
          readonly encoded: Field.EncodedFromFields<TFields>;
          readonly get: Atom.FnContext;
        }
      ) => A | Effect.Effect<A, E, R>;
    }
  ): BuiltForm<TFields, R, A, E, SubmitArgs, CM>;
} = (self: TUnsafe.Any, options: TUnsafe.Any): TUnsafe.Any => {
  const { fields: components, mode, onSubmit, runtime: providedRuntime, reactivityKeys } = options;
  const runtime = providedRuntime ?? Atom.runtime(Layer.empty);
  const { fields } = self;

  const formAtoms = FormAtoms.make({
    formBuilder: self,
    runtime,
    onSubmit,
    reactivityKeys,
    mode,
  });

  const {
    autoSubmitAtom,
    combinedSchema,
    fieldRefs,
    getFieldAtoms,
    getOrCreateFieldAtoms,
    hasChangedSinceSubmitAtom,
    isDirtyAtom,
    keepAliveActiveAtom,
    lastSubmittedValuesAtom,
    mountAtom,
    onBlurSubmitAtom,
    operations,
    resetAtom,
    revertToLastSubmitAtom,
    rootErrorAtom,
    setValuesAtom,
    stateAtom,
    submitAtom,
    submitCountAtom,
    validateAtom,
    validationCountAtom,
    valuesAtom,
  } = formAtoms;

  const InitializeComponent: React.FC<{
    readonly defaultValues: TUnsafe.Any;
    readonly validateOnInit?: boolean;
    readonly children: React.ReactNode;
  }> = ({ children, defaultValues, validateOnInit }) => {
    const registry = React.useContext(RegistryContext);
    const state = useAtomValue(stateAtom);
    const setFormState = useAtomSet(stateAtom);
    const triggerValidate = useAtomSet(validateAtom);
    const [isInitialized, setIsInitialized] = React.useState(false);

    React.useEffect(() => {
      const shouldInit = !registry.get(keepAliveActiveAtom) || O.isNone(registry.get(stateAtom));
      if (shouldInit) {
        setFormState(O.some(operations.createInitialState(defaultValues)));
        if (validateOnInit === true) {
          triggerValidate();
        }
      }
      setIsInitialized(true);
    }, [registry]);

    useAtomMount(autoSubmitAtom);

    if (!isInitialized) return null;
    if (O.isNone(state)) return null;

    return <>{children}</>;
  };

  const fieldComponents = makeFieldComponents(
    fields,
    stateAtom,
    getOrCreateFieldAtoms,
    operations,
    components,
    onBlurSubmitAtom
  );

  const KeepAlive: React.FC = () => {
    const setKeepAliveActive = useAtomSet(keepAliveActiveAtom);

    React.useLayoutEffect(() => {
      setKeepAliveActive(true);
      return () => setKeepAliveActive(false);
    }, [setKeepAliveActive]);

    useAtomMount(mountAtom);
    return null;
  };

  return {
    values: valuesAtom,
    isDirty: isDirtyAtom,
    hasChangedSinceSubmit: hasChangedSinceSubmitAtom,
    lastSubmittedValues: lastSubmittedValuesAtom,
    submitCount: submitCountAtom,
    validationCount: validationCountAtom,
    rootError: rootErrorAtom,
    schema: combinedSchema,
    fields: fieldRefs,
    Initialize: InitializeComponent,
    submit: submitAtom,
    validate: validateAtom,
    reset: resetAtom,
    revertToLastSubmit: revertToLastSubmitAtom,
    setValues: setValuesAtom,
    getFieldAtoms,
    mount: mountAtom,
    KeepAlive,
    ...fieldComponents,
  };
};

/**
 * Atom graph construction for schema-backed forms.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { Cause, Duration, Effect, HashMap, HashSet, Match, Number as N } from "effect";
import * as A from "effect/Array";
import { pipe } from "effect/Function";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as Atom from "effect/unstable/reactivity/Atom";
import * as Field from "./Field.ts";
import * as FormBuilder from "./FormBuilder.ts";
import { recalculateDirtyFieldsForArray, recalculateDirtySubtree } from "./internal/dirty.ts";
import { createWeakRegistry } from "./internal/weak-registry.ts";
import * as Mode from "./Mode.ts";
import { getNestedValue, isPathOrParentDirty, setNestedValue } from "./Path.ts";
import * as Validation from "./Validation.ts";
import type { WeakRegistry } from "./internal/weak-registry.ts";

/**
 * Internal atom bundle backing a single field path.
 *
 * @example
 * ```ts
 * import type { FieldAtoms } from "@beep/form/core/FormAtoms"
 *
 * type FieldAtomKeys = keyof FieldAtoms
 * const key: FieldAtomKeys = "valueAtom"
 * console.log(key) // "valueAtom"
 * ```
 *
 * @category atoms
 * @since 0.0.0
 */
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

/**
 * Public atom bundle exposed to field components.
 *
 * @example
 * ```ts
 * import type { PublicFieldAtoms } from "@beep/form/core/FormAtoms"
 *
 * type PublicFieldAtomKeys = keyof PublicFieldAtoms<string>
 * const key: PublicFieldAtomKeys = "value"
 * console.log(key) // "value"
 * ```
 *
 * @category atoms
 * @since 0.0.0
 */
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

/**
 * Configuration accepted by {@link make}.
 *
 * @example
 * ```ts
 * import type { FormAtomsConfig } from "@beep/form/core/FormAtoms"
 * import type { FieldsRecord } from "@beep/form/core/Field"
 *
 * type Config = FormAtomsConfig<FieldsRecord, never, void, never>
 * const key: keyof Config = "formBuilder"
 * console.log(key) // "formBuilder"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
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

/**
 * Field references derived from a form field record.
 *
 * @example
 * ```ts
 * import type { FieldRefs } from "@beep/form/core/FormAtoms"
 * import { makeField } from "@beep/form/core/Field"
 * import * as S from "effect/Schema"
 *
 * const fields = { name: makeField("name", S.String) }
 * type Refs = FieldRefs<typeof fields>
 * const key: keyof Refs = "name"
 * console.log(key) // "name"
 * ```
 *
 * @category type-level
 * @since 0.0.0
 */
export type FieldRefs<TFields extends Field.FieldsRecord> = {
  readonly [K in keyof TFields]: TFields[K] extends Field.FieldDef<string, S.Codec<unknown, infer Encoded>>
    ? FormBuilder.FieldRef<Encoded>
    : TFields[K] extends Field.ArrayFieldDef<string, S.Codec<unknown, infer Encoded>>
      ? FormBuilder.FieldRef<ReadonlyArray<Encoded>>
      : never;
};

/**
 * Complete atom graph for a form.
 *
 * @example
 * ```ts
 * import type { FormAtoms } from "@beep/form/core/FormAtoms"
 * import type { FieldsRecord } from "@beep/form/core/Field"
 *
 * type Atoms = FormAtoms<FieldsRecord, never>
 * const key: keyof Atoms = "submitAtom"
 * console.log(key) // "submitAtom"
 * ```
 *
 * @category atoms
 * @since 0.0.0
 */
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

/**
 * Pure state transition helpers used by the atom graph.
 *
 * @example
 * ```ts
 * import type { FormOperations } from "@beep/form/core/FormAtoms"
 * import type { FieldsRecord } from "@beep/form/core/Field"
 *
 * type OperationKeys = keyof FormOperations<FieldsRecord>
 * const key: OperationKeys = "setFieldValue"
 * console.log(key) // "setFieldValue"
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
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

/**
 * Creates a form atom graph from a form builder and runtime.
 *
 * @example
 * ```ts
 * import { make } from "@beep/form/core/FormAtoms"
 * import { empty } from "@beep/form/core/FormBuilder"
 * import { Layer } from "effect"
 * import * as Atom from "effect/unstable/reactivity/Atom"
 *
 * const atoms = make({ runtime: Atom.runtime(Layer.empty), formBuilder: empty, onSubmit: () => undefined })
 * console.log(atoms.fieldRefs)
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const make = <TFields extends Field.FieldsRecord, R, A, E, SubmitArgs = void>(
  config: FormAtomsConfig<TFields, R, A, E, SubmitArgs>
): FormAtoms<TFields, R, A, E, SubmitArgs> => {
  const { formBuilder, runtime } = config;
  const { fields } = formBuilder;
  const parsedMode = Mode.parse(config.mode);

  const combinedSchema = FormBuilder.buildSchema(formBuilder);

  const stateAtom = Atom.make(O.none<FormBuilder.FormState<TFields>>()).pipe(Atom.setIdleTTL(0));
  const errorsAtom = Atom.make<HashMap.HashMap<string, Validation.ErrorEntry>>(
    HashMap.empty<string, Validation.ErrorEntry>()
  ).pipe(Atom.setIdleTTL(0));

  const rootErrorAtom = Atom.readable((get) => {
    const errors = get(errorsAtom);
    return pipe(
      HashMap.get(errors, ""),
      O.map((entry) => entry.message)
    );
  }).pipe(Atom.setIdleTTL(0));

  const valuesAtom = Atom.readable((get) => O.map(get(stateAtom), (state) => state.values)).pipe(Atom.setIdleTTL(0));

  const dirtyFieldsAtom = Atom.readable((get) =>
    O.match(get(stateAtom), {
      onNone: () => HashSet.empty<string>(),
      onSome: (state) => state.dirtyFields,
    })
  ).pipe(Atom.setIdleTTL(0));

  const isDirtyAtom = Atom.readable((get) =>
    O.match(get(stateAtom), {
      onNone: () => false,
      onSome: (state) => HashSet.size(state.dirtyFields) > 0,
    })
  ).pipe(Atom.setIdleTTL(0));

  const submitCountAtom = Atom.readable((get) =>
    O.match(get(stateAtom), {
      onNone: () => 0,
      onSome: (state) => state.submitCount,
    })
  ).pipe(Atom.setIdleTTL(0));

  const validationCountAtom = Atom.readable((get) =>
    O.match(get(stateAtom), {
      onNone: () => 0,
      onSome: (state) => state.validationCount,
    })
  ).pipe(Atom.setIdleTTL(0));

  const lastSubmittedValuesAtom = Atom.readable((get) =>
    O.flatMap(get(stateAtom), (state) => state.lastSubmittedValues)
  ).pipe(Atom.setIdleTTL(0));

  const changedSinceSubmitFieldsAtom = Atom.readable((get) =>
    pipe(
      get(stateAtom),
      O.flatMap((state) =>
        pipe(
          state.lastSubmittedValues,
          O.map((lastSubmitted) =>
            recalculateDirtySubtree({
              currentDirty: HashSet.empty<string>(),
              allInitial: lastSubmitted.encoded,
              allValues: state.values,
              rootPath: "",
            })
          )
        )
      ),
      O.getOrElse(() => HashSet.empty<string>())
    )
  ).pipe(Atom.setIdleTTL(0));

  const hasChangedSinceSubmitAtom = Atom.readable((get) =>
    O.match(get(stateAtom), {
      onNone: () => false,
      onSome: (state) => {
        if (O.isNone(state.lastSubmittedValues)) return false;
        if (state.values === state.lastSubmittedValues.value.encoded) return false;
        return HashSet.size(get(changedSinceSubmitFieldsAtom)) > 0;
      },
    })
  ).pipe(Atom.setIdleTTL(0));

  const validationAtomsRegistry = createWeakRegistry<Atom.AtomResultFn<unknown, void, S.SchemaError>>();
  const fieldAtomsRegistry = createWeakRegistry<FieldAtoms>();
  const publicFieldAtomsRegistry = createWeakRegistry<PublicFieldAtoms<unknown>>();
  let validationSchemaRegistry = HashMap.empty<string, S.Top>();
  let fieldSchemaRegistry = HashMap.empty<string, S.Top>();
  const isDirtyAtomsRegistry = createWeakRegistry<Atom.Atom<boolean>>();

  let fieldSchemasByKey = HashMap.empty<string, S.Top>();
  for (const [key, def] of R.toEntries(fields)) {
    if (Field.isArrayFieldDef(def)) {
      fieldSchemasByKey = HashMap.set(fieldSchemasByKey, key, S.Array(def.itemSchema));
    } else if (Field.isFieldDef(def)) {
      fieldSchemasByKey = HashMap.set(fieldSchemasByKey, key, def.schema);
    }
  }

  const getOrCreateValidationAtom = (
    fieldPath: string,
    schema: S.Top
  ): Atom.AtomResultFn<unknown, void, S.SchemaError> => {
    const existing = validationAtomsRegistry.get(fieldPath);
    const existingSchema = HashMap.get(validationSchemaRegistry, fieldPath);
    if (existing !== undefined && O.contains(existingSchema, schema)) return existing;

    const validationAtom = runtime
      .fn<unknown>()((value: unknown) =>
        pipe(S.decodeUnknownEffect(schema as S.Decoder<unknown, R>)(value), Effect.asVoid)
      )
      .pipe(Atom.setIdleTTL(0)) as Atom.AtomResultFn<unknown, void, S.SchemaError>;

    validationAtomsRegistry.set(fieldPath, validationAtom);
    validationSchemaRegistry = HashMap.set(validationSchemaRegistry, fieldPath, schema);
    return validationAtom;
  };

  const getOrCreateFieldAtoms = (fieldPath: string, schema: S.Top): FieldAtoms => {
    const existing = fieldAtomsRegistry.get(fieldPath);
    const existingSchema = HashMap.get(fieldSchemaRegistry, fieldPath);
    if (existing !== undefined && O.contains(existingSchema, schema)) return existing;

    const valueAtom = Atom.writable(
      (get) => getNestedValue(O.getOrThrow(get(stateAtom)).values, fieldPath),
      (ctx, value) => {
        const currentState = O.getOrThrow(ctx.get(stateAtom));
        ctx.set(stateAtom, O.some(operations.setFieldValue(currentState, fieldPath, value)));
      }
    ).pipe(Atom.setIdleTTL(0));

    const initialValueAtom = Atom.readable((get) =>
      getNestedValue(O.getOrThrow(get(stateAtom)).initialValues, fieldPath)
    ).pipe(Atom.setIdleTTL(0));

    const touchedAtom = Atom.writable(
      (get) => (getNestedValue(O.getOrThrow(get(stateAtom)).touched, fieldPath) ?? false) as boolean,
      (ctx, value) => {
        const currentState = O.getOrThrow(ctx.get(stateAtom));
        ctx.set(
          stateAtom,
          O.some({
            ...currentState,
            touched: setNestedValue(currentState.touched, { path: fieldPath, value }),
          })
        );
      }
    ).pipe(Atom.setIdleTTL(0));

    const errorAtom = Atom.readable((get) => {
      const errors = get(errorsAtom);
      return HashMap.get(errors, fieldPath);
    }).pipe(Atom.setIdleTTL(0));

    const existingIsDirtyAtom = isDirtyAtomsRegistry.get(fieldPath);
    const isDirtyAtom =
      existingIsDirtyAtom ??
      Atom.readable((get) =>
        isPathOrParentDirty(
          O.match(get(stateAtom), {
            onNone: () => HashSet.empty<string>(),
            onSome: (state) => state.dirtyFields,
          }),
          fieldPath
        )
      ).pipe(Atom.setIdleTTL(0));
    if (existingIsDirtyAtom === undefined) {
      isDirtyAtomsRegistry.set(fieldPath, isDirtyAtom);
    }

    const validationAtom = getOrCreateValidationAtom(fieldPath, schema);
    const shouldDebounceValidation =
      parsedMode.validation === "onChange" && parsedMode.debounce !== null && !parsedMode.autoSubmit;
    const debounceMs = shouldDebounceValidation ? parsedMode.debounce : null;
    const debouncedValidationAtom =
      debounceMs !== null && debounceMs > 0
        ? runtime
            .fn<unknown>()((value, get) =>
              pipe(
                Effect.sleep(Duration.millis(debounceMs)),
                Effect.flatMap(() =>
                  Effect.sync(() => {
                    get.set(validationAtom, value);
                  })
                )
              )
            )
            .pipe(Atom.setIdleTTL(0))
        : undefined;

    const fieldValidationCountAtom = Atom.make(0).pipe(Atom.setIdleTTL(0));

    const shouldValidateAtom = Atom.readable((get) => {
      if (parsedMode.validation === "onChange") return true;
      if (parsedMode.validation === "onBlur") return get(touchedAtom) || get(fieldValidationCountAtom) > 0;
      return get(submitCountAtom) > 0 || get(validationCountAtom) > 0 || get(fieldValidationCountAtom) > 0;
    }).pipe(Atom.setIdleTTL(0));

    const displayErrorAtom = Atom.readable((get) => {
      const validationResult = get(validationAtom);
      const storedError = get(errorAtom);
      const isDirty = get(isDirtyAtom);
      const isTouched = get(touchedAtom);
      const submitCount = get(submitCountAtom);

      let livePerFieldError: O.Option<string> = O.none();
      if (validationResult._tag === "Failure") {
        const parseError = Cause.findErrorOption(validationResult.cause);
        if (O.isSome(parseError) && S.isSchemaError(parseError.value)) {
          livePerFieldError = Validation.extractFirstError(parseError.value);
        }
      }

      let validationError: O.Option<string> = O.none();
      if (O.isSome(livePerFieldError)) {
        validationError = livePerFieldError;
      } else if (O.isSome(storedError)) {
        const isValidating = validationResult.waiting;
        const shouldHideStoredError =
          storedError.value.source === "field" && (validationResult._tag === "Success" || isValidating);
        if (!shouldHideStoredError) {
          validationError = O.some(storedError.value.message);
        }
      }

      const validationCount = get(validationCountAtom);
      const fieldValidationCount = get(fieldValidationCountAtom);
      const hasAttemptedValidation = submitCount > 0 || validationCount > 0 || fieldValidationCount > 0;
      const shouldShowError = Match.value(parsedMode.validation).pipe(
        Match.when("onChange", () => isDirty || hasAttemptedValidation),
        Match.when("onBlur", () => isTouched || hasAttemptedValidation),
        Match.orElse(() => hasAttemptedValidation)
      );

      return shouldShowError ? validationError : O.none();
    }).pipe(Atom.setIdleTTL(0));

    const triggerValidationAtom = Atom.readable((get) => {
      let lastValue = get.once(valueAtom);

      if (debouncedValidationAtom !== undefined) {
        get.mount(debouncedValidationAtom);
      }

      const trigger = (value: unknown) => {
        if (!get.once(shouldValidateAtom)) return;
        if (debouncedValidationAtom !== undefined) {
          get.set(debouncedValidationAtom, Atom.Interrupt);
          get.set(debouncedValidationAtom, value);
        } else {
          get.set(validationAtom, value);
        }
      };

      get.addFinalizer(() => {
        if (debouncedValidationAtom !== undefined) {
          get.set(debouncedValidationAtom, Atom.Interrupt);
        }
      });

      get.subscribe(valueAtom, (newValue) => {
        if (newValue === lastValue) return;
        lastValue = newValue;
        trigger(newValue);
      });

      if (parsedMode.validation === "onBlur") {
        get.subscribe(touchedAtom, (isTouched) => {
          if (isTouched) {
            const currentValue = get.once(valueAtom);
            get.set(validationAtom, currentValue);
          }
        });
      }
    }).pipe(Atom.setIdleTTL(0));

    const atoms: FieldAtoms = {
      valueAtom,
      initialValueAtom,
      touchedAtom,
      errorAtom,
      isDirtyAtom,
      validationAtom,
      fieldValidationCountAtom,
      displayErrorAtom,
      shouldValidateAtom,
      triggerValidationAtom,
    };
    fieldAtomsRegistry.set(fieldPath, atoms);
    fieldSchemaRegistry = HashMap.set(fieldSchemaRegistry, fieldPath, schema);
    return atoms;
  };

  const resetValidationAtoms = (ctx: { set: <R, W>(atom: Atom.Writable<R, W>, value: W) => void }) => {
    for (const validationAtom of validationAtomsRegistry.values()) {
      ctx.set(validationAtom, Atom.Reset);
    }
    for (const fieldAtoms of fieldAtomsRegistry.values()) {
      ctx.set(fieldAtoms.fieldValidationCountAtom, 0);
    }
  };

  const runSubmit = Effect.fnUntraced(function* (args: SubmitArgs, get: Atom.FnContext) {
    const state = get(stateAtom);
    if (O.isNone(state)) return yield* Effect.die("Form not initialized");
    const values = state.value.values;
    get.set(errorsAtom, HashMap.empty<string, Validation.ErrorEntry>());
    const decoded = yield* pipe(
      S.decodeUnknownEffect(combinedSchema)(values, { errors: "all" }) as Effect.Effect<
        Field.DecodedFromFields<TFields>,
        S.SchemaError,
        R
      >,
      Effect.tapError((parseError) =>
        Effect.sync(() => {
          const routedErrors = Validation.routeErrorsWithSource(parseError);
          get.set(errorsAtom, routedErrors);
          get.set(stateAtom, O.some(operations.createSubmitState(state.value)));
        })
      )
    );
    const submitState = operations.createSubmitState(state.value);
    get.set(
      stateAtom,
      O.some({
        ...submitState,
        lastSubmittedValues: O.some({ encoded: values, decoded }),
      })
    );
    const result = config.onSubmit(args, { decoded, encoded: values, get });
    if (Effect.isEffect(result)) {
      return yield* result as Effect.Effect<A, E, R>;
    }
    return result as A;
  });

  const runValidate = Effect.fnUntraced(function* (_: void, get: Atom.FnContext) {
    const state = get(stateAtom);
    if (O.isNone(state)) return;
    const values = state.value.values;
    get.set(errorsAtom, HashMap.empty<string, Validation.ErrorEntry>());
    yield* pipe(
      S.decodeUnknownEffect(combinedSchema, { errors: "all" })(values) as Effect.Effect<
        Field.DecodedFromFields<TFields>,
        S.SchemaError,
        R
      >,
      Effect.catchTag("SchemaError", (parseError) =>
        Effect.sync(() => {
          const routedErrors = Validation.routeErrorsWithSource(parseError);
          get.set(errorsAtom, routedErrors);
        })
      )
    );
    const currentState = get(stateAtom);
    if (O.isSome(currentState)) {
      get.set(
        stateAtom,
        O.some({
          ...currentState.value,
          validationCount: currentState.value.validationCount + 1,
        })
      );
    }
  });

  const submitAtom = runtime
    .fn<SubmitArgs>()(
      (args, get) => runSubmit(args, get),
      config.reactivityKeys !== undefined ? { reactivityKeys: config.reactivityKeys } : undefined
    )
    .pipe(Atom.setIdleTTL(0)) as Atom.AtomResultFn<SubmitArgs, A, E | S.SchemaError>;

  const validateAtom = runtime
    .fn<void>()((args, get) => runValidate(args, get))
    .pipe(Atom.setIdleTTL(0)) as Atom.AtomResultFn<void, void, never>;

  const fieldRefs = R.fromEntries(
    pipe(
      R.keys(fields),
      A.map((key) => [key, FormBuilder.makeFieldRef(key)] as const)
    )
  ) as FieldRefs<TFields>;

  const operations: FormOperations<TFields> = {
    createInitialState: (defaultValues) => ({
      values: defaultValues,
      initialValues: defaultValues,
      lastSubmittedValues: O.none(),
      touched: Field.createTouchedRecord(fields, false) as { readonly [K in keyof TFields]: boolean },
      submitCount: 0,
      validationCount: 0,
      dirtyFields: HashSet.empty<string>(),
    }),

    createResetState: (state) => ({
      values: state.initialValues,
      initialValues: state.initialValues,
      lastSubmittedValues: O.none(),
      touched: Field.createTouchedRecord(fields, false) as { readonly [K in keyof TFields]: boolean },
      submitCount: 0,
      validationCount: 0,
      dirtyFields: HashSet.empty<string>(),
    }),

    createSubmitState: (state) => ({
      ...state,
      touched: Field.createTouchedRecord(fields, true) as { readonly [K in keyof TFields]: boolean },
      submitCount: state.submitCount + 1,
    }),

    setFieldValue: (state, fieldPath, value) => {
      const newValues = setNestedValue(state.values, { path: fieldPath, value });
      const newDirtyFields = recalculateDirtySubtree({
        currentDirty: state.dirtyFields,
        allInitial: state.initialValues,
        allValues: newValues,
        rootPath: fieldPath,
      });
      return {
        ...state,
        values: newValues as Field.EncodedFromFields<TFields>,
        dirtyFields: newDirtyFields,
      };
    },

    setFormValues: (state, values) => {
      const newDirtyFields = recalculateDirtySubtree({
        currentDirty: state.dirtyFields,
        allInitial: state.initialValues,
        allValues: values,
        rootPath: "",
      });
      return {
        ...state,
        values,
        dirtyFields: newDirtyFields,
      };
    },

    setFieldTouched: (state, fieldPath, touched) => ({
      ...state,
      touched: setNestedValue(state.touched, { path: fieldPath, value: touched }) as {
        readonly [K in keyof TFields]: boolean;
      },
    }),

    appendArrayItem: (state, arrayPath, itemSchema, value) => {
      const newItem = value ?? Field.getDefaultFromSchema(itemSchema);
      const currentItems = (getNestedValue(state.values, arrayPath) ?? []) as ReadonlyArray<unknown>;
      const newItems = pipe(currentItems, A.append(newItem));
      return {
        ...state,
        values: setNestedValue(state.values, { path: arrayPath, value: newItems }) as Field.EncodedFromFields<TFields>,
        dirtyFields: recalculateDirtyFieldsForArray({
          dirtyFields: state.dirtyFields,
          initialValues: state.initialValues,
          arrayPath,
          newItems,
        }),
      };
    },

    removeArrayItem: (state, arrayPath, index) => {
      const currentItems = (getNestedValue(state.values, arrayPath) ?? []) as ReadonlyArray<unknown>;
      const newItems = A.remove(currentItems, index);
      return {
        ...state,
        values: setNestedValue(state.values, { path: arrayPath, value: newItems }) as Field.EncodedFromFields<TFields>,
        dirtyFields: recalculateDirtyFieldsForArray({
          dirtyFields: state.dirtyFields,
          initialValues: state.initialValues,
          arrayPath,
          newItems,
        }),
      };
    },

    swapArrayItems: (state, arrayPath, indexA, indexB) => {
      const currentItems = (getNestedValue(state.values, arrayPath) ?? []) as ReadonlyArray<unknown>;
      if (
        indexA < 0 ||
        indexA >= A.length(currentItems) ||
        indexB < 0 ||
        indexB >= A.length(currentItems) ||
        indexA === indexB
      ) {
        return state;
      }
      const itemA = currentItems[indexA];
      const itemB = currentItems[indexB];
      const newItems =
        itemA === undefined || itemB === undefined
          ? currentItems
          : pipe(
              currentItems,
              A.replace(indexA, itemB),
              O.flatMap(A.replace(indexB, itemA)),
              O.getOrElse(() => currentItems)
            );
      return {
        ...state,
        values: setNestedValue(state.values, { path: arrayPath, value: newItems }) as Field.EncodedFromFields<TFields>,
        dirtyFields: recalculateDirtyFieldsForArray({
          dirtyFields: state.dirtyFields,
          initialValues: state.initialValues,
          arrayPath,
          newItems,
        }),
      };
    },

    moveArrayItem: (state, arrayPath, fromIndex, toIndex) => {
      const currentItems = (getNestedValue(state.values, arrayPath) ?? []) as ReadonlyArray<unknown>;
      if (
        fromIndex < 0 ||
        fromIndex >= A.length(currentItems) ||
        toIndex < 0 ||
        toIndex > A.length(currentItems) ||
        fromIndex === toIndex
      ) {
        return state;
      }
      const item = currentItems[fromIndex];
      const newItems =
        item === undefined
          ? currentItems
          : pipe(A.remove(currentItems, fromIndex), (withoutItem) =>
              pipe(
                withoutItem,
                A.insertAt(N.min(toIndex, A.length(withoutItem)), item),
                O.getOrElse(() => currentItems)
              )
            );
      return {
        ...state,
        values: setNestedValue(state.values, { path: arrayPath, value: newItems }) as Field.EncodedFromFields<TFields>,
        dirtyFields: recalculateDirtyFieldsForArray({
          dirtyFields: state.dirtyFields,
          initialValues: state.initialValues,
          arrayPath,
          newItems,
        }),
      };
    },

    revertToLastSubmit: (state) => {
      if (O.isNone(state.lastSubmittedValues)) {
        return state;
      }

      const lastEncoded = state.lastSubmittedValues.value.encoded;
      if (state.values === lastEncoded) {
        return state;
      }

      const newDirtyFields = recalculateDirtySubtree({
        currentDirty: state.dirtyFields,
        allInitial: state.initialValues,
        allValues: lastEncoded,
        rootPath: "",
      });

      return {
        ...state,
        values: lastEncoded,
        dirtyFields: newDirtyFields,
      };
    },
  };

  const resetAtom = Atom.fnSync<void>()(
    (_: void, get) => {
      const state = get(stateAtom);
      if (O.isNone(state)) return;
      get.set(stateAtom, O.some(operations.createResetState(state.value)));
      get.set(errorsAtom, HashMap.empty<string, Validation.ErrorEntry>());
      resetValidationAtoms(get);
      get.set(submitAtom, Atom.Reset);
      get.set(validateAtom, Atom.Reset);
    },
    { initialValue: undefined as void }
  ).pipe(Atom.setIdleTTL(0));

  const revertToLastSubmitAtom = Atom.fnSync<void>()(
    (_: void, get) => {
      const state = get(stateAtom);
      if (O.isNone(state)) return;
      get.set(stateAtom, O.some(operations.revertToLastSubmit(state.value)));
      get.set(errorsAtom, HashMap.empty<string, Validation.ErrorEntry>());
    },
    { initialValue: undefined as void }
  ).pipe(Atom.setIdleTTL(0));

  const setValuesAtom = Atom.writable(
    (get): Field.EncodedFromFields<TFields> =>
      pipe(
        get(stateAtom),
        O.map((s) => s.values),
        O.getOrElse(() => undefined as never)
      ),
    (ctx, values: Field.EncodedFromFields<TFields>) => {
      const state = ctx.get(stateAtom);
      if (O.isNone(state)) return;
      ctx.set(stateAtom, O.some(operations.setFormValues(state.value, values)));
      ctx.set(errorsAtom, HashMap.empty<string, Validation.ErrorEntry>());
    }
  ).pipe(Atom.setIdleTTL(0));

  const setValueAtomsRegistry = createWeakRegistry<Atom.Writable<void, never>>();

  const setValue = <Value>(
    field: FormBuilder.FieldRef<Value>
  ): Atom.Writable<void, Value | ((prev: Value) => Value)> => {
    const cached = setValueAtomsRegistry.get(field.key);
    if (cached !== undefined) return cached as Atom.Writable<void, Value | ((prev: Value) => Value)>;

    const atom = Atom.fnSync<Value | ((prev: Value) => Value)>()(
      (update, get) => {
        const state = get(stateAtom);
        if (O.isNone(state)) return;

        const currentValue = getNestedValue(state.value.values, field.key) as Value;
        const newValue = P.isFunction(update) ? update(currentValue) : update;

        get.set(stateAtom, O.some(operations.setFieldValue(state.value, field.key, newValue)));
        // Don't clear errors - display logic handles showing/hiding based on source + validation state
      },
      { initialValue: undefined as void }
    ).pipe(Atom.setIdleTTL(0));

    setValueAtomsRegistry.set(field.key, atom as Atom.Writable<void, never>);
    return atom;
  };

  const getFieldIsDirty = (field: FormBuilder.FieldRef<unknown>): Atom.Atom<boolean> => {
    const cached = fieldAtomsRegistry.get(field.key);
    if (cached !== undefined) return cached.isDirtyAtom;

    const existing = isDirtyAtomsRegistry.get(field.key);
    if (existing !== undefined) return existing;

    const atom = Atom.readable((get) =>
      isPathOrParentDirty(
        O.match(get(stateAtom), {
          onNone: () => HashSet.empty<string>(),
          onSome: (state) => state.dirtyFields,
        }),
        field.key
      )
    ).pipe(Atom.setIdleTTL(0));

    isDirtyAtomsRegistry.set(field.key, atom);
    return atom;
  };

  const getFieldAtoms = <S>(field: FormBuilder.FieldRef<S>): PublicFieldAtoms<S> => {
    const cached = publicFieldAtomsRegistry.get(field.key);
    if (cached !== undefined) return cached as PublicFieldAtoms<S>;

    const schema = pipe(
      HashMap.get(fieldSchemasByKey, field.key),
      O.getOrElse(() => S.Unknown)
    );

    const internal = getOrCreateFieldAtoms(field.key, schema);

    const value = Atom.readable((get) =>
      O.map(get(stateAtom), (state) => getNestedValue(state.values, field.key) as S)
    ).pipe(Atom.setIdleTTL(0));

    const error = Atom.readable((get) =>
      O.match(get(stateAtom), {
        onNone: O.none<string>,
        onSome: () => get(internal.displayErrorAtom),
      })
    ).pipe(Atom.setIdleTTL(0));

    const isDirty = getFieldIsDirty(field);

    const isTouched = Atom.readable((get) =>
      O.match(get(stateAtom), {
        onNone: () => false,
        onSome: (state) => (getNestedValue(state.touched, field.key) ?? false) as boolean,
      })
    ).pipe(Atom.setIdleTTL(0));

    const isValidating = Atom.readable((get) => get(internal.validationAtom).waiting).pipe(Atom.setIdleTTL(0));

    const setValueAtom = setValue(field);

    const setTouchedAtom = Atom.fnSync<boolean>()(
      (touched, get) => {
        const state = get(stateAtom);
        if (O.isNone(state)) return;
        get.set(stateAtom, O.some(operations.setFieldTouched(state.value, field.key, touched)));
      },
      { initialValue: undefined as void }
    ).pipe(Atom.setIdleTTL(0));

    const validateFieldAtom = Atom.fnSync<void>()(
      (_: void, get) => {
        const value = get(internal.valueAtom);
        get.set(internal.validationAtom, value);
        get.set(internal.fieldValidationCountAtom, get(internal.fieldValidationCountAtom) + 1);
      },
      { initialValue: undefined as void }
    ).pipe(Atom.setIdleTTL(0));

    const bundle: PublicFieldAtoms<S> = {
      value,
      error,
      isDirty,
      isTouched,
      isValidating,
      setValue: setValueAtom,
      setTouched: setTouchedAtom,
      validate: validateFieldAtom,
    };
    publicFieldAtomsRegistry.set(field.key, bundle as PublicFieldAtoms<unknown>);
    return bundle;
  };

  const mountAtom = Atom.readable((get) => {
    get(stateAtom);
    get(errorsAtom);
    get(submitAtom);
  }).pipe(Atom.setIdleTTL(0));

  const keepAliveActiveAtom = Atom.make(false).pipe(Atom.setIdleTTL(0));
  const debounceSubmitMs = parsedMode.debounce;
  const debouncedSubmitAtom =
    parsedMode.autoSubmit && parsedMode.validation === "onChange" && debounceSubmitMs !== null && debounceSubmitMs > 0
      ? runtime
          .fn<void>()((_, get) =>
            pipe(
              Effect.sleep(Duration.millis(debounceSubmitMs)),
              Effect.flatMap(() =>
                Effect.sync(() => {
                  if (!get(submitAtom).waiting) {
                    get.set(submitAtom, undefined as SubmitArgs);
                  }
                })
              )
            )
          )
          .pipe(Atom.setIdleTTL(0))
      : undefined;

  const autoSubmitAtom: Atom.Atom<void> =
    parsedMode.autoSubmit && parsedMode.validation === "onChange"
      ? Atom.readable((get) => {
          if (debouncedSubmitAtom !== undefined) {
            get.mount(debouncedSubmitAtom);
          }

          const initialState = get.once(stateAtom);
          let lastValues: unknown = O.isSome(initialState) ? initialState.value.values : null;
          let pendingChanges = false;
          let wasSubmitting = false;

          const triggerSubmit = () => {
            if (get.once(submitAtom).waiting) {
              pendingChanges = true;
              return;
            }
            get.set(submitAtom, undefined as SubmitArgs);
          };

          const debouncedSubmit = () => {
            if (debouncedSubmitAtom !== undefined) {
              get.set(debouncedSubmitAtom, Atom.Interrupt);
              get.set(debouncedSubmitAtom, undefined);
            } else {
              triggerSubmit();
            }
          };

          get.addFinalizer(() => {
            if (debouncedSubmitAtom !== undefined) {
              get.set(debouncedSubmitAtom, Atom.Interrupt);
            }
          });

          get.subscribe(stateAtom, () => {
            const state = get.once(stateAtom);
            if (O.isNone(state)) return;
            const currentValues = state.value.values;
            if (currentValues === lastValues) return;
            lastValues = currentValues;

            const submitResult = get.once(submitAtom);
            if (submitResult.waiting) {
              pendingChanges = true;
            } else {
              debouncedSubmit();
            }
          });

          get.subscribe(submitAtom, () => {
            const result = get.once(submitAtom);
            const isSubmitting = result.waiting;
            if (wasSubmitting && !isSubmitting) {
              if (pendingChanges) {
                pendingChanges = false;
                debouncedSubmit();
              }
            }
            wasSubmitting = isSubmitting;
          });
        }).pipe(Atom.setIdleTTL(0))
      : Atom.readable(() => {}).pipe(Atom.setIdleTTL(0));

  const onBlurSubmitAtom: Atom.Writable<void, void> =
    parsedMode.autoSubmit && parsedMode.validation === "onBlur"
      ? Atom.fnSync<void>()(
          (_: void, get) => {
            if (get(submitAtom).waiting) return;
            const stateOption = get(stateAtom);
            if (O.isNone(stateOption)) return;
            const { lastSubmittedValues, values } = stateOption.value;
            if (O.isSome(lastSubmittedValues) && values === lastSubmittedValues.value.encoded) return;
            get.set(submitAtom, undefined as SubmitArgs);
          },
          { initialValue: undefined as void }
        ).pipe(Atom.setIdleTTL(0))
      : Atom.fnSync<void>()((_: void) => {}, { initialValue: undefined as void }).pipe(Atom.setIdleTTL(0));

  return {
    stateAtom,
    errorsAtom,
    rootErrorAtom,
    valuesAtom,
    dirtyFieldsAtom,
    isDirtyAtom,
    submitCountAtom,
    validationCountAtom,
    lastSubmittedValuesAtom,
    changedSinceSubmitFieldsAtom,
    hasChangedSinceSubmitAtom,
    submitAtom,
    validateAtom,
    combinedSchema,
    fieldRefs,
    validationAtomsRegistry,
    fieldAtomsRegistry,
    getOrCreateValidationAtom,
    getOrCreateFieldAtoms,
    resetValidationAtoms,
    operations,
    resetAtom,
    revertToLastSubmitAtom,
    setValuesAtom,
    getFieldAtoms,
    autoSubmitAtom,
    onBlurSubmitAtom,
    mountAtom,
    keepAliveActiveAtom,
  } as FormAtoms<TFields, R, A, E, SubmitArgs>;
};

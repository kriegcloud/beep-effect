/**
 * Form builder composition and state models.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $FormId } from "@beep/identity/packages";
import { Effect, Match, SchemaGetter, SchemaIssue } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import { isArrayFieldDef, makeField } from "./Field.ts";
import type { TUnsafe } from "@beep/types";
import type { HashSet } from "effect";
import type * as AST from "effect/SchemaAST";
import type * as AtomRegistry from "effect/unstable/reactivity/AtomRegistry";
import type { ArrayFieldDef, DecodedFromFields, EncodedFromFields, FieldDef, FieldsRecord } from "./Field.ts";

const $I = $FormId.create("core/FormBuilder");

/**
 * Encoded and decoded value snapshot captured after successful submission.
 *
 * @example
 * ```ts
 * import type { SubmittedValues } from "@beep/form/core/FormBuilder"
 * import type { FieldsRecord } from "@beep/form/core/Field"
 * import * as O from "effect/Option"
 *
 * const submitted: O.Option<SubmittedValues<FieldsRecord>> = O.none()
 * console.log(O.isNone(submitted)) // true
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export interface SubmittedValues<TFields extends FieldsRecord> {
  readonly decoded: DecodedFromFields<TFields>;
  readonly encoded: EncodedFromFields<TFields>;
}

/**
 * Runtime marker for field references.
 *
 * @example
 * ```ts
 * import { FieldTypeId } from "@beep/form/core/FormBuilder"
 *
 * console.log(typeof FieldTypeId) // "symbol"
 * ```
 *
 * @category symbols
 * @since 0.0.0
 */
export const FieldTypeId: unique symbol = Symbol.for("@beep/form/FieldRef");

/**
 * Type of the field reference runtime marker.
 *
 * @example
 * ```ts
 * import { FieldTypeId, type FieldTypeId as FieldRefTypeId } from "@beep/form/core/FormBuilder"
 *
 * const id: FieldRefTypeId = FieldTypeId
 * console.log(typeof id) // "symbol"
 * ```
 *
 * @category symbols
 * @since 0.0.0
 */
export type FieldTypeId = typeof FieldTypeId;

/**
 * Stable reference to a field by key and encoded value type.
 *
 * @example
 * ```ts
 * import { makeFieldRef, type FieldRef } from "@beep/form/core/FormBuilder"
 *
 * const ref: FieldRef<string> = makeFieldRef("name")
 * console.log(ref.key) // "name"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export interface FieldRef<SchemaOrValue> {
  readonly _S?: SchemaOrValue;
  readonly key: string;
  readonly [FieldTypeId]: FieldTypeId;
}

/**
 * Creates a typed field reference from a field key.
 *
 * @example
 * ```ts
 * import { makeFieldRef } from "@beep/form/core/FormBuilder"
 *
 * const ref = makeFieldRef<string>("email")
 * console.log(ref.key) // "email"
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const makeFieldRef = <SchemaOrValue>(key: string): FieldRef<SchemaOrValue> => ({
  [FieldTypeId]: FieldTypeId,
  key,
});

/**
 * Runtime marker for form builders.
 *
 * @example
 * ```ts
 * import { TypeId } from "@beep/form/core/FormBuilder"
 *
 * console.log(typeof TypeId) // "symbol"
 * ```
 *
 * @category symbols
 * @since 0.0.0
 */
export const TypeId: unique symbol = Symbol.for("@beep/form/FormBuilder");

/**
 * Type of the form builder runtime marker.
 *
 * @example
 * ```ts
 * import { TypeId, type TypeId as BuilderTypeId } from "@beep/form/core/FormBuilder"
 *
 * const id: BuilderTypeId = TypeId
 * console.log(typeof id) // "symbol"
 * ```
 *
 * @category symbols
 * @since 0.0.0
 */
export type TypeId = typeof TypeId;

/**
 * Runtime state held by a form atom graph.
 *
 * @example
 * ```ts
 * import type { FormState } from "@beep/form/core/FormBuilder"
 * import type { FieldsRecord } from "@beep/form/core/Field"
 * import * as O from "effect/Option"
 *
 * const lastSubmittedValues: FormState<FieldsRecord>["lastSubmittedValues"] = O.none()
 * console.log(O.isNone(lastSubmittedValues)) // true
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export interface FormState<TFields extends FieldsRecord> {
  readonly dirtyFields: HashSet.HashSet<string>;
  readonly initialValues: EncodedFromFields<TFields>;
  readonly lastSubmittedValues: O.Option<SubmittedValues<TFields>>;
  readonly submitCount: number;
  readonly touched: { readonly [K in keyof TFields]: boolean };
  readonly validationCount: number;
  readonly values: EncodedFromFields<TFields>;
}

/**
 * Legacy refinement issue object accepted by builder refinements.
 *
 * @example
 * ```ts
 * import { LegacyFilterIssue } from "@beep/form/core/FormBuilder"
 *
 * const issue = LegacyFilterIssue.make({ path: ["confirm"], message: "Must match" })
 * console.log(issue.message) // "Must match"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class LegacyFilterIssue extends S.Class<LegacyFilterIssue>($I`LegacyFilterIssue`)(
  {
    path: S.Array(S.PropertyKey),
    message: S.String,
  },
  $I.annote("LegacyFilterIssue", {
    description: "Legacy refinement issue object used by effect-form compatible form filters.",
  })
) {}

/**
 * Issue shape accepted from synchronous and Effect-based form refinements.
 *
 * @example
 * ```ts
 * import { LegacyFilterIssue, type FormFilterIssue } from "@beep/form/core/FormBuilder"
 *
 * const issue: FormFilterIssue = LegacyFilterIssue.make({ path: ["name"], message: "Required" })
 * console.log(issue.message) // "Required"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type FormFilterIssue = S.FilterIssue | LegacyFilterIssue;

/**
 * Return shape accepted from form-level refinement callbacks.
 *
 * @example
 * ```ts
 * import type { FormFilterOutput } from "@beep/form/core/FormBuilder"
 *
 * const output: FormFilterOutput = true
 * console.log(output) // true
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type FormFilterOutput = undefined | boolean | FormFilterIssue | ReadonlyArray<FormFilterIssue>;

interface SyncRefinement {
  readonly _tag: "sync";
  readonly fn: (values: unknown) => FormFilterOutput;
}

interface AsyncRefinement<R> {
  readonly _tag: "async";
  readonly fn: (values: unknown) => Effect.Effect<FormFilterOutput, never, R>;
}

type Refinement<R> = SyncRefinement | AsyncRefinement<R>;

/**
 * Immutable builder used to collect fields and form-level refinements.
 *
 * @example
 * ```ts
 * import { empty, type FormBuilder } from "@beep/form/core/FormBuilder"
 * import { makeField } from "@beep/form/core/Field"
 * import * as S from "effect/Schema"
 *
 * const builder: FormBuilder<{ readonly name: ReturnType<typeof makeField<"name", typeof S.String>> }, never> =
 *   empty.addField(makeField("name", S.String))
 * console.log(builder.fields.name.key) // "name"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export interface FormBuilder<TFields extends FieldsRecord, R> {
  readonly _R?: R;

  addField<K extends string, Schema extends S.Top>(
    this: FormBuilder<TFields, R>,
    field: FieldDef<K, Schema>
  ): FormBuilder<TFields & { readonly [key in K]: FieldDef<K, Schema> }, R | S.Codec.DecodingServices<Schema>>;

  addField<K extends string, Schema extends S.Top>(
    this: FormBuilder<TFields, R>,
    field: ArrayFieldDef<K, Schema>
  ): FormBuilder<TFields & { readonly [key in K]: ArrayFieldDef<K, Schema> }, R | S.Codec.DecodingServices<Schema>>;

  addField<K extends string, Schema extends S.Top>(
    this: FormBuilder<TFields, R>,
    key: K,
    schema: Schema
  ): FormBuilder<TFields & { readonly [key in K]: FieldDef<K, Schema> }, R | S.Codec.DecodingServices<Schema>>;
  readonly fields: TFields;

  merge<TFields2 extends FieldsRecord, R2>(
    this: FormBuilder<TFields, R>,
    other: FormBuilder<TFields2, R2>
  ): FormBuilder<TFields & TFields2, R | R2>;

  refine(
    this: FormBuilder<TFields, R>,
    predicate: (values: DecodedFromFields<TFields>) => FormFilterOutput
  ): FormBuilder<TFields, R>;

  refineEffect<RD>(
    this: FormBuilder<TFields, R>,
    predicate: (values: DecodedFromFields<TFields>) => Effect.Effect<FormFilterOutput, never, RD>
  ): FormBuilder<TFields, R | Exclude<RD, AtomRegistry.AtomRegistry>>;
  readonly refinements: ReadonlyArray<Refinement<R>>;
  readonly [TypeId]: TypeId;
}

const makeBuilder = <TFields extends FieldsRecord, R>(
  fields: TFields,
  refinements: ReadonlyArray<Refinement<R>>
): FormBuilder<TFields, R> => ({
  [TypeId]: TypeId,
  fields,
  refinements,
  addField<K extends string, Schema extends S.Top>(
    this: FormBuilder<TFields, R>,
    keyOrField: K | FieldDef<K, Schema> | ArrayFieldDef<K, Schema>,
    schema?: Schema
  ) {
    const field = P.isString(keyOrField) ? makeField(keyOrField, schema ?? S.Unknown) : keyOrField;
    return makeBuilder({ ...this.fields, [field.key]: field } as TUnsafe.Any, this.refinements) as TUnsafe.Any;
  },
  merge<TFields2 extends FieldsRecord, R2>(this: FormBuilder<TFields, R>, other: FormBuilder<TFields2, R2>) {
    return makeBuilder(
      { ...this.fields, ...other.fields } as TUnsafe.Any,
      A.appendAll(this.refinements, other.refinements) as TUnsafe.Any
    ) as TUnsafe.Any;
  },
  refine(
    this: FormBuilder<TFields, R>,
    predicate: (values: DecodedFromFields<TFields>) => FormFilterOutput
  ): FormBuilder<TFields, R> {
    return makeBuilder(
      this.fields,
      A.append(this.refinements, {
        _tag: "sync" as const,
        fn: (values: unknown) => predicate(values as TUnsafe.Any),
      })
    );
  },
  refineEffect<RD>(
    this: FormBuilder<TFields, R>,
    predicate: (values: DecodedFromFields<TFields>) => Effect.Effect<FormFilterOutput, never, RD>
  ): FormBuilder<TFields, R | Exclude<RD, AtomRegistry.AtomRegistry>> {
    return makeBuilder(
      this.fields,
      A.append(this.refinements, {
        _tag: "async" as const,
        fn: (values: unknown) => predicate(values as TUnsafe.Any),
      }) as TUnsafe.Any
    );
  },
});

const isLegacyFilterIssue = (entry: FormFilterIssue): entry is LegacyFilterIssue =>
  P.isObject(entry) && !SchemaIssue.isIssue(entry) && P.hasProperty(entry, "message") && P.isString(entry.message);

const normalizeFilterIssue = (entry: FormFilterIssue): S.FilterIssue =>
  isLegacyFilterIssue(entry) ? { path: entry.path, issue: entry.message } : entry;

const normalizeFilterOutput = (output: FormFilterOutput): S.FilterOutput =>
  Match.value(output).pipe(
    Match.when(isFilterIssueArray, (issues) => A.map(issues, normalizeFilterIssue)),
    Match.when(P.isUndefined, (value) => value),
    Match.when(P.isBoolean, (value) => value),
    Match.orElse((issue) => normalizeFilterIssue(issue))
  );

const makeFilterIssue = (input: unknown, entry: FormFilterIssue): SchemaIssue.Issue => {
  const normalizedEntry = normalizeFilterIssue(entry);
  if (P.isString(normalizedEntry)) {
    return new SchemaIssue.InvalidValue(O.some(input), { message: normalizedEntry });
  }
  if (SchemaIssue.isIssue(normalizedEntry)) {
    return normalizedEntry;
  }
  const inner = P.isString(normalizedEntry.issue)
    ? new SchemaIssue.InvalidValue(O.some(input), { message: normalizedEntry.issue })
    : normalizedEntry.issue;
  return new SchemaIssue.Pointer(normalizedEntry.path, inner);
};

const isFilterIssueArray = (output: FormFilterOutput): output is ReadonlyArray<FormFilterIssue> => A.isArray(output);

const makeFilterOutputIssue = (
  input: unknown,
  ast: AST.AST,
  output: FormFilterOutput
): SchemaIssue.Issue | undefined => {
  if (output === undefined) {
    return undefined;
  }
  if (P.isBoolean(output)) {
    return output ? undefined : new SchemaIssue.InvalidValue(O.some(input));
  }
  if (isFilterIssueArray(output)) {
    if (A.length(output) === 0) {
      return undefined;
    }
    const issues = A.map(output, (entry) => makeFilterIssue(input, entry));
    const first = A.head(issues);
    if (O.isNone(first)) {
      return undefined;
    }
    return A.length(issues) === 1
      ? first.value
      : new SchemaIssue.Composite(ast, O.some(input), [first.value, ...A.drop(issues, 1)]);
  }
  return makeFilterIssue(input, output);
};

/**
 * Detects form builder values.
 *
 * @example
 * ```ts
 * import { empty, isFormBuilder } from "@beep/form/core/FormBuilder"
 *
 * console.log(isFormBuilder(empty)) // true
 * ```
 *
 * @category guards
 * @since 0.0.0
 */
export const isFormBuilder = (u: unknown): u is FormBuilder<FieldsRecord, unknown> => P.hasProperty(u, TypeId);

/**
 * Empty form builder.
 *
 * @example
 * ```ts
 * import { empty } from "@beep/form/core/FormBuilder"
 *
 * console.log(empty.refinements.length) // 0
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const empty: FormBuilder<{}, never> = makeBuilder({}, A.empty<Refinement<never>>());

/**
 * Builds the combined schema for a form builder.
 *
 * @example
 * ```ts
 * import { buildSchema, empty } from "@beep/form/core/FormBuilder"
 * import { makeField } from "@beep/form/core/Field"
 * import * as S from "effect/Schema"
 *
 * const schema = buildSchema(empty.addField(makeField("name", S.String)))
 * console.log(S.isSchema(schema)) // true
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const buildSchema = <TFields extends FieldsRecord, R>(
  self: FormBuilder<TFields, R>
): S.Codec<DecodedFromFields<TFields>, EncodedFromFields<TFields>, R> => {
  const schemaFields = R.map(self.fields, (def) => (isArrayFieldDef(def) ? S.Array(def.itemSchema) : def.schema));

  let schema: S.Top = S.Struct(schemaFields);

  for (const refinement of self.refinements) {
    if (refinement._tag === "sync") {
      schema = schema.check(S.makeFilter((value) => normalizeFilterOutput(refinement.fn(value))));
    } else {
      const currentSchema = schema;
      schema = schema.pipe(
        S.decode({
          decode: SchemaGetter.transformOrFail((value) =>
            refinement.fn(value).pipe(
              Effect.flatMap((out) => {
                const issue = makeFilterOutputIssue(value, currentSchema.ast, out);
                return issue === undefined ? Effect.succeed(value) : Effect.fail(issue);
              })
            )
          ),
          encode: SchemaGetter.passthrough(),
        })
      );
    }
  }

  return schema as TUnsafe.Any;
};

import { Effect } from "effect";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import type * as AST from "effect/SchemaAST";
import * as SchemaGetter from "effect/SchemaGetter";
import * as SchemaIssue from "effect/SchemaIssue";
import type * as AtomRegistry from "effect/unstable/reactivity/AtomRegistry";

import type {
  AnyFieldDef,
  ArrayFieldDef,
  DecodedFromFields,
  EncodedFromFields,
  FieldDef,
  FieldsRecord,
} from "./Field.ts";
import { isArrayFieldDef, isFieldDef, makeField } from "./Field.ts";

export interface SubmittedValues<TFields extends FieldsRecord> {
  readonly decoded: DecodedFromFields<TFields>;
  readonly encoded: EncodedFromFields<TFields>;
}

export const FieldTypeId: unique symbol = Symbol.for("@beep/form/FieldRef");

export type FieldTypeId = typeof FieldTypeId;

export interface FieldRef<SchemaOrValue> {
  readonly _S?: SchemaOrValue;
  readonly key: string;
  readonly [FieldTypeId]: FieldTypeId;
}

export const makeFieldRef = <SchemaOrValue>(key: string): FieldRef<SchemaOrValue> => ({
  [FieldTypeId]: FieldTypeId,
  key,
});

export const TypeId: unique symbol = Symbol.for("@beep/form/FormBuilder");

export type TypeId = typeof TypeId;

export interface FormState<TFields extends FieldsRecord> {
  readonly dirtyFields: ReadonlySet<string>;
  readonly initialValues: EncodedFromFields<TFields>;
  readonly lastSubmittedValues: O.Option<SubmittedValues<TFields>>;
  readonly submitCount: number;
  readonly touched: { readonly [K in keyof TFields]: boolean };
  readonly validationCount: number;
  readonly values: EncodedFromFields<TFields>;
}

export type LegacyFilterIssue = {
  readonly path: ReadonlyArray<PropertyKey>;
  readonly message: string;
};

export type FormFilterIssue = S.FilterIssue | LegacyFilterIssue;

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

const FormBuilderProto = {
  [TypeId]: TypeId,
  addField<TFields extends FieldsRecord, R>(
    this: FormBuilder<TFields, R>,
    keyOrField: string | AnyFieldDef,
    schema?: S.Top
  ): FormBuilder<FieldsRecord, unknown> {
    const field = P.isString(keyOrField)
      ? (() => {
          if (schema === undefined) {
            throw new Error("FormBuilder.addField requires a schema when the first argument is a key");
          }
          return makeField(keyOrField, schema);
        })()
      : keyOrField;
    const newSelf = Object.create(FormBuilderProto);
    newSelf.fields = { ...this.fields, [field.key]: field };
    newSelf.refinements = this.refinements;
    return newSelf;
  },
  merge<TFields extends FieldsRecord, R, TFields2 extends FieldsRecord, R2>(
    this: FormBuilder<TFields, R>,
    other: FormBuilder<TFields2, R2>
  ): FormBuilder<TFields & TFields2, R | R2> {
    const newSelf = Object.create(FormBuilderProto);
    newSelf.fields = { ...this.fields, ...other.fields };
    newSelf.refinements = [...this.refinements, ...other.refinements];
    return newSelf;
  },
  refine<TFields extends FieldsRecord, R>(
    this: FormBuilder<TFields, R>,
    predicate: (values: DecodedFromFields<TFields>) => FormFilterOutput
  ): FormBuilder<TFields, R> {
    const newSelf = Object.create(FormBuilderProto);
    newSelf.fields = this.fields;
    newSelf.refinements = [
      ...this.refinements,
      { _tag: "sync" as const, fn: (values: unknown) => predicate(values as DecodedFromFields<TFields>) },
    ];
    return newSelf;
  },
  refineEffect<TFields extends FieldsRecord, R, RD>(
    this: FormBuilder<TFields, R>,
    predicate: (values: DecodedFromFields<TFields>) => Effect.Effect<FormFilterOutput, never, RD>
  ): FormBuilder<TFields, R | Exclude<RD, AtomRegistry.AtomRegistry>> {
    const newSelf = Object.create(FormBuilderProto);
    newSelf.fields = this.fields;
    newSelf.refinements = [
      ...this.refinements,
      { _tag: "async" as const, fn: (values: unknown) => predicate(values as DecodedFromFields<TFields>) },
    ];
    return newSelf;
  },
};

const isLegacyFilterIssue = (entry: FormFilterIssue): entry is LegacyFilterIssue =>
  typeof entry === "object" && entry !== null && !SchemaIssue.isIssue(entry) && "message" in entry;

const normalizeFilterIssue = (entry: FormFilterIssue): S.FilterIssue =>
  isLegacyFilterIssue(entry) ? { path: entry.path, issue: entry.message } : entry;

const normalizeFilterOutput = (output: FormFilterOutput): S.FilterOutput =>
  isFilterIssueArray(output) ? output.map(normalizeFilterIssue) : output === undefined || typeof output === "boolean" ? output : normalizeFilterIssue(output);

const makeFilterIssue = (input: unknown, entry: FormFilterIssue): SchemaIssue.Issue => {
  const normalizedEntry = normalizeFilterIssue(entry);
  if (typeof normalizedEntry === "string") {
    return new SchemaIssue.InvalidValue(O.some(input), { message: normalizedEntry });
  }
  if (SchemaIssue.isIssue(normalizedEntry)) {
    return normalizedEntry;
  }
  const inner =
    typeof normalizedEntry.issue === "string"
      ? new SchemaIssue.InvalidValue(O.some(input), { message: normalizedEntry.issue })
      : normalizedEntry.issue;
  return new SchemaIssue.Pointer(normalizedEntry.path, inner);
};

const isFilterIssueArray = (output: FormFilterOutput): output is ReadonlyArray<FormFilterIssue> => Array.isArray(output);

const makeFilterOutputIssue = (input: unknown, ast: AST.AST, output: FormFilterOutput): SchemaIssue.Issue | undefined => {
  if (output === undefined) {
    return undefined;
  }
  if (typeof output === "boolean") {
    return output ? undefined : new SchemaIssue.InvalidValue(O.some(input));
  }
  if (isFilterIssueArray(output)) {
    if (output.length === 0) {
      return undefined;
    }
    const issues = output.map((entry) => makeFilterIssue(input, entry));
    const first = issues[0];
    if (first === undefined) {
      return undefined;
    }
    return issues.length === 1 ? first : new SchemaIssue.Composite(ast, O.some(input), [first, ...issues.slice(1)]);
  }
  return makeFilterIssue(input, output);
};

export const isFormBuilder = (u: unknown): u is FormBuilder<FieldsRecord, unknown> => P.hasProperty(u, TypeId);


export const empty: FormBuilder<{}, never> = (() => {
  const self = Object.create(FormBuilderProto);
  self.fields = {};
  self.refinements = [];
  return self;
})();

export const buildSchema = <TFields extends FieldsRecord, R>(
  self: FormBuilder<TFields, R>
): S.Codec<DecodedFromFields<TFields>, EncodedFromFields<TFields>, R> => {
  const schemaFields: Record<string, S.Top> = {};
  for (const [key, def] of Object.entries(self.fields)) {
    if (isArrayFieldDef(def)) {
      schemaFields[key] = S.Array(def.itemSchema);
    } else if (isFieldDef(def)) {
      schemaFields[key] = def.schema;
    }
  }

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

  return schema as S.Codec<DecodedFromFields<TFields>, EncodedFromFields<TFields>, R>;
};

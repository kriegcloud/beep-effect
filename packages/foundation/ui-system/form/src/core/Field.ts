/**
 * Field definition schemas, constructors, and type derivation helpers.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { SchemaAST as AST, Exit, Match } from "effect";
import * as A from "effect/Array";
import { pipe } from "effect/Function";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as S from "effect/Schema";

type DecodeTopUnknownExit = (
  schema: S.Top,
  options?: AST.ParseOptions
) => (input: unknown, options?: AST.ParseOptions) => Exit.Exit<unknown, S.SchemaError>;

const decodeTopUnknownExit = S.decodeUnknownExit as DecodeTopUnknownExit;

/**
 * Runtime marker for field definition values.
 *
 * @example
 * ```ts
 * import { TypeId } from "@beep/form/core/Field"
 *
 * console.log(typeof TypeId) // "symbol"
 * ```
 *
 * @category symbols
 * @since 0.0.0
 */
export const TypeId: unique symbol = Symbol.for("@beep/form/Field");

/**
 * Type of the field definition runtime marker.
 *
 * @example
 * ```ts
 * import { TypeId, type TypeId as FieldTypeId } from "@beep/form/core/Field"
 *
 * const id: FieldTypeId = TypeId
 * console.log(typeof id) // "symbol"
 * ```
 *
 * @category symbols
 * @since 0.0.0
 */
export type TypeId = typeof TypeId;

/**
 * Scalar field definition pairing a stable form key with an Effect schema.
 *
 * @example
 * ```ts
 * import { makeField, type FieldDef } from "@beep/form/core/Field"
 * import * as S from "effect/Schema"
 *
 * const field: FieldDef<"name", typeof S.String> = makeField("name", S.String)
 * console.log(field.key) // "name"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export interface FieldDef<K extends string, Schema extends S.Top> {
  readonly _tag: "field";
  readonly key: K;
  readonly schema: Schema;
}

/**
 * Array field definition pairing a stable form key with an item schema.
 *
 * @example
 * ```ts
 * import { makeArrayField, type ArrayFieldDef } from "@beep/form/core/Field"
 * import * as S from "effect/Schema"
 *
 * const field: ArrayFieldDef<"items", typeof S.String> = makeArrayField("items", S.String)
 * console.log(field._tag) // "array"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export interface ArrayFieldDef<K extends string, Schema extends S.Top> {
  readonly _tag: "array";
  readonly itemSchema: Schema;
  readonly key: K;
}

/**
 * Union of scalar and array field definitions accepted by a form builder.
 *
 * @example
 * ```ts
 * import { makeField, type AnyFieldDef } from "@beep/form/core/Field"
 * import * as S from "effect/Schema"
 *
 * const field: AnyFieldDef = makeField("name", S.String)
 * console.log(field.key) // "name"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type AnyFieldDef = FieldDef<string, S.Top> | ArrayFieldDef<string, S.Top>;

/**
 * Record of form field definitions keyed by form path segment.
 *
 * @example
 * ```ts
 * import { makeField, type FieldsRecord } from "@beep/form/core/Field"
 * import * as S from "effect/Schema"
 *
 * const fields: FieldsRecord = { name: makeField("name", S.String) }
 * console.log(fields.name.key) // "name"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type FieldsRecord = Record<string, AnyFieldDef>;

/**
 * Detects array field definitions.
 *
 * @example
 * ```ts
 * import { isArrayFieldDef, makeArrayField } from "@beep/form/core/Field"
 * import * as S from "effect/Schema"
 *
 * console.log(isArrayFieldDef(makeArrayField("items", S.String))) // true
 * ```
 *
 * @category guards
 * @since 0.0.0
 */
export const isArrayFieldDef = (def: AnyFieldDef): def is ArrayFieldDef<string, S.Top> => def._tag === "array";

/**
 * Detects scalar field definitions.
 *
 * @example
 * ```ts
 * import { isFieldDef, makeField } from "@beep/form/core/Field"
 * import * as S from "effect/Schema"
 *
 * console.log(isFieldDef(makeField("name", S.String))) // true
 * ```
 *
 * @category guards
 * @since 0.0.0
 */
export const isFieldDef = (def: AnyFieldDef): def is FieldDef<string, S.Top> => def._tag === "field";

/**
 * Creates a scalar field definition.
 *
 * @example
 * ```ts
 * import { makeField } from "@beep/form/core/Field"
 * import * as S from "effect/Schema"
 *
 * const field = makeField("email", S.String)
 * console.log(field.key) // "email"
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const makeField = <K extends string, Schema extends S.Top>(key: K, schema: Schema): FieldDef<K, Schema> => ({
  _tag: "field",
  key,
  schema,
});

/**
 * Creates an array field definition.
 *
 * @example
 * ```ts
 * import { makeArrayField } from "@beep/form/core/Field"
 * import * as S from "effect/Schema"
 *
 * const field = makeArrayField("tags", S.String)
 * console.log(field.itemSchema === S.String) // true
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const makeArrayField = <K extends string, Schema extends S.Top>(
  key: K,
  itemSchema: Schema
): ArrayFieldDef<K, Schema> => ({
  _tag: "array",
  key,
  itemSchema,
});

/**
 * Encoded form value shape derived from field definitions.
 *
 * @example
 * ```ts
 * import { makeField, type EncodedFromFields } from "@beep/form/core/Field"
 * import * as S from "effect/Schema"
 *
 * const fields = { name: makeField("name", S.String) }
 * const value: EncodedFromFields<typeof fields> = { name: "Ada" }
 * console.log(value.name) // "Ada"
 * ```
 *
 * @category type-level
 * @since 0.0.0
 */
export type EncodedFromFields<T extends FieldsRecord> = {
  readonly [K in keyof T]: T[K] extends FieldDef<string, infer Schema>
    ? S.Codec.Encoded<Schema>
    : T[K] extends ArrayFieldDef<string, infer Schema>
      ? ReadonlyArray<S.Codec.Encoded<Schema>>
      : never;
};

/**
 * Decoded form value shape derived from field definitions.
 *
 * @example
 * ```ts
 * import { makeField, type DecodedFromFields } from "@beep/form/core/Field"
 * import * as S from "effect/Schema"
 *
 * const fields = { age: makeField("age", S.Number) }
 * const value: DecodedFromFields<typeof fields> = { age: 42 }
 * console.log(value.age) // 42
 * ```
 *
 * @category type-level
 * @since 0.0.0
 */
export type DecodedFromFields<T extends FieldsRecord> = {
  readonly [K in keyof T]: T[K] extends FieldDef<string, infer Schema>
    ? S.Schema.Type<Schema>
    : T[K] extends ArrayFieldDef<string, infer Schema>
      ? ReadonlyArray<S.Schema.Type<Schema>>
      : never;
};

const tryServiceFreeSchemaDefault = (schema: S.Top): unknown | undefined => {
  const valueSchema = S.Struct({ value: schema });
  const valueExit = decodeTopUnknownExit(valueSchema)({}, { disableChecks: true });
  if (Exit.isSuccess(valueExit)) {
    const value = valueExit.value;
    if (P.isObject(value) && P.hasProperty(value, "value")) {
      return value.value;
    }
  }

  const directExit = decodeTopUnknownExit(schema)(undefined, { disableChecks: true });
  if (Exit.isSuccess(directExit)) {
    return directExit.value;
  }

  return undefined;
};

const astPropertyName = (name: PropertyKey): string =>
  P.isString(name) ? name : P.isNumber(name) ? `${name}` : (name.description ?? "");

const getDefaultFromAst: (ast: AST.AST) => unknown = Match.type<AST.AST>().pipe(
  Match.withReturnType<unknown>(),
  Match.tag("String", "TemplateLiteral", () => ""),
  Match.tag("Number", () => 0),
  Match.tag("Boolean", () => false),
  Match.tag("BigInt", () => BigInt(0)),
  Match.tag("Literal", (ast) => ast.literal),
  Match.tag("Enum", (ast) =>
    pipe(
      A.head(ast.enums),
      O.map((entry) => entry[1]),
      O.getOrUndefined
    )
  ),
  Match.tag("Objects", (ast) =>
    R.fromEntries(
      A.map(ast.propertySignatures, (prop) => [astPropertyName(prop.name), getDefaultFromAst(prop.type)] as const)
    )
  ),
  Match.tag("Arrays", () => []),
  Match.tag("Union", (ast) => pipe(A.head(ast.types), O.map(getDefaultFromAst), O.getOrUndefined)),
  Match.tag("Never", "Undefined", "Void", () => undefined),
  Match.tag("Null", () => null),
  Match.tag("Suspend", (ast) => getDefaultFromAst(ast.thunk())),
  Match.orElse(() => "")
);

/**
 * Produces a best-effort encoded default value for a schema.
 *
 * @example
 * ```ts
 * import { getDefaultFromSchema } from "@beep/form/core/Field"
 * import * as S from "effect/Schema"
 *
 * console.log(getDefaultFromSchema(S.String)) // ""
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const getDefaultFromSchema = (schema: S.Top): unknown =>
  tryServiceFreeSchemaDefault(schema) ?? getDefaultFromAst(AST.toEncoded(schema.ast));

/**
 * Builds encoded defaults for every field in a field record.
 *
 * @example
 * ```ts
 * import { getDefaultEncodedValues, makeField } from "@beep/form/core/Field"
 * import * as S from "effect/Schema"
 *
 * const defaults = getDefaultEncodedValues({ name: makeField("name", S.String) })
 * console.log(defaults.name) // ""
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const getDefaultEncodedValues = (fields: FieldsRecord): Record<string, unknown> =>
  R.fromEntries(
    A.map(R.toEntries(fields), ([key, def]) => [key, isArrayFieldDef(def) ? [] : getDefaultFromSchema(def.schema)])
  );

/**
 * Creates a touched-state record for every field.
 *
 * @example
 * ```ts
 * import { createTouchedRecord, makeField } from "@beep/form/core/Field"
 * import * as S from "effect/Schema"
 *
 * const touched = createTouchedRecord({ name: makeField("name", S.String) }, false)
 * console.log(touched.name) // false
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const createTouchedRecord = (fields: FieldsRecord, value: boolean): Record<string, boolean> =>
  R.fromEntries(A.map(R.keys(fields), (key) => [key, value]));

/**
 * Extracts field definitions from a struct-like schema.
 *
 * @example
 * ```ts
 * import { extractStructFieldDefs } from "@beep/form/core/Field"
 * import * as S from "effect/Schema"
 *
 * const fields = extractStructFieldDefs(S.Struct({ name: S.String }))
 * console.log(fields?.[0]?.key) // "name"
 * ```
 *
 * @category destructors
 * @since 0.0.0
 */
export const extractStructFieldDefs = (schema: S.Top): ReadonlyArray<FieldDef<string, S.Top>> | undefined => {
  const unwrapObjects = (ast: AST.AST): AST.Objects | undefined => {
    if (AST.isObjects(ast)) return ast;
    if (AST.isSuspend(ast)) return unwrapObjects(ast.thunk());
    if (AST.isUnion(ast)) {
      return pipe(A.findFirst(ast.types, AST.isObjects), O.getOrUndefined);
    }
    return undefined;
  };

  const objects = unwrapObjects(schema.ast);
  if (objects === undefined) return undefined;

  return A.map(objects.propertySignatures, (prop) => makeField(astPropertyName(prop.name), S.make(prop.type)));
};

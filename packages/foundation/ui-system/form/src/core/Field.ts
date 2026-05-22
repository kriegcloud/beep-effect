import * as Exit from "effect/Exit";
import * as S from "effect/Schema";
import * as AST from "effect/SchemaAST";

type DecodeTopUnknownExit = (
  schema: S.Top,
  options?: AST.ParseOptions
) => (input: unknown, options?: AST.ParseOptions) => Exit.Exit<unknown, S.SchemaError>;

const decodeTopUnknownExit = S.decodeUnknownExit as DecodeTopUnknownExit;

export const TypeId: unique symbol = Symbol.for("@beep/form/Field");

export type TypeId = typeof TypeId;

export interface FieldDef<K extends string, Schema extends S.Top> {
  readonly _tag: "field";
  readonly key: K;
  readonly schema: Schema;
}

export interface ArrayFieldDef<K extends string, Schema extends S.Top> {
  readonly _tag: "array";
  readonly itemSchema: Schema;
  readonly key: K;
}

export type AnyFieldDef = FieldDef<string, S.Top> | ArrayFieldDef<string, S.Top>;

export type FieldsRecord = Record<string, AnyFieldDef>;

export const isArrayFieldDef = (def: AnyFieldDef): def is ArrayFieldDef<string, S.Top> =>
  def._tag === "array";

export const isFieldDef = (def: AnyFieldDef): def is FieldDef<string, S.Top> => def._tag === "field";

export const makeField = <K extends string, Schema extends S.Top>(key: K, schema: Schema): FieldDef<K, Schema> => ({
  _tag: "field",
  key,
  schema,
});

export const makeArrayField = <K extends string, Schema extends S.Top>(
  key: K,
  itemSchema: Schema
): ArrayFieldDef<K, Schema> => ({
  _tag: "array",
  key,
  itemSchema,
});

export type EncodedFromFields<T extends FieldsRecord> = {
  readonly [K in keyof T]: T[K] extends FieldDef<string, infer Schema>
    ? S.Codec.Encoded<Schema>
    : T[K] extends ArrayFieldDef<string, infer Schema>
      ? ReadonlyArray<S.Codec.Encoded<Schema>>
      : never;
};

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
    if (typeof value === "object" && value !== null && "value" in value) {
      return value.value;
    }
  }

  const directExit = decodeTopUnknownExit(schema)(undefined, { disableChecks: true });
  if (Exit.isSuccess(directExit)) {
    return directExit.value;
  }

  return undefined;
};

const getDefaultFromAst = (ast: AST.AST): unknown => {
  switch (ast._tag) {
    case "String":
    case "TemplateLiteral":
      return "";
    case "Number":
      return 0;
    case "Boolean":
      return false;
    case "BigInt":
      return BigInt(0);
    case "Literal":
      return ast.literal;
    case "Enum": {
      const first = ast.enums[0];
      return first !== undefined ? first[1] : undefined;
    }
    case "Objects": {
      const result: Record<string, unknown> = {};
      for (const prop of ast.propertySignatures) {
        result[String(prop.name)] = getDefaultFromAst(prop.type);
      }
      return result;
    }
    case "Arrays":
      return [];
    case "Union": {
      const first = ast.types[0];
      return first !== undefined ? getDefaultFromAst(first) : undefined;
    }
    case "Never":
    case "Undefined":
    case "Void":
      return undefined;
    case "Null":
      return null;
    case "Suspend":
      return getDefaultFromAst(ast.thunk());
    default:
      return "";
  }
};

export const getDefaultFromSchema = (schema: S.Top): unknown =>
  tryServiceFreeSchemaDefault(schema) ?? getDefaultFromAst(AST.toEncoded(schema.ast));

export const getDefaultEncodedValues = (fields: FieldsRecord): Record<string, unknown> => {
  const result: Record<string, unknown> = {};
  for (const [key, def] of Object.entries(fields)) {
    if (isArrayFieldDef(def)) {
      result[key] = [];
    } else {
      result[key] = getDefaultFromSchema(def.schema);
    }
  }
  return result;
};

export const createTouchedRecord = (fields: FieldsRecord, value: boolean): Record<string, boolean> => {
  const result: Record<string, boolean> = {};
  for (const key of Object.keys(fields)) {
    result[key] = value;
  }
  return result;
};

export const extractStructFieldDefs = (
  schema: S.Top
): ReadonlyArray<FieldDef<string, S.Top>> | undefined => {
  const unwrapObjects = (ast: AST.AST): AST.Objects | undefined => {
    if (AST.isObjects(ast)) return ast;
    if (AST.isSuspend(ast)) return unwrapObjects(ast.thunk());
    if (AST.isUnion(ast)) {
      const firstObject = ast.types.find(AST.isObjects);
      return firstObject ?? undefined;
    }
    return undefined;
  };

  const objects = unwrapObjects(schema.ast);
  if (objects === undefined) return undefined;

  return objects.propertySignatures.map((prop) => makeField(String(prop.name), S.make(prop.type)));
};

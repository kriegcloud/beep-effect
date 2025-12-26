import { thunkEmptyStr, thunkFalse } from "@beep/utils/thunk";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as HashSet from "effect/HashSet";
import * as Match from "effect/Match";
import * as Num from "effect/Number";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as AST from "effect/SchemaAST";
import * as Str from "effect/String";
import { AutoIncrement, ColumnType, Default, PrimaryKeyId, Unique } from "./column-annotations.ts";
import { PgDSL } from "./db-schema/mod.ts";

/**
 * Maps a schema to a SQLite column definition, respecting column annotations.
 *
 * Note: When used with schema-based table definitions, optional fields (| undefined)
 * are transformed to nullable fields (| null) to match SQLite's NULL semantics.
 * Fields with both null and undefined will emit a warning as this is a lossy conversion.
 */
export const getColumnDefForSchema = (
  schema: S.Schema.AnyNoContext,
  propertySignature?: undefined | AST.PropertySignature,
  forceNullable = false
): PgDSL.ColumnDefinition.Any => {
  const ast = schema.ast;

  // Extract annotations
  const getAnnotation = <T>(annotationId: symbol): O.Option<T> =>
    propertySignature
      ? hasPropertyAnnotation<T>(propertySignature, annotationId)
      : AST.getAnnotation<T>(annotationId)(ast);

  const columnType = AST.getAnnotation<PgDSL.FieldColumnType.Type>(ColumnType)(ast);

  // Check if schema has null (e.g., S.NullOr) or undefined or if it's forced nullable (optional field)
  const isNullable = forceNullable || hasNull(ast) || hasUndefined(ast);

  // Get base column definition with nullable flag
  const baseColumn = O.isSome(columnType)
    ? getColumnForType(columnType.value, isNullable)
    : getColumnForSchema(schema, isNullable);

  // Apply annotations
  const primaryKey = getAnnotation<boolean>(PrimaryKeyId).pipe(O.getOrElse(thunkFalse));
  const autoIncrement = getAnnotation<boolean>(AutoIncrement).pipe(O.getOrElse(thunkFalse));
  const defaultValue = getAnnotation<unknown>(Default);

  return {
    ...baseColumn,
    ...(primaryKey && { primaryKey: true }),
    ...(autoIncrement && { autoIncrement: true }),
    ...(O.isSome(defaultValue) && { default: O.some(defaultValue.value) }),
  };
};

const hasPropertyAnnotation = <T>(propertySignature: AST.PropertySignature, annotationId: symbol): O.Option<T> => {
  if ("annotations" in propertySignature && propertySignature.annotations) {
    const annotation = AST.getAnnotation<T>(annotationId)(propertySignature as any);
    if (O.isSome(annotation)) return annotation;
  }
  return AST.getAnnotation<T>(annotationId)(propertySignature.type);
};

/**
 * Maps schema property signatures to SQLite column definitions.
 * Optional fields (| undefined) become nullable columns (| null).
 */
export const schemaFieldsToColumns = (
  propertySignatures: ReadonlyArray<AST.PropertySignature>
): { columns: PgDSL.Columns; uniqueColumns: string[] } => {
  return F.pipe(
    propertySignatures,
    A.reduce({ columns: {} as PgDSL.Columns, uniqueColumns: [] as string[] }, (acc, prop) => {
      if (!Str.isString(prop.name)) return acc;

      const fieldSchema = S.make(prop.type);

      // Warn about lossy conversion for fields with both null and undefined
      if (prop.isOptional) {
        const { hasNull, hasUndefined } = checkNullUndefined(fieldSchema.ast);
        if (hasNull && hasUndefined) {
          console.warn(`Field '${prop.name}' has both null and undefined - treating | undefined as | null`);
        }
      }

      // Get column definition - pass nullable flag for optional fields
      const columnDef = getColumnDefForSchema(fieldSchema, prop, prop.isOptional);

      // Check for primary key and unique annotations
      const hasPrimaryKey = hasPropertyAnnotation<boolean>(prop, PrimaryKeyId).pipe(O.getOrElse(thunkFalse));
      const hasUnique = hasPropertyAnnotation<boolean>(prop, Unique).pipe(O.getOrElse(thunkFalse));

      // Build final column
      const column = {
        ...columnDef,
        ...(hasPrimaryKey && { primaryKey: true }),
      };

      // Validate primary key + nullable
      if (column?.primaryKey && column.nullable) {
        throw new Error("Primary key columns cannot be nullable");
      }

      return {
        columns: { ...acc.columns, [prop.name]: column },
        uniqueColumns: hasUnique ? [...acc.uniqueColumns, prop.name] : acc.uniqueColumns,
      };
    })
  );
};

const checkNullUndefined = (ast: AST.AST): { hasNull: boolean; hasUndefined: boolean } => {
  const visit = (type: AST.AST): { hasNull: boolean; hasUndefined: boolean } => {
    if (AST.isUndefinedKeyword(type)) {
      return { hasNull: false, hasUndefined: true };
    }
    if (AST.isLiteral(type) && type.literal === null) {
      return { hasNull: true, hasUndefined: false };
    }
    if (AST.isUnion(type)) {
      return F.pipe(
        type.types,
        A.reduce({ hasNull: false as boolean, hasUndefined: false as boolean }, (acc, t) => {
          const result = visit(t);
          return {
            hasNull: acc.hasNull || result.hasNull,
            hasUndefined: acc.hasUndefined || result.hasUndefined,
          };
        })
      );
    }
    return { hasNull: false, hasUndefined: false };
  };

  return visit(ast);
};

const hasNull = (ast: AST.AST): boolean => {
  if (AST.isLiteral(ast) && ast.literal === null) return true;
  if (AST.isUnion(ast)) {
    return F.pipe(ast.types, A.some(hasNull));
  }
  return false;
};

const hasUndefined = (ast: AST.AST): boolean => {
  if (AST.isUndefinedKeyword(ast)) return true;
  if (AST.isUnion(ast)) {
    return F.pipe(ast.types, A.some(hasUndefined));
  }
  return false;
};
const getColumnForType = (columnType: string, nullable = false): PgDSL.ColumnDefinition.Any =>
  Match.value(columnType).pipe(
    Match.when("text", () => PgDSL.text({ nullable })),
    Match.when("integer", () => PgDSL.integer({ nullable })),
    Match.when("real", () => PgDSL.real({ nullable })),
    Match.when("blob", () => PgDSL.blob({ nullable })),
    Match.orElseAbsurd
  );
// const getColumnForType = (columnType: string, nullable = false): PgDSL.ColumnDefinition.Any => {
//   switch (columnType) {
//     case 'text':
//       return PgDSL.text({ nullable })
//     case 'integer':
//       return PgDSL.integer({ nullable })
//     case 'real':
//       return PgDSL.real({ nullable })
//     case 'blob':
//       return PgDSL.blob({ nullable })
//     default:
//       return shouldNeverHappen(`Unsupported column type: ${columnType}`)
//   }
// }

const getColumnForSchema = (schema: S.Schema.AnyNoContext, nullable = false): PgDSL.ColumnDefinition.Any => {
  const ast = schema.ast;
  // Strip nullable wrapper to get core type
  const coreAst = stripNullable(ast);
  const coreSchema = stripNullable(ast) === ast ? schema : S.make(coreAst);

  // Special case: Boolean is transformed to integer in SQLite
  if (AST.isBooleanKeyword(coreAst)) {
    return PgDSL.boolean({ nullable });
  }

  // Get the encoded AST - what actually gets stored in SQLite
  const encodedAst = S.encodedSchema(coreSchema).ast;

  // Check if the encoded type matches SQLite native types
  if (AST.isStringKeyword(encodedAst)) {
    return PgDSL.text({ schema: coreSchema, nullable });
  }

  if (AST.isNumberKeyword(encodedAst)) {
    // Special cases for integer columns
    const id = AST.getIdentifierAnnotation(coreAst).pipe(O.getOrElse(thunkEmptyStr));
    if (id === "Int" || id === "DateFromNumber") {
      return PgDSL.integer({ schema: coreSchema, nullable });
    }
    return PgDSL.real({ schema: coreSchema, nullable });
  }

  if (isUint8ArraySchema(coreAst) || isUint8ArraySchema(encodedAst)) {
    return PgDSL.blob({ schema: S.Uint8ArrayFromSelf as S.Schema<Uint8Array<ArrayBuffer>>, nullable });
  }

  const literalColumn = getLiteralColumnDefinition(encodedAst, coreSchema, nullable, coreAst);
  if (literalColumn) return literalColumn;

  // Fallback to checking the original AST in case the encoded schema differs
  const coreLiteralColumn = getLiteralColumnDefinition(coreAst, coreSchema, nullable, coreAst);
  if (coreLiteralColumn) return coreLiteralColumn;

  // Everything else needs JSON encoding
  return PgDSL.json({ schema: coreSchema, nullable });
};

const stripNullable = (ast: AST.AST): AST.AST => {
  if (!AST.isUnion(ast)) return ast;

  // Filter out null/undefined members while preserving any annotations on the union
  const coreTypes = F.pipe(
    ast.types,
    A.filter((type) => !(AST.isLiteral(type) && type.literal === null) && !AST.isUndefinedKeyword(type))
  );

  if (coreTypes.length === 0 || coreTypes.length === ast.types.length) {
    return ast;
  }

  if (coreTypes.length === 1) {
    return coreTypes[0]!;
  }

  return AST.Union.make(coreTypes, ast.annotations);
};

const getLiteralColumnDefinition = (
  ast: AST.AST,
  schema: S.Schema.AnyNoContext,
  nullable: boolean,
  sourceAst: AST.AST
): PgDSL.ColumnDefinition.Any | null => {
  const literalValues = extractLiteralValues(ast);
  if (!literalValues) return null;

  const literalType = getLiteralValueType(literalValues);

  return Match.value(literalType).pipe(
    Match.when("string", () => PgDSL.text({ schema, nullable })),
    Match.when("number", () => {
      const id = AST.getIdentifierAnnotation(sourceAst).pipe(O.getOrElse(thunkEmptyStr));
      if (id === "Int" || id === "DateFromNumber") {
        return PgDSL.integer({ schema, nullable });
      }

      const useIntegerColumn =
        F.pipe(literalValues, A.length, Num.greaterThan(1)) &&
        F.pipe(
          literalValues,
          A.every((value) => typeof value === "number" && Number.isInteger(value))
        );

      return useIntegerColumn ? PgDSL.integer({ schema, nullable }) : PgDSL.real({ schema, nullable });
    }),
    Match.when("boolean", () => PgDSL.boolean({ nullable })),
    Match.when("bigint", () => PgDSL.integer({ schema, nullable })),
    Match.orElse(() => null)
  );
};

const extractLiteralValues = (ast: AST.AST): ReadonlyArray<AST.LiteralValue> | null => {
  if (AST.isLiteral(ast)) return A.make(ast.literal);

  if (AST.isUnion(ast) && F.pipe(ast.types, A.isNonEmptyReadonlyArray) && F.pipe(ast.types, A.every(AST.isLiteral))) {
    return F.pipe(
      ast.types,
      A.map((type) => {
        if (AST.isLiteral(type)) return type.literal;
        // This branch should never be reached due to A.every(AST.isLiteral) check above
        return null;
      })
    );
  }

  return null;
};

const getLiteralValueType = (
  literals: ReadonlyArray<AST.LiteralValue>
): "string" | "number" | "boolean" | "bigint" | null => {
  const literalTypes = F.pipe(
    literals,
    A.map((value) => (value === null ? "null" : typeof value)),
    HashSet.fromIterable
  );

  if (F.pipe(literalTypes, HashSet.size) !== 1) return null;

  const literalType = F.pipe(literalTypes, HashSet.values, A.fromIterable, A.head, O.getOrNull);

  if (literalType === "string" || literalType === "number" || literalType === "boolean" || literalType === "bigint") {
    return literalType;
  }
  return null;
};

const isUint8ArraySchema = (ast: AST.AST): boolean => {
  const identifier = AST.getIdentifierAnnotation(ast);
  if (O.isSome(identifier) && F.pipe(identifier.value, Str.includes("Uint8Array"))) {
    return true;
  }

  if (AST.isTupleType(ast)) {
    return (
      F.pipe(ast.elements, A.isEmptyReadonlyArray) &&
      F.pipe(ast.rest, A.length) === 1 &&
      AST.isNumberKeyword(ast.rest[0]!.type)
    );
  }

  return false;
};

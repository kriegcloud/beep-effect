import { $SchemaId } from "@beep/identity";
import { LiteralKit } from "@beep/schema/LiteralKit";
import { MappedLiteralKit } from "@beep/schema/MappedLiteralKit";
import * as Str from "@beep/utils/Str";
import * as S from "effect/Schema";

const $I = $SchemaId.create("Sql/Sql");

export const Dialect = LiteralKit([
  "pg",
  "mysql",
  "sqlite",
  "singlestore",
  "mssql",
  "common",
  "gel",
  "cockroach",
]).annotate(
  $I.annote("Dialect", {
    description: "Database dialects supported by the SQL module",
  })
);

export type Dialect = typeof Dialect.Type;

export const ColumnDataType = LiteralKit([
  "array",
  "bigint",
  "boolean",
  "custom",
  "number",
  "object",
  "string",
]).annotate(
  $I.annote("ColumnDataType", {
    description: "Data types supported by SQL columns",
  })
);

export type ColumnDataType = typeof ColumnDataType.Type;

export const ColumnDataArrayConstraint = LiteralKit([
  "vector",
  "int64vector",
  "halfvector",
  "basecolumn",
  "point",
  "geometry",
  "line",
]).annotate(
  $I.annote("ColumnDataArrayConstraint", {
    description: "Array constraints supported by SQL columns",
  })
);

export type ColumnDataArrayConstraint = typeof ColumnDataArrayConstraint.Type;

export const ColumnDataBigIntConstraint = LiteralKit(["int64", "uint64"]).annotate(
  $I.annote("ColumnDataBigIntConstraint", {
    description: "BigInt constraints supported by SQL columns",
  })
);

export type ColumnDataBigIntConstraint = typeof ColumnDataBigIntConstraint.Type;

export const ColumnDataNumberConstraint = LiteralKit([
  "double",
  "float",
  "int8",
  "int16",
  "int24",
  "int32",
  "int53",
  "udouble",
  "ufloat",
  "uint8",
  "uint16",
  "uint24",
  "uint32",
  "uint53",
  "unsigned",
  "year",
]).annotate(
  $I.annote("ColumnDataNumberConstraint", {
    description: "Number constraints supported by SQL columns",
  })
);

export type ColumnDataNumberConstraint = typeof ColumnDataNumberConstraint.Type;

export const ColumnDataObjectConstraint = LiteralKit([
  "buffer",
  "date",
  "geometry",
  "json",
  "line",
  "point",
  // Gel-specific
  "dateDuration",
  "duration",
  "localDate",
  "localDateTime",
  "localTime",
  "relDuration",
]).annotate(
  $I.annote("ColumnDataObjectConstraint", {
    description: "Object constraints supported by SQL columns",
  })
);

export type ColumnDataObjectConstraint = typeof ColumnDataObjectConstraint.Type;

export const ColumnDataStringConstraint = LiteralKit([
  "binary",
  "cidr",
  "date",
  "datetime",
  "enum",
  "inet",
  "int64",
  "interval",
  "macaddr",
  "macaddr8",
  "numeric",
  "sparsevec",
  "time",
  "timestamp",
  "uint64",
  "unumeric",
  "uuid",
]).annotate(
  $I.annote("ColumnDataStringConstraint", {
    description: "String constraints supported by SQL columns",
  })
);

export type ColumnDataStringConstraint = typeof ColumnDataStringConstraint.Type;

export const ColumnDataConstraint = LiteralKit([
  ...ColumnDataArrayConstraint.Options,
  ...ColumnDataBigIntConstraint.Options,
  ...ColumnDataNumberConstraint.Options,
  ...ColumnDataObjectConstraint.Options,
  ...ColumnDataStringConstraint.Options,
]).annotate(
  $I.annote("ColumnDataConstraint", {
    description: "All constraints supported by SQL columns",
  })
);

export type ColumnDataConstraint = typeof ColumnDataConstraint.Type;

// const
const prefixTypeMap = {
  array: Str.mapPrefix("array " as const),
  bigint: Str.mapPrefix("bigint " as const),
  number: Str.mapPrefix("number " as const),
  object: Str.mapPrefix("object " as const),
  string: Str.mapPrefix("string " as const),
};

export const ColumnType = LiteralKit([
  ...ColumnDataType.Options,
  ...prefixTypeMap.array(ColumnDataArrayConstraint.Options),
  ...prefixTypeMap.bigint(ColumnDataBigIntConstraint.Options),
  ...prefixTypeMap.number(ColumnDataNumberConstraint.Options),
  ...prefixTypeMap.object(ColumnDataObjectConstraint.Options),
  ...prefixTypeMap.string(ColumnDataStringConstraint.Options),
]).annotate(
  $I.annote("ColumnType", {
    description: "All column types supported by SQL columns",
  })
);

export type ColumnType = typeof ColumnType.Type;

export const UpdateDeleteAction = LiteralKit(["cascade", "restrict", "no action", "set null", "set default"]).annotate(
  $I.annote("UpdateDeleteAction", {
    description: "All actions supported by SQL update and delete operations",
  })
);

export type UpdateDeleteAction = typeof UpdateDeleteAction.Type;

export const DimensionStringFromNumber = MappedLiteralKit([
  [0, "[]"],
  [1, "[][]"],
  [2, "[][][]"],
  [3, "[][][][]"],
  [4, "[][][][][]"],
  [5, "[][][][][][]"],
]).annotate(
  $I.annote("DimensionStringFromNumber", {
    description: "All array dimensions supported by SQL columns as string",
  })
);

export declare namespace DimensionStringFromNumber {
  export type Type = typeof DimensionStringFromNumber.Type;
  export type Encoded = keyof typeof DimensionStringFromNumber.Encoded;
}

export const ArrayDimension = LiteralKit(DimensionStringFromNumber.From.Options).annotate(
  $I.annote("ArrayDimension", {
    description: "All array dimensions supported by SQL columns",
  })
);

export type ArrayDimension = typeof ArrayDimension.Type;

export const ArrayDimensionString = LiteralKit(DimensionStringFromNumber.To.Options).annotate(
  $I.annote("ArrayDimensionString", {
    description: "All array dimensions supported by SQL columns as string",
  })
);

export type ArrayDimensionString = typeof ArrayDimensionString.Type;

export const PolicyConfigAs = LiteralKit(["permissive", "restrictive"]).annotate(
  $I.annote("PolicyConfigAs", {
    description: "All policy configuration options supported by SQL columns",
  })
);
export type PolicyConfigAs = typeof PolicyConfigAs.Type;

export const PolicyConfigFor = LiteralKit(["all", "select", "insert", "update", "delete"]).annotate(
  $I.annote("PolicyConfigFor", {
    description: "All policy configuration options supported by SQL columns",
  })
);

export type PolicyConfigFor = typeof PolicyConfigFor.Type;

export const Casing = LiteralKit(["snake_case", "camelCase"]).annotate(
  $I.annote("Casing", {
    description: "Casing configuration for sql",
  })
);

export type Casing = typeof Casing.Type;

export const RelationType = LiteralKit(["many", "one"]).annotate(
  $I.annote("RelationType", {
    description: "All relation types supported by SQL columns",
  })
);

export type RelationType = typeof RelationType.Type;

export declare namespace ColumnDataType {
  export type Enum = typeof ColumnDataType.Enum;
  export type Map = {
    readonly [K in keyof Enum]: Enum[K];
  };
  export type NarrowTo<T extends ColumnDataType> = Enum[T];
  export type SchemaMember<TType extends ColumnDataType, TConstraint extends ColumnDataConstraint> = S.Struct<{
    type: S.tag<TType>;
    constraint: S.tag<TConstraint>;
  }>;
}

export interface ColumnTypeData<
  TType extends ColumnDataType = ColumnDataType,
  TConstraint extends ColumnDataConstraint | undefined = ColumnDataConstraint | undefined,
> {
  type: TType;
  constraint: TConstraint;
}

export type Assume<T, U> = T extends U ? T : U;

export type ExtractColumnTypeData<T extends ColumnType> =
  T extends `${infer Type extends ColumnDataType} ${infer Constraint extends ColumnDataConstraint}`
    ? ColumnTypeData<Type, Constraint>
    : ColumnTypeData<Assume<T, ColumnDataType>, undefined>;

export const ArrayColumnTypeDataConstraint = S.TemplateLiteralParser([
  ColumnType.Enum.array,
  " ",
  ColumnDataArrayConstraint,
]).annotate(
  $I.annote("ArrayColumnTypeDataConstraint", {
    description: "Constraint for column data of type array",
  })
);

export declare namespace ArrayColumnTypeDataConstraint {
  export type Type = typeof ArrayColumnTypeDataConstraint.Type;
  export type Encoded = typeof ArrayColumnTypeDataConstraint.Encoded;
}

export const BigIntColumnTypeDataConstraint = S.TemplateLiteralParser([
  ColumnType.Enum.bigint,
  " ",
  ColumnDataBigIntConstraint,
]).annotate(
  $I.annote("BigIntColumnTypeDataConstraint", {
    description: "Constraint for column data of type bigint",
  })
);

export declare namespace BigIntColumnTypeDataConstraint {
  export type Type = typeof BigIntColumnTypeDataConstraint.Type;
  export type Encoded = typeof BigIntColumnTypeDataConstraint.Encoded;
}

export const NumberColumnTypeDataConstraint = S.TemplateLiteralParser([
  ColumnType.Enum.number,
  " ",
  ColumnDataNumberConstraint,
]).annotate(
  $I.annote("NumberColumnTypeDataConstraint", {
    description: "Constraint for column data of type number",
  })
);
export declare namespace NumberColumnTypeDataConstraint {
  export type Type = typeof NumberColumnTypeDataConstraint.Type;
  export type Encoded = typeof NumberColumnTypeDataConstraint.Encoded;
}

export const ObjectColumnTypeDataConstraint = S.TemplateLiteralParser([
  ColumnType.Enum.object,
  " ",
  ColumnDataObjectConstraint,
]).annotate(
  $I.annote("ObjectColumnTypeDataConstraint", {
    description: "Constraint for column data of type object",
  })
);
export declare namespace ObjectColumnTypeDataConstraint {
  export type Type = typeof ObjectColumnTypeDataConstraint.Type;
  export type Encoded = typeof ObjectColumnTypeDataConstraint.Encoded;
}
export const StringColumnTypeDataConstraint = S.TemplateLiteralParser([
  ColumnType.Enum.string,
  " ",
  ColumnDataStringConstraint,
]).annotate(
  $I.annote("StringColumnTypeDataConstraint", {
    description: "Constraint for column data of type string",
  })
);
export declare namespace StringColumnTypeDataConstraint {
  export type Type = typeof StringColumnTypeDataConstraint.Type;
  export type Encoded = typeof StringColumnTypeDataConstraint.Encoded;
}

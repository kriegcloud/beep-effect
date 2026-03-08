import { $SchemaId } from "@beep/identity";
import { LiteralKit } from "@beep/schema/LiteralKit";
import { MappedLiteralKit } from "@beep/schema/MappedLiteralKit";
import { Str } from "@beep/utils";
import * as S from "effect/Schema";
import { VariantSchema } from "effect/unstable/schema";

const $I = $SchemaId.create("Sql/Sql");

/**
 * @since 0.0.0
 * @category Validation
 */
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

/**
 * @since 0.0.0
 * @category DomainModel
 */
export type Dialect = typeof Dialect.Type;

/**
 * @since 0.0.0
 * @category Validation
 */
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

/**
 * @since 0.0.0
 * @category DomainModel
 */
export type ColumnDataType = typeof ColumnDataType.Type;

/**
 * @since 0.0.0
 * @category Validation
 */
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

/**
 * @since 0.0.0
 * @category DomainModel
 */
export type ColumnDataArrayConstraint = typeof ColumnDataArrayConstraint.Type;

/**
 * @since 0.0.0
 * @category Validation
 */
export const ColumnDataBigIntConstraint = LiteralKit(["int64", "uint64"]).annotate(
  $I.annote("ColumnDataBigIntConstraint", {
    description: "BigInt constraints supported by SQL columns",
  })
);

/**
 * @since 0.0.0
 * @category DomainModel
 */
export type ColumnDataBigIntConstraint = typeof ColumnDataBigIntConstraint.Type;

/**
 * @since 0.0.0
 * @category Validation
 */
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

/**
 * @since 0.0.0
 * @category DomainModel
 */
export type ColumnDataNumberConstraint = typeof ColumnDataNumberConstraint.Type;

/**
 * @since 0.0.0
 * @category Validation
 */
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

/**
 * @since 0.0.0
 * @category DomainModel
 */
export type ColumnDataObjectConstraint = typeof ColumnDataObjectConstraint.Type;

/**
 * @since 0.0.0
 * @category Validation
 */
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

/**
 * @since 0.0.0
 * @category DomainModel
 */
export type ColumnDataStringConstraint = typeof ColumnDataStringConstraint.Type;

/**
 * @since 0.0.0
 * @category Validation
 */
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

/**
 * @since 0.0.0
 * @category DomainModel
 */
export type ColumnDataConstraint = typeof ColumnDataConstraint.Type;

// const
const prefixTypeMap = {
  array: Str.mapPrefix("array " as const),
  bigint: Str.mapPrefix("bigint " as const),
  number: Str.mapPrefix("number " as const),
  object: Str.mapPrefix("object " as const),
  string: Str.mapPrefix("string " as const),
};

/**
 * @since 0.0.0
 * @category Validation
 */
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

/**
 * @since 0.0.0
 * @category DomainModel
 */
export type ColumnType = typeof ColumnType.Type;

/**
 * @since 0.0.0
 * @category Validation
 */
export const UpdateDeleteAction = LiteralKit(["cascade", "restrict", "no action", "set null", "set default"]).annotate(
  $I.annote("UpdateDeleteAction", {
    description: "All actions supported by SQL update and delete operations",
  })
);

/**
 * @since 0.0.0
 * @category DomainModel
 */
export type UpdateDeleteAction = typeof UpdateDeleteAction.Type;

/**
 * @since 0.0.0
 * @category Validation
 */
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

/**
 * @since 0.0.0
 * @category DomainModel
 */
export declare namespace DimensionStringFromNumber {
  /**
   * @since 0.0.0
   */
  export type Type = typeof DimensionStringFromNumber.Type;
  /**
   * @since 0.0.0
   */
  export type Encoded = keyof typeof DimensionStringFromNumber.Encoded;
}

/**
 * @since 0.0.0
 * @category Validation
 */
export const ArrayDimension = LiteralKit(DimensionStringFromNumber.From.Options).annotate(
  $I.annote("ArrayDimension", {
    description: "All array dimensions supported by SQL columns",
  })
);

/**
 * @since 0.0.0
 * @category DomainModel
 */
export type ArrayDimension = typeof ArrayDimension.Type;

/**
 * @since 0.0.0
 * @category Validation
 */
export const ArrayDimensionString = LiteralKit(DimensionStringFromNumber.To.Options).annotate(
  $I.annote("ArrayDimensionString", {
    description: "All array dimensions supported by SQL columns as string",
  })
);

/**
 * @since 0.0.0
 * @category DomainModel
 */
export type ArrayDimensionString = typeof ArrayDimensionString.Type;

/**
 * @since 0.0.0
 * @category Validation
 */
export const PolicyConfigAs = LiteralKit(["permissive", "restrictive"]).annotate(
  $I.annote("PolicyConfigAs", {
    description: "All policy configuration options supported by SQL columns",
  })
);
/**
 * @since 0.0.0
 * @category DomainModel
 */
export type PolicyConfigAs = typeof PolicyConfigAs.Type;

/**
 * @since 0.0.0
 * @category Validation
 */
export const PolicyConfigFor = LiteralKit(["all", "select", "insert", "update", "delete"]).annotate(
  $I.annote("PolicyConfigFor", {
    description: "All policy configuration options supported by SQL columns",
  })
);

/**
 * @since 0.0.0
 * @category DomainModel
 */
export type PolicyConfigFor = typeof PolicyConfigFor.Type;

/**
 * @since 0.0.0
 * @category Validation
 */
export const Casing = LiteralKit(["snake_case", "camelCase"]).annotate(
  $I.annote("Casing", {
    description: "Casing configuration for sql",
  })
);

/**
 * @since 0.0.0
 * @category DomainModel
 */
export type Casing = typeof Casing.Type;

/**
 * @since 0.0.0
 * @category Validation
 */
export const RelationType = LiteralKit(["many", "one"]).annotate(
  $I.annote("RelationType", {
    description: "All relation types supported by SQL columns",
  })
);

/**
 * @since 0.0.0
 * @category DomainModel
 */
export type RelationType = typeof RelationType.Type;

/**
 * @since 0.0.0
 * @category DomainModel
 */
export declare namespace ColumnDataType {
  /**
   * @since 0.0.0
   */
  export type Enum = typeof ColumnDataType.Enum;
  /**
   * @since 0.0.0
   */
  export type Map = {
    readonly [K in keyof Enum]: Enum[K];
  };
  /**
   * @since 0.0.0
   */
  export type NarrowTo<T extends ColumnDataType> = Enum[T];
  /**
   * @since 0.0.0
   */
  export type SchemaMember<TType extends ColumnDataType, TConstraint extends ColumnDataConstraint> = S.Struct<{
    type: S.tag<TType>;
    constraint: S.tag<TConstraint>;
  }>;
}

/**
 * @since 0.0.0
 * @category DomainModel
 */
export interface ColumnTypeData<
  TType extends ColumnDataType = ColumnDataType,
  TConstraint extends ColumnDataConstraint | undefined = ColumnDataConstraint | undefined,
> {
  constraint: TConstraint;
  type: TType;
}

/**
 * @since 0.0.0
 * @category Utility
 */
export type Assume<T, U> = T extends U ? T : U;

/**
 * @since 0.0.0
 * @category DomainModel
 */
export type ExtractColumnTypeData<T extends ColumnType> =
  T extends `${infer Type extends ColumnDataType} ${infer Constraint extends ColumnDataConstraint}`
    ? ColumnTypeData<Type, Constraint>
    : ColumnTypeData<Assume<T, ColumnDataType>, undefined>;

/**
 * @since 0.0.0
 * @category Validation
 */
export const ArrayColumnTypeDataConstraint = S.TemplateLiteralParser([
  ColumnType.Enum.array,
  " ",
  ColumnDataArrayConstraint,
]).annotate(
  $I.annote("ArrayColumnTypeDataConstraint", {
    description: "Constraint for column data of type array",
  })
);

/**
 * @since 0.0.0
 * @category DomainModel
 */
export declare namespace ArrayColumnTypeDataConstraint {
  /**
   * @since 0.0.0
   */
  export type Type = typeof ArrayColumnTypeDataConstraint.Type;
  /**
   * @since 0.0.0
   */
  export type Encoded = typeof ArrayColumnTypeDataConstraint.Encoded;
}

/**
 * @since 0.0.0
 * @category Validation
 */
export const BigIntColumnTypeDataConstraint = S.TemplateLiteralParser([
  ColumnType.Enum.bigint,
  " ",
  ColumnDataBigIntConstraint,
]).annotate(
  $I.annote("BigIntColumnTypeDataConstraint", {
    description: "Constraint for column data of type bigint",
  })
);

/**
 * @since 0.0.0
 * @category DomainModel
 */
export declare namespace BigIntColumnTypeDataConstraint {
  /**
   * @since 0.0.0
   */
  export type Type = typeof BigIntColumnTypeDataConstraint.Type;
  /**
   * @since 0.0.0
   */
  export type Encoded = typeof BigIntColumnTypeDataConstraint.Encoded;
}

/**
 * @since 0.0.0
 * @category Validation
 */
export const NumberColumnTypeDataConstraint = S.TemplateLiteralParser([
  ColumnType.Enum.number,
  " ",
  ColumnDataNumberConstraint,
]).annotate(
  $I.annote("NumberColumnTypeDataConstraint", {
    description: "Constraint for column data of type number",
  })
);
/**
 * @since 0.0.0
 * @category DomainModel
 */
export declare namespace NumberColumnTypeDataConstraint {
  /**
   * @since 0.0.0
   */
  export type Type = typeof NumberColumnTypeDataConstraint.Type;
  /**
   * @since 0.0.0
   */
  export type Encoded = typeof NumberColumnTypeDataConstraint.Encoded;
}

/**
 * @since 0.0.0
 * @category Validation
 */
export const ObjectColumnTypeDataConstraint = S.TemplateLiteralParser([
  ColumnType.Enum.object,
  " ",
  ColumnDataObjectConstraint,
]).annotate(
  $I.annote("ObjectColumnTypeDataConstraint", {
    description: "Constraint for column data of type object",
  })
);
/**
 * @since 0.0.0
 * @category DomainModel
 */
export declare namespace ObjectColumnTypeDataConstraint {
  /**
   * @since 0.0.0
   */
  export type Type = typeof ObjectColumnTypeDataConstraint.Type;
  /**
   * @since 0.0.0
   */
  export type Encoded = typeof ObjectColumnTypeDataConstraint.Encoded;
}
/**
 * @since 0.0.0
 * @category Validation
 */
export const StringColumnTypeDataConstraint = S.TemplateLiteralParser([
  ColumnType.Enum.string,
  " ",
  ColumnDataStringConstraint,
]).annotate(
  $I.annote("StringColumnTypeDataConstraint", {
    description: "Constraint for column data of type string",
  })
);
/**
 * @since 0.0.0
 * @category DomainModel
 */
export declare namespace StringColumnTypeDataConstraint {
  /**
   * @since 0.0.0
   */
  export type Type = typeof StringColumnTypeDataConstraint.Type;
  /**
   * @since 0.0.0
   */
  export type Encoded = typeof StringColumnTypeDataConstraint.Encoded;
}

/**
 * @since 0.0.0
 * @category DomainModel
 */
export interface MakeOptions<Variants extends ReadonlyArray<string>, Default extends Variants[number]> {
  readonly defaultVariant: Default;
  readonly variants: Variants;
}

/**
 * @since 0.0.0
 * @category DomainModel
 */
export interface MakeReturn<Variants extends ReadonlyArray<string>, Default extends Variants[number]> {
  readonly Class: ReturnType<typeof VariantSchema.make<Variants, Default>>["Class"];
  readonly extract: ReturnType<typeof VariantSchema.make<Variants, Default>>["extract"];
  readonly Field: ReturnType<typeof VariantSchema.make<Variants, Default>>["Field"];
  readonly FieldExcept: ReturnType<typeof VariantSchema.make<Variants, Default>>["FieldExcept"];
  readonly FieldOnly: ReturnType<typeof VariantSchema.make<Variants, Default>>["FieldOnly"];
  readonly fieldEvolve: ReturnType<typeof VariantSchema.make<Variants, Default>>["fieldEvolve"];
  readonly Struct: ReturnType<typeof VariantSchema.make<Variants, Default>>["Struct"];
  readonly Union: ReturnType<typeof VariantSchema.make<Variants, Default>>["Union"];
}

/**
 * @since 0.0.0
 * @category Utility
 */
export const make = <const Variants extends ReadonlyArray<string>, const Default extends Variants[number]>(
  options: MakeOptions<Variants, Default>
): MakeReturn<Variants, Default> => {
  return VariantSchema.make(options);
};

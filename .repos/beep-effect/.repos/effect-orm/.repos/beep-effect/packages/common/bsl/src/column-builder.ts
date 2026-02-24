import { $BslId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { ArrayUtils } from "@beep/utils";
import type * as A from "effect/Array";
import type { ColumnBaseConfig } from "./column";
import type { Column } from "./column.ts";
import { entityKind } from "./entity";
import type { ExtraConfigColumn, PgColumn, PgSequenceOptions } from "./pg-core/index";
import type { SQL } from "./sql/sql";
import type { Assume } from "./utils";

const $I = $BslId.create("BSL");

/**
 * Creates prefixed column type literals from constraint literals.
 *
 * @example
 * toColumnTypeFn(["vector", "point"], "array")
 * // => ["array vector", "array point"]
 */
const toColumnTypeFn = <const Literals extends A.NonEmptyReadonlyArray<string>, const Prefix extends string>(
  literals: Literals,
  prefix: Prefix
): A.NonEmptyReadonlyArray<`${Prefix} ${Literals[number]}`> =>
  ArrayUtils.NonEmptyReadonly.mapNonEmpty(literals, (opt) => `${prefix} ${opt}` as const);

// ─────────────────────────────────────────────────────────────────────────────
// Base Data Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Column data types representing the fundamental JavaScript/TypeScript types
 * that Drizzle maps to database columns.
 */
export class ColumnDataType extends BS.StringLiteralKit(
  "array",
  "bigint",
  "boolean",
  "custom",
  "number",
  "object",
  "string"
).annotations(
  $I.annotations("ColumnDataType", {
    description: "Base column data types for Drizzle ORM",
  })
) {}

export declare namespace ColumnDataType {
  export type Type = typeof ColumnDataType.Type;
}

// ─────────────────────────────────────────────────────────────────────────────
// Array Constraint
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Array-specific column data constraints including vectors, geometric types,
 * and base column references.
 */
export class ColumnDataArrayConstraint extends BS.StringLiteralKit(
  "vector",
  "int64vector",
  "halfvector",
  "basecolumn",
  "point",
  "geometry",
  "line"
).annotations(
  $I.annotations("ColumnDataArrayConstraint", {
    description: "Array column constraints including vectors and geometric types",
  })
) {
  static readonly toColumnType = toColumnTypeFn(this.Options, "array");
}

export declare namespace ColumnDataArrayConstraint {
  export type Type = typeof ColumnDataArrayConstraint.Type;
}

// ─────────────────────────────────────────────────────────────────────────────
// BigInt Constraint
// ─────────────────────────────────────────────────────────────────────────────

/**
 * BigInt-specific column data constraints for signed and unsigned 64-bit integers.
 */
export class ColumnDataBigIntConstraint extends BS.StringLiteralKit("int64", "uint64").annotations(
  $I.annotations("ColumnDataBigIntConstraint", {
    description: "BigInt column constraints for 64-bit integers",
  })
) {
  static readonly toColumnType = toColumnTypeFn(this.Options, "bigint");
}

export declare namespace ColumnDataBigIntConstraint {
  export type Type = typeof ColumnDataBigIntConstraint.Type;
}

// ─────────────────────────────────────────────────────────────────────────────
// Number Constraint
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Number-specific column data constraints covering various integer sizes,
 * floating-point types, and unsigned variants.
 */
export class ColumnDataNumberConstraint extends BS.StringLiteralKit(
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
  "year"
).annotations(
  $I.annotations("ColumnDataNumberConstraint", {
    description: "Number column constraints for integers and floating-point types",
  })
) {
  static readonly toColumnType = toColumnTypeFn(this.Options, "number");
}

export declare namespace ColumnDataNumberConstraint {
  export type Type = typeof ColumnDataNumberConstraint.Type;
}

// ─────────────────────────────────────────────────────────────────────────────
// Object Constraint
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Object-specific column data constraints including buffers, dates, JSON,
 * geometric types, and Gel-specific temporal types.
 */
export class ColumnDataObjectConstraint extends BS.StringLiteralKit(
  "buffer",
  "date",
  "geometry",
  "json",
  "line",
  "point",
  // Gel-specific temporal types
  "dateDuration",
  "duration",
  "localDate",
  "localDateTime",
  "localTime",
  "relDuration"
).annotations(
  $I.annotations("ColumnDataObjectConstraint", {
    description: "Object column constraints including dates, JSON, and geometric types",
  })
) {
  static readonly toColumnType = toColumnTypeFn(this.Options, "object");
}

export declare namespace ColumnDataObjectConstraint {
  export type Type = typeof ColumnDataObjectConstraint.Type;
}

// ─────────────────────────────────────────────────────────────────────────────
// String Constraint
// ─────────────────────────────────────────────────────────────────────────────

/**
 * String-specific column data constraints covering various text formats,
 * network types, temporal formats, and numeric string representations.
 */
export class ColumnDataStringConstraint extends BS.StringLiteralKit(
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
  "uuid"
).annotations(
  $I.annotations("ColumnDataStringConstraint", {
    description: "String column constraints for text, network, and temporal formats",
  })
) {
  static readonly toColumnType = toColumnTypeFn(this.Options, "string");
}

export declare namespace ColumnDataStringConstraint {
  export type Type = typeof ColumnDataStringConstraint.Type;
}

// ─────────────────────────────────────────────────────────────────────────────
// Composite Constraint (All Constraints)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Union of all column data constraints combining array, bigint, number,
 * object, and string constraints.
 */
export class ColumnDataConstraint extends BS.StringLiteralKit(
  ...ColumnDataArrayConstraint.Options,
  ...ColumnDataBigIntConstraint.Options,
  ...ColumnDataNumberConstraint.Options,
  ...ColumnDataObjectConstraint.Options,
  ...ColumnDataStringConstraint.Options
).annotations(
  $I.annotations("ColumnDataConstraint", {
    description: "All column data constraints combining array, bigint, number, object, and string",
  })
) {}

export declare namespace ColumnDataConstraint {
  export type Type = typeof ColumnDataConstraint.Type;
}

// ─────────────────────────────────────────────────────────────────────────────
// Column Type (Full Type with Prefixed Constraints)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Complete column type schema combining base data types with all prefixed
 * constraint variants (e.g., "array vector", "bigint int64", "string uuid").
 */
export class ColumnType extends BS.StringLiteralKit(
  // Base data types
  ...ColumnDataType.Options,
  // Prefixed constraint types
  ...ColumnDataArrayConstraint.toColumnType,
  ...ColumnDataBigIntConstraint.toColumnType,
  ...ColumnDataNumberConstraint.toColumnType,
  ...ColumnDataObjectConstraint.toColumnType,
  ...ColumnDataStringConstraint.toColumnType
).annotations(
  $I.annotations("ColumnType", {
    description: "Full column type including base types and prefixed constraints",
  })
) {}

export declare namespace ColumnType {
  export type Type = typeof ColumnType.Type;
}

/**
 * SQL dialect identifier for database-specific schema generation.
 */
export class Dialect extends BS.StringLiteralKit(
  "pg",
  "mysql",
  "sqlite",
  "singlestore",
  "mssql",
  "common",
  "gel",
  "cockroach"
).annotations(
  $I.annotations("Dialect", {
    description:
      "SQL dialect identifier representing supported database engines for schema generation and type mapping.",
  })
) {
  static readonly toColumnType = toColumnTypeFn(this.Options, "object");
}

export declare namespace Dialect {
  export type Type = typeof Dialect.Type;
}

/**
 * Relation cardinality type for entity associations.
 */
export class RelationType extends BS.StringLiteralKit("one", "many").annotations(
  $I.annotations("RelationType", {
    description: "Relation cardinality indicating whether an association references one or many related entities.",
  })
) {}

/**
 * SQL join operation type for combining table data.
 */
export class JoinType extends BS.StringLiteralKit("inner", "left", "right", "full", "cross").annotations(
  $I.annotations("JoinType", {
    description:
      "SQL join operation type specifying how rows from two tables are combined based on matching conditions.",
  })
) {}

export declare namespace JoinType {
  export type Type = typeof JoinType.Type;
}

/**
 * Nullability constraint for join operation results.
 */
export class JoinNullability extends BS.StringLiteralKit("nullable", "not-null").annotations(
  $I.annotations("JoinNullability", {
    description: "Nullability constraint indicating whether join result columns may contain null values.",
  })
) {}

export declare namespace JoinNullability {
  export type Type = typeof JoinNullability.Type;
}

/**
 * Selection mode for query result handling.
 */
export class SelectMode extends BS.StringLiteralKit("partial", "single", "multiple").annotations(
  $I.annotations("SelectMode", {
    description:
      "Selection mode specifying whether a query returns partial fields, a single record, or multiple records.",
  })
) {}

export declare namespace SelectMode {
  export type Type = typeof SelectMode.Type;
}

/**
 * SQL set operation type for combining query results.
 */
export class SetOperator extends BS.StringLiteralKit("union", "intersect", "except").annotations(
  $I.annotations("SetOperator", {
    description: "SQL set operator specifying how to combine result sets from multiple queries.",
  })
) {}

export declare namespace SetOperator {
  export type Type = typeof SetOperator.Type;
}

export class GeneratedStorageMode extends BS.StringLiteralKit("virtual", "stored", "persisted").annotations(
  $I.annotations("GeneratedStorageMode", {
    description:
      "Storage mode for generated/computed columns: virtual (computed on read), stored (persisted to disk), or persisted (alias for stored)",
  })
) {}

export declare namespace GeneratedStorageMode {
  export type Type = typeof GeneratedStorageMode.Type;
}

export class GeneratedType extends BS.StringLiteralKit("always", "byDefault").annotations(
  $I.annotations("GeneratedType", {
    description:
      "Generation behavior for computed columns: always (value always generated), byDefault (generated only when no value provided)",
  })
) {}

export declare namespace GeneratedType {
  export type Type = typeof GeneratedType.Type;
}

export interface ColumnTypeData<
  TType extends ColumnDataType.Type = ColumnDataType.Type,
  TConstraint extends ColumnDataConstraint.Type | undefined = ColumnDataConstraint.Type | undefined,
> {
  type: TType;
  constraint: TConstraint;
}

export type ExtractColumnTypeData<T extends ColumnType.Type> =
  T extends `${infer Type extends ColumnDataType.Type} ${infer Constraint extends ColumnDataConstraint.Type}`
    ? ColumnTypeData<Type, Constraint>
    : ColumnTypeData<Assume<T, ColumnDataType.Type>, undefined>;

export function extractExtendedColumnType<TColumn extends Column>(
  column: TColumn
): ExtractColumnTypeData<TColumn["_"]["dataType"]> {
  const [type, constraint] = column.dataType.split(" ");

  return { type, constraint } as any;
}

export interface GeneratedColumnConfig<TDataType> {
  as: TDataType | SQL | (() => SQL);
  type?: undefined | GeneratedType.Type;
  mode?: undefined | GeneratedStorageMode.Type;
}

export interface GeneratedIdentityConfig {
  sequenceName?: undefined | string;
  sequenceOptions?: undefined | PgSequenceOptions;
  type: "always" | "byDefault";
}

export interface ColumnBuilderBaseConfig<TDataType extends ColumnType.Type> {
  dataType: TDataType;
  data: unknown;
  driverParam: unknown;
  notNull?: undefined | boolean;
  hasDefault?: undefined | boolean;
}

export type MakeColumnConfig<
  T extends ColumnBuilderBaseConfig<ColumnType.Type>,
  TTableName extends string,
  TDialect extends Dialect.Type = "common",
  TData = T extends { $type: infer U } ? U : T["data"],
> = {
  name: string;
  tableName: TTableName;
  dataType: T["dataType"];
  data: TData;
  driverParam: T["driverParam"];
  notNull: T["notNull"] extends true ? true : false;
  hasDefault: T["hasDefault"] extends true ? true : false;
  isPrimaryKey: T extends { isPrimaryKey: true } ? true : false;
  isAutoincrement: T extends { isAutoincrement: true } ? true : false;
  hasRuntimeDefault: T extends { hasRuntimeDefault: true } ? true : false;
  enumValues: T extends { enumValues: [string, ...string[]] } ? T["enumValues"] : undefined;
  baseColumn: T extends { baseBuilder: infer U extends ColumnBuilderBase }
    ? BuildColumn<TTableName, U, TDialect>
    : never;
  identity: T extends { identity: "always" } ? "always" : T extends { identity: "byDefault" } ? "byDefault" : undefined;
  generated: T extends { generated: infer G }
    ? unknown extends G
      ? undefined
      : G extends undefined
        ? undefined
        : G
    : undefined;
} & {};

export interface ColumnBuilderRuntimeConfig<TData> {
  name: string;
  keyAsName: boolean;
  notNull: boolean;
  default: TData | SQL | undefined;
  defaultFn: (() => TData | SQL) | undefined;
  onUpdateFn: (() => TData | SQL) | undefined;
  hasDefault: boolean;
  primaryKey: boolean;
  isUnique: boolean;
  uniqueName: string | undefined;
  uniqueType: string | undefined;
  dataType: string;
  columnType: string;
  generated: GeneratedColumnConfig<TData> | undefined;
  generatedIdentity: GeneratedIdentityConfig | undefined;
}

export interface ColumnBuilderExtraConfig {
  primaryKeyHasDefault?: undefined | boolean;
}

export type NotNull<T> = T & {
  _: {
    notNull: true;
  };
};

export type HasDefault<T> = T & {
  _: {
    hasDefault: true;
  };
};

export type IsPrimaryKey<T> = T & {
  _: {
    isPrimaryKey: true;
    notNull: true;
  };
};

export type IsAutoincrement<T> = T & {
  _: {
    isAutoincrement: true;
  };
};

export type HasRuntimeDefault<T> = T & {
  _: {
    hasRuntimeDefault: true;
  };
};

export type $Type<T, TType> = T & {
  _: {
    $type: TType;
  };
};

export type HasGenerated<T, TGenerated = {}> = T & {
  _: {
    hasDefault: true;
    generated: TGenerated;
  };
};

export type IsIdentity<T, TType extends "always" | "byDefault"> = T & {
  _: {
    notNull: true;
    hasDefault: true;
    identity: TType;
  };
};

export interface ColumnBuilderBase<
  out T extends ColumnBuilderBaseConfig<ColumnType.Type> = ColumnBuilderBaseConfig<ColumnType.Type>,
> {
  _: T;
}

// To understand how to use `ColumnBuilder` and `AnyColumnBuilder`, see `Column` and `AnyColumn` documentation.
export abstract class ColumnBuilder<
  out T extends ColumnBuilderBaseConfig<ColumnType.Type>,
  TRuntimeConfig extends object = object,
  TExtraConfig extends ColumnBuilderExtraConfig = ColumnBuilderExtraConfig,
> implements ColumnBuilderBase<T>
{
  static readonly [entityKind]: string = "ColumnBuilder";

  declare _: T;

  /** @internal */
  protected config: ColumnBuilderRuntimeConfig<T["data"]> & TRuntimeConfig;

  protected constructor(name: string, dataType: ColumnType, columnType: string) {
    this.config = {
      name,
      keyAsName: name === "",
      notNull: false,
      default: undefined,
      hasDefault: false,
      primaryKey: false,
      isUnique: false,
      uniqueName: undefined,
      uniqueType: undefined,
      dataType,
      columnType,
      generated: undefined,
    } as ColumnBuilderRuntimeConfig<T["data"]> & TRuntimeConfig; // TODO: ??
  }

  /**
   * Changes the data type of the column. Commonly used with `json` columns. Also, useful for branded types.
   *
   * @example
   * ```ts
   * const users = pgTable('users', {
   * 	id: integer('id').$type<UserId>().primaryKey(),
   * 	details: json('details').$type<UserDetails>().notNull(),
   * });
   * ```
   */
  $type<TType>(): $Type<this, TType> {
    return this as $Type<this, TType>;
  }

  /**
   * Adds a `not null` clause to the column definition.
   *
   * Affects the `select` model of the table - columns *without* `not null` will be nullable on select.
   */
  notNull(): NotNull<this> {
    this.config.notNull = true;
    return this as NotNull<this>;
  }

  /**
   * Adds a `default <value>` clause to the column definition.
   *
   * Affects the `insert` model of the table - columns *with* `default` are optional on insert.
   *
   * If you need to set a dynamic default value, use {@link $defaultFn} instead.
   */
  default(value: (this["_"] extends { $type: infer U } ? U : this["_"]["data"]) | SQL): HasDefault<this> {
    this.config.default = value;
    this.config.hasDefault = true;
    return this as HasDefault<this>;
  }

  /**
   * Adds a dynamic default value to the column.
   * The function will be called when the row is inserted, and the returned value will be used as the column value.
   *
   * **Note:** This value does not affect the `drizzle-kit` behavior, it is only used at runtime in `drizzle-orm`.
   */
  $defaultFn(
    fn: () => (this["_"] extends { $type: infer U } ? U : this["_"]["data"]) | SQL
  ): HasRuntimeDefault<HasDefault<this>> {
    this.config.defaultFn = fn;
    this.config.hasDefault = true;
    return this as HasRuntimeDefault<HasDefault<this>>;
  }

  /**
   * Alias for {@link $defaultFn}.
   */
  $default = this.$defaultFn;

  /**
   * Adds a dynamic update value to the column.
   * The function will be called when the row is updated, and the returned value will be used as the column value if none is provided.
   * If no `default` (or `$defaultFn`) value is provided, the function will be called when the row is inserted as well, and the returned value will be used as the column value.
   *
   * **Note:** This value does not affect the `drizzle-kit` behavior, it is only used at runtime in `drizzle-orm`.
   */
  $onUpdateFn(fn: () => (this["_"] extends { $type: infer U } ? U : this["_"]["data"]) | SQL): HasDefault<this> {
    this.config.onUpdateFn = fn;
    this.config.hasDefault = true;
    return this as HasDefault<this>;
  }

  /**
   * Alias for {@link $onUpdateFn}.
   */
  $onUpdate = this.$onUpdateFn;

  /**
   * Adds a `primary key` clause to the column definition. This implicitly makes the column `not null`.
   *
   * In SQLite, `integer primary key` implicitly makes the column auto-incrementing.
   */
  primaryKey(): TExtraConfig["primaryKeyHasDefault"] extends true
    ? IsPrimaryKey<HasDefault<this>>
    : IsPrimaryKey<this> {
    this.config.primaryKey = true;
    this.config.notNull = true;
    return this as TExtraConfig["primaryKeyHasDefault"] extends true
      ? IsPrimaryKey<HasDefault<this>>
      : IsPrimaryKey<this>;
  }

  abstract generatedAlwaysAs(
    as: SQL | T["data"] | (() => SQL),
    config?: undefined | Partial<GeneratedColumnConfig<unknown>>
  ): HasGenerated<
    this,
    {
      type: "always";
    }
  >;

  /** @internal Sets the name of the column to the key within the table definition if a name was not given. */
  setName(name: string) {
    if (this.config.name !== "") return;
    this.config.name = name;
  }
}

export type BuildColumn<
  TTableName extends string,
  TBuilder extends ColumnBuilderBase,
  TDialect extends Dialect.Type,
  TBuiltConfig extends ColumnBaseConfig<ColumnType.Type> = MakeColumnConfig<TBuilder["_"], TTableName, TDialect>,
> = TDialect extends "common" ? Column<TBuiltConfig, {}> : never;
// // TDialect extends 'pg' ? PgColumn<TBuiltConfig, {}>
// TDialect extends 'mysql' ? MySqlColumn<TBuiltConfig, {}>
// 	: TDialect extends 'mssql' ? MsSqlColumn<TBuiltConfig, {}>
// 	: TDialect extends 'sqlite' ? SQLiteColumn<TBuiltConfig, {}>
// 	: TDialect extends 'singlestore' ? SingleStoreColumn<TBuiltConfig, {}>
// 	: TDialect extends 'gel' ? GelColumn<TBuiltConfig, {}>
// 	: TDialect extends 'cockroach' ? CockroachColumn<TBuiltConfig, {}>
// 	: ;

export type BuildIndexColumn<TDialect extends Dialect.Type> = TDialect extends "pg" ? ExtraConfigColumn : never;

// TDialect extends 'cockroach' ? CockroachExtraConfigColumn
// 	: TDialect extends 'gel' ? GelExtraConfigColumn

// TODO
// try to make sql as well + indexRaw

// optional after everything will be working as expected
// also try to leave only needed methods for extraConfig
// make an error if I pass .asc() to fk and so on

export type BuildColumns<
  TTableName extends string,
  TConfigMap extends Record<string, ColumnBuilderBase>,
  TDialect extends Dialect.Type,
> = {
  [Key in keyof TConfigMap]: BuildColumn<TTableName, TConfigMap[Key], TDialect>;
} & {};

export type BuildExtraConfigColumns<
  _TTableName extends string,
  TConfigMap extends Record<string, ColumnBuilderBase>,
  TDialect extends Dialect.Type,
> = {
  [Key in keyof TConfigMap]: BuildIndexColumn<TDialect>;
} & {};

export type ChangeColumnTableName<
  TColumn extends Column,
  TAlias extends string,
  TDialect extends Dialect.Type,
> = TDialect extends "pg" // TODO: optimise
  ? PgColumn<TColumn["_"]["dataType"], Omit<TColumn["_"], "tableName"> & { tableName: TAlias; insertType: unknown }>
  : // : TDialect extends 'mysql' ? MySqlColumn<MakeColumnConfig<TColumn['_'], TAlias>>
    // : TDialect extends 'singlestore' ? SingleStoreColumn<MakeColumnConfig<TColumn['_'], TAlias>>
    // : TDialect extends 'sqlite' ? SQLiteColumn<MakeColumnConfig<TColumn['_'], TAlias>>
    // : TDialect extends 'gel' ? GelColumn<MakeColumnConfig<TColumn['_'], TAlias>>
    // : TDialect extends 'mssql' ? MsSqlColumn<MakeColumnConfig<TColumn['_'], TAlias>>
    // : TDialect extends 'cockroach' ? CockroachColumn<MakeColumnConfig<TColumn['_'], TAlias>>
    never;

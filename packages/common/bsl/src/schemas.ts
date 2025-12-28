import { $BslId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { ArrayUtils } from "@beep/utils";
import type * as A from "effect/Array";
import * as F from "effect/Function";

const $I = $BslId.create("schemas");

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
  F.pipe(
    literals,
    ArrayUtils.NonEmptyReadonly.mapNonEmpty((opt) => `${prefix} ${opt}` as const)
  );

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

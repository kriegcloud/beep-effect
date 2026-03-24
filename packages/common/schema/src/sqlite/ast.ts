/**
 * Sqlite Schema Module
 *
 * @module @beep/schema/sqlite/ast
 * @since 0.0.0
 */
import { $SchemaId } from "@beep/identity";
import * as S from "effect/Schema";
import { LiteralKit } from "../LiteralKit.ts";

/**
 * Represents the unique identifier for the SQLite Abstract Syntax Tree (AST) schema.
 *
 * This identifier is used to annotate and provide identity composition for all schemas
 * related to AST processing within the SQLite module. It serves as a canonical reference
 * point when working with schema-based validations, transformations, and encoding/decoding
 * in the associated domain.
 *
 * ## Key Features
 * - **Identity Composition**: Simplifies schema identity management and avoids duplication.
 * - **Reusability**: Enables seamless integration of schema definitions across multiple modules.
 * - **Tractability**: Facilitates debugging and reasoning by centralizing schema references.
 *
 * ## Usage
 *
 * This ID should be used for annotating schema-related code to ensure unique identification
 * and tracking of derived schemas.
 *
 * ### Example
 * ```typescript
 * import * as S from "effect/Schema";
 * import { $I } from "sqlite/ast";
 *
 * const TableSchema = S.Struct({
 *   name: S.String,
 *   columns: S.Array(S.Struct({
 *     columnName: S.String,
 *     dataType: S.String
 *   }))
 * }).annotate(
 *   $I,
 *   { description: "Schema for representing an SQLite table" }
 * );
 *
 * const program = S.decodeUnknownEffect(TableSchema)({
 *   name: "users",
 *   columns: [
 *     { columnName: "id", dataType: "INTEGER" },
 *     { columnName: "name", dataType: "TEXT" }
 *   ]
 * }).pipe(Effect*/
const $I = $SchemaId.create("sqlite/ast");

/**
 * Represents the permitted SQLite column type tags.
 *
 * @category Validation
 * @since 0.0.0
 */
export const ColumnTypeTag = LiteralKit(["text", "null", "real", "integer", "blob"]).pipe(
  $I.annoteSchema("ColumnTypeTag", {
    description: "Sqlite column type tag",
  })
);

/**
 * Type-level representation of a SQLite column type tag.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type ColumnTypeTag = typeof ColumnTypeTag.Type;

/**
 * Represents the SQLite `TEXT` column type.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class ColumnTypeText extends S.TaggedClass<ColumnTypeText>($I`ColumnTypeText`)(
  "text",
  {},
  $I.annote("ColumnTypeText", {
    description: "Sqlite column type text",
  })
) {}

/**
 * Represents the SQLite `NULL` column type.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class ColumnTypeNull extends S.TaggedClass<ColumnTypeNull>($I`ColumnTypeNull`)(
  "null",
  {},
  $I.annote("ColumnTypeNull", {
    description: "Sqlite column type null",
  })
) {}

/**
 * Represents the SQLite `REAL` column type.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class ColumnTypeReal extends S.TaggedClass<ColumnTypeReal>($I`ColumnTypeReal`)(
  "real",
  {},
  $I.annote("ColumnTypeReal", {
    description: "Sqlite column type real",
  })
) {}

/**
 * Represents a column type definition for SQL integer values in a database schema.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class ColumnTypeInteger extends S.TaggedClass<ColumnTypeInteger>($I`ColumnTypeInteger`)(
  "integer",
  {},
  $I.annote("ColumnTypeInteger", {
    description: "Sqlite column type integer",
  })
) {}

/**
 * Represents the SQLite `BLOB` column type.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class ColumnTypeBlob extends S.TaggedClass<ColumnTypeBlob>($I`ColumnTypeBlob`)(
  "blob",
  {},
  $I.annote("ColumnTypeBlob", {
    description: "Sqlite column type blob",
  })
) {}

/**
 * Represents the possible SQLite column types.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export const ColumnType = S.Union([
  ColumnTypeText,
  ColumnTypeNull,
  ColumnTypeReal,
  ColumnTypeInteger,
  ColumnTypeBlob,
]).pipe(
  S.toTaggedUnion("_tag"),
  $I.annoteSchema("ColumnType", {
    description: "Sqlite column type",
  })
);

/**
 * Type-level representation of the SQLite column type union.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type ColumnType = typeof ColumnType.Type;

/**
 * Represents a column in a SQLite database schema.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class Column extends S.TaggedClass<Column>($I`Column`)(
  "column",
  {
    name: S.String,
    type: ColumnType,
    primaryKey: S.Boolean,
    nullable: S.Boolean,
    default: S.Option(S.Any),
    schema: S.Any,
  },
  $I.annote("Column", {
    description: "Sqlite column",
  })
) {
  static readonly new = (props: Omit<Column, "_tag">) => new Column(props);
}

/**
 * Represents an index in a SQLite database schema.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class Index extends S.TaggedClass<Index>($I`Index`)(
  "index",
  {
    columns: S.Array(S.String),
    name: S.OptionFromOptionalKey(S.String),
    unique: S.OptionFromOptionalKey(S.Boolean),
    primaryKey: S.OptionFromOptionalKey(S.Boolean),
  },
  $I.annote("Index", {
    description: "Sqlite index",
  })
) {}

/**
 * Represents a foreign key reference in an SQLite context, tying a local column to a referenced table and column.
 *
 * This class is part of the domain model layer, standardizing how foreign key references are represented within
 * the repository or application logic.
 *
 * ## Properties
 * - `table` {string} - The name of the foreign table being referenced.
 * - `column` {string} - The column on the foreign table that the reference points to.
 *
 * @example
 * ```typescript
 * import { ForeignKeyReference } from "@beep/sql-schema";
 * import * as S from "effect/Schema";
 *
 * const exampleReference = new ForeignKeyReference({
 *   table: "users",
 *   column: "id"
 * })
 *
 * console.log(`Table: ${exampleReference.table}, Column: ${exampleReference.column}`)
 *
 * const decoded = S.decodeUnknownEffect(ForeignKeyReference.schema)({
 *   table: "orders",
 *   column: "user_id"
 * })
 *
 * const program = Effect.gen(function* () {
 *   const reference = yield* decoded
 *   console.log(reference) // Outputs { table: "orders", column: "user_id" }
 *   return reference
 * })
 * ```
 *
 * @category DomainModel
 * @since*/
class ForeignKeyReference extends S.TaggedClass<ForeignKeyReference>($I`ForeignKeyReference`)(
  "foreignKeyReference",
  {
    table: S.String,
    column: S.String,
  },
  $I.annote("ForeignKeyReference", {
    description: "Sqlite foreign key reference",
  })
) {}

/**
 * Represents a SQLite foreign key column, containing the referenced table*/
class ForeignKeyColumn extends S.TaggedClass<ForeignKeyColumn>($I`ForeignKeyColumn`)(
  "foreignKeyColumn",
  {
    table: S.String,
    column: S.String,
  },
  $I.annote("ForeignKeyColumn", {
    description: "Sqlite foreign key column",
  })
) {}

/**
 * Represents a foreign key in a SQLite database schema.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class ForeignKey extends S.TaggedClass<ForeignKey>($I`ForeignKey`)(
  "foreignKey",
  {
    key: S.Array(ForeignKeyColumn),
    references: S.Array(ForeignKeyReference),
    columns: S.Array(S.String),
  },
  $I.annote("ForeignKey", {
    description: "Sqlite foreign key",
  })
) {}

/**
 * Represents a SQL table definition in SQLite.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class Table extends S.TaggedClass<Table>($I`Table`)(
  "table",
  {
    name: S.String,
    columns: S.Array(Column),
    indexes: S.Array(Index),
  },
  $I.annote("Table", {
    description: "Sqlite table",
  })
) {}

/**
 * Represents a SQLite database schema.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class DbSchema extends S.TaggedClass<DbSchema>($I`DbSchema`)(
  "dbSchema",
  { tables: S.Array(Table) },
  $I.annote("DbSchema", { description: "Sqlite database schema" })
) {}

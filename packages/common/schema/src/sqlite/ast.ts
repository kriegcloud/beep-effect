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
 * This schema defines the set of accepted column types for SQLite tables as
 * strictly limited to one of the following literal values:
 * - `"text"`
 * - `"null"`
 * - `"real"`
 * - `"integer"`
 * - `"blob"`
 *
 * It is annotated with metadata for additional description.
 *
 * @example
 * ```typescript
 * import { ColumnTypeTag } from "your-module-path"
 * import * as S from "effect/Schema"
 *
 * // Valid column type tags
 * const validColumnTypes = ["text", "null", "real", "integer", "blob"]
 *
 * const schema = ColumnTypeTag
 *
 * const isValid = validColumnTypes.every(type =>
 *   S.is(schema)(type) // true for all valid types
 * )
 *
 * console.log(isValid) // true
 *
 * // Attempt decoding an invalid type
 * const invalidType = "unknown"
 * const decoded = S.decodeUnknown(schema)(invalidType) // Fails decoding
 * ```
 *
 * @example
 * ```typescript
 * import { ColumnTypeTag } from "your-module-path"
 * import * as S from "effect/Schema"
 *
 * // Create typesafe schemas based on ColumnTypeTag
 * const columnSchema = S.Struct({
 *   name: S.String,
 *   type: ColumnTypeTag
 * })
 *
 * const value = {
 *   name: "age",
 *   type: "integer"
 * }
 *
 * const result = S.decodeUnknownEffect(columnSchema)(value)
 * // Yields a success Effect for valid data or fails otherwise.
 * ```
 *
 * @category Validation
 * @returns {Schema} - Returns a `Schema` instance representing the SQLite column type tag structure.
 * @since 0.0.0
 */
export const ColumnTypeTag = LiteralKit(["text", "null", "real", "integer", "blob"]).pipe(
  $I.annoteSchema("ColumTypeTag", {
    description: "Sqlite column type tag",
  })
);

/**
 * A type-safe representation of a database column type.
 *
 * The `ColumnTypeTag` type provides a consistent way to annotate and identify
 * the type of a column used in database-related operations, ensuring compatibility and type safety
 * throughout the application codebase.
 *
 * This type is useful for defining column metadata and associating type information
 * with database schemas, queries, and transformations.
 *
 * @example
 * ```typescript
 * // Define column type metadata for a user table
 * import { ColumnTypeTag } from "effect/db";
 *
 * const UserTable = {
 *   id: ColumnTypeTag.Type.Number,
 *   name: ColumnTypeTag.Type.String,
 *   isAdmin: ColumnTypeTag.Type.Boolean
 * };
 *
 * // Use the metadata in type-safe operations
 * const query = db.query(select(UserTable.name).from("users"));
 * const name: string = query.result[0]; // Correctly typed as string
 * ```
 *
 * @category DomainModel
 * @since 0.0*/
export type ColumnTypeTag = typeof ColumnTypeTag.Type;

/**
 *
 */
export class ColumnTypeText extends S.TaggedClass<ColumnTypeText>($I`ColumnTypeText`)(
  "text",
  {},
  $I.annote("ColumnTypeText", {
    description: "Sqlite column type text",
  })
) {}

/**
 * Represents the `NULL` column type in SQLite.
 *
 * This class is a specialization of the column type abstraction used in the
 * `beep-effect` repository. It serves as a type-safe definition for SQLite's
 * `NULL` type and extends the common tagging constructs of the `Effect` framework.
 *
 * ## Overview
 *
 * - Designed for use within SQL schema validation or migrations.
 * - Provides structured tagging to differentiate column types in*/
export class ColumnTypeNull extends S.TaggedClass<ColumnTypeNull>($I`ColumnTypeNull`)(
  "null",
  {},
  $I.annote("ColumnTypeNull", {
    description: "Sqlite column type null",
  })
) {}

/**
 * Represents the `REAL` column type in SQLite.
 *
 * This class is part of a tagged schema used to define and validate SQL column types, ensuring
 * type safety and helping with structured representation of database schemas. The `ColumnTypeReal`
 * type maps to SQLite's `REAL` type, commonly used for floating-point numeric values.
 *
 * ## Key Features
 *
 * - Provides a strongly-typed representation of SQLite's `REAL` column type.
 * - Enables schema-based validation and parsing.
 * - Compatible with tagged schema workflows in the Effect library.
 *
 * ## Example Usage
 *
 * @example
 * ```typescript
 * import * as S from "effect/Schema";
 * import { Effect } from "effect";
 * import { ColumnTypeReal } from "./path-to/ColumnTypeReal";
 *
 * // Define a schema with a column of ColumnTypeReal
 * const TableSchema = S.Struct({
 *   price: ColumnTypeReal
 * });
 *
 * const InputData = { price:*/
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
 * This class provides the metadata and structure necessary to represent and manipulate
 * SQLite-compatible integer column types within the broader schema definition process.
 *
 * ## Features
 * - Tagged with a specific description for clear type safety and domain applicability.
 * - Lightweight class implementation with proper annotations for schema interoperability.
 *
 * @example
 * ```typescript
 * import { ColumnTypeInteger } from "effect/Schema"
 *
 * // Creating a new integer column type
 * const integerColumn = new ColumnTypeInteger()
 *
 * // Usage in a schema definition
 * const UserTable = S.Struct({
 *   id: integerColumn,   // ID field as an integer
 *   name: S.String       // Other fields
 * })
 * ```
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class ColumnTypeInteger extends S.TaggedClass<ColumnTypeInteger>($I`ColumnTypeInteger`)(
  "integer",
  {},
  $I.annote("ColumnTypeInteger", {
    description: "Sqlite column type integer",
  })
) {}

/**
 * Represents a SQLite column of type `BLOB`.
 *
 * This class is primarily used to define and handle SQLite columns
 * that store binary large object (BLOB) data. BLOBs are generally
 * used for storing binary data such as images, files, or any sequence of bytes.
 *
 * ## Key Features
 *
 * - Provides type-safe representation for BLOB columns.
 * - Integration-ready within schemas and effect-based workflows.
 * - Annotated for consistent usage in domain models.
 *
 * @example
 * ```typescript
 * import { ColumnTypeBlob } from "effect/Database";
 * import * as S from "effect/Schema";
 *
 * // Example of using ColumnTypeBlob in a schema definition
 * const FileSchema = S.Struct({
 *   id: S.Number,
 *   name:*/
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
 * This schema is used to define the various data types supported by SQLite columns
 * and ensures strict type validation for operations involving these types.
 *
 * ## Valid Values
 *
 * - `ColumnTypeText` - Represents textual data.
 * - `ColumnTypeNull` - Represents a null column type.
 * - `ColumnTypeReal` - Represents floating-point numeric data.
 * - `ColumnTypeInteger` - Represents integer numeric data.
 * - `ColumnTypeBlob` - Represents binary large objects (BLOBs).
 *
 * The schema is encoded as a tagged union using the `_tag` property for type
 * discrimination.
 *
 * ## Example Usage
 *
 * @example
 * ```typescript
 * import * as S from "effect/Schema";
 * import { ColumnType } from "your-module";
 *
 * const textColumn = { _tag: "ColumnTypeText" };
 * const validated = S.decode(ColumnType)(textColumn);
 *
 * console.log(validated); // { _tag: "ColumnTypeText" }
 *
 * const invalidColumn = { _tag: "InvalidType" };
 * const validationError = S.decode(ColumnType)(invalidColumn);
 * console.log(validationError); // Validation fails
 * ```
 *
 * @since 0.0.0
 * @category DomainModel
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
 * Represents the enumerated types of a database column.
 *
 * This type is used to define column types in a schema-based system, enabling
 * a consistent and type-safe way to work with column definitions for databases.
 *
 * ## Key Features
 * - Centralized management of column types for schema definitions.
 * - Provides strong TypeScript support for static type checking.
 * - Enables seamless integration with schema validation utilities.
 *
 * @example
 * ```typescript
 * import { ColumnType } from "./path/to/module";
 * import * as S from "effect/Schema";
 *
 * const UserTableSchema = S.Struct({
 *   id: ColumnType.Number,
 *   name: ColumnType.String,
 *   isActive: ColumnType.Boolean,
 *   createdAt: ColumnType.Date
 * });
 *
 * const validateUserTable = (data: unknown) => S.decode(UserTableSchema)(data);
 *
 * const result = validateUserTable({
 *   id: 1,
 *   name: "Alice",
 *   isActive: true,
 *   createdAt: new Date()
 * });
 *
 * console.log(result); // Success, returns typed data
 * ```
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type ColumnType = typeof ColumnType.Type;

/**
 * Represents a column in a SQLite database schema.
 *
 * The `Column` class encapsulates the essential metadata about a column, including its name,
 * data type, constraints (e.g., primary key, nullable),*/
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
 * Represents an SQLite index with additional metadata.
 *
 * This class defines the structure and properties of a database index,
 * which includes its columns, name, and optional attributes such as
 * whether it is unique or serves as a primary key. It is tagged for
 * schema processing and serialization.
 *
 * ## Key Features
 *
 * - Supports optional `name`, `unique`, and `primaryKey` attributes
 * - Type-safe structure for working with SQLite database indices
 * - Fully integrated with `effect/Schema` for encoding/decoding
 *
 * @example
 * ```typescript
 * import * as S from "*/
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
 * Represents a SQL Foreign Key declaration, specifying the relationships between tables in a relational database.
 *
 * This class models a foreign key constraint, containing metadata about the key columns,
 * their referenced columns, and the table relationships encoded in the database schema.
 *
 * ## Features
 * - Captures foreign key constraints declaratively.
 * - Encodes both source (`key`) and target (`references`)*/
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
 * The `Table` class models database tables with their associated columns
 * and indexes. It provides structured information that can be used for
 * schema generation, validation, and integration with database operations.
 *
 * ## Key Features
 *
 * - **Column Definitions**: Encapsulates column metadata using `Column` objects.
 * - **Index Support**: Supports relational database indexing via `Index` objects.
 * - **Typed Metadata**: Strongly typed schema for name, columns, and indexes.
 *
 * ## Example Usage
 *
 * @example
 * ```typescript
 * import { Table, Column, Index } from "effect/sql-schema";
 * import * as S from "effect/Schema";
 *
 * const UserTable = new Table({
 *   name: "users",
 *   columns: [
 *     new Column({ name: "id", type: "INTEGER", isPrimary: true }),
 *     new Column({ name: "username", type: "TEXT", isNullable: false }),
 *     new Column({ name: "email", type: "TEXT", isNullable: false }),
 *   ],
 *   indexes: [
 *     new Index({
 *       name: "username_index",
 *       columns: ["username"],
 *     }),
 *   ]
 * });
 *
 * console.log(UserTable.name); // "users"
 * ```
 *
 * ## Validation
 *
 * `Table` instances can validate the schema structure of an SQLite database. This is
 * highly beneficial in defining strict contracts for your database schema and format.
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
 * Represents the schema of a SQLite database, including its tables.
 *
 * This class encapsulates metadata regarding an SQLite database schema,
 * which typically includes details of all the tables constituting the database.
 * It acts as a foundational contract for database schema modeling.
 *
 * ## Features
 * - Encodes database tables into a structured schema.
 * - Provides strong typing for schema metadata.
 * - Designed to simplify database interaction and ensure schema consistency.
 *
 * @example
 * ```typescript
 * import { DbSchema, Table } from "effect";
 *
 * // Define tables
 * const UsersTable = Table.create({
 *   name: "users",
 *   columns: [
 *     { name: "id", type: "integer", primaryKey: true },
 *     { name: "name", type: "text" },
 *     { name: "email", type: "text", unique: true }
 *   ]
 * });
 *
 * const OrdersTable = Table.create({
 *   name: "orders",
 *   columns: [
 *     { name: "id", type: "integer", primaryKey: true },
 *     { name: "userId", type: "integer", references: "users(id)" },
 *     { name: "amount", type: "real" }
 *   ]
 * });
 *
 * // Create database schema representation
 * const dbSchema = new DbSchema({
 *   tables: [UsersTable, OrdersTable]
 * });
 *
 * console.log(dbSchema);
 * ```
 *
 * @example
 * ```typescript
 * import { Effect, DbSchema, Table, S } from "effect";
 *
 * // Create schema dynamically with Effect
 * const program = Effect.gen(function* () {
 *   const tables = yield* Effect.succeed([
 *     Table.create({ name: "products", columns: [{ name: "id", type: "integer", primaryKey*/
export class DbSchema extends S.TaggedClass<DbSchema>($I`DbSchema`)(
  "dbSchema",
  { tables: S.Array(Table) },
  $I.annote("DbSchema", { description: "Sqlite database schema" })
) {}

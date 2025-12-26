import { BS } from "@beep/schema";
import type { NullableProps } from "@beep/types/nullable";
import * as O from "effect/Option";
import type * as S from "effect/Schema";
import * as AST from "effect/SchemaAST";
import type * as Types from "effect/Types";
import { getColumnDefForSchema, schemaFieldsToColumns } from "./column-def.ts";
import { PgDSL } from "./db-schema/mod.ts";
import type { QueryBuilder } from "./query-builder/mod.ts";
import { makeQueryBuilder, QueryBuilderAstSymbol, QueryBuilderTypeId } from "./query-builder/mod.ts";

export const { blob, boolean, column, datetime, integer, isColumnDefinition, json, real, text } = PgDSL;

// Re-export the column definition function
export { getColumnDefForSchema };

export type StateType = "singleton" | "dynamic";

export type DefaultPgTableDef = PgDSL.TableDefinition<string, PgDSL.Columns>;
export type DefaultPgTableDefConstrained = PgDSL.TableDefinition<string, PgDSL.ConstraintColumns>;

// TODO use to hide table def internals
export const TableDefInternalsSymbol = Symbol("TableDefInternals");
export type TableDefInternalsSymbol = typeof TableDefInternalsSymbol;

export type TableDefBase<
  // TODO replace PgDef type param with Effect Schema (see below)
  TPgDef extends DefaultPgTableDef = DefaultPgTableDefConstrained,
  TOptions extends TableOptions = TableOptions,
> = {
  pgDef: TPgDef;
  options: TOptions;
  // Derived from `pgDef`, so only exposed for convenience
  rowSchema: PgDSL.StructSchemaForColumns<TPgDef["columns"]>;
  insertSchema: PgDSL.InsertStructSchemaForColumns<TPgDef["columns"]>;
};

export type TableDef<
  // TODO replace PgDef type param with Effect Schema
  // We can only do this with Effect Schema v4 once the default values are tracked on the type level
  // https://github.com/livestorejs/livestore/issues/382
  TPgDef extends DefaultPgTableDef = DefaultPgTableDefConstrained,
  TOptions extends TableOptions = TableOptions,
  // NOTE we're not using `PgDSL.StructSchemaForColumns<TPgDef['columns']>`
  // as we don't want the alias type for users to show up, so we're redefining it here
  // TODO adjust this to `TSchema = Schema.TypeLiteral<` but requires some advance type-level work
  TSchema = S.Schema<
    PgDSL.AnyIfConstained<
      TPgDef["columns"],
      { readonly [K in keyof TPgDef["columns"]]: TPgDef["columns"][K]["schema"]["Type"] }
    >,
    PgDSL.AnyIfConstained<
      TPgDef["columns"],
      { readonly [K in keyof TPgDef["columns"]]: TPgDef["columns"][K]["schema"]["Encoded"] }
    >
  >,
> = {
  pgDef: TPgDef;
  options: TOptions;
  // Derived from `pgDef`, so only exposed for convenience
  rowSchema: TSchema;
  insertSchema: PgDSL.InsertStructSchemaForColumns<TPgDef["columns"]>;
  // query: QueryBuilder<ReadonlyArray<S.Schema.Type<TSchema>>, TableDefBase<TPgDef & {}, TOptions>>
  readonly Type: S.Schema.Type<TSchema>;
  readonly Encoded: S.Schema.Encoded<TSchema>;
} & QueryBuilder<ReadonlyArray<S.Schema.Type<TSchema>>, TableDefBase<TPgDef & {}, TOptions>>;

export type TableOptionsInput = Partial<{
  indexes: PgDSL.Index[];
}>;

export namespace TableDef {
  export type Any = TableDef<any, any>;
}

export type TableOptions = {
  /** Derived based on whether the table definition has one or more columns (besides the `id` column) */
  readonly isClientDocumentTable: boolean;
};

/**
 * Creates a SQLite table definition from columns or an Effect Schema.
 *
 * This function supports two main ways to define a table:
 * 1. Using explicit column definitions
 * 2. Using an Effect Schema (either the `name` property needs to be provided or the schema needs to have a title/identifier)
 *
 * ```ts
 * // Using explicit columns
 * const usersTable = State.SQLite.table({
 *   name: 'users',
 *   columns: {
 *     id: State.SQLite.text({ primaryKey: true }),
 *     name: State.SQLite.text({ nullable: false }),
 *     email: State.SQLite.text({ nullable: false }),
 *     age: State.SQLite.integer({ nullable: true }),
 *   },
 * })
 * ```
 *
 * ```ts
 * // Using Effect Schema with annotations
 * import { Schema } from 'effect'
 *
 * const UserSchema = S.Struct({
 *   id: S.Int.pipe(State.SQLite.withPrimaryKey).pipe(State.SQLite.withAutoIncrement),
 *   email: S.String.pipe(State.SQLite.withUnique),
 *   name: S.String,
 *   active: S.Boolean.pipe(State.SQLite.withDefault(true)),
 *   createdAt: S.optional(S.Date),
 * })
 *
 * // Option 1: With explicit name
 * const usersTable = State.SQLite.table({
 *   name: 'users',
 *   schema: UserSchema,
 * })
 *
 * // Option 2: With name from schema annotation (title or identifier)
 * const AnnotatedUserSchema = UserSchema.annotations({ title: 'users' })
 * const usersTable2 = State.SQLite.table({
 *   schema: AnnotatedUserSchema,
 * })
 * ```
 *
 * ```ts
 * // Adding indexes
 * const PostSchema = S.Struct({
 *   id: S.String.pipe(State.SQLite.withPrimaryKey),
 *   title: S.String,
 *   authorId: S.String,
 *   createdAt: S.Date,
 * }).annotations({ identifier: 'posts' })
 *
 * const postsTable = State.SQLite.table({
 *   schema: PostSchema,
 *   indexes: [
 *     { name: 'idx_posts_author', columns: ['authorId'] },
 *     { name: 'idx_posts_created', columns: ['createdAt'], isUnique: false },
 *   ],
 * })
 * ```
 *
 * @remarks
 * - Primary key columns are automatically non-nullable
 * - Columns with `State.SQLite.withUnique` annotation automatically get unique indexes
 * - The `State.SQLite.withAutoIncrement` annotation only works with integer primary keys
 * - Default values can be literal values or SQL expressions
 * - When using Effect Schema without explicit name, the schema must have a title or identifier annotation
 */
// Overload 1: With columns
// TODO drop support for `column` when Effect Schema v4 is released
export function table<
  TName extends string,
  TColumns extends PgDSL.Columns | PgDSL.ColumnDefinition.Any,
  const TOptionsInput extends TableOptionsInput = TableOptionsInput,
>(
  args: {
    name: TName;
    columns: TColumns;
  } & Partial<TOptionsInput>
): TableDef<PgTableDefForInput<TName, TColumns>, WithDefaults<TColumns>>;

// Overload 2: With schema and explicit name
export function table<
  TName extends string,
  TSchema extends S.Schema.AnyNoContext,
  const TOptionsInput extends TableOptionsInput = TableOptionsInput,
>(
  args: {
    name: TName;
    schema: TSchema;
  } & Partial<TOptionsInput>
): TableDef<
  PgTableDefForSchemaInput<TName, S.Schema.Type<TSchema>, S.Schema.Encoded<TSchema>, TSchema>,
  TableOptions
>;

// Overload 3: With schema and no name (uses schema annotations)
export function table<
  TSchema extends S.Schema.AnyNoContext,
  const TOptionsInput extends TableOptionsInput = TableOptionsInput,
>(
  args: {
    schema: TSchema;
  } & Partial<TOptionsInput>
): TableDef<
  PgTableDefForSchemaInput<string, S.Schema.Type<TSchema>, S.Schema.Encoded<TSchema>, TSchema>,
  TableOptions
>;

// Implementation
export function table<
  TName extends string,
  TColumns extends PgDSL.Columns | PgDSL.ColumnDefinition.Any,
  const TOptionsInput extends TableOptionsInput = TableOptionsInput,
>(
  args: (
    | {
        name: TName;
        columns: TColumns;
      }
    | {
        name: TName;
        schema: S.Schema.AnyNoContext;
      }
    | {
        schema: S.Schema.AnyNoContext;
      }
  ) &
    Partial<TOptionsInput>
): TableDef<any, any> {
  const { ...options } = args;

  let tableName: string;
  let columns: PgDSL.Columns;
  let additionalIndexes: PgDSL.Index[] = [];

  if ("columns" in args) {
    tableName = args.name;
    const columnOrColumns = args.columns;
    columns = (
      PgDSL.isColumnDefinition(columnOrColumns) ? { value: columnOrColumns } : columnOrColumns
    ) as PgDSL.Columns;
    additionalIndexes = [];
  } else if ("schema" in args) {
    const result = schemaFieldsToColumns(BS.getResolvedPropertySignatures(args.schema));
    columns = result.columns;

    // We'll set tableName first, then use it for index names
    let tempTableName: string;

    // If name is provided, use it; otherwise extract from schema annotations
    if ("name" in args) {
      tempTableName = args.name;
    } else {
      // Use title or identifier, with preference for title
      tempTableName = AST.getTitleAnnotation(args.schema.ast).pipe(
        O.orElse(() => AST.getIdentifierAnnotation(args.schema.ast)),
        O.getOrThrowWith(
          () =>
            new Error("When using schema without explicit name, the schema must have a title or identifier annotation")
        )
      );
    }

    tableName = tempTableName;

    // Create unique indexes for columns with unique annotation
    additionalIndexes = (result.uniqueColumns || []).map((columnName) => ({
      name: `idx_${tableName}_${columnName}_unique`,
      columns: [columnName],
      isUnique: true,
    }));
  } else {
    throw new Error("Either `columns` or `schema` must be provided when calling `table()`");
  }

  const options_: TableOptions = {
    isClientDocumentTable: false,
  };

  // Combine user-provided indexes with unique column indexes
  const allIndexes = [...(options?.indexes ?? []), ...additionalIndexes];
  const pgDef = PgDSL.table(tableName, columns, allIndexes);

  const rowSchema = PgDSL.structSchemaForTable(pgDef);
  const insertSchema = PgDSL.insertStructSchemaForTable(pgDef);
  const tableDef = {
    pgDef,
    options: options_,
    rowSchema,
    insertSchema,
  } satisfies TableDefBase;

  const query = makeQueryBuilder(tableDef);
  // tableDef.query = query

  // NOTE we're currently patching the existing tableDef object
  // as it's being used as part of the query builder API
  for (const key of Object.keys(query)) {
    // @ts-expect-error TODO properly implement this
    tableDef[key] = query[key];
  }

  // @ts-expect-error TODO properly type this
  tableDef[QueryBuilderAstSymbol] = query[QueryBuilderAstSymbol];
  // @ts-expect-error TODO properly type this
  tableDef[QueryBuilderTypeId] = query[QueryBuilderTypeId];

  return tableDef as any;
}

export namespace FromTable {
  // TODO this sometimes doesn't preserve the order of columns
  export type RowDecoded<TTableDef extends TableDefBase> = Types.Simplify<
    NullableProps<Pick<RowDecodedAll<TTableDef>, NullableColumnNames<TTableDef>>> &
      Omit<RowDecodedAll<TTableDef>, NullableColumnNames<TTableDef>>
  >;

  export type NullableColumnNames<TTableDef extends TableDefBase> = FromColumns.NullableColumnNames<
    TTableDef["pgDef"]["columns"]
  >;

  export type Columns<TTableDef extends TableDefBase> = {
    [K in keyof TTableDef["pgDef"]["columns"]]: TTableDef["pgDef"]["columns"][K]["columnType"];
  };

  export type RowEncodeNonNullable<TTableDef extends TableDefBase> = {
    [K in keyof TTableDef["pgDef"]["columns"]]: S.Schema.Encoded<TTableDef["pgDef"]["columns"][K]["schema"]>;
  };

  export type RowEncoded<TTableDef extends TableDefBase> = Types.Simplify<
    NullableProps<Pick<RowEncodeNonNullable<TTableDef>, NullableColumnNames<TTableDef>>> &
      Omit<RowEncodeNonNullable<TTableDef>, NullableColumnNames<TTableDef>>
  >;

  export type RowDecodedAll<TTableDef extends TableDefBase> = {
    [K in keyof TTableDef["pgDef"]["columns"]]: S.Schema.Type<TTableDef["pgDef"]["columns"][K]["schema"]>;
  };
}

export namespace FromColumns {
  // TODO this sometimes doesn't preserve the order of columns
  export type RowDecoded<TColumns extends PgDSL.Columns> = Types.Simplify<
    NullableProps<Pick<RowDecodedAll<TColumns>, NullableColumnNames<TColumns>>> &
      Omit<RowDecodedAll<TColumns>, NullableColumnNames<TColumns>>
  >;

  export type RowDecodedAll<TColumns extends PgDSL.Columns> = {
    [K in keyof TColumns]: S.Schema.Type<TColumns[K]["schema"]>;
  };

  export type RowEncoded<TColumns extends PgDSL.Columns> = Types.Simplify<
    NullableProps<Pick<RowEncodeNonNullable<TColumns>, NullableColumnNames<TColumns>>> &
      Omit<RowEncodeNonNullable<TColumns>, NullableColumnNames<TColumns>>
  >;

  export type RowEncodeNonNullable<TColumns extends PgDSL.Columns> = {
    [K in keyof TColumns]: S.Schema.Encoded<TColumns[K]["schema"]>;
  };

  export type NullableColumnNames<TColumns extends PgDSL.Columns> = keyof {
    [K in keyof TColumns as TColumns[K]["default"] extends true ? K : never]: {};
  };

  export type RequiredInsertColumnNames<TColumns extends PgDSL.Columns> =
    PgDSL.FromColumns.RequiredInsertColumnNames<TColumns>;

  export type InsertRowDecoded<TColumns extends PgDSL.Columns> = PgDSL.FromColumns.InsertRowDecoded<TColumns>;
}

export type PgTableDefForInput<
  TName extends string,
  TColumns extends PgDSL.Columns | PgDSL.ColumnDefinition.Any,
> = PgDSL.TableDefinition<TName, PrettifyFlat<ToColumns<TColumns>>>;

export type PgTableDefForSchemaInput<
  TName extends string,
  TType,
  TEncoded,
  _TSchema = any,
> = TableDefInput.ForSchema<TName, TType, TEncoded, _TSchema>;

export type WithDefaults<TColumns extends PgDSL.Columns | PgDSL.ColumnDefinition.Any> = {
  isClientDocumentTable: false;
  requiredInsertColumnNames: PgDSL.FromColumns.RequiredInsertColumnNames<ToColumns<TColumns>>;
};

export type PrettifyFlat<T> = T extends infer U ? { [K in keyof U]: U[K] } : never;

export type ToColumns<TColumns extends PgDSL.Columns | PgDSL.ColumnDefinition.Any> = TColumns extends PgDSL.Columns
  ? TColumns
  : TColumns extends PgDSL.ColumnDefinition.Any
    ? { value: TColumns }
    : never;

export declare namespace SchemaToColumns {
  // Type helper to create column definition with proper schema
  export type ColumnDefForType<TEncoded, TType> = PgDSL.ColumnDefinition<TEncoded, TType>;

  // Create columns type from schema Type and Encoded
  export type FromTypes<TType, TEncoded> =
    TEncoded extends Record<string, any>
      ? {
          [K in keyof TEncoded]-?: ColumnDefForType<
            TEncoded[K],
            TType extends Record<string, any> ? (K extends keyof TType ? TType[K] : TEncoded[K]) : TEncoded[K]
          >;
        }
      : PgDSL.Columns;
}

export declare namespace TableDefInput {
  export type ForColumns<
    TName extends string,
    TColumns extends PgDSL.Columns | PgDSL.ColumnDefinition.Any,
  > = PgDSL.TableDefinition<TName, PrettifyFlat<ToColumns<TColumns>>>;

  export type ForSchema<TName extends string, TType, TEncoded, _TSchema = any> = PgDSL.TableDefinition<
    TName,
    SchemaToColumns.FromTypes<TType, TEncoded>
  >;
}

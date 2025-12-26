import { $DslId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { ArrayUtils, tagPropIs } from "@beep/utils";
import { omitUndefineds } from "@beep/utils/omit";
import * as A from "effect/Array";
import * as Data from "effect/Data";
import * as F from "effect/Function";
import * as Match from "effect/Match";
import * as O from "effect/Option";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as AST from "effect/SchemaAST";
import * as Struct from "effect/Struct";
import { hashCode } from "../hash.ts";

const $I = $DslId.create("pg/db-schema/ast/pg");

export class ColumnTypeTag extends BS.StringLiteralKit("text", "null", "real", "integer", "blob").annotations(
  $I.annotations("ColumnType", {
    description: "Valid column types for a database table",
  })
) {}

export declare namespace ColumnTypeTag {
  export type Type = typeof ColumnTypeTag.Type;
}

const ColumnTypeUnion = ColumnTypeTag.toTagged("_tag");

export class ColumnType extends ColumnTypeUnion.Union.annotations(
  $I.annotations("ColumnType", {
    description: "Valid column types for a database table",
  })
) {}

export declare namespace ColumnType {
  export type Type = typeof ColumnType.Type;

  export type Text = typeof ColumnTypeUnion.Members.text.Type;
  export type Null = typeof ColumnTypeUnion.Members.null.Type;
  export type Real = typeof ColumnTypeUnion.Members.real.Type;
  export type Integer = typeof ColumnTypeUnion.Members.integer.Type;
  export type Blob = typeof ColumnTypeUnion.Members.blob.Type;
}

export class Column extends S.TaggedClass<Column>($I`Column`)("column", {
  name: S.String,
  type: ColumnType,
  primaryKey: S.Boolean,
  nullable: S.Boolean,
  autoIncrement: S.Boolean,
  default: S.Option(S.Any),
  schema: S.declare((u: unknown): u is S.Schema<any> => S.isSchema(u)),
}) {}

export const column = (props: Omit<Column, "_tag">): Column => Column.make(props);

export class Index extends S.TaggedClass<Index>($I`Index`)(
  "index",
  {
    columns: S.Array(S.String),
    name: S.optional(S.String),
    unique: S.optional(S.Boolean),
    primaryKey: S.optional(S.Boolean),
  },
  $I.annotations(`Index`, {
    description: "An index on a database table",
  })
) {}

export const index = (columns: ReadonlyArray<string>, name?: string, unique?: boolean, primaryKey?: boolean): Index =>
  Index.make({
    columns,
    ...omitUndefineds({ name, unique, primaryKey }),
  });

export class ForeignKey extends S.TaggedClass<ForeignKey>($I`ForeignKey`)(
  "foreignKey",
  {
    references: S.Struct({
      table: S.String,
      columns: S.Array(S.String),
    }),
    key: S.Struct({
      table: S.String,
      columns: S.Array(S.String),
    }),
    columns: S.Array(S.String),
  },
  $I.annotations("ForeignKey", {
    description: "A foreign key constraint on a database table",
  })
) {}

export const foreignKey = (
  references: { table: string; columns: ReadonlyArray<string> },
  key: { table: string; columns: ReadonlyArray<string> },
  columns: ReadonlyArray<string>
): ForeignKey => ForeignKey.make({ references, key, columns });

export class Table extends S.TaggedClass<Table>($I`Table`)(
  "table",
  {
    name: S.String,
    columns: S.Array(Column),
    indexes: S.Array(Index),
  },
  $I.annotations("Table", {
    description: "A table in a database",
  })
) {}

export const table = (name: string, columns: ReadonlyArray<Column>, indexes: ReadonlyArray<Index>): Table => ({
  _tag: "table",
  name,
  columns,
  indexes,
});

export class DbSchema extends S.TaggedClass<DbSchema>($I`DbSchema`)(
  "dbSchema",
  {
    tables: S.Array(Table),
  },
  $I.annotations("DbSchema", {
    description: "A database schema",
  })
) {}

export const dbSchema = (tables: Table[]): DbSchema => ({ _tag: "dbSchema", tables });

//
// type JsonColumn<Col extends S.Schema.Type<Column> = S.Schema.Type<Column>> = S.Schema.Type<S.transform<S.SchemaClass<unknown, string>, Col>>
//
// type JsonColumnWithSchema<Col extends S.Schema.Type<Column> = S.Schema.Type<Column>> = S.Schema.Type<S.transform<S.SchemaClass<unknown, string>, Col> & { schema: S.Schema<any>}
/**
 * Helper to detect if a column is a JSON column (has parseJson transformation)
 */
const isJsonColumn = (column: Column) =>
  tagPropIs(column.type, "text")
    ? false
    : F.pipe(
        column.schema.ast,
        (ast) => tagPropIs(ast, "Transformation") && ast.annotations.schemaId === AST.ParseJsonSchemaId
      );

const c = Column.make({
  name: "beep",
  type: ColumnTypeUnion.Members.text.make(),
  nullable: false,
  default: O.some("c"),
  schema: S.String,
  primaryKey: false,
  autoIncrement: false,
});
c.schema.ast;

class ASTEntity extends S.Union(Table, Column, Index, ForeignKey, DbSchema).annotations(
  $I.annotations("ASTEntity", {
    description: "An entity in a database schema",
  })
) {
  static readonly tagLiterals = BS.StringLiteralKit(
    ...ArrayUtils.NonEmptyReadonly.mapNonEmpty(this.members, Struct.get("_tag"))
  );

  static trimInfo(entity: ASTEntity.Type): Record<string, any> {
    return F.pipe(
      entity,
      Match.type<ASTEntity.Type>().pipe(
        Match.withReturnType<Record<string, any>>(),
        Match.tagsExhaustive({
          table: (table) => ({
            _tag: table._tag,
            name: table.name,
            columns: F.pipe(table.columns, A.map(ASTEntity.trimInfo)),
            indexes: F.pipe(table.indexes, A.map(ASTEntity.trimInfo)),
          }),
          column: (obj) => {
            const baseInfo: Record<string, any> = {
              _tag: "column",
              name: obj.name,
              type: obj.type._tag,
              primaryKey: obj.primaryKey,
              nullable: obj.nullable,
              autoIncrement: obj.autoIncrement,
              default: obj.default,
            };

            // NEW: Include schema hash for JSON columns
            // This ensures that changes to the JSON schema are detected
            if (isJsonColumn(obj) && obj.schema) {
              // Use Effect's Schema.hash for consistent hashing
              baseInfo.jsonSchemaHash = BS.hash(obj.schema);
            }

            return baseInfo;
          },
          index: Struct.pick("_tag", "columns", "name", "unique", "primaryKey"),
          foreignKey: Struct.pick("_tag", "references", "key", "columns"),
          dbSchema: (dbSchema) =>
            Data.struct({
              ...Struct.pick("_tag")(dbSchema),
              tables: ArrayUtils.Readonly.mapReadonly(dbSchema.tables, ASTEntity.trimInfo),
            }),
        })
      )
    );
  }
}

export declare namespace ASTEntity {
  export type Type = typeof ASTEntity.Type;
}

/**
 * NOTE we're now including JSON schema information for JSON columns
 * to detect client document schema changes
 */
export const hash = (obj: ASTEntity.Type): number => hashCode(JSON.stringify(ASTEntity.trimInfo(obj)));

export const structSchemaForTable = (tableDef: Table) =>
  F.pipe(
    tableDef.columns,
    ArrayUtils.Readonly.mapReadonly((column) => [column.name, column.schema] as const),
    R.fromEntries,
    S.Struct
  );

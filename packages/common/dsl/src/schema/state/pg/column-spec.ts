import * as A from "effect/Array";
import * as S from "effect/Schema";
import { type PgAST, PgDSL } from "./db-schema/mod.ts";

/**
 * Returns a SQLite column specification string for a table's column definitions.
 *
 * Example:
 * ```
 * 'id' integer not null autoincrement , 'email' text not null  , 'username' text not null  , 'created_at' text   default CURRENT_TIMESTAMP, PRIMARY KEY ('id')
 * ```
 */
export const makeColumnSpec = (tableAst: PgAST.Table) => {
  const pkColumns = A.filter(tableAst.columns, (_) => _.primaryKey);
  const hasSinglePk = A.length(pkColumns) === 1;
  const pkColumn = hasSinglePk ? pkColumns[0] : undefined;

  // Build column definitions, handling the special SQLite rule that AUTOINCREMENT
  // is only valid on a single column declared as INTEGER PRIMARY KEY (column-level).
  const columnDefStrs = A.map(tableAst.columns, (column) =>
    toPgColumnSpec(column, {
      inlinePrimaryKey: hasSinglePk && column === pkColumn && column.primaryKey === true,
    })
  );

  // For composite primary keys, add a table-level PRIMARY KEY clause.
  if (pkColumns.length > 1) {
    const quotedPkCols = A.map(pkColumns, (_) => `"${_.name}"`);
    columnDefStrs.push(`PRIMARY KEY (${A.join(", ")(quotedPkCols)})`);
  }

  return A.join(", ")(columnDefStrs);
};

/** NOTE primary keys are applied on a table level not on a column level to account for multi-column primary keys */
const toPgColumnSpec = (column: PgAST.Column, opts: { inlinePrimaryKey: boolean }) => {
  const columnTypeStr = column.type._tag;
  // When PRIMARY KEY is declared inline, NOT NULL is implied and should not be emitted,
  // and AUTOINCREMENT must immediately follow PRIMARY KEY within the same constraint.
  const nullableStr = opts.inlinePrimaryKey ? "" : column.nullable === false ? "not null" : "";

  // Only include AUTOINCREMENT when it's valid: single-column INTEGER PRIMARY KEY
  const includeAutoIncrement = opts.inlinePrimaryKey && column.type._tag === "integer" && column.autoIncrement === true;

  const pkStr = opts.inlinePrimaryKey ? "primary key" : "";
  const autoIncrementStr = includeAutoIncrement ? "autoincrement" : "";

  const defaultValueStr = (() => {
    if (column.default._tag === "None") return "";

    const defaultValue = column.default.value;
    if (PgDSL.isDefaultThunk(defaultValue)) return "";

    const resolvedDefault = PgDSL.resolveColumnDefault(defaultValue);

    if (resolvedDefault === null) return "default null";
    if (PgDSL.isSqlDefaultValue(resolvedDefault)) return `default ${resolvedDefault.sql}`;

    const encodeValue = S.encodeSync(column.schema);
    const encodedDefaultValue = encodeValue(resolvedDefault);

    if (columnTypeStr === "text") return `default '${encodedDefaultValue}'`;
    return `default ${encodedDefaultValue}`;
  })();

  // Ensure order: PRIMARY KEY [AUTOINCREMENT] [NOT NULL] ...
  return `"${column.name}" ${columnTypeStr} ${pkStr} ${autoIncrementStr} ${nullableStr} ${defaultValueStr}`;
};

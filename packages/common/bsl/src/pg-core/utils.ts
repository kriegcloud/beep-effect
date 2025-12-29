import { is } from "../entity";
import { PgTable } from "../pg-core/table";
import { SQL } from "../sql/sql";
import { Subquery } from "../subquery";
import { Table, TableSchema } from "../table";
import { ViewBaseConfig } from "../view-common";
import { type Check, CheckBuilder } from "./checks";
import { type ForeignKey, ForeignKeyBuilder } from "./foreign-keys";
import type { Index } from "./indexes";
import { IndexBuilder } from "./indexes";
import { PgPolicy } from "./policies";
import { type PrimaryKey, PrimaryKeyBuilder } from "./primary-keys";
import { type UniqueConstraint, UniqueConstraintBuilder } from "./unique-constraint";
import type { PgMaterializedView, PgView } from "./view";
import type { PgViewBase } from "./view-base";
import { PgMaterializedViewConfig, PgViewConfig } from "./view-common";

export function getTableConfig<TTable extends PgTable>(table: TTable) {
  const columns = Object.values(table[Table.Symbol.Columns]);
  const indexes: Index[] = [];
  const checks: Check[] = [];
  const primaryKeys: PrimaryKey[] = [];
  const foreignKeys: ForeignKey[] = Object.values(table[PgTable.Symbol.InlineForeignKeys]);
  const uniqueConstraints: UniqueConstraint[] = [];
  const name = table[Table.Symbol.Name];
  const schema = table[Table.Symbol.Schema];
  const policies: PgPolicy[] = [];
  const enableRLS: boolean = table[PgTable.Symbol.EnableRLS];

  const extraConfigBuilder = table[PgTable.Symbol.ExtraConfigBuilder];

  if (extraConfigBuilder !== undefined) {
    const extraConfig = extraConfigBuilder(table[Table.Symbol.ExtraConfigColumns]);
    const extraValues = Array.isArray(extraConfig) ? (extraConfig.flat(1) as any[]) : Object.values(extraConfig);
    for (const builder of extraValues) {
      if (is(builder, IndexBuilder)) {
        indexes.push(builder.build(table));
      } else if (is(builder, CheckBuilder)) {
        checks.push(builder.build(table));
      } else if (is(builder, UniqueConstraintBuilder)) {
        uniqueConstraints.push(builder.build(table));
      } else if (is(builder, PrimaryKeyBuilder)) {
        primaryKeys.push(builder.build(table));
      } else if (is(builder, ForeignKeyBuilder)) {
        foreignKeys.push(builder.build(table));
      } else if (is(builder, PgPolicy)) {
        policies.push(builder);
      }
    }
  }

  return {
    columns,
    indexes,
    foreignKeys,
    checks,
    primaryKeys,
    uniqueConstraints,
    name,
    schema,
    policies,
    enableRLS,
  };
}

export function extractUsedTable(table: PgTable | Subquery | PgViewBase | SQL): string[] {
  if (is(table, PgTable)) {
    return [
      table[TableSchema] ? `${table[TableSchema]}.${table[Table.Symbol.BaseName]}` : table[Table.Symbol.BaseName],
    ];
  }
  if (is(table, Subquery)) {
    return table._.usedTables ?? [];
  }
  if (is(table, SQL)) {
    return table.usedTables ?? [];
  }
  return [];
}

export function getViewConfig<TName extends string = string, TExisting extends boolean = boolean>(
  view: PgView<TName, TExisting>
) {
  return {
    ...view[ViewBaseConfig],
    ...view[PgViewConfig],
  };
}

export function getMaterializedViewConfig<TName extends string = string, TExisting extends boolean = boolean>(
  view: PgMaterializedView<TName, TExisting>
) {
  return {
    ...view[ViewBaseConfig],
    ...view[PgMaterializedViewConfig],
  };
}

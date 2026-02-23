import type * as V1 from "./_relations";
import type { AnyColumn } from "./column";
import { Column } from "./column";
import { OriginalColumn } from "./column-common";
import { entityKind, is } from "./entity";
import type { View } from "./sql/sql";
import { SQL, sql } from "./sql/sql";
import { Table } from "./table";
import { ViewBaseConfig } from "./view-common";

export class ColumnTableAliasProxyHandler<TColumn extends Column> implements ProxyHandler<TColumn> {
  static readonly [entityKind]: string = "ColumnTableAliasProxyHandler";
  private readonly table: Table | View;
  private readonly ignoreColumnAlias?: undefined | undefined | boolean;

  constructor(table: Table | View, ignoreColumnAlias?: undefined | undefined | boolean) {
    this.table = table;
    this.ignoreColumnAlias = ignoreColumnAlias;
  }

  get(columnObj: TColumn, prop: string | symbol): any {
    if (prop === "table") {
      return this.table;
    }

    if (prop === "isAlias" && this.ignoreColumnAlias) {
      return false;
    }

    return columnObj[prop as keyof TColumn];
  }
}

export class TableAliasProxyHandler<T extends Table | View> implements ProxyHandler<T> {
  static readonly [entityKind]: string = "TableAliasProxyHandler";
  private readonly alias: string;
  private readonly replaceOriginalName: boolean;
  private readonly ignoreColumnAlias?: undefined | boolean;

  constructor(alias: string, replaceOriginalName: boolean, ignoreColumnAlias?: undefined | boolean) {
    this.alias = alias;
    this.replaceOriginalName = replaceOriginalName;
    this.ignoreColumnAlias = ignoreColumnAlias;
  }

  get(target: T, prop: string | symbol): any {
    if (prop === Table.Symbol.IsAlias) {
      return true;
    }

    if (prop === Table.Symbol.Name) {
      return this.alias;
    }

    if (this.replaceOriginalName && prop === Table.Symbol.OriginalName) {
      return this.alias;
    }

    if (prop === ViewBaseConfig) {
      return {
        ...target[ViewBaseConfig as keyof typeof target],
        name: this.alias,
        isAlias: true,
      };
    }

    if (prop === Table.Symbol.Columns) {
      const columns = (target as Table)[Table.Symbol.Columns];
      if (!columns) {
        return columns;
      }

      const proxiedColumns: { [key: string]: any } = {};

      Object.keys(columns).map((key) => {
        proxiedColumns[key] = new Proxy(
          columns[key]!,
          new ColumnTableAliasProxyHandler(new Proxy(target, this), this.ignoreColumnAlias)
        );
      });

      return proxiedColumns;
    }

    const value = target[prop as keyof typeof target];
    if (is(value, Column)) {
      return new Proxy(
        value as AnyColumn,
        new ColumnTableAliasProxyHandler(new Proxy(target, this), this.ignoreColumnAlias)
      );
    }

    return value;
  }
}

export class ColumnAliasProxyHandler<T extends Column> implements ProxyHandler<T> {
  static readonly [entityKind]: string = "ColumnAliasProxyHandler";
  private readonly alias: string;

  constructor(alias: string) {
    this.alias = alias;
  }

  get(target: T, prop: keyof Column): any {
    if (prop === "isAlias") {
      return true;
    }

    if (prop === "name") {
      return this.alias;
    }

    if (prop === "keyAsName") {
      return false;
    }

    if (prop === OriginalColumn) {
      return () => target;
    }

    return target[prop];
  }
}

export class RelationTableAliasProxyHandler<T extends V1.Relation> implements ProxyHandler<T> {
  static readonly [entityKind]: string = "RelationTableAliasProxyHandler";
  private readonly alias: string;

  constructor(alias: string) {
    this.alias = alias;
  }

  get(target: T, prop: string | symbol): any {
    if (prop === "sourceTable") {
      return aliasedTable(target.sourceTable, this.alias);
    }

    return target[prop as keyof typeof target];
  }
}

export function aliasedTable<T extends Table | View>(table: T, tableAlias: string): T {
  return new Proxy(table, new TableAliasProxyHandler(tableAlias, false, false));
}

export function aliasedColumn<T extends Column>(column: T, alias: string): T {
  return new Proxy(column, new ColumnAliasProxyHandler(alias));
}

export function aliasedRelation<T extends V1.Relation>(relation: T, tableAlias: string): T {
  return new Proxy(relation, new RelationTableAliasProxyHandler(tableAlias));
}

export function aliasedTableColumn<T extends AnyColumn>(column: T, tableAlias: string): T {
  return new Proxy(
    column,
    new ColumnTableAliasProxyHandler(
      new Proxy(column.table, new TableAliasProxyHandler(tableAlias, false, false)),
      false
    )
  );
}

export function mapColumnsInAliasedSQLToAlias(query: SQL.Aliased, alias: string): SQL.Aliased {
  return new SQL.Aliased(mapColumnsInSQLToAlias(query.sql, alias), query.fieldAlias);
}

export function mapColumnsInSQLToAlias(query: SQL, alias: string): SQL {
  return sql.join(
    query.queryChunks.map((c) => {
      if (is(c, Column)) {
        return aliasedTableColumn(c, alias);
      }
      if (is(c, SQL)) {
        return mapColumnsInSQLToAlias(c, alias);
      }
      if (is(c, SQL.Aliased)) {
        return mapColumnsInAliasedSQLToAlias(c, alias);
      }
      return c;
    })
  );
}

// Defined separately from the Column class to resolve circular dependency
Column.prototype.as = function (alias: string): Column {
  return aliasedColumn(this, alias);
};

export function getOriginalColumnFromAlias<T extends Column>(column: T): T {
  return column[OriginalColumn]();
}

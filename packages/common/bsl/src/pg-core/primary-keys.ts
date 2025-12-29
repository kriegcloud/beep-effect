import { entityKind } from "../entity";
import type { AnyPgColumn, PgColumn } from "./columns/index";
import { PgTable } from "./table";

export function primaryKey<
  TTableName extends string,
  TColumn extends AnyPgColumn<{ tableName: TTableName }>,
  TColumns extends AnyPgColumn<{ tableName: TTableName }>[],
>(config: { name?: undefined | string; columns: [TColumn, ...TColumns] }): PrimaryKeyBuilder;
/**
 * @deprecated: Please use primaryKey({ columns: [] }) instead of this function
 * @param columns
 */
export function primaryKey<TTableName extends string, TColumns extends AnyPgColumn<{ tableName: TTableName }>[]>(
  ...columns: TColumns
): PrimaryKeyBuilder;
export function primaryKey(...config: any) {
  if (config[0].columns) {
    return new PrimaryKeyBuilder(config[0].columns, config[0].name);
  }
  return new PrimaryKeyBuilder(config);
}

export class PrimaryKeyBuilder {
  static readonly [entityKind]: string = "PgPrimaryKeyBuilder";

  /** @internal */
  columns: PgColumn[];

  /** @internal */
  name?: undefined | string;

  constructor(columns: PgColumn[], name?: undefined | string) {
    this.columns = columns;
    this.name = name;
  }

  /** @internal */
  build(table: PgTable): PrimaryKey {
    return new PrimaryKey(table, this.columns, this.name);
  }
}

export class PrimaryKey {
  static readonly [entityKind]: string = "PgPrimaryKey";

  readonly columns: AnyPgColumn<{}>[];
  readonly name?: undefined | string;
  readonly isNameExplicit: boolean;

  constructor(
    readonly table: PgTable,
    columns: AnyPgColumn<{}>[],
    name?: undefined | string
  ) {
    this.columns = columns;
    this.name = name;
    this.isNameExplicit = !!name;
  }

  getName(): string {
    return this.name ?? `${this.table[PgTable.Symbol.Name]}_${this.columns.map((column) => column.name).join("_")}_pk`;
  }
}

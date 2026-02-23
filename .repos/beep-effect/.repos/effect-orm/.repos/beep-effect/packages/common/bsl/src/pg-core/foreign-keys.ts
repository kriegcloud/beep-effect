import { entityKind } from "../entity";
import { TableName } from "../table.utils";
import type { AnyPgColumn, PgColumn } from "./columns/index";
import type { PgTable } from "./table";

export type UpdateDeleteAction = "cascade" | "restrict" | "no action" | "set null" | "set default";

export type Reference = () => {
  readonly name?: undefined | string;
  readonly columns: PgColumn[];
  readonly foreignTable: PgTable;
  readonly foreignColumns: PgColumn[];
};

export class ForeignKeyBuilder {
  static readonly [entityKind]: string = "PgForeignKeyBuilder";

  /** @internal */
  reference: Reference;

  /** @internal */
  _onUpdate: UpdateDeleteAction | undefined = "no action";

  /** @internal */
  _onDelete: UpdateDeleteAction | undefined = "no action";

  constructor(
    config: () => {
      name?: undefined | string;
      columns: PgColumn[];
      foreignColumns: PgColumn[];
    },
    actions?:
      | undefined
      | {
          onUpdate?: undefined | UpdateDeleteAction;
          onDelete?: undefined | UpdateDeleteAction;
        }
      | undefined
  ) {
    this.reference = () => {
      const { name, columns, foreignColumns } = config();
      return { name, columns, foreignTable: foreignColumns[0]?.table as PgTable, foreignColumns };
    };
    if (actions) {
      this._onUpdate = actions.onUpdate;
      this._onDelete = actions.onDelete;
    }
  }

  onUpdate(action: UpdateDeleteAction): this {
    this._onUpdate = action === undefined ? "no action" : action;
    return this;
  }

  onDelete(action: UpdateDeleteAction): this {
    this._onDelete = action === undefined ? "no action" : action;
    return this;
  }

  /** @internal */
  build(table: PgTable): ForeignKey {
    return new ForeignKey(table, this);
  }
}

export type AnyForeignKeyBuilder = ForeignKeyBuilder;

export class ForeignKey {
  static readonly [entityKind]: string = "PgForeignKey";

  readonly reference: Reference;
  readonly onUpdate: UpdateDeleteAction | undefined;
  readonly onDelete: UpdateDeleteAction | undefined;
  readonly name?: undefined | string;

  constructor(
    readonly table: PgTable,
    builder: ForeignKeyBuilder
  ) {
    this.reference = builder.reference;
    this.onUpdate = builder._onUpdate;
    this.onDelete = builder._onDelete;
  }

  getName(): string {
    const { name, columns, foreignColumns } = this.reference();
    const columnNames = columns.map((column) => column.name);
    const foreignColumnNames = foreignColumns.map((column) => column.name);
    const chunks = [this.table[TableName], ...columnNames, foreignColumns[0]!.table[TableName], ...foreignColumnNames];
    return name ?? `${chunks.join("_")}_fk`;
  }

  isNameExplicit(): boolean {
    return !!this.reference().name;
  }
}

type ColumnsWithTable<TTableName extends string, TColumns extends PgColumn[]> = {
  [Key in keyof TColumns]: AnyPgColumn<{ tableName: TTableName }>;
};

export function foreignKey<
  TTableName extends string,
  TForeignTableName extends string,
  TColumns extends [AnyPgColumn<{ tableName: TTableName }>, ...AnyPgColumn<{ tableName: TTableName }>[]],
>(config: {
  name?: undefined | string;
  columns: TColumns;
  foreignColumns: ColumnsWithTable<TForeignTableName, TColumns>;
}): ForeignKeyBuilder {
  function mappedConfig() {
    const { name, columns, foreignColumns } = config;
    return {
      name,
      columns,
      foreignColumns,
    };
  }

  return new ForeignKeyBuilder(mappedConfig);
}

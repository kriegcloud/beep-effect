import type { EntityId } from "@beep/schema/identity";
import type { DefaultColumns } from "@beep/shared-tables/Columns";
import type { BuildColumns, BuildExtraConfigColumns } from "drizzle-orm";
import type { PgTableExtraConfigValue } from "drizzle-orm/pg-core";
import * as pg from "drizzle-orm/pg-core";
import { globalColumns } from "../common";

export const make = <const TableName extends string, const Brand extends string>(
  entityId: EntityId.EntityIdSchemaInstance<TableName, Brand>
) => {
  const defaultColumns: DefaultColumns<TableName, Brand> = {
    id: entityId.publicId(),
    _rowId: entityId.privateId(),
    ...globalColumns,
  };

  const maker =
    (defaultColumns: DefaultColumns<TableName, Brand>) =>
    <TColumnsMap extends Omit<Record<string, pg.PgColumnBuilderBase>, keyof DefaultColumns<TableName, Brand>>>(
      columns: TColumnsMap,
      extraConfig?:
        | ((
            self: BuildExtraConfigColumns<TableName, TColumnsMap & DefaultColumns<TableName, Brand>, "pg">
          ) => PgTableExtraConfigValue[])
        | undefined
    ) => {
      const cols = {
        ...defaultColumns,
        ...columns,
      };
      return pg.pgTable<TableName, TColumnsMap & DefaultColumns<TableName, Brand>>(
        entityId.tableName,
        cols,
        extraConfig
      ) as pg.PgTableWithColumns<{
        name: TableName;
        schema: undefined;
        columns: BuildColumns<TableName, TColumnsMap & DefaultColumns<TableName, Brand>, "pg">;
        dialect: "pg";
      }>;
    };

  return maker(defaultColumns);
};

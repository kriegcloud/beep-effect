import type { EntityId } from "@beep/schema/EntityId";
import type { SharedEntityIds } from "@beep/shared-domain/EntityIds";
import type { DefaultColumns } from "@beep/shared-tables/Columns";
import type { $Type, BuildColumns, BuildExtraConfigColumns } from "drizzle-orm";
import type { PgTableExtraConfigValue } from "drizzle-orm/pg-core";
import * as pg from "drizzle-orm/pg-core";
import { globalColumns } from "./common";
import { organizationTable } from "./tables/organization.table";

type OrgTableDefaultColumns<TableName extends string, Brand extends string> = DefaultColumns<TableName, Brand> & {
  organizationId: $Type<
    pg.PgTextBuilderInitial<"organization_id", [string, ...string[]]>,
    SharedEntityIds.OrganizationId.Type
  >;
};

export namespace OrgTable {
  export const make = <const TableName extends string, const Brand extends string>(
    entityId: EntityId.EntityIdSchemaInstance<TableName, Brand>
  ) => {
    const defaultColumns: OrgTableDefaultColumns<TableName, Brand> = {
      id: entityId.publicId(),
      _rowId: entityId.privateId(),
      organizationId: pg
        .text("organization_id")
        .references(() => organizationTable.id, {
          onDelete: "cascade",
          onUpdate: "cascade",
        })
        .$type<SharedEntityIds.OrganizationId.Type>(),
      ...globalColumns,
    };

    const maker =
      (defaultColumns: OrgTableDefaultColumns<TableName, Brand>) =>
      <
        TColumnsMap extends Omit<
          Record<string, pg.PgColumnBuilderBase>,
          keyof OrgTableDefaultColumns<TableName, Brand>
        >,
      >(
        columns: TColumnsMap,
        extraConfig?: (
          self: BuildExtraConfigColumns<TableName, TColumnsMap & OrgTableDefaultColumns<TableName, Brand>, "pg">
        ) => PgTableExtraConfigValue[]
      ) => {
        const cols = {
          ...defaultColumns,
          ...columns,
        };
        return pg.pgTable<TableName, TColumnsMap & OrgTableDefaultColumns<TableName, Brand>>(
          entityId.tableName,
          cols,
          extraConfig
        ) as pg.PgTableWithColumns<{
          name: TableName;
          schema: undefined;
          columns: BuildColumns<TableName, TColumnsMap & OrgTableDefaultColumns<TableName, Brand>, "pg">;
          dialect: "pg";
        }>;
      };

    return maker(defaultColumns);
  };
}

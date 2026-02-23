import type { EntityId } from "@beep/schema/identity";
import type { SharedEntityIds } from "@beep/shared-domain/entity-ids";
import type { DefaultColumns } from "@beep/shared-tables/Columns";
import type { $Type, BuildColumns, BuildExtraConfigColumns, NotNull } from "drizzle-orm";
import type { PgTableExtraConfigValue } from "drizzle-orm/pg-core";
import * as pg from "drizzle-orm/pg-core";
import { globalColumns } from "../common";
import { organization } from "../tables/organization.table";

type OrgTableDefaultColumns<TableName extends string, Brand extends string> = DefaultColumns<TableName, Brand> & {
  organizationId: $Type<
    NotNull<pg.PgTextBuilderInitial<"organization_id", [string, ...string[]]>>,
    SharedEntityIds.OrganizationId.Type
  >;
};

export const make = <const TableName extends string, const Brand extends string>(
  entityId: EntityId.EntityId.SchemaInstance<TableName, Brand>
) => {
  const defaultColumns: OrgTableDefaultColumns<TableName, Brand> = {
    id: entityId.publicId(),
    _rowId: entityId.privateId(),
    organizationId: pg
      .text("organization_id")
      .notNull()
      .references(() => organization.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      })
      .notNull()
      .$type<SharedEntityIds.OrganizationId.Type>(),
    ...globalColumns,
  };

  const maker =
    (defaultColumns: OrgTableDefaultColumns<TableName, Brand>) =>
    <TColumnsMap extends Omit<Record<string, pg.PgColumnBuilderBase>, keyof OrgTableDefaultColumns<TableName, Brand>>>(
      columns: TColumnsMap,
      extraConfig?:
        | ((
            self: BuildExtraConfigColumns<TableName, TColumnsMap & OrgTableDefaultColumns<TableName, Brand>, "pg">
          ) => PgTableExtraConfigValue[])
        | undefined
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

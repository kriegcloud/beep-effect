import type { EntityId } from "@beep/schema/identity";
import type { SharedEntityIds } from "@beep/shared-domain/entity-ids";
import type { DefaultColumns } from "@beep/shared-tables/columns";
import { organization } from "@beep/shared-tables/tables/organization.table";
import type { $Type, BuildExtraConfigColumns, NotNull } from "drizzle-orm";
import type { PgTableExtraConfigValue } from "drizzle-orm/pg-core";
import * as pg from "drizzle-orm/pg-core";
import { globalColumns } from "../common";
import type { MergedColumns, PgTableWithMergedColumns, Prettify } from "../table/types";

/**
 * Default columns for organization-scoped tables.
 * Extends DefaultColumns with the organizationId foreign key.
 */
type OrgDefaultColumns<TableName extends string, Brand extends string> = DefaultColumns<TableName, Brand> & {
  organizationId: $Type<
    NotNull<pg.PgTextBuilderInitial<"organization_id", [string, ...string[]]>>,
    SharedEntityIds.OrganizationId.Type
  >;
};

type OrgDefaultColumnKeys = keyof OrgDefaultColumns<string, string>;

/**
 * Constraint type that produces a compile error when conflicting keys are provided.
 * Works by requiring conflicting keys to be `never`, which is unsatisfiable.
 *
 * @example
 * // This will error:
 * OrgTable.make(SomeId)({ organizationId: pg.text("organization_id") })
 * // Error: Type 'PgTextBuilderInitial<...>' is not assignable to type 'never'
 */
type NoOrgDefaultKeys<T> = T & { readonly [K in OrgDefaultColumnKeys]?: never };

type OrgColumnsMap = Omit<Record<string, pg.PgColumnBuilderBase>, OrgDefaultColumnKeys>;

type OrgExtraConfigColumns<
  TableName extends string,
  Brand extends string,
  TColumnsMap extends OrgColumnsMap,
> = BuildExtraConfigColumns<TableName, MergedColumns<OrgDefaultColumns<TableName, Brand>, TColumnsMap>, "pg">;

type OrgExtraConfig<TableName extends string, Brand extends string, TColumnsMap extends OrgColumnsMap> =
  | undefined
  | ((self: OrgExtraConfigColumns<TableName, Brand, TColumnsMap>) => PgTableExtraConfigValue[]);

/**
 * All columns (org defaults + custom), flattened for clean display.
 * This is the type that will be displayed in hover tooltips.
 */
type OrgAllColumns<TableName extends string, Brand extends string, TColumnsMap extends OrgColumnsMap> = Prettify<
  MergedColumns<OrgDefaultColumns<TableName, Brand>, TColumnsMap>
>;

export const make = <const TableName extends string, const Brand extends string>(
  entityId: EntityId.EntityId<TableName, Brand>
): (<TColumnsMap extends OrgColumnsMap>(
  columns: NoOrgDefaultKeys<TColumnsMap>,
  extraConfig?: OrgExtraConfig<TableName, Brand, TColumnsMap>
) => PgTableWithMergedColumns<TableName, OrgAllColumns<TableName, Brand, TColumnsMap>>) => {
  const defaultColumns: OrgDefaultColumns<TableName, Brand> = {
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
    (
      defaultColumns: OrgDefaultColumns<TableName, Brand>
    ): (<TColumnsMap extends OrgColumnsMap>(
      columns: NoOrgDefaultKeys<TColumnsMap>,
      extraConfig?: OrgExtraConfig<TableName, Brand, TColumnsMap>
    ) => PgTableWithMergedColumns<TableName, OrgAllColumns<TableName, Brand, TColumnsMap>>) =>
    <TColumnsMap extends OrgColumnsMap>(
      columns: NoOrgDefaultKeys<TColumnsMap>,
      extraConfig?: OrgExtraConfig<TableName, Brand, TColumnsMap>
    ): PgTableWithMergedColumns<TableName, OrgAllColumns<TableName, Brand, TColumnsMap>> => {
      const cols = {
        ...defaultColumns,
        ...columns,
      };
      return pg.pgTable<TableName, OrgAllColumns<TableName, Brand, TColumnsMap>>(entityId.tableName, cols, extraConfig);
    };

  return maker(defaultColumns);
};

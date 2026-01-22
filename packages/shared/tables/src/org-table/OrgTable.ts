import type { EntityId } from "@beep/schema/identity";
import type { SharedEntityIds } from "@beep/shared-domain/entity-ids";
import type { DefaultColumns } from "@beep/shared-tables/columns";
import { organization } from "@beep/shared-tables/tables/organization.table";
import type { $Type, BuildExtraConfigColumns, NotNull } from "drizzle-orm";
import { sql } from "drizzle-orm";
import type { PgTableExtraConfigValue } from "drizzle-orm/pg-core";
import * as pg from "drizzle-orm/pg-core";
import { globalColumns } from "../common";
import type { MergedColumns, PgTableWithMergedColumns, Prettify } from "../table/types";

// =============================================================================
// RLS OPTIONS
// =============================================================================

/**
 * RLS options for OrgTable.make
 */
export type RlsOptions = {
  /**
   * Controls automatic RLS policy generation.
   *
   * - 'standard' (default): Generates policy requiring exact organizationId match
   * - 'nullable': Generates policy allowing NULL or matching organizationId
   * - 'none': Skips automatic policy generation (for custom policies)
   */
  readonly rlsPolicy?: "standard" | "nullable" | "none";
};

// =============================================================================
// POLICY GENERATORS (Internal)
// =============================================================================

/**
 * Standard tenant isolation policy for NOT NULL organizationId columns.
 * Requires exact match between row's organizationId and session context.
 */
const standardPolicy = (tableName: string) =>
  pg.pgPolicy(`tenant_isolation_${tableName}`, {
    as: "permissive",
    for: "all",
    using: sql`organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text`,
    withCheck: sql`organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text`,
  });

/**
 * Nullable tenant isolation policy for OPTIONAL organizationId columns.
 * Allows access when organizationId is NULL OR matches session context.
 */
const nullablePolicy = (tableName: string) =>
  pg.pgPolicy(`tenant_isolation_${tableName}`, {
    as: "permissive",
    for: "all",
    using: sql`organization_id IS NULL OR organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text`,
    withCheck: sql`organization_id IS NULL OR organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text`,
  });

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
  entityId: EntityId.EntityId<TableName, Brand>,
  options?: RlsOptions
): (<TColumnsMap extends OrgColumnsMap>(
  columns: NoOrgDefaultKeys<TColumnsMap>,
  extraConfig?: OrgExtraConfig<TableName, Brand, TColumnsMap>
) => PgTableWithMergedColumns<TableName, OrgAllColumns<TableName, Brand, TColumnsMap>>) => {
  const rlsPolicy = options?.rlsPolicy ?? "standard";

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

      // Create merged config that combines user's extraConfig with auto-generated RLS policy
      const mergedConfig =
        rlsPolicy === "none"
          ? extraConfig
          : (self: OrgExtraConfigColumns<TableName, Brand, TColumnsMap>): PgTableExtraConfigValue[] => {
              const userConfigs = extraConfig?.(self) ?? [];
              const policy =
                rlsPolicy === "nullable" ? nullablePolicy(entityId.tableName) : standardPolicy(entityId.tableName);
              return [...userConfigs, policy];
            };

      const table = pg.pgTable<TableName, OrgAllColumns<TableName, Brand, TColumnsMap>>(
        entityId.tableName,
        cols,
        mergedConfig
      );

      // Enable RLS unless explicitly disabled
      return rlsPolicy === "none"
        ? table
        : (table.enableRLS() as PgTableWithMergedColumns<TableName, OrgAllColumns<TableName, Brand, TColumnsMap>>);
    };

  return maker(defaultColumns);
};

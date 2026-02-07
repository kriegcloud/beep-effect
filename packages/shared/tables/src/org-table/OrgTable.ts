import type { EntityId } from "@beep/schema/identity";
import type { SharedEntityIds } from "@beep/shared-domain/entity-ids";
import type { DefaultColumns } from "@beep/shared-tables/columns";
import { organization } from "@beep/shared-tables/tables/organization.table";
import type { $Type, BuildExtraConfigColumns, NotNull } from "drizzle-orm";
import { sql } from "drizzle-orm";
import type { PgTableExtraConfigValue } from "drizzle-orm/pg-core";
import * as pg from "drizzle-orm/pg-core";
import type * as A from "effect/Array";
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

  /**
   * When true, the organizationId column is nullable (no .notNull() constraint).
   * Defaults to false (NOT NULL constraint applied).
   *
   * When nullableColumn is true and rlsPolicy is not explicitly set,
   * rlsPolicy defaults to "nullable" instead of "standard".
   */
  readonly nullableColumn?: boolean;
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

// =============================================================================
// COLUMN TYPES
// =============================================================================

/**
 * Default columns for organization-scoped tables with NOT NULL organizationId.
 * Extends DefaultColumns with the organizationId foreign key.
 */
type OrgDefaultColumns<TableName extends string, Brand extends string> = DefaultColumns<TableName, Brand> & {
  organizationId: $Type<
    NotNull<pg.PgTextBuilderInitial<"organization_id", [string, ...string[]]>>,
    SharedEntityIds.OrganizationId.Type
  >;
};

/**
 * Default columns for organization-scoped tables with NULLABLE organizationId.
 * Extends DefaultColumns with a nullable organizationId foreign key.
 */
type OrgDefaultColumnsNullable<TableName extends string, Brand extends string> = DefaultColumns<TableName, Brand> & {
  organizationId: $Type<
    pg.PgTextBuilderInitial<"organization_id", [string, ...string[]]>,
    SharedEntityIds.OrganizationId.Type | null
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

// =============================================================================
// EXTRA CONFIG TYPES (NOT NULL variant)
// =============================================================================

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
 * Used when organizationId is NOT NULL.
 */
type OrgAllColumns<TableName extends string, Brand extends string, TColumnsMap extends OrgColumnsMap> = Prettify<
  MergedColumns<OrgDefaultColumns<TableName, Brand>, TColumnsMap>
>;

// =============================================================================
// EXTRA CONFIG TYPES (NULLABLE variant)
// =============================================================================

type OrgExtraConfigColumnsNullable<
  TableName extends string,
  Brand extends string,
  TColumnsMap extends OrgColumnsMap,
> = BuildExtraConfigColumns<TableName, MergedColumns<OrgDefaultColumnsNullable<TableName, Brand>, TColumnsMap>, "pg">;

type OrgExtraConfigNullable<TableName extends string, Brand extends string, TColumnsMap extends OrgColumnsMap> =
  | undefined
  | ((self: OrgExtraConfigColumnsNullable<TableName, Brand, TColumnsMap>) => PgTableExtraConfigValue[]);

/**
 * All columns (org defaults + custom), flattened for clean display.
 * Used when organizationId is NULLABLE.
 */
type OrgAllColumnsNullable<
  TableName extends string,
  Brand extends string,
  TColumnsMap extends OrgColumnsMap,
> = Prettify<MergedColumns<OrgDefaultColumnsNullable<TableName, Brand>, TColumnsMap>>;

// =============================================================================
// INTERNAL MAKER FUNCTIONS
// =============================================================================

/**
 * Internal implementation for NOT NULL organizationId tables.
 */
const makeNotNull = <
  const TableName extends string,
  const Brand extends string,
  const LinkedActions extends A.NonEmptyReadonlyArray<string>,
>(
  entityId: EntityId.EntityId<TableName, Brand, LinkedActions>,
  rlsPolicy: "standard" | "nullable" | "none"
): (<TColumnsMap extends OrgColumnsMap>(
  columns: NoOrgDefaultKeys<TColumnsMap>,
  extraConfig?: OrgExtraConfig<TableName, Brand, TColumnsMap>
) => PgTableWithMergedColumns<TableName, OrgAllColumns<TableName, Brand, TColumnsMap>>) => {
  const orgFkName = `${entityId.tableName}_org_fk`;

  const defaultColumns: OrgDefaultColumns<TableName, Brand> = {
    id: entityId.publicId(),
    _rowId: entityId.privateId(),
    organizationId: pg.text("organization_id").notNull().$type<SharedEntityIds.OrganizationId.Type>(),
    ...globalColumns,
  };

  return <TColumnsMap extends OrgColumnsMap>(
    columns: NoOrgDefaultKeys<TColumnsMap>,
    extraConfig?: OrgExtraConfig<TableName, Brand, TColumnsMap>
  ): PgTableWithMergedColumns<TableName, OrgAllColumns<TableName, Brand, TColumnsMap>> => {
    const cols = {
      ...defaultColumns,
      ...columns,
    };

    const mergedConfig =
      rlsPolicy === "none"
        ? (self: OrgExtraConfigColumns<TableName, Brand, TColumnsMap>): PgTableExtraConfigValue[] => {
            const userConfigs = extraConfig?.(self) ?? [];
            const orgFk = pg
              .foreignKey({
                name: orgFkName,
                columns: [self.organizationId],
                foreignColumns: [organization.id],
              })
              .onDelete("cascade")
              .onUpdate("cascade");
            return [...userConfigs, orgFk];
          }
        : (self: OrgExtraConfigColumns<TableName, Brand, TColumnsMap>): PgTableExtraConfigValue[] => {
            const userConfigs = extraConfig?.(self) ?? [];
            const orgFk = pg
              .foreignKey({
                name: orgFkName,
                columns: [self.organizationId],
                foreignColumns: [organization.id],
              })
              .onDelete("cascade")
              .onUpdate("cascade");
            const policy =
              rlsPolicy === "nullable" ? nullablePolicy(entityId.tableName) : standardPolicy(entityId.tableName);
            return [...userConfigs, orgFk, policy];
          };

    const table = pg.pgTable<TableName, OrgAllColumns<TableName, Brand, TColumnsMap>>(
      entityId.tableName,
      cols,
      mergedConfig
    );

    return rlsPolicy === "none"
      ? table
      : (table.enableRLS() as PgTableWithMergedColumns<TableName, OrgAllColumns<TableName, Brand, TColumnsMap>>);
  };
};

/**
 * Internal implementation for NULLABLE organizationId tables.
 */
const makeNullable = <
  const TableName extends string,
  const Brand extends string,
  const LinkedActions extends A.NonEmptyReadonlyArray<string>,
>(
  entityId: EntityId.EntityId<TableName, Brand, LinkedActions>,
  rlsPolicy: "standard" | "nullable" | "none"
): (<TColumnsMap extends OrgColumnsMap>(
  columns: NoOrgDefaultKeys<TColumnsMap>,
  extraConfig?: OrgExtraConfigNullable<TableName, Brand, TColumnsMap>
) => PgTableWithMergedColumns<TableName, OrgAllColumnsNullable<TableName, Brand, TColumnsMap>>) => {
  const orgFkName = `${entityId.tableName}_org_fk`;

  const defaultColumns: OrgDefaultColumnsNullable<TableName, Brand> = {
    id: entityId.publicId(),
    _rowId: entityId.privateId(),
    organizationId: pg.text("organization_id").$type<SharedEntityIds.OrganizationId.Type | null>(),
    ...globalColumns,
  };

  return <TColumnsMap extends OrgColumnsMap>(
    columns: NoOrgDefaultKeys<TColumnsMap>,
    extraConfig?: OrgExtraConfigNullable<TableName, Brand, TColumnsMap>
  ): PgTableWithMergedColumns<TableName, OrgAllColumnsNullable<TableName, Brand, TColumnsMap>> => {
    const cols = {
      ...defaultColumns,
      ...columns,
    };

    const mergedConfig =
      rlsPolicy === "none"
        ? (self: OrgExtraConfigColumnsNullable<TableName, Brand, TColumnsMap>): PgTableExtraConfigValue[] => {
            const userConfigs = extraConfig?.(self) ?? [];
            const orgFk = pg
              .foreignKey({
                name: orgFkName,
                columns: [self.organizationId],
                foreignColumns: [organization.id],
              })
              .onDelete("cascade")
              .onUpdate("cascade");
            return [...userConfigs, orgFk];
          }
        : (self: OrgExtraConfigColumnsNullable<TableName, Brand, TColumnsMap>): PgTableExtraConfigValue[] => {
            const userConfigs = extraConfig?.(self) ?? [];
            const orgFk = pg
              .foreignKey({
                name: orgFkName,
                columns: [self.organizationId],
                foreignColumns: [organization.id],
              })
              .onDelete("cascade")
              .onUpdate("cascade");
            const policy =
              rlsPolicy === "nullable" ? nullablePolicy(entityId.tableName) : standardPolicy(entityId.tableName);
            return [...userConfigs, orgFk, policy];
          };

    const table = pg.pgTable<TableName, OrgAllColumnsNullable<TableName, Brand, TColumnsMap>>(
      entityId.tableName,
      cols,
      mergedConfig
    );

    return rlsPolicy === "none"
      ? table
      : (table.enableRLS() as PgTableWithMergedColumns<
          TableName,
          OrgAllColumnsNullable<TableName, Brand, TColumnsMap>
        >);
  };
};

// =============================================================================
// PUBLIC API - FUNCTION OVERLOADS
// =============================================================================

/**
 * Creates an organization-scoped table with automatic RLS policy.
 *
 * @overload When `nullableColumn: true`, organizationId can be NULL
 */
export function make<
  const TableName extends string,
  const Brand extends string,
  const LinkedActions extends A.NonEmptyReadonlyArray<string>,
>(
  entityId: EntityId.EntityId<TableName, Brand, LinkedActions>,
  options: RlsOptions & { readonly nullableColumn: true }
): <TColumnsMap extends OrgColumnsMap>(
  columns: NoOrgDefaultKeys<TColumnsMap>,
  extraConfig?: OrgExtraConfigNullable<TableName, Brand, TColumnsMap>
) => PgTableWithMergedColumns<TableName, OrgAllColumnsNullable<TableName, Brand, TColumnsMap>>;

/**
 * Creates an organization-scoped table with automatic RLS policy.
 *
 * @overload When `nullableColumn: false` or undefined, organizationId is NOT NULL (default)
 */
export function make<
  const TableName extends string,
  const Brand extends string,
  const LinkedActions extends A.NonEmptyReadonlyArray<string>,
>(
  entityId: EntityId.EntityId<TableName, Brand, LinkedActions>,
  options?: RlsOptions & { readonly nullableColumn?: false }
): <TColumnsMap extends OrgColumnsMap>(
  columns: NoOrgDefaultKeys<TColumnsMap>,
  extraConfig?: OrgExtraConfig<TableName, Brand, TColumnsMap>
) => PgTableWithMergedColumns<TableName, OrgAllColumns<TableName, Brand, TColumnsMap>>;

/**
 * Creates an organization-scoped table with automatic RLS policy.
 *
 * Implementation that dispatches to the appropriate internal maker based on nullableColumn.
 */
export function make<
  const TableName extends string,
  const Brand extends string,
  const LinkedActions extends A.NonEmptyReadonlyArray<string>,
>(
  entityId: EntityId.EntityId<TableName, Brand, LinkedActions>,
  options?: RlsOptions
):
  | (<TColumnsMap extends OrgColumnsMap>(
      columns: NoOrgDefaultKeys<TColumnsMap>,
      extraConfig?: OrgExtraConfig<TableName, Brand, TColumnsMap>
    ) => PgTableWithMergedColumns<TableName, OrgAllColumns<TableName, Brand, TColumnsMap>>)
  | (<TColumnsMap extends OrgColumnsMap>(
      columns: NoOrgDefaultKeys<TColumnsMap>,
      extraConfig?: OrgExtraConfigNullable<TableName, Brand, TColumnsMap>
    ) => PgTableWithMergedColumns<TableName, OrgAllColumnsNullable<TableName, Brand, TColumnsMap>>) {
  const nullableColumn = options?.nullableColumn ?? false;
  // Default to "nullable" RLS policy when column is nullable, unless explicitly set
  const rlsPolicy = options?.rlsPolicy ?? (nullableColumn ? "nullable" : "standard");

  if (nullableColumn) {
    return makeNullable(entityId, rlsPolicy);
  }

  return makeNotNull(entityId, rlsPolicy);
}

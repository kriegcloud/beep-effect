import type * as Organization from "@beep/shared-domain/entities/Organization";
import type * as OrganizationTables from "@beep/shared-tables/entities/Organization";
import type * as Table from "@beep/shared-tables/table/Table";
import { bigint, integer, jsonb, pgTable, serial, text } from "drizzle-orm/pg-core";
import { describe, expect, it } from "tstyche";

const ManualOrganizationColumns = {
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
  createdByPrincipal: jsonb("created_by_principal").notNull(),
  entityType: text("entity_type").notNull(),
  id: serial("id").primaryKey(),
  legalName: text("legal_name").notNull(),
  licenseTier: text("license_tier").notNull(),
  name: text("name").notNull(),
  orgId: integer("org_id").notNull(),
  parentOrgId: integer("parent_org_id"),
  rowVersion: integer("row_version").notNull(),
  schemaVersion: text("schema_version").notNull(),
  settings: jsonb("settings").notNull(),
  slug: text("slug").notNull(),
  source: text("source").notNull(),
  updatedAt: bigint("updated_at", { mode: "number" }).notNull(),
  updatedByPrincipal: jsonb("updated_by_principal").notNull(),
};

const ManualOrganizationTable = pgTable("shared_organization", ManualOrganizationColumns);

type OrganizationColumnBuilders = Table.ColumnBuilderMapFor<typeof Organization.Model.definition.fieldMap>;

describe("OrganizationTable types", () => {
  it("preserves table and descriptor metadata literals", () => {
    expect<typeof OrganizationTables.Table.definition.tableName>().type.toBe<"shared_organization">();
    expect<typeof OrganizationTables.Table.definition.entityId.entityType>().type.toBe<"SharedOrganization">();
    expect<typeof OrganizationTables.Table.definition.fieldMap.slug.columnName>().type.toBe<"slug">();
    expect<typeof OrganizationTables.Table.definition.fieldMap.slug.storageKind>().type.toBe<"text">();
    expect<(typeof OrganizationTables.Table.definition.fieldMap.slug.indexHints)[0]["kind"]>().type.toBe<"unique">();
    expect<typeof OrganizationTables.Table.definition.fieldMap.licenseTier.storageKind>().type.toBe<"literal">();
    expect<typeof OrganizationTables.Table.definition.fieldMap.parentOrgId.nullable>().type.toBe<true>();
    expect<typeof OrganizationTables.Table.definition.fieldMap.settings.storageKind>().type.toBe<"json">();
  });

  it("derives Organization column builder types", () => {
    expect<OrganizationColumnBuilders["slug"]>().type.toBe<typeof ManualOrganizationColumns.slug>();
    expect<OrganizationColumnBuilders["licenseTier"]>().type.toBe<typeof ManualOrganizationColumns.licenseTier>();
    expect<OrganizationColumnBuilders["parentOrgId"]>().type.toBe<typeof ManualOrganizationColumns.parentOrgId>();
    expect<OrganizationColumnBuilders["settings"]>().type.toBe<typeof ManualOrganizationColumns.settings>();
  });

  it("derives Organization table column and row types", () => {
    expect<typeof OrganizationTables.Table.slug>().type.toBe<typeof ManualOrganizationTable.slug>();
    expect<typeof OrganizationTables.Table.licenseTier>().type.toBe<typeof ManualOrganizationTable.licenseTier>();
    expect<typeof OrganizationTables.Table.parentOrgId>().type.toBe<typeof ManualOrganizationTable.parentOrgId>();
    expect<typeof OrganizationTables.Table.settings>().type.toBe<typeof ManualOrganizationTable.settings>();
    expect<typeof OrganizationTables.Table.$inferSelect>().type.toBe<typeof ManualOrganizationTable.$inferSelect>();
  });
});

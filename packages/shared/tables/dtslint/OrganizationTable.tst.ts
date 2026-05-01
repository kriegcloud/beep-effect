import type * as Organization from "@beep/shared-domain/entities/Organization";
import type * as OrganizationTables from "@beep/shared-tables/entities/Organization";
import type { EntityTable } from "@beep/shared-tables/table/Table";
import { describe, expect, it } from "tstyche";

describe("OrganizationTable types", () => {
  it("preserves table and descriptor metadata literals", () => {
    expect<typeof OrganizationTables.Table>().type.toBeAssignableTo<EntityTable.TableFor<typeof Organization.Model>>();
    expect<typeof OrganizationTables.Table.definition.tableName>().type.toBe<"shared_organization">();
    expect<typeof OrganizationTables.Table.definition.entityId.entityType>().type.toBe<"SharedOrganization">();
    expect<typeof OrganizationTables.Table.definition.persisted.slug.storageKind>().type.toBe<"text">();
    expect<(typeof OrganizationTables.Table.definition.persisted.slug.indexHints)[0]["kind"]>().type.toBe<"unique">();
    expect<typeof OrganizationTables.Table.definition.persisted.licenseTier.storageKind>().type.toBe<"literal">();
    expect<typeof OrganizationTables.Table.definition.persisted.settings.storageKind>().type.toBe<"jsonb">();
  });
});

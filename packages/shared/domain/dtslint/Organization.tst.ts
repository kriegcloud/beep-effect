import type * as Organization from "@beep/shared-domain/entities/Organization/index";
import type * as Shared from "@beep/shared-domain/identity/Shared";
import type * as O from "effect/Option";
import type * as S from "effect/Schema";
import { describe, expect, it } from "tstyche";

describe("Organization types", () => {
  it("preserves entity, table, and literal metadata", () => {
    expect<typeof Organization.Model.definition.entityId.tableName>().type.toBe<"shared_organization">();
    expect<typeof Organization.Model.definition.entityId.entityType>().type.toBe<"SharedOrganization">();
    expect<typeof Organization.Model.definition.entityId.equivalence>().type.toBe<
      (self: Shared.OrganizationId, that: Shared.OrganizationId) => boolean
    >();
    expect<typeof Organization.Model.definition.fieldMap.id.storageKind>().type.toBe<"entityId">();
    expect<typeof Organization.Model.definition.fieldMap.slug.columnName>().type.toBe<"slug">();
    expect<typeof Organization.Model.definition.fieldMap.slug.storageKind>().type.toBe<"text">();
    expect<(typeof Organization.Model.definition.fieldMap.slug.indexHints)[0]["kind"]>().type.toBe<"unique">();
    expect<typeof Organization.Model.definition.fieldMap.licenseTier.storageKind>().type.toBe<"literal">();
    expect<(typeof Organization.Model.definition.fieldMap.licenseTier.indexHints)[0]["kind"]>().type.toBe<"lookup">();
    expect<typeof Organization.Model.definition.fieldMap.parentOrgId.nullable>().type.toBe<true>();
    expect<typeof Organization.Model.definition.fieldMap.settings.storageKind>().type.toBe<"json">();
  });

  it("preserves Organization profile pack field types", () => {
    expect<typeof Organization.ProfilePack.fields.name>().type.toBe<typeof S.NonEmptyString>();
    expect<typeof Organization.ProfilePack.fields.slug.Type>().type.toBe<typeof Organization.Model.fields.slug.Type>();
    expect<typeof Organization.ProfilePack.fields.licenseTier.Type>().type.toBe<"free" | "team" | "enterprise">();
    expect<typeof Organization.ProfilePack.fields.parentOrgId.Type>().type.toBe<O.Option<Shared.OrganizationId>>();
    expect<typeof Organization.ProfilePack.fields.settings.Type>().type.toBe<Organization.Settings>();
  });

  it("preserves Organization model field types and helper ergonomics", () => {
    expect<Organization.Model["parentOrgId"]>().type.toBe<O.Option<Shared.OrganizationId>>();
    expect<Pick<Organization.Model, "parentOrgId">["parentOrgId"]>().type.toBe<O.Option<Shared.OrganizationId>>();
    expect<typeof Organization.Model.fields.id.Type>().type.toBe<Shared.OrganizationId>();
    expect<typeof Organization.Model.fields.orgId.Type>().type.toBe<Shared.OrganizationId>();
    expect<typeof Organization.Model.fields.licenseTier.Type>().type.toBe<Organization.LicenseTier>();
    expect<typeof Organization.Model.fields.parentOrgId.Type>().type.toBe<O.Option<Shared.OrganizationId>>();
    expect<typeof Organization.hasParentOrganization>().type.toBe<
      (organization: Pick<Organization.Model, "parentOrgId">) => boolean
    >();
    expect<typeof Organization.isTenantRoot>().type.toBe<
      (organization: Pick<Organization.Model, "id" | "orgId">) => boolean
    >();
    expect<typeof Organization.hasValidTenantPlacement>().type.toBe<
      (organization: Pick<Organization.Model, "id" | "orgId" | "parentOrgId">) => boolean
    >();
    expect<{ readonly org: Organization.Model }>().type.toBeAssignableTo<{ readonly org: Organization.Model }>();
  });
});

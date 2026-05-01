import type * as Organization from "@beep/shared-domain/entities/Organization";
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
    expect<typeof Organization.Model.definition.persisted.id.storageKind>().type.toBe<"entityId">();
    expect<typeof Organization.Model.definition.persisted.slug.storageKind>().type.toBe<"text">();
    expect<(typeof Organization.Model.definition.persisted.slug.indexHints)[0]["kind"]>().type.toBe<"unique">();
    expect<typeof Organization.Model.definition.persisted.licenseTier.storageKind>().type.toBe<"literal">();
    expect<(typeof Organization.Model.definition.persisted.licenseTier.indexHints)[0]["kind"]>().type.toBe<"lookup">();
    expect<typeof Organization.Model.definition.persisted.settings.storageKind>().type.toBe<"jsonb">();
  });

  it("preserves Organization definition field types", () => {
    expect<typeof Organization.Model.definition.fields.name>().type.toBe<typeof S.NonEmptyString>();
    expect<typeof Organization.Model.definition.fields.slug.Type>().type.toBe<
      typeof Organization.Model.fields.slug.Type
    >();
    expect<typeof Organization.Model.definition.fields.licenseTier.Type>().type.toBe<"free" | "team" | "enterprise">();
    expect<typeof Organization.Model.definition.fields.parentOrgId.Type>().type.toBe<O.Option<Shared.OrganizationId>>();
    expect<typeof Organization.Model.definition.fields.settings.Type>().type.toBe<Organization.Settings>();
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

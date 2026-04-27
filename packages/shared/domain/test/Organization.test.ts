import * as Organization from "@beep/shared-domain/entities/Organization/index";
import * as Shared from "@beep/shared-domain/identity/Shared";
import { describe, expect, it } from "@effect/vitest";
import * as O from "effect/Option";
import * as S from "effect/Schema";

const decodeOrganization = S.decodeUnknownSync(Organization.Model);
const decodeOrganizationId = S.decodeUnknownSync(Shared.OrganizationId);

const systemPrincipal = {
  component: "Runtime",
  kind: "System",
} as const;

const organizationInput = {
  createdAt: 1,
  createdByPrincipal: systemPrincipal,
  entityType: "SharedOrganization",
  id: 1,
  legalName: "Acme Legal LLC",
  licenseTier: "enterprise",
  name: "Acme",
  orgId: 1,
  rowVersion: 1,
  schemaVersion: "0.0.0",
  settings: {
    allowAgentActions: true,
    defaultRetentionDays: 90,
  },
  slug: "acme",
  source: "Application",
  updatedAt: 2,
  updatedByPrincipal: systemPrincipal,
} as const;

describe("Organization", () => {
  it("reuses the shared OrganizationId metadata", () => {
    expect(Shared.OrganizationId.tableName).toBe("shared_organization");
    expect(Shared.OrganizationId.entityType).toBe("SharedOrganization");
    expect(Shared.OrganizationId.resource).toBe("shared.organization");
    expect(Shared.OrganizationId.equivalence(decodeOrganizationId(1), decodeOrganizationId(1))).toBe(true);
    expect(Shared.OrganizationId.equivalence(decodeOrganizationId(1), decodeOrganizationId(2))).toBe(false);
    expect(decodeOrganizationId(1)).toBe(1);
  });

  it("defines license-tier literals and settings decoding", () => {
    const decodeSettings = S.decodeUnknownSync(Organization.Settings);

    expect(Organization.LicenseTier.is.free("free")).toBe(true);
    expect(Organization.LicenseTier.is.team("team")).toBe(true);
    expect(Organization.LicenseTier.is.enterprise("enterprise")).toBe(true);
    expect(decodeSettings({ allowAgentActions: false, defaultRetentionDays: 30 }).defaultRetentionDays).toBe(30);
    expect(() => decodeSettings({ allowAgentActions: true, defaultRetentionDays: 0 })).toThrow();
  });

  it("decodes nullable parent organization ids to Option values", () => {
    expect(O.isNone(decodeOrganization(organizationInput).parentOrgId)).toBe(true);
    expect(O.isNone(decodeOrganization({ ...organizationInput, parentOrgId: null }).parentOrgId)).toBe(true);
    expect(O.getOrThrow(decodeOrganization({ ...organizationInput, parentOrgId: 1 }).parentOrgId)).toBe(1);
    expect(() => decodeOrganization({ ...organizationInput, parentOrgId: 0 })).toThrow();
  });

  it("materializes profile mixin descriptors for the entity and table layers", () => {
    expect(Organization.ProfileMixin.fieldKeys).toEqual([
      "legalName",
      "licenseTier",
      "name",
      "parentOrgId",
      "settings",
      "slug",
    ]);
    expect(Organization.ProfilePack.fieldMap.slug.columnName).toBe("slug");
    expect(Organization.ProfilePack.fieldMap.slug.indexHints?.[0]?.kind).toBe("unique");
    expect(Organization.ProfilePack.fieldMap.licenseTier.storageKind).toBe("literal");
    expect(Organization.ProfilePack.fieldMap.licenseTier.indexHints?.[0]?.kind).toBe("lookup");
    expect(Organization.ProfilePack.fieldMap.parentOrgId.nullable).toBe(true);
    expect(Organization.ProfilePack.fieldMap.settings.storageKind).toBe("json");
  });

  it("extends BaseEntity through the Organization profile pack", () => {
    const organization = decodeOrganization(organizationInput);

    expect(Organization.Model.definition.entityId).toBe(Shared.OrganizationId);
    expect(Organization.Model.definition.mixins).toBe(Organization.ProfilePack);
    expect(Organization.Model.definition.fieldMap.id.columnName).toBe("id");
    expect(Organization.Model.definition.fieldMap.orgId.columnName).toBe("org_id");
    expect(Organization.Model.definition.fieldMap.slug.columnName).toBe("slug");
    expect(Organization.Model.fields.slug).toBeDefined();
    expect(organization.name).toBe("Acme");
    expect(O.isNone(organization.parentOrgId)).toBe(true);
  });

  it("checks tenant-root and parent organization invariants", () => {
    const rootId = decodeOrganizationId(1);
    const parentId = decodeOrganizationId(2);
    const child = decodeOrganization({
      ...organizationInput,
      id: 3,
      orgId: 2,
      parentOrgId: 2,
      slug: "child-acme",
    });

    expect(Organization.isTenantRoot({ id: rootId, orgId: rootId })).toBe(true);
    expect(Organization.isTenantRoot({ id: rootId, orgId: parentId })).toBe(false);
    expect(Organization.hasParentOrganization({ parentOrgId: O.none() })).toBe(false);
    expect(Organization.hasParentOrganization(child)).toBe(true);
    expect(Organization.hasValidTenantPlacement({ id: rootId, orgId: rootId, parentOrgId: O.none() })).toBe(true);
    expect(Organization.hasValidTenantPlacement(child)).toBe(true);
    expect(
      Organization.hasValidTenantPlacement({
        id: rootId,
        orgId: rootId,
        parentOrgId: O.some(parentId),
      })
    ).toBe(false);
    expect(
      Organization.hasValidTenantPlacement({
        id: rootId,
        orgId: parentId,
        parentOrgId: O.none(),
      })
    ).toBe(false);
  });
});

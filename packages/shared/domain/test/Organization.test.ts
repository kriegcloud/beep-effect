import * as Organization from "@beep/shared-domain/entities/Organization/index";
import * as Shared from "@beep/shared-domain/identity/Shared";
import { assert, describe, expect, it } from "@effect/vitest";
import { Effect, Exit } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";

const decodeOrganization = S.decodeUnknownEffect(Organization.Model);
const decodeOrganizationId = S.decodeUnknownEffect(Shared.OrganizationId);
const expectFailure = Effect.fn("expectFailure")(function* <A, E>(effect: Effect.Effect<A, E, never>) {
  const exit = yield* Effect.exit(effect);
  assert.strictEqual(Exit.isFailure(exit), true);
});

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
  it.effect("reuses the shared OrganizationId metadata", () =>
    Effect.gen(function* () {
      const id1 = yield* decodeOrganizationId(1);
      const id1Again = yield* decodeOrganizationId(1);
      const id2 = yield* decodeOrganizationId(2);

    expect(Shared.OrganizationId.tableName).toBe("shared_organization");
    expect(Shared.OrganizationId.entityType).toBe("SharedOrganization");
    expect(Shared.OrganizationId.resource).toBe("shared.organization");
      expect(Shared.OrganizationId.equivalence(id1, id1Again)).toBe(true);
      expect(Shared.OrganizationId.equivalence(id1, id2)).toBe(false);
      expect(id1).toBe(1);
    })
  );

  it.effect("defines license-tier literals and settings decoding", () =>
    Effect.gen(function* () {
      const decodeSettings = S.decodeUnknownEffect(Organization.Settings);

    expect(Organization.LicenseTier.is.free("free")).toBe(true);
    expect(Organization.LicenseTier.is.team("team")).toBe(true);
    expect(Organization.LicenseTier.is.enterprise("enterprise")).toBe(true);
      expect((yield* decodeSettings({ allowAgentActions: false, defaultRetentionDays: 30 })).defaultRetentionDays).toBe(
        30
      );
      yield* expectFailure(decodeSettings({ allowAgentActions: true, defaultRetentionDays: 0 }));
    })
  );

  it.effect("decodes nullable parent organization ids to Option values", () =>
    Effect.gen(function* () {
      expect(O.isNone((yield* decodeOrganization(organizationInput)).parentOrgId)).toBe(true);
      expect(O.isNone((yield* decodeOrganization({ ...organizationInput, parentOrgId: null })).parentOrgId)).toBe(
        true
      );
      expect(O.getOrThrow((yield* decodeOrganization({ ...organizationInput, parentOrgId: 1 })).parentOrgId)).toBe(1);
      yield* expectFailure(decodeOrganization({ ...organizationInput, parentOrgId: 0 }));
    })
  );

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

  it.effect("extends BaseEntity through the Organization profile pack", () =>
    Effect.gen(function* () {
      const organization = yield* decodeOrganization(organizationInput);

    expect(Organization.Model.definition.entityId).toBe(Shared.OrganizationId);
    expect(Organization.Model.definition.mixins).toBe(Organization.ProfilePack);
    expect(Organization.Model.definition.fieldMap.id.columnName).toBe("id");
    expect(Organization.Model.definition.fieldMap.orgId.columnName).toBe("org_id");
    expect(Organization.Model.definition.fieldMap.slug.columnName).toBe("slug");
    expect(Organization.Model.fields.slug).toBeDefined();
    expect(organization.name).toBe("Acme");
    expect(O.isNone(organization.parentOrgId)).toBe(true);
    })
  );

  it.effect("checks tenant-root and parent organization invariants", () =>
    Effect.gen(function* () {
      const rootId = yield* decodeOrganizationId(1);
      const parentId = yield* decodeOrganizationId(2);
      const child = yield* decodeOrganization({
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
    })
  );
});

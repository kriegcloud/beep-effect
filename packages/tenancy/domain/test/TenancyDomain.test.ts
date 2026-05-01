import * as Tenancy from "@beep/shared-domain/identity/Tenancy";
import {
  MembershipRole,
  MembershipStatus,
  Organization,
  OrganizationKind,
  OrganizationLicenseTier,
  PrincipalKind,
  UserRole,
} from "@beep/tenancy-domain";
import { describe, expect, it } from "@effect/vitest";
import * as S from "effect/Schema";

const systemPrincipal = { kind: "System", component: "Runtime" } as const;

const baseEntityInput = (entityType: string, id: number) => ({
  createdAt: id,
  createdByPrincipal: systemPrincipal,
  entityType,
  id,
  orgId: 1,
  rowVersion: 1,
  schemaVersion: "0.0.0",
  source: "System",
  updatedAt: id + 1,
  updatedByPrincipal: systemPrincipal,
});

describe("@beep/tenancy-domain", () => {
  it("exports value schemas from the package identity", () => {
    expect(OrganizationKind.is.solo_practice("solo_practice")).toBe(true);
    expect(OrganizationKind.is.wealth_firm("wealth_firm")).toBe(true);
    expect(OrganizationLicenseTier.is.solo("solo")).toBe(true);
    expect(OrganizationLicenseTier.is.team("team")).toBe(true);
    expect(PrincipalKind.is.agent("agent")).toBe(true);
    expect(PrincipalKind.is.user("user")).toBe(true);
    expect(MembershipRole.is.advisor("advisor")).toBe(true);
    expect(MembershipRole.is.owner_attorney("owner_attorney")).toBe(true);
    expect(MembershipStatus.is.active("active")).toBe(true);
    expect(UserRole.is.attorney("attorney")).toBe(true);
  });

  it("wires Organization to the tenancy BaseEntity identity", () => {
    expect(Organization.definition.entityId).toBe(Tenancy.OrganizationId);
    expect(Organization.definition.entityId.tableName).toBe("tenancy_organization");
    expect(Organization.definition.entityId.entityType).toBe("TenancyOrganization");
    expect(Organization.definition.fieldMap.id.storageKind).toBe("entityId");
    expect(Organization.definition.fieldMap.kind.storageKind).toBe("literal");
  });

  it("decodes and constructs an Organization row", () => {
    const decoded = S.decodeUnknownSync(Organization)({
      ...baseEntityInput("TenancyOrganization", 1),
      fixtureKey: "org.acme",
      kind: "solo_practice",
      licenseTier: "solo",
      name: "Acme Practice",
    });
    const constructed = new Organization(decoded);

    expect(decoded).toBeInstanceOf(Organization);
    expect(constructed).toBeInstanceOf(Organization);
    expect(constructed.entityType).toBe("TenancyOrganization");
    expect(constructed.kind).toBe("solo_practice");
    expect(constructed.name).toBe("Acme Practice");
  });
});

import type * as Tenancy from "@beep/shared-domain/identity/Tenancy";
import {
  type MembershipRole,
  type MembershipRole as MembershipRoleType,
  type MembershipStatus,
  type MembershipStatus as MembershipStatusType,
  Organization,
  type OrganizationKind,
  type OrganizationKind as OrganizationKindType,
  type OrganizationLicenseTier,
  type OrganizationLicenseTier as OrganizationLicenseTierType,
  type PrincipalKind,
  type PrincipalKind as PrincipalKindType,
  type UserRole,
  type UserRole as UserRoleType,
} from "@beep/tenancy-domain";
import { describe, expect, it } from "tstyche";

declare const organization: typeof Organization.Type;

describe("@beep/tenancy-domain", () => {
  it("preserves exported value schema types", () => {
    expect<typeof OrganizationKind.Type>().type.toBe<OrganizationKindType>();
    expect<OrganizationKindType>().type.toBe<"solo_practice" | "wealth_firm">();
    expect<typeof OrganizationLicenseTier.Type>().type.toBe<OrganizationLicenseTierType>();
    expect<OrganizationLicenseTierType>().type.toBe<"solo" | "team">();
    expect<typeof PrincipalKind.Type>().type.toBe<PrincipalKindType>();
    expect<PrincipalKindType>().type.toBe<"agent" | "user">();
    expect<typeof MembershipRole.Type>().type.toBe<MembershipRoleType>();
    expect<MembershipRoleType>().type.toBe<"advisor" | "owner_attorney">();
    expect<typeof MembershipStatus.Type>().type.toBe<MembershipStatusType>();
    expect<MembershipStatusType>().type.toBe<"active">();
    expect<typeof UserRole.Type>().type.toBe<UserRoleType>();
    expect<UserRoleType>().type.toBe<"advisor" | "attorney">();
  });

  it("preserves Organization BaseEntity identity wiring", () => {
    expect(Organization.definition.entityId).type.toBe<typeof Tenancy.OrganizationId>();
    expect<typeof Organization.definition.entityId.tableName>().type.toBe<"tenancy_organization">();
    expect<typeof Organization.definition.entityId.entityType>().type.toBe<"TenancyOrganization">();
    expect<typeof Organization.definition.persisted.kind.storageKind>().type.toBe<"literal">();
    expect<typeof Organization.definition.persisted.name.columnName>().type.toBe<"name">();
    expect<typeof Organization.fields.kind.Type>().type.toBe<OrganizationKindType>();
  });

  it("preserves decode and constructor types", () => {
    expect<typeof Organization.Encoded>().type.toBeAssignableTo<typeof Organization.Encoded>();
    expect(new Organization(organization)).type.toBe<Organization>();
    expect<Organization["kind"]>().type.toBe<OrganizationKindType>();
  });
});

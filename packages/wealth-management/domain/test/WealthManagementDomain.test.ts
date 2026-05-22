import * as WealthManagement from "@beep/shared-domain/identity/WealthManagement";
import { Account, AccountType, HouseholdStatus, PartyType, WealthClientStatus } from "@beep/wealth-management-domain";
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

describe("@beep/wealth-management-domain", () => {
  it("exports value schemas from the package identity", () => {
    expect(AccountType.is.taxable_brokerage("taxable_brokerage")).toBe(true);
    expect(HouseholdStatus.is.active("active")).toBe(true);
    expect(PartyType.is.person("person")).toBe(true);
    expect(WealthClientStatus.is.active_client("active_client")).toBe(true);
  });

  it("wires Account to the wealth-management BaseEntity identity", () => {
    expect(Account.definition.entityId).toBe(WealthManagement.AccountId);
    expect(Account.definition.entityId.tableName).toBe("wealth_management_account");
    expect(Account.definition.entityId.entityType).toBe("WealthManagementAccount");
    expect(Account.definition.persisted.id.storageKind).toBe("entityId");
    expect(Account.definition.persisted.accountType.storageKind).toBe("literal");
  });

  it("decodes and constructs an Account row", () => {
    const decoded = S.decodeUnknownSync(Account)({
      ...baseEntityInput("WealthManagementAccount", 6),
      accountType: "taxable_brokerage",
      externalLabel: "Taxable Brokerage",
      fixtureKey: "account.taxable",
      householdFixtureKey: "household.acme",
    });
    const constructed = Account.make(decoded);

    expect(decoded).toBeInstanceOf(Account);
    expect(constructed).toBeInstanceOf(Account);
    expect(constructed.entityType).toBe("WealthManagementAccount");
    expect(constructed.accountType).toBe("taxable_brokerage");
    expect(constructed.householdFixtureKey).toBe("household.acme");
  });
});

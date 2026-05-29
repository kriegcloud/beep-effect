import { Account } from "@beep/wealth-management-domain";
import { describe, expect, it } from "tstyche";
import type * as WealthManagement from "@beep/shared-domain/identity/WealthManagement";
import type {
  AccountType,
  AccountType as AccountTypeType,
  HouseholdStatus,
  HouseholdStatus as HouseholdStatusType,
  PartyType,
  PartyType as PartyTypeType,
  WealthClientStatus,
  WealthClientStatus as WealthClientStatusType,
} from "@beep/wealth-management-domain";

declare const account: Account;

describe("@beep/wealth-management-domain", () => {
  it("preserves exported value schema types", () => {
    expect<AccountType>().type.toBe<AccountTypeType>();
    expect<AccountTypeType>().type.toBe<"taxable_brokerage">();
    expect<HouseholdStatus>().type.toBe<HouseholdStatusType>();
    expect<HouseholdStatusType>().type.toBe<"active">();
    expect<PartyType>().type.toBe<PartyTypeType>();
    expect<PartyTypeType>().type.toBe<"person">();
    expect<WealthClientStatus>().type.toBe<WealthClientStatusType>();
    expect<WealthClientStatusType>().type.toBe<"active_client">();
  });

  it("preserves Account BaseEntity identity wiring", () => {
    expect(Account.definition.entityId).type.toBe<typeof WealthManagement.AccountId>();
    expect<typeof Account.definition.entityId.tableName>().type.toBe<"wealth_management_account">();
    expect<typeof Account.definition.entityId.entityType>().type.toBe<"WealthManagementAccount">();
    expect<typeof Account.definition.persisted.accountType.storageKind>().type.toBe<"literal">();
    expect<typeof Account.definition.persisted.householdFixtureKey.columnName>().type.toBe<"household_fixture_key">();
    expect<typeof Account.fields.accountType.Type>().type.toBe<AccountTypeType>();
  });

  it("preserves decode and constructor types", () => {
    expect<typeof Account.Encoded>().type.toBeAssignableTo<typeof Account.Encoded>();
    expect(Account.make(account)).type.toBe<Account>();
    expect<Account["accountType"]>().type.toBe<AccountTypeType>();
  });
});

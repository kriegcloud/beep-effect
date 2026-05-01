import type * as WealthManagement from "@beep/shared-domain/identity/WealthManagement";
import {
  Account,
  type AccountType,
  type AccountType as AccountTypeType,
  type HouseholdStatus,
  type HouseholdStatus as HouseholdStatusType,
  type PartyType,
  type PartyType as PartyTypeType,
  type WealthClientStatus,
  type WealthClientStatus as WealthClientStatusType,
} from "@beep/wealth-management-domain";
import { describe, expect, it } from "tstyche";

declare const account: typeof Account.Type;

describe("@beep/wealth-management-domain", () => {
  it("preserves exported value schema types", () => {
    expect<typeof AccountType.Type>().type.toBe<AccountTypeType>();
    expect<AccountTypeType>().type.toBe<"taxable_brokerage">();
    expect<typeof HouseholdStatus.Type>().type.toBe<HouseholdStatusType>();
    expect<HouseholdStatusType>().type.toBe<"active">();
    expect<typeof PartyType.Type>().type.toBe<PartyTypeType>();
    expect<PartyTypeType>().type.toBe<"person">();
    expect<typeof WealthClientStatus.Type>().type.toBe<WealthClientStatusType>();
    expect<WealthClientStatusType>().type.toBe<"active_client">();
  });

  it("preserves Account BaseEntity identity wiring", () => {
    expect(Account.definition.entityId).type.toBe<typeof WealthManagement.AccountId>();
    expect<typeof Account.definition.entityId.tableName>().type.toBe<"wealth_management_account">();
    expect<typeof Account.definition.entityId.entityType>().type.toBe<"WealthManagementAccount">();
    expect<typeof Account.definition.fieldMap.accountType.storageKind>().type.toBe<"literal">();
    expect<typeof Account.definition.fieldMap.householdFixtureKey.columnName>().type.toBe<"household_fixture_key">();
    expect<typeof Account.fields.accountType.Type>().type.toBe<AccountTypeType>();
  });

  it("preserves decode and constructor types", () => {
    expect<typeof Account.Encoded>().type.toBeAssignableTo<typeof Account.Encoded>();
    expect(new Account(account)).type.toBe<Account>();
    expect<Account["accountType"]>().type.toBe<AccountTypeType>();
  });
});

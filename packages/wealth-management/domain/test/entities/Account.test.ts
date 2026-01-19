/**
 * Account model tests
 *
 * @module wm-domain/test/entities/Account
 * @since 0.1.0
 */
import { effect, strictEqual } from "@beep/testkit";
import { SharedEntityIds, WealthManagementEntityIds } from "@beep/shared-domain";
import * as Effect from "effect/Effect";
import * as DateTime from "effect/DateTime";
import * as O from "effect/Option";
import { describe } from "bun:test";
import { Entities } from "@beep/wm-domain";
import { ACCOUNT_IRI } from "@beep/wm-domain/ontology";

describe("@beep/wm-domain/entities/Account", () => {
  const testAccountId = WealthManagementEntityIds.WmAccountId.make(
    "wm_account__12345678-1234-1234-1234-123456789012"
  );
  const testOrgId = SharedEntityIds.OrganizationId.make(
    "shared_organization__87654321-4321-4321-4321-210987654321"
  );
  const testCustodianId = WealthManagementEntityIds.WmCustodianId.make(
    "wm_custodian__11111111-1111-1111-1111-111111111111"
  );

  effect("creates Account with required fields via insert.make", () =>
    Effect.gen(function* () {
      const now = yield* DateTime.now;

      const account = Entities.Account.Model.insert.make({
        id: testAccountId,
        organizationId: testOrgId,
        accountNumber: "123-456-789",
        accountType: "Individual",
        taxStatus: "Taxable",
        custodianId: testCustodianId,
        createdAt: now,
        updatedAt: now,
      });

      strictEqual(account.accountNumber, "123-456-789");
      strictEqual(account.accountType, "Individual");
      strictEqual(account.taxStatus, "Taxable");
    })
  );

  effect("validates account type enum values", () =>
    Effect.gen(function* () {
      const accountTypes = ["Individual", "Joint", "Trust", "Entity", "Retirement"] as const;
      const now = yield* DateTime.now;

      for (const type of accountTypes) {
        const account = Entities.Account.Model.insert.make({
          id: testAccountId,
          organizationId: testOrgId,
          accountNumber: "TEST-001",
          accountType: type,
          taxStatus: "Taxable",
          custodianId: testCustodianId,
          createdAt: now,
          updatedAt: now,
        });

        strictEqual(account.accountType, type);
      }
    })
  );

  effect("validates tax status enum values", () =>
    Effect.gen(function* () {
      const taxStatuses = ["Taxable", "Tax-Deferred", "Tax-Exempt"] as const;
      const now = yield* DateTime.now;

      for (const status of taxStatuses) {
        const account = Entities.Account.Model.insert.make({
          id: testAccountId,
          organizationId: testOrgId,
          accountNumber: "TEST-002",
          accountType: "Individual",
          taxStatus: status,
          custodianId: testCustodianId,
          createdAt: now,
          updatedAt: now,
        });

        strictEqual(account.taxStatus, status);
      }
    })
  );

  effect("creates Account with optional openDate", () =>
    Effect.gen(function* () {
      const now = yield* DateTime.now;
      const openDate = new Date("2023-01-15");

      const account = Entities.Account.Model.insert.make({
        id: testAccountId,
        organizationId: testOrgId,
        accountNumber: "123-456-789",
        accountType: "Joint",
        taxStatus: "Tax-Deferred",
        custodianId: testCustodianId,
        openDate: O.some(openDate),
        createdAt: now,
        updatedAt: now,
      });

      strictEqual(O.isSome(account.openDate), true);
      strictEqual(O.getOrNull(account.openDate)?.getFullYear(), 2023);
    })
  );

  effect("has correct default classIri", () =>
    Effect.gen(function* () {
      const now = yield* DateTime.now;

      const account = Entities.Account.Model.insert.make({
        id: testAccountId,
        organizationId: testOrgId,
        accountNumber: "TEST-IRI",
        accountType: "Individual",
        taxStatus: "Taxable",
        custodianId: testCustodianId,
        createdAt: now,
        updatedAt: now,
      });

      strictEqual(account.classIri, ACCOUNT_IRI);
    })
  );
});

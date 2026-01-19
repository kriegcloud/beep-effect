/**
 * Investment model tests
 *
 * @module wm-domain/test/entities/Investment
 * @since 0.1.0
 */
import { effect, strictEqual } from "@beep/testkit";
import { SharedEntityIds, WealthManagementEntityIds } from "@beep/shared-domain";
import * as Effect from "effect/Effect";
import * as DateTime from "effect/DateTime";
import * as O from "effect/Option";
import { describe } from "bun:test";
import { Entities } from "@beep/wm-domain";
import { INVESTMENT_IRI } from "@beep/wm-domain/ontology";

describe("@beep/wm-domain/entities/Investment", () => {
  const testInvestmentId = WealthManagementEntityIds.WmInvestmentId.make(
    "wm_investment__12345678-1234-1234-1234-123456789012"
  );
  const testOrgId = SharedEntityIds.OrganizationId.make(
    "shared_organization__87654321-4321-4321-4321-210987654321"
  );

  effect("creates Investment with required fields via insert.make", () =>
    Effect.gen(function* () {
      const now = yield* DateTime.now;

      const investment = Entities.Investment.Model.insert.make({
        id: testInvestmentId,
        organizationId: testOrgId,
        investmentType: "Security",
        createdAt: now,
        updatedAt: now,
      });

      strictEqual(investment.investmentType, "Security");
    })
  );

  effect("validates investment type enum values", () =>
    Effect.gen(function* () {
      const investmentTypes = ["Security", "PrivateFund", "RealEstate", "Alternative"] as const;
      const now = yield* DateTime.now;

      for (const type of investmentTypes) {
        const investment = Entities.Investment.Model.insert.make({
          id: testInvestmentId,
          organizationId: testOrgId,
          investmentType: type,
          createdAt: now,
          updatedAt: now,
        });

        strictEqual(investment.investmentType, type);
      }
    })
  );

  effect("creates Investment with optional valuation fields", () =>
    Effect.gen(function* () {
      const now = yield* DateTime.now;

      const investment = Entities.Investment.Model.insert.make({
        id: testInvestmentId,
        organizationId: testOrgId,
        investmentType: "Security",
        securityId: O.some("US0378331005"),
        ticker: O.some("AAPL"),
        costBasis: O.some(10000),
        marketValue: O.some(15000),
        normalizedSecurityId: O.some("us0378331005"),
        createdAt: now,
        updatedAt: now,
      });

      strictEqual(O.getOrNull(investment.securityId), "US0378331005");
      strictEqual(O.getOrNull(investment.ticker), "AAPL");
      strictEqual(O.getOrNull(investment.costBasis), 10000);
      strictEqual(O.getOrNull(investment.marketValue), 15000);
    })
  );

  effect("has correct default classIri", () =>
    Effect.gen(function* () {
      const now = yield* DateTime.now;

      const investment = Entities.Investment.Model.insert.make({
        id: testInvestmentId,
        organizationId: testOrgId,
        investmentType: "Security",
        createdAt: now,
        updatedAt: now,
      });

      strictEqual(investment.classIri, INVESTMENT_IRI);
    })
  );
});

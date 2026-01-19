/**
 * Household model tests
 *
 * @module wm-domain/test/entities/Household
 * @since 0.1.0
 */

import { describe } from "bun:test";
import { SharedEntityIds, WealthManagementEntityIds } from "@beep/shared-domain";
import { effect, strictEqual } from "@beep/testkit";
import { Entities } from "@beep/wm-domain";
import { HOUSEHOLD_IRI } from "@beep/wm-domain/ontology";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";

describe("@beep/wm-domain/entities/Household", () => {
  const testHouseholdId = WealthManagementEntityIds.WmHouseholdId.make(
    "wm_household__12345678-1234-1234-1234-123456789012"
  );
  const testOrgId = SharedEntityIds.OrganizationId.make("shared_organization__87654321-4321-4321-4321-210987654321");

  effect("creates Household with required fields via insert.make", () =>
    Effect.gen(function* () {
      const household = Entities.Household.Model.insert.make({
        id: testHouseholdId,
        organizationId: testOrgId,
        householdName: "Smith Household",
      });

      strictEqual(household.householdName, "Smith Household");
    })
  );

  effect("creates Household with aggregated fields", () =>
    Effect.gen(function* () {
      const household = Entities.Household.Model.insert.make({
        id: testHouseholdId,
        organizationId: testOrgId,
        householdName: "Johnson Household",
        memberCount: O.some(4),
        totalAUM: O.some(10000000),
      });

      strictEqual(O.getOrNull(household.memberCount), 4);
      strictEqual(O.getOrNull(household.totalAUM), 10000000);
    })
  );

  effect("validates memberCount can be zero", () =>
    Effect.gen(function* () {
      const household = Entities.Household.Model.insert.make({
        id: testHouseholdId,
        organizationId: testOrgId,
        householdName: "Test Household",
        memberCount: O.some(0),
      });

      strictEqual(O.getOrNull(household.memberCount), 0);
    })
  );

  effect("has correct default classIri", () =>
    Effect.gen(function* () {
      const household = Entities.Household.Model.insert.make({
        id: testHouseholdId,
        organizationId: testOrgId,
        householdName: "Test Household",
      });

      strictEqual(household.classIri, HOUSEHOLD_IRI);
    })
  );
});

/**
 * Beneficiary model tests
 *
 * @module wm-domain/test/entities/Beneficiary
 * @since 0.1.0
 */
import { effect, strictEqual } from "@beep/testkit";
import { SharedEntityIds, WealthManagementEntityIds } from "@beep/shared-domain";
import * as Effect from "effect/Effect";
import * as DateTime from "effect/DateTime";
import * as O from "effect/Option";
import { describe } from "bun:test";
import { Entities } from "@beep/wm-domain";
import { BENEFICIARY_IRI } from "@beep/wm-domain/ontology";

describe("@beep/wm-domain/entities/Beneficiary", () => {
  const testBeneficiaryId = WealthManagementEntityIds.WmBeneficiaryId.make(
    "wm_beneficiary__12345678-1234-1234-1234-123456789012"
  );
  const testOrgId = SharedEntityIds.OrganizationId.make(
    "shared_organization__87654321-4321-4321-4321-210987654321"
  );
  const testClientId = WealthManagementEntityIds.WmClientId.make(
    "wm_client__11111111-1111-1111-1111-111111111111"
  );

  effect("creates Beneficiary with required fields via insert.make", () =>
    Effect.gen(function* () {
      const now = yield* DateTime.now;

      const beneficiary = Entities.Beneficiary.Model.insert.make({
        id: testBeneficiaryId,
        organizationId: testOrgId,
        beneficiaryType: "Primary",
        createdAt: now,
        updatedAt: now,
      });

      strictEqual(beneficiary.beneficiaryType, "Primary");
    })
  );

  effect("validates beneficiary type enum values", () =>
    Effect.gen(function* () {
      const beneficiaryTypes = ["Primary", "Contingent", "Per Stirpes"] as const;
      const now = yield* DateTime.now;

      for (const type of beneficiaryTypes) {
        const beneficiary = Entities.Beneficiary.Model.insert.make({
          id: testBeneficiaryId,
          organizationId: testOrgId,
          beneficiaryType: type,
          createdAt: now,
          updatedAt: now,
        });

        strictEqual(beneficiary.beneficiaryType, type);
      }
    })
  );

  effect("creates Beneficiary with percentage and linked client", () =>
    Effect.gen(function* () {
      const now = yield* DateTime.now;

      const beneficiary = Entities.Beneficiary.Model.insert.make({
        id: testBeneficiaryId,
        organizationId: testOrgId,
        beneficiaryType: "Primary",
        beneficiaryPercentage: O.some(50),
        linkedClientId: O.some(testClientId),
        createdAt: now,
        updatedAt: now,
      });

      strictEqual(O.getOrNull(beneficiary.beneficiaryPercentage), 50);
      strictEqual(O.getOrNull(beneficiary.linkedClientId), testClientId);
    })
  );

  effect("validates percentage boundaries", () =>
    Effect.gen(function* () {
      const now = yield* DateTime.now;

      // Test 0%
      const beneficiaryZero = Entities.Beneficiary.Model.insert.make({
        id: testBeneficiaryId,
        organizationId: testOrgId,
        beneficiaryType: "Contingent",
        beneficiaryPercentage: O.some(0),
        createdAt: now,
        updatedAt: now,
      });
      strictEqual(O.getOrNull(beneficiaryZero.beneficiaryPercentage), 0);

      // Test 100%
      const beneficiaryFull = Entities.Beneficiary.Model.insert.make({
        id: testBeneficiaryId,
        organizationId: testOrgId,
        beneficiaryType: "Primary",
        beneficiaryPercentage: O.some(100),
        createdAt: now,
        updatedAt: now,
      });
      strictEqual(O.getOrNull(beneficiaryFull.beneficiaryPercentage), 100);
    })
  );

  effect("has correct default classIri", () =>
    Effect.gen(function* () {
      const now = yield* DateTime.now;

      const beneficiary = Entities.Beneficiary.Model.insert.make({
        id: testBeneficiaryId,
        organizationId: testOrgId,
        beneficiaryType: "Primary",
        createdAt: now,
        updatedAt: now,
      });

      strictEqual(beneficiary.classIri, BENEFICIARY_IRI);
    })
  );
});

/**
 * Custodian model tests
 *
 * @module wm-domain/test/entities/Custodian
 * @since 0.1.0
 */
import { effect, strictEqual } from "@beep/testkit";
import { SharedEntityIds, WealthManagementEntityIds } from "@beep/shared-domain";
import * as Effect from "effect/Effect";
import * as DateTime from "effect/DateTime";
import * as O from "effect/Option";
import { describe } from "bun:test";
import { Entities } from "@beep/wm-domain";
import { CUSTODIAN_IRI } from "@beep/wm-domain/ontology";

describe("@beep/wm-domain/entities/Custodian", () => {
  const testCustodianId = WealthManagementEntityIds.WmCustodianId.make(
    "wm_custodian__12345678-1234-1234-1234-123456789012"
  );
  const testOrgId = SharedEntityIds.OrganizationId.make(
    "shared_organization__87654321-4321-4321-4321-210987654321"
  );

  effect("creates Custodian with required fields via insert.make", () =>
    Effect.gen(function* () {
      const now = yield* DateTime.now;

      const custodian = Entities.Custodian.Model.insert.make({
        id: testCustodianId,
        organizationId: testOrgId,
        custodianName: "Charles Schwab",
        createdAt: now,
        updatedAt: now,
      });

      strictEqual(custodian.custodianName, "Charles Schwab");
    })
  );

  effect("creates Custodian with optional code", () =>
    Effect.gen(function* () {
      const now = yield* DateTime.now;

      const custodian = Entities.Custodian.Model.insert.make({
        id: testCustodianId,
        organizationId: testOrgId,
        custodianName: "Fidelity Investments",
        custodianCode: O.some("FIDELITY"),
        createdAt: now,
        updatedAt: now,
      });

      strictEqual(custodian.custodianName, "Fidelity Investments");
      strictEqual(O.getOrNull(custodian.custodianCode), "FIDELITY");
    })
  );

  effect("has correct default classIri", () =>
    Effect.gen(function* () {
      const now = yield* DateTime.now;

      const custodian = Entities.Custodian.Model.insert.make({
        id: testCustodianId,
        organizationId: testOrgId,
        custodianName: "Test Custodian",
        createdAt: now,
        updatedAt: now,
      });

      strictEqual(custodian.classIri, CUSTODIAN_IRI);
    })
  );
});

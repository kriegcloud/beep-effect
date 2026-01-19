/**
 * Custodian model tests
 *
 * @module wm-domain/test/entities/Custodian
 * @since 0.1.0
 */

import { describe } from "bun:test";
import { SharedEntityIds, WealthManagementEntityIds } from "@beep/shared-domain";
import { effect, strictEqual } from "@beep/testkit";
import { Entities } from "@beep/wm-domain";
import { CUSTODIAN_IRI } from "@beep/wm-domain/ontology";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";

describe("@beep/wm-domain/entities/Custodian", () => {
  const testCustodianId = WealthManagementEntityIds.WmCustodianId.make(
    "wm_custodian__12345678-1234-1234-1234-123456789012"
  );
  const testOrgId = SharedEntityIds.OrganizationId.make("shared_organization__87654321-4321-4321-4321-210987654321");

  effect("creates Custodian with required fields via insert.make", () =>
    Effect.gen(function* () {
      const custodian = Entities.Custodian.Model.insert.make({
        id: testCustodianId,
        organizationId: testOrgId,
        custodianName: "Charles Schwab",
      });

      strictEqual(custodian.custodianName, "Charles Schwab");
    })
  );

  effect("creates Custodian with optional code", () =>
    Effect.gen(function* () {
      const custodian = Entities.Custodian.Model.insert.make({
        id: testCustodianId,
        organizationId: testOrgId,
        custodianName: "Fidelity Investments",
        custodianCode: O.some("FIDELITY"),
      });

      strictEqual(custodian.custodianName, "Fidelity Investments");
      strictEqual(O.getOrNull(custodian.custodianCode), "FIDELITY");
    })
  );

  effect("has correct default classIri", () =>
    Effect.gen(function* () {
      const custodian = Entities.Custodian.Model.insert.make({
        id: testCustodianId,
        organizationId: testOrgId,
        custodianName: "Test Custodian",
      });

      strictEqual(custodian.classIri, CUSTODIAN_IRI);
    })
  );
});

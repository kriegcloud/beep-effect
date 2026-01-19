/**
 * Client model tests
 *
 * Tests for Client entity schema creation and validation.
 * Sensitive fields (taxId, dateOfBirth, netWorth) use Option<Redacted<T>>
 * and are tested for omission (defaulting to O.none()).
 *
 * @module wm-domain/test/entities/Client
 * @since 0.1.0
 */

import { describe } from "bun:test";
import { SharedEntityIds, WealthManagementEntityIds } from "@beep/shared-domain";
import { effect, strictEqual } from "@beep/testkit";
import { Entities } from "@beep/wm-domain";
import { CLIENT_IRI } from "@beep/wm-domain/ontology";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";

describe("@beep/wm-domain/entities/Client", () => {
  const testClientId = WealthManagementEntityIds.WmClientId.make("wm_client__12345678-1234-1234-1234-123456789012");
  const testOrgId = SharedEntityIds.OrganizationId.make("shared_organization__87654321-4321-4321-4321-210987654321");

  effect("creates Client with required fields via insert.make", () =>
    Effect.gen(function* () {
      const client = Entities.Client.Model.insert.make({
        id: testClientId,
        organizationId: testOrgId,
        legalName: "John Smith",
        riskTolerance: "Moderate",
        kycStatus: "Verified",
      });

      strictEqual(client.legalName, "John Smith");
      strictEqual(client.riskTolerance, "Moderate");
      strictEqual(client.kycStatus, "Verified");
      // Sensitive fields default to O.none() when omitted
      strictEqual(O.isNone(client.taxId), true);
      strictEqual(O.isNone(client.dateOfBirth), true);
      strictEqual(O.isNone(client.netWorth), true);
    })
  );

  effect("validates risk tolerance enum values", () =>
    Effect.gen(function* () {
      const riskValues = ["Conservative", "Moderate", "Aggressive"] as const;

      for (const risk of riskValues) {
        const client = Entities.Client.Model.insert.make({
          id: testClientId,
          organizationId: testOrgId,
          legalName: "Test Client",
          riskTolerance: risk,
          kycStatus: "Verified",
        });

        strictEqual(client.riskTolerance, risk);
      }
    })
  );

  effect("validates KYC status enum values", () =>
    Effect.gen(function* () {
      const kycValues = ["Pending", "Verified", "Expired"] as const;

      for (const kyc of kycValues) {
        const client = Entities.Client.Model.insert.make({
          id: testClientId,
          organizationId: testOrgId,
          legalName: "Test Client",
          riskTolerance: "Moderate",
          kycStatus: kyc,
        });

        strictEqual(client.kycStatus, kyc);
      }
    })
  );

  effect("has correct default classIri", () =>
    Effect.gen(function* () {
      const client = Entities.Client.Model.insert.make({
        id: testClientId,
        organizationId: testOrgId,
        legalName: "Test Client",
        riskTolerance: "Moderate",
        kycStatus: "Verified",
      });

      strictEqual(client.classIri, CLIENT_IRI);
    })
  );

  effect("creates Client with optional non-sensitive fields", () =>
    Effect.gen(function* () {
      const client = Entities.Client.Model.insert.make({
        id: testClientId,
        organizationId: testOrgId,
        legalName: "Jane Doe",
        riskTolerance: "Aggressive",
        kycStatus: "Pending",
        normalizedName: O.some("jane doe"),
        taxIdHash: O.some("abc123hash"),
      });

      strictEqual(client.legalName, "Jane Doe");
      strictEqual(O.getOrNull(client.normalizedName), "jane doe");
      strictEqual(O.getOrNull(client.taxIdHash), "abc123hash");
    })
  );
});

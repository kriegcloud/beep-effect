/**
 * Trust model tests
 *
 * @module wm-domain/test/entities/Trust
 * @since 0.1.0
 */
import { effect, strictEqual } from "@beep/testkit";
import { SharedEntityIds, WealthManagementEntityIds } from "@beep/shared-domain";
import * as Effect from "effect/Effect";
import * as DateTime from "effect/DateTime";
import * as O from "effect/Option";
import { describe } from "bun:test";
import { Entities } from "@beep/wm-domain";
import { TRUST_IRI } from "@beep/wm-domain/ontology";

describe("@beep/wm-domain/entities/Trust", () => {
  const testTrustId = WealthManagementEntityIds.WmTrustId.make(
    "wm_trust__12345678-1234-1234-1234-123456789012"
  );
  const testOrgId = SharedEntityIds.OrganizationId.make(
    "shared_organization__87654321-4321-4321-4321-210987654321"
  );

  effect("creates Trust with required fields via insert.make", () =>
    Effect.gen(function* () {
      const now = yield* DateTime.now;

      const trust = Entities.Trust.Model.insert.make({
        id: testTrustId,
        organizationId: testOrgId,
        trustName: "Smith Family Trust",
        trustType: "Revocable",
        createdAt: now,
        updatedAt: now,
      });

      strictEqual(trust.trustName, "Smith Family Trust");
      strictEqual(trust.trustType, "Revocable");
    })
  );

  effect("validates trust type enum values", () =>
    Effect.gen(function* () {
      const trustTypes = ["Revocable", "Irrevocable", "Charitable"] as const;
      const now = yield* DateTime.now;

      for (const type of trustTypes) {
        const trust = Entities.Trust.Model.insert.make({
          id: testTrustId,
          organizationId: testOrgId,
          trustName: "Test Trust",
          trustType: type,
          createdAt: now,
          updatedAt: now,
        });

        strictEqual(trust.trustType, type);
      }
    })
  );

  effect("creates Trust with optional fields", () =>
    Effect.gen(function* () {
      const now = yield* DateTime.now;
      const establishedDate = new Date("2020-06-15");

      const trust = Entities.Trust.Model.insert.make({
        id: testTrustId,
        organizationId: testOrgId,
        trustName: "Charitable Foundation Trust",
        trustType: "Charitable",
        taxIdHash: O.some("hashedvalue123"),
        establishedDate: O.some(establishedDate),
        jurisdiction: O.some("Delaware"),
        createdAt: now,
        updatedAt: now,
      });

      strictEqual(O.getOrNull(trust.jurisdiction), "Delaware");
      strictEqual(O.getOrNull(trust.establishedDate)?.getFullYear(), 2020);
    })
  );

  effect("has correct default classIri", () =>
    Effect.gen(function* () {
      const now = yield* DateTime.now;

      const trust = Entities.Trust.Model.insert.make({
        id: testTrustId,
        organizationId: testOrgId,
        trustName: "Test Trust",
        trustType: "Revocable",
        createdAt: now,
        updatedAt: now,
      });

      strictEqual(trust.classIri, TRUST_IRI);
    })
  );
});

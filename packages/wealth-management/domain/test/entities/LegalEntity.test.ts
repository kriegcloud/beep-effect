/**
 * LegalEntity model tests
 *
 * @module wm-domain/test/entities/LegalEntity
 * @since 0.1.0
 */

import { describe } from "bun:test";
import { SharedEntityIds, WealthManagementEntityIds } from "@beep/shared-domain";
import { effect, strictEqual } from "@beep/testkit";
import { Entities } from "@beep/wm-domain";
import { LEGAL_ENTITY_IRI } from "@beep/wm-domain/ontology";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";

describe("@beep/wm-domain/entities/LegalEntity", () => {
  const testEntityId = WealthManagementEntityIds.WmLegalEntityId.make(
    "wm_entity__12345678-1234-1234-1234-123456789012"
  );
  const testOrgId = SharedEntityIds.OrganizationId.make("shared_organization__87654321-4321-4321-4321-210987654321");

  effect("creates LegalEntity with required fields via insert.make", () =>
    Effect.gen(function* () {
      const legalEntity = Entities.LegalEntity.Model.insert.make({
        id: testEntityId,
        organizationId: testOrgId,
        entityName: "Smith Family Holdings LLC",
        entityType: "LLC",
      });

      strictEqual(legalEntity.entityName, "Smith Family Holdings LLC");
      strictEqual(legalEntity.entityType, "LLC");
    })
  );

  effect("validates entity type enum values", () =>
    Effect.gen(function* () {
      const entityTypes = ["LLC", "Partnership", "LimitedPartnership", "Corporation", "Foundation"] as const;

      for (const type of entityTypes) {
        const legalEntity = Entities.LegalEntity.Model.insert.make({
          id: testEntityId,
          organizationId: testOrgId,
          entityName: "Test Entity",
          entityType: type,
        });

        strictEqual(legalEntity.entityType, type);
      }
    })
  );

  effect("creates LegalEntity with optional fields", () =>
    Effect.gen(function* () {
      const formationDate = new Date("2018-03-20");

      const legalEntity = Entities.LegalEntity.Model.insert.make({
        id: testEntityId,
        organizationId: testOrgId,
        entityName: "Johnson Family LP",
        entityType: "LimitedPartnership",
        taxIdHash: O.some("hashedtaxid456"),
        stateOfFormation: O.some("Delaware"),
        formationDate: O.some(formationDate),
      });

      strictEqual(O.getOrNull(legalEntity.stateOfFormation), "Delaware");
      strictEqual(O.getOrNull(legalEntity.formationDate)?.getFullYear(), 2018);
    })
  );

  effect("has correct default classIri", () =>
    Effect.gen(function* () {
      const legalEntity = Entities.LegalEntity.Model.insert.make({
        id: testEntityId,
        organizationId: testOrgId,
        entityName: "Test Entity",
        entityType: "Corporation",
      });

      strictEqual(legalEntity.classIri, LEGAL_ENTITY_IRI);
    })
  );
});

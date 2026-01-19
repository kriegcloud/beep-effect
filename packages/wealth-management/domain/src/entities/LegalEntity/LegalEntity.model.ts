/**
 * LegalEntity domain model for Wealth Management slice
 *
 * Represents a legal entity (LLC, partnership, corporation).
 *
 * @module wm-domain/entities/LegalEntity
 * @since 0.1.0
 */
import { $WmDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { SharedEntityIds, WealthManagementEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";
import { LEGAL_ENTITY_IRI } from "../../ontology/class-iris";

const $I = $WmDomainId.create("entities/LegalEntity");

/**
 * Legal entity type values.
 *
 * @since 0.1.0
 * @category enums
 */
export const EntityTypeValues = ["LLC", "Partnership", "LimitedPartnership", "Corporation", "Foundation"] as const;
export type EntityType = (typeof EntityTypeValues)[number];

/**
 * LegalEntity model for the wealth management slice.
 *
 * Represents a legal entity with formation and tax identification.
 *
 * @example
 * ```ts
 * import { Entities } from "@beep/wm-domain";
 * import { WealthManagementEntityIds, SharedEntityIds } from "@beep/shared-domain";
 * import * as DateTime from "effect/DateTime";
 *
 * const entity = Entities.LegalEntity.Model.insert.make({
 *   id: WealthManagementEntityIds.WmLegalEntityId.make("wm_entity__uuid"),
 *   organizationId: SharedEntityIds.OrganizationId.make("shared_organization__uuid"),
 *   entityName: "Smith Family Holdings LLC",
 *   entityType: "LLC",
 *   createdAt: DateTime.unsafeNow(),
 *   updatedAt: DateTime.unsafeNow(),
 * });
 * ```
 *
 * @since 0.1.0
 * @category models
 */
export class Model extends M.Class<Model>($I`LegalEntityModel`)(
  makeFields(WealthManagementEntityIds.WmLegalEntityId, {
    organizationId: SharedEntityIds.OrganizationId,

    /**
     * Ontology class IRI for this entity type.
     */
    classIri: BS.toOptionalWithDefault(S.String)(LEGAL_ENTITY_IRI).annotations({
      description: "OWL class IRI for the LegalEntity entity",
    }),

    /**
     * Legal name of the entity.
     */
    entityName: S.String.annotations({
      description: "Legal name of the entity",
    }),

    /**
     * Type of legal entity structure.
     */
    entityType: S.Literal(...EntityTypeValues).annotations({
      description: "Legal entity type classification",
    }),

    /**
     * Tax identifier (EIN) for the entity - SENSITIVE.
     * Suppressed from logs for PII protection.
     */
    taxId: BS.FieldSensitiveOptionOmittable(
      S.String.annotations({
        description: "Entity tax identifier (EIN) - SENSITIVE",
      })
    ),

    /**
     * Hash of taxId for entity resolution without exposing raw PII.
     */
    taxIdHash: BS.FieldOptionOmittable(
      S.String.annotations({
        description: "SHA-256 hash of taxId for secure matching",
      })
    ),

    /**
     * State or country where the entity was formed.
     */
    stateOfFormation: BS.FieldOptionOmittable(
      S.String.annotations({
        description: "State or country of formation",
      })
    ),

    /**
     * Date the entity was formed.
     */
    formationDate: BS.FieldOptionOmittable(
      S.Date.annotations({
        description: "Entity formation date",
      })
    ),
  }),
  $I.annotations("LegalEntityModel", {
    description: "Wealth management legal entity with formation and tax identification.",
  })
) {
  static readonly utils = modelKit(Model);
}

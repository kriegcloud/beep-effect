/**
 * Trust domain model for Wealth Management slice
 *
 * Represents a trust structure (revocable, irrevocable, charitable).
 *
 * @module wm-domain/entities/Trust
 * @since 0.1.0
 */
import { $WmDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { SharedEntityIds, WealthManagementEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";
import { TRUST_IRI } from "../../ontology/class-iris";

const $I = $WmDomainId.create("entities/Trust");

/**
 * Trust type values.
 *
 * @since 0.1.0
 * @category enums
 */
export const TrustTypeValues = ["Revocable", "Irrevocable", "Charitable"] as const;
export type TrustType = (typeof TrustTypeValues)[number];

/**
 * Trust model for the wealth management slice.
 *
 * Represents a trust structure with jurisdiction and establishment tracking.
 *
 * @example
 * ```ts
 * import { Entities } from "@beep/wm-domain";
 * import { WealthManagementEntityIds, SharedEntityIds } from "@beep/shared-domain";
 * import * as DateTime from "effect/DateTime";
 *
 * const trust = Entities.Trust.Model.insert.make({
 *   id: WealthManagementEntityIds.WmTrustId.make("wm_trust__uuid"),
 *   organizationId: SharedEntityIds.OrganizationId.make("shared_organization__uuid"),
 *   trustName: "Smith Family Trust",
 *   trustType: "Revocable",
 *   createdAt: DateTime.unsafeNow(),
 *   updatedAt: DateTime.unsafeNow(),
 * });
 * ```
 *
 * @since 0.1.0
 * @category models
 */
export class Model extends M.Class<Model>($I`TrustModel`)(
  makeFields(WealthManagementEntityIds.WmTrustId, {
    organizationId: SharedEntityIds.OrganizationId,

    /**
     * Ontology class IRI for this entity type.
     */
    classIri: BS.toOptionalWithDefault(S.String)(TRUST_IRI).annotations({
      description: "OWL class IRI for the Trust entity",
    }),

    /**
     * Name of the trust.
     */
    trustName: S.String.annotations({
      description: "Legal name of the trust",
    }),

    /**
     * Type of trust structure.
     */
    trustType: S.Literal(...TrustTypeValues).annotations({
      description: "Trust type classification",
    }),

    /**
     * Tax identifier (EIN) for the trust - SENSITIVE.
     * Suppressed from logs for PII protection.
     */
    taxId: BS.FieldSensitiveOptionOmittable(
      S.String.annotations({
        description: "Trust tax identifier (EIN) - SENSITIVE",
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
     * Date the trust was established.
     */
    establishedDate: BS.FieldOptionOmittable(
      S.Date.annotations({
        description: "Trust establishment date",
      })
    ),

    /**
     * Jurisdiction (state/country) where trust was formed.
     */
    jurisdiction: BS.FieldOptionOmittable(
      S.String.annotations({
        description: "Trust jurisdiction (state/country)",
      })
    ),
  }),
  $I.annotations("TrustModel", {
    description: "Wealth management trust entity with jurisdiction and establishment tracking.",
  })
) {
  static readonly utils = modelKit(Model);
}

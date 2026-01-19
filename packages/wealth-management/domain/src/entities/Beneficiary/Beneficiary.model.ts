/**
 * Beneficiary domain model for Wealth Management slice
 *
 * Represents a beneficiary designation on accounts and trusts.
 *
 * @module wm-domain/entities/Beneficiary
 * @since 0.1.0
 */
import { $WmDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { SharedEntityIds, WealthManagementEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";
import { BENEFICIARY_IRI } from "../../ontology/class-iris";

const $I = $WmDomainId.create("entities/Beneficiary");

/**
 * Beneficiary type values.
 *
 * @since 0.1.0
 * @category enums
 */
export const BeneficiaryTypeValues = ["Primary", "Contingent", "Per Stirpes"] as const;
export type BeneficiaryType = (typeof BeneficiaryTypeValues)[number];

/**
 * Beneficiary model for the wealth management slice.
 *
 * Represents a beneficiary designation with percentage allocation.
 *
 * @example
 * ```ts
 * import { Entities } from "@beep/wm-domain";
 * import { WealthManagementEntityIds, SharedEntityIds } from "@beep/shared-domain";
 * import * as DateTime from "effect/DateTime";
 *
 * const beneficiary = Entities.Beneficiary.Model.insert.make({
 *   id: WealthManagementEntityIds.WmBeneficiaryId.make("wm_beneficiary__uuid"),
 *   organizationId: SharedEntityIds.OrganizationId.make("shared_organization__uuid"),
 *   beneficiaryType: "Primary",
 *   beneficiaryPercentage: 50,
 *   createdAt: DateTime.unsafeNow(),
 *   updatedAt: DateTime.unsafeNow(),
 * });
 * ```
 *
 * @since 0.1.0
 * @category models
 */
export class Model extends M.Class<Model>($I`BeneficiaryModel`)(
  makeFields(WealthManagementEntityIds.WmBeneficiaryId, {
    organizationId: SharedEntityIds.OrganizationId,

    /**
     * Ontology class IRI for this entity type.
     */
    classIri: BS.toOptionalWithDefault(S.String)(BENEFICIARY_IRI).annotations({
      description: "OWL class IRI for the Beneficiary entity",
    }),

    /**
     * Type of beneficiary designation.
     */
    beneficiaryType: S.Literal(...BeneficiaryTypeValues).annotations({
      description: "Beneficiary designation type",
    }),

    /**
     * Percentage allocation for this beneficiary (0-100).
     */
    beneficiaryPercentage: BS.FieldOptionOmittable(
      S.Number.pipe(S.greaterThanOrEqualTo(0), S.lessThanOrEqualTo(100)).annotations({
        description: "Beneficiary percentage allocation (0-100)",
      })
    ),

    /**
     * Optional link to a Client entity if beneficiary is also a client.
     */
    linkedClientId: BS.FieldOptionOmittable(
      WealthManagementEntityIds.WmClientId.annotations({
        description: "Reference to linked Client entity if applicable",
      })
    ),
  }),
  $I.annotations("BeneficiaryModel", {
    description: "Wealth management beneficiary designation with percentage allocation.",
  })
) {
  static readonly utils = modelKit(Model);
}

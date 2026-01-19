/**
 * Custodian domain model for Wealth Management slice
 *
 * Represents a custodian institution holding assets.
 *
 * @module wm-domain/entities/Custodian
 * @since 0.1.0
 */
import { $WmDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { SharedEntityIds, WealthManagementEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";
import { CUSTODIAN_IRI } from "../../ontology/class-iris";

const $I = $WmDomainId.create("entities/Custodian");

/**
 * Custodian model for the wealth management slice.
 *
 * Represents a custodian institution that holds client assets.
 *
 * @example
 * ```ts
 * import { Entities } from "@beep/wm-domain";
 * import { WealthManagementEntityIds, SharedEntityIds } from "@beep/shared-domain";
 * import * as DateTime from "effect/DateTime";
 *
 * const custodian = Entities.Custodian.Model.insert.make({
 *   id: WealthManagementEntityIds.WmCustodianId.make("wm_custodian__uuid"),
 *   organizationId: SharedEntityIds.OrganizationId.make("shared_organization__uuid"),
 *   custodianName: "Charles Schwab",
 *   createdAt: DateTime.unsafeNow(),
 *   updatedAt: DateTime.unsafeNow(),
 * });
 * ```
 *
 * @since 0.1.0
 * @category models
 */
export class Model extends M.Class<Model>($I`CustodianModel`)(
  makeFields(WealthManagementEntityIds.WmCustodianId, {
    organizationId: SharedEntityIds.OrganizationId,

    /**
     * Ontology class IRI for this entity type.
     */
    classIri: BS.toOptionalWithDefault(S.String)(CUSTODIAN_IRI).annotations({
      description: "OWL class IRI for the Custodian entity",
    }),

    /**
     * Name of the custodian institution.
     */
    custodianName: S.String.annotations({
      description: "Name of the custodian institution",
    }),

    /**
     * Custodian identifier code (if applicable).
     */
    custodianCode: BS.FieldOptionOmittable(
      S.String.annotations({
        description: "Unique custodian identifier code",
      })
    ),
  }),
  $I.annotations("CustodianModel", {
    description: "Wealth management custodian institution holding client assets.",
  })
) {
  static readonly utils = modelKit(Model);
}

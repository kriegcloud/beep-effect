/**
 * Household domain model for Wealth Management slice
 *
 * Represents a household grouping of clients.
 *
 * @module wm-domain/entities/Household
 * @since 0.1.0
 */
import { $WmDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { SharedEntityIds, WealthManagementEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";
import { HOUSEHOLD_IRI } from "../../ontology/class-iris";

const $I = $WmDomainId.create("entities/Household");

/**
 * Household model for the wealth management slice.
 *
 * Represents a household grouping with aggregated metrics.
 *
 * @example
 * ```ts
 * import { Entities } from "@beep/wm-domain";
 * import { WealthManagementEntityIds, SharedEntityIds } from "@beep/shared-domain";
 * import * as DateTime from "effect/DateTime";
 *
 * const household = Entities.Household.Model.insert.make({
 *   id: WealthManagementEntityIds.WmHouseholdId.make("wm_household__uuid"),
 *   organizationId: SharedEntityIds.OrganizationId.make("shared_organization__uuid"),
 *   householdName: "Smith Household",
 *   createdAt: DateTime.unsafeNow(),
 *   updatedAt: DateTime.unsafeNow(),
 * });
 * ```
 *
 * @since 0.1.0
 * @category models
 */
export class Model extends M.Class<Model>($I`HouseholdModel`)(
  makeFields(WealthManagementEntityIds.WmHouseholdId, {
    organizationId: SharedEntityIds.OrganizationId,

    /**
     * Ontology class IRI for this entity type.
     */
    classIri: BS.toOptionalWithDefault(S.String)(HOUSEHOLD_IRI).annotations({
      description: "OWL class IRI for the Household entity",
    }),

    /**
     * Name of the household grouping.
     */
    householdName: S.String.annotations({
      description: "Name for the household grouping",
    }),

    /**
     * Number of members in the household (computed).
     */
    memberCount: BS.FieldOptionOmittable(
      S.Number.pipe(S.int(), S.nonNegative()).annotations({
        description: "Count of household members",
      })
    ),

    /**
     * Total assets under management across household (computed).
     */
    totalAUM: BS.FieldOptionOmittable(
      S.Number.annotations({
        description: "Total assets under management for household",
      })
    ),
  }),
  $I.annotations("HouseholdModel", {
    description: "Wealth management household grouping with aggregated metrics.",
  })
) {
  static readonly utils = modelKit(Model);
}

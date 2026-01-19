/**
 * Investment domain model for Wealth Management slice
 *
 * Represents an investment position (securities, private funds, real estate, alternatives).
 *
 * @module wm-domain/entities/Investment
 * @since 0.1.0
 */
import { $WmDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { SharedEntityIds, WealthManagementEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";
import { INVESTMENT_IRI } from "../../ontology/class-iris";

const $I = $WmDomainId.create("entities/Investment");

/**
 * Investment type values.
 *
 * @since 0.1.0
 * @category enums
 */
export const InvestmentTypeValues = ["Security", "PrivateFund", "RealEstate", "Alternative"] as const;
export type InvestmentType = (typeof InvestmentTypeValues)[number];

/**
 * Investment model for the wealth management slice.
 *
 * Represents an investment position with valuation and security identification.
 *
 * @example
 * ```ts
 * import { Entities } from "@beep/wm-domain";
 * import { WealthManagementEntityIds, SharedEntityIds } from "@beep/shared-domain";
 * import * as DateTime from "effect/DateTime";
 *
 * const investment = Entities.Investment.Model.insert.make({
 *   id: WealthManagementEntityIds.WmInvestmentId.make("wm_investment__uuid"),
 *   organizationId: SharedEntityIds.OrganizationId.make("shared_organization__uuid"),
 *   investmentType: "Security",
 *   ticker: "AAPL",
 *   createdAt: DateTime.unsafeNow(),
 *   updatedAt: DateTime.unsafeNow(),
 * });
 * ```
 *
 * @since 0.1.0
 * @category models
 */
export class Model extends M.Class<Model>($I`InvestmentModel`)(
  makeFields(WealthManagementEntityIds.WmInvestmentId, {
    organizationId: SharedEntityIds.OrganizationId,

    /**
     * Ontology class IRI for this entity type.
     */
    classIri: BS.toOptionalWithDefault(S.String)(INVESTMENT_IRI).annotations({
      description: "OWL class IRI for the Investment entity",
    }),

    /**
     * Type of investment.
     */
    investmentType: S.Literal(...InvestmentTypeValues).annotations({
      description: "Investment type classification",
    }),

    /**
     * Security identifier (CUSIP/ISIN) for publicly traded securities.
     */
    securityId: BS.FieldOptionOmittable(
      S.String.annotations({
        description: "Security identifier (CUSIP/ISIN)",
      })
    ),

    /**
     * Stock ticker symbol for publicly traded securities.
     */
    ticker: BS.FieldOptionOmittable(
      S.String.annotations({
        description: "Stock ticker symbol",
      })
    ),

    /**
     * Original cost basis of the investment.
     */
    costBasis: BS.FieldOptionOmittable(
      S.Number.annotations({
        description: "Original cost basis amount",
      })
    ),

    /**
     * Current market value of the investment.
     */
    marketValue: BS.FieldOptionOmittable(
      S.Number.annotations({
        description: "Current market value",
      })
    ),

    /**
     * Normalized security ID for entity resolution.
     */
    normalizedSecurityId: BS.FieldOptionOmittable(
      S.String.annotations({
        description: "Normalized security identifier for matching",
      })
    ),
  }),
  $I.annotations("InvestmentModel", {
    description: "Wealth management investment position with valuation and security identification.",
  })
) {
  static readonly utils = modelKit(Model);
}

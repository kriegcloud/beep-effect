/**
 * Account domain model for Wealth Management slice
 *
 * Represents an investment or custody account.
 *
 * @module wm-domain/entities/Account
 * @since 0.1.0
 */
import { $WmDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { SharedEntityIds, WealthManagementEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";
import { ACCOUNT_IRI } from "../../ontology/class-iris";

const $I = $WmDomainId.create("entities/Account");

/**
 * Account type values.
 *
 * @since 0.1.0
 * @category enums
 */
export const AccountTypeValues = ["Individual", "Joint", "Trust", "Entity", "Retirement"] as const;
export type AccountType = (typeof AccountTypeValues)[number];

/**
 * Tax status values for accounts.
 *
 * @since 0.1.0
 * @category enums
 */
export const TaxStatusValues = ["Taxable", "Tax-Deferred", "Tax-Exempt"] as const;
export type TaxStatus = (typeof TaxStatusValues)[number];

/**
 * Account model for the wealth management slice.
 *
 * Represents an investment or custody account with custodian relationship
 * and tax status tracking.
 *
 * @example
 * ```ts
 * import { Entities } from "@beep/wm-domain";
 * import { WealthManagementEntityIds, SharedEntityIds } from "@beep/shared-domain";
 * import * as DateTime from "effect/DateTime";
 *
 * const account = Entities.Account.Model.insert.make({
 *   id: WealthManagementEntityIds.WmAccountId.make("wm_account__uuid"),
 *   organizationId: SharedEntityIds.OrganizationId.make("shared_organization__uuid"),
 *   accountNumber: "123-456-789",
 *   accountType: "Individual",
 *   taxStatus: "Taxable",
 *   custodianId: WealthManagementEntityIds.WmCustodianId.make("wm_custodian__uuid"),
 *   createdAt: DateTime.unsafeNow(),
 *   updatedAt: DateTime.unsafeNow(),
 * });
 * ```
 *
 * @since 0.1.0
 * @category models
 */
export class Model extends M.Class<Model>($I`AccountModel`)(
  makeFields(WealthManagementEntityIds.WmAccountId, {
    organizationId: SharedEntityIds.OrganizationId,

    /**
     * Ontology class IRI for this entity type.
     */
    classIri: BS.toOptionalWithDefault(S.String)(ACCOUNT_IRI).annotations({
      description: "OWL class IRI for the Account entity",
    }),

    /**
     * Account number identifier.
     */
    accountNumber: S.String.annotations({
      description: "Unique account number identifier",
    }),

    /**
     * Type of account.
     */
    accountType: S.Literal(...AccountTypeValues).annotations({
      description: "Account type classification",
    }),

    /**
     * Tax treatment status of the account.
     */
    taxStatus: S.Literal(...TaxStatusValues).annotations({
      description: "Tax treatment status",
    }),

    /**
     * Reference to the custodian holding the account.
     */
    custodianId: WealthManagementEntityIds.WmCustodianId.annotations({
      description: "Custodian institution holding this account",
    }),

    /**
     * Date the account was opened.
     */
    openDate: BS.FieldOptionOmittable(
      S.Date.annotations({
        description: "Account opening date",
      })
    ),
  }),
  $I.annotations("AccountModel", {
    description: "Wealth management account entity with custodian relationship and tax status.",
  })
) {
  static readonly utils = modelKit(Model);
}

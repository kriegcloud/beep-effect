/**
 * Client domain model for Wealth Management slice
 *
 * Represents an individual or entity client in the wealth management context.
 *
 * @module wm-domain/entities/Client
 * @since 0.1.0
 */
import { $WmDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { SharedEntityIds, WealthManagementEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";
import { CLIENT_IRI } from "../../ontology/class-iris";

const $I = $WmDomainId.create("entities/Client");

/**
 * Risk tolerance levels for client risk assessment.
 *
 * @since 0.1.0
 * @category enums
 */
export const RiskToleranceValues = ["Conservative", "Moderate", "Aggressive"] as const;
export type RiskTolerance = (typeof RiskToleranceValues)[number];

/**
 * KYC (Know Your Customer) verification status.
 *
 * @since 0.1.0
 * @category enums
 */
export const KycStatusValues = ["Pending", "Verified", "Expired"] as const;
export type KycStatus = (typeof KycStatusValues)[number];

/**
 * Client model for the wealth management slice.
 *
 * Represents an individual or entity client with PII handling,
 * risk assessment, and KYC compliance tracking.
 *
 * @example
 * ```ts
 * import { Entities } from "@beep/wm-domain";
 * import { WealthManagementEntityIds, SharedEntityIds } from "@beep/shared-domain";
 * import * as DateTime from "effect/DateTime";
 *
 * const client = Entities.Client.Model.insert.make({
 *   id: WealthManagementEntityIds.WmClientId.make("wm_client__uuid"),
 *   organizationId: SharedEntityIds.OrganizationId.make("shared_organization__uuid"),
 *   legalName: "John Smith",
 *   riskTolerance: "Moderate",
 *   kycStatus: "Verified",
 *   createdAt: DateTime.unsafeNow(),
 *   updatedAt: DateTime.unsafeNow(),
 * });
 * ```
 *
 * @since 0.1.0
 * @category models
 */
export class Model extends M.Class<Model>($I`ClientModel`)(
  makeFields(WealthManagementEntityIds.WmClientId, {
    organizationId: SharedEntityIds.OrganizationId,

    /**
     * Ontology class IRI for this entity type.
     */
    classIri: BS.toOptionalWithDefault(S.String)(CLIENT_IRI).annotations({
      description: "OWL class IRI for the Client entity",
    }),

    /**
     * Legal name of the client.
     */
    legalName: S.String.annotations({
      description: "Full legal name of the client",
    }),

    /**
     * Risk tolerance level from risk questionnaire or IPS.
     */
    riskTolerance: S.Literal(...RiskToleranceValues).annotations({
      description: "Client risk tolerance level",
    }),

    /**
     * KYC verification status.
     */
    kycStatus: S.Literal(...KycStatusValues).annotations({
      description: "Know Your Customer verification status",
    }),

    /**
     * Tax identifier (SSN/EIN) - SENSITIVE.
     * Suppressed from logs for PII protection.
     */
    taxId: BS.FieldSensitiveOptionOmittable(
      S.String.annotations({
        description: "Tax identifier (SSN/EIN) - SENSITIVE",
      })
    ),

    /**
     * Date of birth - SENSITIVE.
     * Suppressed from logs for PII protection.
     */
    dateOfBirth: BS.FieldSensitiveOptionOmittable(
      S.Date.annotations({
        description: "Date of birth - SENSITIVE",
      })
    ),

    /**
     * Net worth amount - SENSITIVE.
     * Suppressed from logs for privacy.
     */
    netWorth: BS.FieldSensitiveOptionOmittable(
      S.Number.annotations({
        description: "Net worth in base currency - SENSITIVE",
      })
    ),

    /**
     * Normalized name for entity resolution.
     */
    normalizedName: BS.FieldOptionOmittable(
      S.String.annotations({
        description: "Lowercased, trimmed name for deduplication",
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
  }),
  $I.annotations("ClientModel", {
    description: "Wealth management client entity with PII protection and compliance tracking.",
  })
) {
  static readonly utils = modelKit(Model);
}

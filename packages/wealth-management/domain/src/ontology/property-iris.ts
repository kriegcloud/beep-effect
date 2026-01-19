/**
 * Wealth Management ontology property IRIs
 *
 * OWL property URIs for all wealth management relationships and attributes.
 *
 * @module wm-domain/ontology/property-iris
 * @since 0.1.0
 */
import { WM_NAMESPACE } from "./namespace";

// ============================================================================
// Object Properties (Entity-to-Entity)
// ============================================================================

/**
 * ownsAccount property IRI - Client owns Account.
 *
 * @since 0.1.0
 * @category property-iris
 */
export const OWNS_ACCOUNT_IRI = `${WM_NAMESPACE}ownsAccount` as const;

/**
 * ownedBy property IRI - Account owned by Client.
 *
 * @since 0.1.0
 * @category property-iris
 */
export const OWNED_BY_IRI = `${WM_NAMESPACE}ownedBy` as const;

/**
 * heldByCustodian property IRI - Account held by Custodian.
 *
 * @since 0.1.0
 * @category property-iris
 */
export const HELD_BY_CUSTODIAN_IRI = `${WM_NAMESPACE}heldByCustodian` as const;

/**
 * ownsEntity property IRI - Client owns Legal Entity.
 *
 * @since 0.1.0
 * @category property-iris
 */
export const OWNS_ENTITY_IRI = `${WM_NAMESPACE}ownsEntity` as const;

/**
 * containsInvestment property IRI - Account contains Investment.
 *
 * @since 0.1.0
 * @category property-iris
 */
export const CONTAINS_INVESTMENT_IRI = `${WM_NAMESPACE}containsInvestment` as const;

/**
 * heldIn property IRI - Investment held in Account.
 *
 * @since 0.1.0
 * @category property-iris
 */
export const HELD_IN_IRI = `${WM_NAMESPACE}heldIn` as const;

/**
 * hasBeneficiary property IRI - Account/Trust has Beneficiary.
 *
 * @since 0.1.0
 * @category property-iris
 */
export const HAS_BENEFICIARY_IRI = `${WM_NAMESPACE}hasBeneficiary` as const;

/**
 * beneficiaryOf property IRI - Beneficiary of Account/Trust.
 *
 * @since 0.1.0
 * @category property-iris
 */
export const BENEFICIARY_OF_IRI = `${WM_NAMESPACE}beneficiaryOf` as const;

/**
 * establishedBy property IRI - Trust established by Client.
 *
 * @since 0.1.0
 * @category property-iris
 */
export const ESTABLISHED_BY_IRI = `${WM_NAMESPACE}establishedBy` as const;

/**
 * managedBy property IRI - Trust managed by Client/LegalEntity.
 *
 * @since 0.1.0
 * @category property-iris
 */
export const MANAGED_BY_IRI = `${WM_NAMESPACE}managedBy` as const;

/**
 * holdsAccount property IRI - Trust holds TrustAccount.
 *
 * @since 0.1.0
 * @category property-iris
 */
export const HOLDS_ACCOUNT_IRI = `${WM_NAMESPACE}holdsAccount` as const;

/**
 * memberOf property IRI - Client member of Household.
 *
 * @since 0.1.0
 * @category property-iris
 */
export const MEMBER_OF_IRI = `${WM_NAMESPACE}memberOf` as const;

/**
 * hasMember property IRI - Household has Client member.
 *
 * @since 0.1.0
 * @category property-iris
 */
export const HAS_MEMBER_IRI = `${WM_NAMESPACE}hasMember` as const;

/**
 * evidenceFor property IRI - Document is evidence for fact.
 *
 * @since 0.1.0
 * @category property-iris
 */
export const EVIDENCE_FOR_IRI = `${WM_NAMESPACE}evidenceFor` as const;

/**
 * hasEvidence property IRI - Fact has Document evidence.
 *
 * @since 0.1.0
 * @category property-iris
 */
export const HAS_EVIDENCE_IRI = `${WM_NAMESPACE}hasEvidence` as const;

/**
 * supersedes property IRI - Document supersedes previous Document.
 *
 * @since 0.1.0
 * @category property-iris
 */
export const SUPERSEDES_IRI = `${WM_NAMESPACE}supersedes` as const;

/**
 * managedByEntity property IRI - LegalEntity managed by LegalEntity.
 *
 * @since 0.1.0
 * @category property-iris
 */
export const MANAGED_BY_ENTITY_IRI = `${WM_NAMESPACE}managedByEntity` as const;

/**
 * linkedClient property IRI - Beneficiary linked to Client.
 *
 * @since 0.1.0
 * @category property-iris
 */
export const LINKED_CLIENT_IRI = `${WM_NAMESPACE}linkedClient` as const;

// ============================================================================
// Datatype Properties (Entity-to-Literal)
// ============================================================================

/**
 * legalName property IRI - Legal name of client/entity.
 *
 * @since 0.1.0
 * @category property-iris
 */
export const LEGAL_NAME_IRI = `${WM_NAMESPACE}legalName` as const;

/**
 * taxId property IRI - Tax identifier (SSN/EIN).
 *
 * @since 0.1.0
 * @category property-iris
 */
export const TAX_ID_IRI = `${WM_NAMESPACE}taxId` as const;

/**
 * dateOfBirth property IRI - Date of birth.
 *
 * @since 0.1.0
 * @category property-iris
 */
export const DATE_OF_BIRTH_IRI = `${WM_NAMESPACE}dateOfBirth` as const;

/**
 * netWorth property IRI - Net worth amount.
 *
 * @since 0.1.0
 * @category property-iris
 */
export const NET_WORTH_IRI = `${WM_NAMESPACE}netWorth` as const;

/**
 * riskTolerance property IRI - Risk tolerance level.
 *
 * @since 0.1.0
 * @category property-iris
 */
export const RISK_TOLERANCE_IRI = `${WM_NAMESPACE}riskTolerance` as const;

/**
 * kycStatus property IRI - KYC verification status.
 *
 * @since 0.1.0
 * @category property-iris
 */
export const KYC_STATUS_IRI = `${WM_NAMESPACE}kycStatus` as const;

/**
 * accountNumber property IRI - Account number.
 *
 * @since 0.1.0
 * @category property-iris
 */
export const ACCOUNT_NUMBER_IRI = `${WM_NAMESPACE}accountNumber` as const;

/**
 * accountType property IRI - Account type.
 *
 * @since 0.1.0
 * @category property-iris
 */
export const ACCOUNT_TYPE_IRI = `${WM_NAMESPACE}accountType` as const;

/**
 * taxStatus property IRI - Tax status of account.
 *
 * @since 0.1.0
 * @category property-iris
 */
export const TAX_STATUS_IRI = `${WM_NAMESPACE}taxStatus` as const;

/**
 * openDate property IRI - Account open date.
 *
 * @since 0.1.0
 * @category property-iris
 */
export const OPEN_DATE_IRI = `${WM_NAMESPACE}openDate` as const;

/**
 * costBasis property IRI - Investment cost basis.
 *
 * @since 0.1.0
 * @category property-iris
 */
export const COST_BASIS_IRI = `${WM_NAMESPACE}costBasis` as const;

/**
 * marketValue property IRI - Investment market value.
 *
 * @since 0.1.0
 * @category property-iris
 */
export const MARKET_VALUE_IRI = `${WM_NAMESPACE}marketValue` as const;

/**
 * securityId property IRI - Security identifier (CUSIP/ISIN).
 *
 * @since 0.1.0
 * @category property-iris
 */
export const SECURITY_ID_IRI = `${WM_NAMESPACE}securityId` as const;

/**
 * ticker property IRI - Stock ticker symbol.
 *
 * @since 0.1.0
 * @category property-iris
 */
export const TICKER_IRI = `${WM_NAMESPACE}ticker` as const;

/**
 * investmentType property IRI - Type of investment.
 *
 * @since 0.1.0
 * @category property-iris
 */
export const INVESTMENT_TYPE_IRI = `${WM_NAMESPACE}investmentType` as const;

/**
 * trustName property IRI - Trust name.
 *
 * @since 0.1.0
 * @category property-iris
 */
export const TRUST_NAME_IRI = `${WM_NAMESPACE}trustName` as const;

/**
 * trustType property IRI - Trust type.
 *
 * @since 0.1.0
 * @category property-iris
 */
export const TRUST_TYPE_IRI = `${WM_NAMESPACE}trustType` as const;

/**
 * establishedDate property IRI - Trust established date.
 *
 * @since 0.1.0
 * @category property-iris
 */
export const ESTABLISHED_DATE_IRI = `${WM_NAMESPACE}establishedDate` as const;

/**
 * jurisdiction property IRI - Trust jurisdiction.
 *
 * @since 0.1.0
 * @category property-iris
 */
export const JURISDICTION_IRI = `${WM_NAMESPACE}jurisdiction` as const;

/**
 * beneficiaryType property IRI - Beneficiary type.
 *
 * @since 0.1.0
 * @category property-iris
 */
export const BENEFICIARY_TYPE_IRI = `${WM_NAMESPACE}beneficiaryType` as const;

/**
 * beneficiaryPercentage property IRI - Beneficiary percentage.
 *
 * @since 0.1.0
 * @category property-iris
 */
export const BENEFICIARY_PERCENTAGE_IRI = `${WM_NAMESPACE}beneficiaryPercentage` as const;

/**
 * householdName property IRI - Household name.
 *
 * @since 0.1.0
 * @category property-iris
 */
export const HOUSEHOLD_NAME_IRI = `${WM_NAMESPACE}householdName` as const;

/**
 * entityName property IRI - Legal entity name.
 *
 * @since 0.1.0
 * @category property-iris
 */
export const ENTITY_NAME_IRI = `${WM_NAMESPACE}entityName` as const;

/**
 * entityType property IRI - Legal entity type.
 *
 * @since 0.1.0
 * @category property-iris
 */
export const ENTITY_TYPE_IRI = `${WM_NAMESPACE}entityType` as const;

/**
 * stateOfFormation property IRI - State of formation.
 *
 * @since 0.1.0
 * @category property-iris
 */
export const STATE_OF_FORMATION_IRI = `${WM_NAMESPACE}stateOfFormation` as const;

/**
 * formationDate property IRI - Formation date.
 *
 * @since 0.1.0
 * @category property-iris
 */
export const FORMATION_DATE_IRI = `${WM_NAMESPACE}formationDate` as const;

/**
 * custodianName property IRI - Custodian name.
 *
 * @since 0.1.0
 * @category property-iris
 */
export const CUSTODIAN_NAME_IRI = `${WM_NAMESPACE}custodianName` as const;

/**
 * documentDate property IRI - Document date.
 *
 * @since 0.1.0
 * @category property-iris
 */
export const DOCUMENT_DATE_IRI = `${WM_NAMESPACE}documentDate` as const;

/**
 * effectiveDate property IRI - Effective date.
 *
 * @since 0.1.0
 * @category property-iris
 */
export const EFFECTIVE_DATE_IRI = `${WM_NAMESPACE}effectiveDate` as const;

/**
 * expirationDate property IRI - Expiration date.
 *
 * @since 0.1.0
 * @category property-iris
 */
export const EXPIRATION_DATE_IRI = `${WM_NAMESPACE}expirationDate` as const;

// ============================================================================
// Property IRI Collections
// ============================================================================

/**
 * All object property IRIs as a readonly array.
 *
 * @since 0.1.0
 * @category property-iris
 */
export const ALL_OBJECT_PROPERTY_IRIS = [
  OWNS_ACCOUNT_IRI,
  OWNED_BY_IRI,
  HELD_BY_CUSTODIAN_IRI,
  OWNS_ENTITY_IRI,
  CONTAINS_INVESTMENT_IRI,
  HELD_IN_IRI,
  HAS_BENEFICIARY_IRI,
  BENEFICIARY_OF_IRI,
  ESTABLISHED_BY_IRI,
  MANAGED_BY_IRI,
  HOLDS_ACCOUNT_IRI,
  MEMBER_OF_IRI,
  HAS_MEMBER_IRI,
  EVIDENCE_FOR_IRI,
  HAS_EVIDENCE_IRI,
  SUPERSEDES_IRI,
  MANAGED_BY_ENTITY_IRI,
  LINKED_CLIENT_IRI,
] as const;

/**
 * All datatype property IRIs as a readonly array.
 *
 * @since 0.1.0
 * @category property-iris
 */
export const ALL_DATATYPE_PROPERTY_IRIS = [
  LEGAL_NAME_IRI,
  TAX_ID_IRI,
  DATE_OF_BIRTH_IRI,
  NET_WORTH_IRI,
  RISK_TOLERANCE_IRI,
  KYC_STATUS_IRI,
  ACCOUNT_NUMBER_IRI,
  ACCOUNT_TYPE_IRI,
  TAX_STATUS_IRI,
  OPEN_DATE_IRI,
  COST_BASIS_IRI,
  MARKET_VALUE_IRI,
  SECURITY_ID_IRI,
  TICKER_IRI,
  INVESTMENT_TYPE_IRI,
  TRUST_NAME_IRI,
  TRUST_TYPE_IRI,
  ESTABLISHED_DATE_IRI,
  JURISDICTION_IRI,
  BENEFICIARY_TYPE_IRI,
  BENEFICIARY_PERCENTAGE_IRI,
  HOUSEHOLD_NAME_IRI,
  ENTITY_NAME_IRI,
  ENTITY_TYPE_IRI,
  STATE_OF_FORMATION_IRI,
  FORMATION_DATE_IRI,
  CUSTODIAN_NAME_IRI,
  DOCUMENT_DATE_IRI,
  EFFECTIVE_DATE_IRI,
  EXPIRATION_DATE_IRI,
] as const;

/**
 * All property IRIs combined.
 *
 * @since 0.1.0
 * @category property-iris
 */
export const ALL_PROPERTY_IRIS = [...ALL_OBJECT_PROPERTY_IRIS, ...ALL_DATATYPE_PROPERTY_IRIS] as const;

/**
 * Type for any valid wealth management object property IRI.
 *
 * @since 0.1.0
 * @category property-iris
 */
export type WmObjectPropertyIRI = (typeof ALL_OBJECT_PROPERTY_IRIS)[number];

/**
 * Type for any valid wealth management datatype property IRI.
 *
 * @since 0.1.0
 * @category property-iris
 */
export type WmDatatypePropertyIRI = (typeof ALL_DATATYPE_PROPERTY_IRIS)[number];

/**
 * Type for any valid wealth management property IRI.
 *
 * @since 0.1.0
 * @category property-iris
 */
export type WmPropertyIRI = WmObjectPropertyIRI | WmDatatypePropertyIRI;

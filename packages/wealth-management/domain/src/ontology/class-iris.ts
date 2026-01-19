/**
 * Wealth Management ontology class IRIs
 *
 * OWL class URIs for all wealth management entity types.
 *
 * @module wm-domain/ontology/class-iris
 * @since 0.1.0
 */
import { WM_NAMESPACE } from "./namespace";

// ============================================================================
// Core Entity Classes
// ============================================================================

/**
 * Client class IRI - Individual or entity client.
 *
 * @since 0.1.0
 * @category class-iris
 */
export const CLIENT_IRI = `${WM_NAMESPACE}Client` as const;

/**
 * Account class IRI - Investment or custody account.
 *
 * @since 0.1.0
 * @category class-iris
 */
export const ACCOUNT_IRI = `${WM_NAMESPACE}Account` as const;

/**
 * Investment class IRI - Investment position (securities, funds, real estate).
 *
 * @since 0.1.0
 * @category class-iris
 */
export const INVESTMENT_IRI = `${WM_NAMESPACE}Investment` as const;

/**
 * Trust class IRI - Trust structure.
 *
 * @since 0.1.0
 * @category class-iris
 */
export const TRUST_IRI = `${WM_NAMESPACE}Trust` as const;

/**
 * Household class IRI - Household grouping of clients.
 *
 * @since 0.1.0
 * @category class-iris
 */
export const HOUSEHOLD_IRI = `${WM_NAMESPACE}Household` as const;

/**
 * Beneficiary class IRI - Beneficiary designation.
 *
 * @since 0.1.0
 * @category class-iris
 */
export const BENEFICIARY_IRI = `${WM_NAMESPACE}Beneficiary` as const;

/**
 * Custodian class IRI - Custodian institution.
 *
 * @since 0.1.0
 * @category class-iris
 */
export const CUSTODIAN_IRI = `${WM_NAMESPACE}Custodian` as const;

/**
 * LegalEntity class IRI - Legal entity (LLC, partnership, corporation).
 *
 * @since 0.1.0
 * @category class-iris
 */
export const LEGAL_ENTITY_IRI = `${WM_NAMESPACE}LegalEntity` as const;

// ============================================================================
// Account Subclasses
// ============================================================================

/**
 * Individual Account class IRI.
 *
 * @since 0.1.0
 * @category class-iris
 */
export const INDIVIDUAL_ACCOUNT_IRI = `${WM_NAMESPACE}IndividualAccount` as const;

/**
 * Joint Account class IRI.
 *
 * @since 0.1.0
 * @category class-iris
 */
export const JOINT_ACCOUNT_IRI = `${WM_NAMESPACE}JointAccount` as const;

/**
 * Trust Account class IRI.
 *
 * @since 0.1.0
 * @category class-iris
 */
export const TRUST_ACCOUNT_IRI = `${WM_NAMESPACE}TrustAccount` as const;

/**
 * Entity Account class IRI.
 *
 * @since 0.1.0
 * @category class-iris
 */
export const ENTITY_ACCOUNT_IRI = `${WM_NAMESPACE}EntityAccount` as const;

/**
 * Retirement Account class IRI.
 *
 * @since 0.1.0
 * @category class-iris
 */
export const RETIREMENT_ACCOUNT_IRI = `${WM_NAMESPACE}RetirementAccount` as const;

// ============================================================================
// Investment Subclasses
// ============================================================================

/**
 * Security class IRI (publicly traded).
 *
 * @since 0.1.0
 * @category class-iris
 */
export const SECURITY_IRI = `${WM_NAMESPACE}Security` as const;

/**
 * Private Fund class IRI (hedge funds, PE).
 *
 * @since 0.1.0
 * @category class-iris
 */
export const PRIVATE_FUND_IRI = `${WM_NAMESPACE}PrivateFund` as const;

/**
 * Real Estate class IRI.
 *
 * @since 0.1.0
 * @category class-iris
 */
export const REAL_ESTATE_IRI = `${WM_NAMESPACE}RealEstate` as const;

/**
 * Alternative Investment class IRI.
 *
 * @since 0.1.0
 * @category class-iris
 */
export const ALTERNATIVE_IRI = `${WM_NAMESPACE}Alternative` as const;

// ============================================================================
// Trust Subclasses
// ============================================================================

/**
 * Revocable Trust class IRI.
 *
 * @since 0.1.0
 * @category class-iris
 */
export const REVOCABLE_TRUST_IRI = `${WM_NAMESPACE}RevocableTrust` as const;

/**
 * Irrevocable Trust class IRI.
 *
 * @since 0.1.0
 * @category class-iris
 */
export const IRREVOCABLE_TRUST_IRI = `${WM_NAMESPACE}IrrevocableTrust` as const;

/**
 * Charitable Trust class IRI.
 *
 * @since 0.1.0
 * @category class-iris
 */
export const CHARITABLE_TRUST_IRI = `${WM_NAMESPACE}CharitableTrust` as const;

// ============================================================================
// Legal Entity Subclasses
// ============================================================================

/**
 * LLC class IRI.
 *
 * @since 0.1.0
 * @category class-iris
 */
export const LLC_IRI = `${WM_NAMESPACE}LLC` as const;

/**
 * Partnership class IRI.
 *
 * @since 0.1.0
 * @category class-iris
 */
export const PARTNERSHIP_IRI = `${WM_NAMESPACE}Partnership` as const;

/**
 * Limited Partnership class IRI.
 *
 * @since 0.1.0
 * @category class-iris
 */
export const LIMITED_PARTNERSHIP_IRI = `${WM_NAMESPACE}LimitedPartnership` as const;

/**
 * Corporation class IRI.
 *
 * @since 0.1.0
 * @category class-iris
 */
export const CORPORATION_IRI = `${WM_NAMESPACE}Corporation` as const;

/**
 * Foundation class IRI.
 *
 * @since 0.1.0
 * @category class-iris
 */
export const FOUNDATION_IRI = `${WM_NAMESPACE}Foundation` as const;

// ============================================================================
// Document Class
// ============================================================================

/**
 * Document class IRI.
 *
 * @since 0.1.0
 * @category class-iris
 */
export const DOCUMENT_IRI = `${WM_NAMESPACE}Document` as const;

// ============================================================================
// Class IRI Collection
// ============================================================================

/**
 * All class IRIs as a readonly array.
 *
 * @since 0.1.0
 * @category class-iris
 */
export const ALL_CLASS_IRIS = [
  CLIENT_IRI,
  ACCOUNT_IRI,
  INVESTMENT_IRI,
  TRUST_IRI,
  HOUSEHOLD_IRI,
  BENEFICIARY_IRI,
  CUSTODIAN_IRI,
  LEGAL_ENTITY_IRI,
  INDIVIDUAL_ACCOUNT_IRI,
  JOINT_ACCOUNT_IRI,
  TRUST_ACCOUNT_IRI,
  ENTITY_ACCOUNT_IRI,
  RETIREMENT_ACCOUNT_IRI,
  SECURITY_IRI,
  PRIVATE_FUND_IRI,
  REAL_ESTATE_IRI,
  ALTERNATIVE_IRI,
  REVOCABLE_TRUST_IRI,
  IRREVOCABLE_TRUST_IRI,
  CHARITABLE_TRUST_IRI,
  LLC_IRI,
  PARTNERSHIP_IRI,
  LIMITED_PARTNERSHIP_IRI,
  CORPORATION_IRI,
  FOUNDATION_IRI,
  DOCUMENT_IRI,
] as const;

/**
 * Type for any valid wealth management class IRI.
 *
 * @since 0.1.0
 * @category class-iris
 */
export type WmClassIRI = (typeof ALL_CLASS_IRIS)[number];

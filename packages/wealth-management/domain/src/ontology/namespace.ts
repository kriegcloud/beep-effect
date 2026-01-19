/**
 * Wealth Management ontology namespace
 *
 * @module wm-domain/ontology/namespace
 * @since 0.1.0
 */

/**
 * The base IRI namespace for the wealth management ontology.
 *
 * All class and property IRIs are prefixed with this namespace.
 *
 * @since 0.1.0
 * @category ontology
 */
export const WM_NAMESPACE = "https://beep.dev/ontology/wealth-management#" as const;

/**
 * The prefix used for wealth management ontology IRIs in SPARQL/Turtle.
 *
 * @since 0.1.0
 * @category ontology
 */
export const WM_PREFIX = "wm" as const;

/**
 * XML Schema Datatypes namespace for literal types.
 *
 * @since 0.1.0
 * @category ontology
 */
export const XSD_NAMESPACE = "http://www.w3.org/2001/XMLSchema#" as const;

/**
 * RDF namespace for RDF vocabulary.
 *
 * @since 0.1.0
 * @category ontology
 */
export const RDF_NAMESPACE = "http://www.w3.org/1999/02/22-rdf-syntax-ns#" as const;

/**
 * RDFS namespace for RDFS vocabulary.
 *
 * @since 0.1.0
 * @category ontology
 */
export const RDFS_NAMESPACE = "http://www.w3.org/2000/01/rdf-schema#" as const;

/**
 * OWL namespace for OWL vocabulary.
 *
 * @since 0.1.0
 * @category ontology
 */
export const OWL_NAMESPACE = "http://www.w3.org/2002/07/owl#" as const;

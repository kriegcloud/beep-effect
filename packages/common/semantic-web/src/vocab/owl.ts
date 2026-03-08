/**
 * OWL vocabulary helpers.
 *
 * @since 0.0.0
 * @module
 */

import { makeNamedNode } from "../rdf.ts";

/**
 * OWL namespace IRI.
 *
 * @since 0.0.0
 * @category Configuration
 */
export const OWL_NAMESPACE = "http://www.w3.org/2002/07/owl#" as const;

/**
 * `owl:Class`
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const OWL_CLASS = makeNamedNode(`${OWL_NAMESPACE}Class`);

/**
 * `owl:ObjectProperty`
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const OWL_OBJECT_PROPERTY = makeNamedNode(`${OWL_NAMESPACE}ObjectProperty`);

/**
 * `owl:DatatypeProperty`
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const OWL_DATATYPE_PROPERTY = makeNamedNode(`${OWL_NAMESPACE}DatatypeProperty`);

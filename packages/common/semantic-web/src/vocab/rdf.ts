/**
 * RDF vocabulary helpers.
 *
 * @since 0.0.0
 * @module
 */

import { makeNamedNode } from "../rdf.ts";

/**
 * RDF namespace IRI.
 *
 * @since 0.0.0
 * @category Configuration
 */
export const RDF_NAMESPACE = "http://www.w3.org/1999/02/22-rdf-syntax-ns#" as const;

/**
 * `rdf:type`
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const RDF_TYPE = makeNamedNode(`${RDF_NAMESPACE}type`);

/**
 * `rdf:first`
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const RDF_FIRST = makeNamedNode(`${RDF_NAMESPACE}first`);

/**
 * `rdf:rest`
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const RDF_REST = makeNamedNode(`${RDF_NAMESPACE}rest`);

/**
 * `rdf:nil`
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const RDF_NIL = makeNamedNode(`${RDF_NAMESPACE}nil`);

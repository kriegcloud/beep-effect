/**
 * Web Annotation vocabulary helpers.
 *
 * @since 0.0.0
 * @module
 */

import { makeNamedNode } from "../rdf.ts";

/**
 * OA namespace IRI.
 *
 * @since 0.0.0
 * @category Configuration
 */
export const OA_NAMESPACE = "http://www.w3.org/ns/oa#" as const;

/**
 * `oa:Annotation`
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const OA_ANNOTATION = makeNamedNode(`${OA_NAMESPACE}Annotation`);

/**
 * `oa:hasTarget`
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const OA_HAS_TARGET = makeNamedNode(`${OA_NAMESPACE}hasTarget`);

/**
 * `oa:hasSelector`
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const OA_HAS_SELECTOR = makeNamedNode(`${OA_NAMESPACE}hasSelector`);

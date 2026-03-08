/**
 * XSD vocabulary helpers.
 *
 * @since 0.0.0
 * @module
 */

import { makeNamedNode } from "../rdf.ts";

/**
 * XSD namespace IRI.
 *
 * @since 0.0.0
 * @category Configuration
 */
export const XSD_NAMESPACE = "http://www.w3.org/2001/XMLSchema#" as const;

/**
 * `xsd:string`
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const XSD_STRING = makeNamedNode(`${XSD_NAMESPACE}string`);

/**
 * `xsd:boolean`
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const XSD_BOOLEAN = makeNamedNode(`${XSD_NAMESPACE}boolean`);

/**
 * `xsd:integer`
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const XSD_INTEGER = makeNamedNode(`${XSD_NAMESPACE}integer`);

/**
 * `xsd:double`
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const XSD_DOUBLE = makeNamedNode(`${XSD_NAMESPACE}double`);

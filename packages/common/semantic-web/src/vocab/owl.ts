/**
 * OWL vocabulary helpers.
 *
 * @packageDocumentation
 * @since 0.0.0
 * @module
 */

import { makeNamedNode } from "../rdf.ts";

/**
 * OWL namespace IRI.
 *
 * @example
 * ```ts
 * import { OWL_NAMESPACE } from "@beep/semantic-web/vocab/owl"
 *
 * void OWL_NAMESPACE
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const OWL_NAMESPACE = "http://www.w3.org/2002/07/owl#" as const;

/**
 * `owl:Class`
 *
 * @example
 * ```ts
 * import { OWL_CLASS } from "@beep/semantic-web/vocab/owl"
 *
 * void OWL_CLASS
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export const OWL_CLASS = makeNamedNode(`${OWL_NAMESPACE}Class`);

/**
 * `owl:ObjectProperty`
 *
 * @example
 * ```ts
 * import { OWL_OBJECT_PROPERTY } from "@beep/semantic-web/vocab/owl"
 *
 * void OWL_OBJECT_PROPERTY
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export const OWL_OBJECT_PROPERTY = makeNamedNode(`${OWL_NAMESPACE}ObjectProperty`);

/**
 * `owl:DatatypeProperty`
 *
 * @example
 * ```ts
 * import { OWL_DATATYPE_PROPERTY } from "@beep/semantic-web/vocab/owl"
 *
 * void OWL_DATATYPE_PROPERTY
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export const OWL_DATATYPE_PROPERTY = makeNamedNode(`${OWL_NAMESPACE}DatatypeProperty`);

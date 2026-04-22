/**
 * RDF vocabulary helpers.
 *
 * @packageDocumentation
 * @since 0.0.0
 * @module
 */

import { makeNamedNode } from "../rdf.ts";

/**
 * RDF namespace IRI.
 *
 * @example
 * ```ts
 * import { RDF_NAMESPACE } from "@beep/semantic-web/vocab/rdf"
 *
 * void RDF_NAMESPACE
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const RDF_NAMESPACE = "http://www.w3.org/1999/02/22-rdf-syntax-ns#" as const;

/**
 * `rdf:type`
 *
 * @example
 * ```ts
 * import { RDF_TYPE } from "@beep/semantic-web/vocab/rdf"
 *
 * void RDF_TYPE
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export const RDF_TYPE = makeNamedNode(`${RDF_NAMESPACE}type`);

/**
 * `rdf:first`
 *
 * @example
 * ```ts
 * import { RDF_FIRST } from "@beep/semantic-web/vocab/rdf"
 *
 * void RDF_FIRST
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export const RDF_FIRST = makeNamedNode(`${RDF_NAMESPACE}first`);

/**
 * `rdf:rest`
 *
 * @example
 * ```ts
 * import { RDF_REST } from "@beep/semantic-web/vocab/rdf"
 *
 * void RDF_REST
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export const RDF_REST = makeNamedNode(`${RDF_NAMESPACE}rest`);

/**
 * `rdf:nil`
 *
 * @example
 * ```ts
 * import { RDF_NIL } from "@beep/semantic-web/vocab/rdf"
 *
 * void RDF_NIL
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export const RDF_NIL = makeNamedNode(`${RDF_NAMESPACE}nil`);

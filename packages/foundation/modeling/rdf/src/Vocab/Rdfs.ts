/**
 * RDFS vocabulary helpers.
 *
 * @packageDocumentation
 * @since 0.0.0
 * @packageDocumentation
 */

import { makeNamedNode } from "../Rdf.ts";

/**
 * RDFS namespace IRI.
 *
 * @example
 * ```ts
 * import { RDFS_NAMESPACE } from "@beep/rdf/vocab/rdfs"
 *
 * console.log(RDFS_NAMESPACE)
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const RDFS_NAMESPACE = "http://www.w3.org/2000/01/rdf-schema#" as const;

/**
 * `rdfs:label`
 *
 * @example
 * ```ts
 * import { RDFS_LABEL } from "@beep/rdf/vocab/rdfs"
 *
 * console.log(RDFS_LABEL)
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export const RDFS_LABEL = makeNamedNode(`${RDFS_NAMESPACE}label`);

/**
 * `rdfs:comment`
 *
 * @example
 * ```ts
 * import { RDFS_COMMENT } from "@beep/rdf/vocab/rdfs"
 *
 * console.log(RDFS_COMMENT)
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export const RDFS_COMMENT = makeNamedNode(`${RDFS_NAMESPACE}comment`);

/**
 * `rdfs:Class`
 *
 * @example
 * ```ts
 * import { RDFS_CLASS } from "@beep/rdf/vocab/rdfs"
 *
 * console.log(RDFS_CLASS)
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export const RDFS_CLASS = makeNamedNode(`${RDFS_NAMESPACE}Class`);

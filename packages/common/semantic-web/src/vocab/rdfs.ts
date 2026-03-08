/**
 * RDFS vocabulary helpers.
 *
 * @since 0.0.0
 * @module
 */

import { makeNamedNode } from "../rdf.ts";

/**
 * RDFS namespace IRI.
 *
 * @since 0.0.0
 * @category Configuration
 */
export const RDFS_NAMESPACE = "http://www.w3.org/2000/01/rdf-schema#" as const;

/**
 * `rdfs:label`
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const RDFS_LABEL = makeNamedNode(`${RDFS_NAMESPACE}label`);

/**
 * `rdfs:comment`
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const RDFS_COMMENT = makeNamedNode(`${RDFS_NAMESPACE}comment`);

/**
 * `rdfs:Class`
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const RDFS_CLASS = makeNamedNode(`${RDFS_NAMESPACE}Class`);

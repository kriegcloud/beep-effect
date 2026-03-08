/**
 * PROV vocabulary helpers.
 *
 * @since 0.0.0
 * @module
 */

import { makeNamedNode } from "../rdf.ts";

/**
 * PROV namespace IRI.
 *
 * @since 0.0.0
 * @category Configuration
 */
export const PROV_NAMESPACE = "http://www.w3.org/ns/prov#" as const;

/**
 * `prov:Entity`
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const PROV_ENTITY = makeNamedNode(`${PROV_NAMESPACE}Entity`);

/**
 * `prov:Activity`
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const PROV_ACTIVITY = makeNamedNode(`${PROV_NAMESPACE}Activity`);

/**
 * `prov:Agent`
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const PROV_AGENT = makeNamedNode(`${PROV_NAMESPACE}Agent`);

/**
 * `prov:wasGeneratedBy`
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const PROV_WAS_GENERATED_BY = makeNamedNode(`${PROV_NAMESPACE}wasGeneratedBy`);

/**
 * `prov:used`
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const PROV_USED = makeNamedNode(`${PROV_NAMESPACE}used`);

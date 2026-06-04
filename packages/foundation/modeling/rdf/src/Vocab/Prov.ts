/**
 * PROV vocabulary helpers.
 *
 * @packageDocumentation
 * @since 0.0.0
 * @packageDocumentation
 */

import { makeNamedNode } from "../Rdf.ts";

/**
 * PROV namespace IRI.
 *
 * @example
 * ```ts
 * import { PROV_NAMESPACE } from "@beep/rdf/vocab/prov"
 *
 * console.log(PROV_NAMESPACE)
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const PROV_NAMESPACE = "http://www.w3.org/ns/prov#" as const;

/**
 * `prov:Entity`
 *
 * @example
 * ```ts
 * import { PROV_ENTITY } from "@beep/rdf/vocab/prov"
 *
 * console.log(PROV_ENTITY)
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export const PROV_ENTITY = makeNamedNode(`${PROV_NAMESPACE}Entity`);

/**
 * `prov:Activity`
 *
 * @example
 * ```ts
 * import { PROV_ACTIVITY } from "@beep/rdf/vocab/prov"
 *
 * console.log(PROV_ACTIVITY)
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export const PROV_ACTIVITY = makeNamedNode(`${PROV_NAMESPACE}Activity`);

/**
 * `prov:Agent`
 *
 * @example
 * ```ts
 * import { PROV_AGENT } from "@beep/rdf/vocab/prov"
 *
 * console.log(PROV_AGENT)
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export const PROV_AGENT = makeNamedNode(`${PROV_NAMESPACE}Agent`);

/**
 * `prov:wasGeneratedBy`
 *
 * @example
 * ```ts
 * import { PROV_WAS_GENERATED_BY } from "@beep/rdf/vocab/prov"
 *
 * console.log(PROV_WAS_GENERATED_BY)
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export const PROV_WAS_GENERATED_BY = makeNamedNode(`${PROV_NAMESPACE}wasGeneratedBy`);

/**
 * `prov:used`
 *
 * @example
 * ```ts
 * import { PROV_USED } from "@beep/rdf/vocab/prov"
 *
 * console.log(PROV_USED)
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export const PROV_USED = makeNamedNode(`${PROV_NAMESPACE}used`);

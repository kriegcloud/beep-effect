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
 * import { PROV_NAMESPACE } from "@beep/rdf/Vocab/Prov"
 *
 * const entityIri = `${PROV_NAMESPACE}Entity`
 * console.log(entityIri) // "http://www.w3.org/ns/prov#Entity"
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
 * import { PROV_ENTITY } from "@beep/rdf/Vocab/Prov"
 *
 * console.log(PROV_ENTITY.value) // "http://www.w3.org/ns/prov#Entity"
 * console.log(PROV_ENTITY.termType) // "NamedNode"
 * ```
 *
 * @since 0.0.0
 * @category constants
 */
export const PROV_ENTITY = makeNamedNode(`${PROV_NAMESPACE}Entity`);

/**
 * `prov:Activity`
 *
 * @example
 * ```ts
 * import { PROV_ACTIVITY } from "@beep/rdf/Vocab/Prov"
 *
 * console.log(PROV_ACTIVITY.value) // "http://www.w3.org/ns/prov#Activity"
 * console.log(PROV_ACTIVITY.termType) // "NamedNode"
 * ```
 *
 * @since 0.0.0
 * @category constants
 */
export const PROV_ACTIVITY = makeNamedNode(`${PROV_NAMESPACE}Activity`);

/**
 * `prov:Agent`
 *
 * @example
 * ```ts
 * import { PROV_AGENT } from "@beep/rdf/Vocab/Prov"
 *
 * console.log(PROV_AGENT.value) // "http://www.w3.org/ns/prov#Agent"
 * console.log(PROV_AGENT.termType) // "NamedNode"
 * ```
 *
 * @since 0.0.0
 * @category constants
 */
export const PROV_AGENT = makeNamedNode(`${PROV_NAMESPACE}Agent`);

/**
 * `prov:wasGeneratedBy`
 *
 * @example
 * ```ts
 * import { PROV_WAS_GENERATED_BY } from "@beep/rdf/Vocab/Prov"
 *
 * console.log(PROV_WAS_GENERATED_BY.value) // "http://www.w3.org/ns/prov#wasGeneratedBy"
 * console.log(PROV_WAS_GENERATED_BY.termType) // "NamedNode"
 * ```
 *
 * @since 0.0.0
 * @category constants
 */
export const PROV_WAS_GENERATED_BY = makeNamedNode(`${PROV_NAMESPACE}wasGeneratedBy`);

/**
 * `prov:used`
 *
 * @example
 * ```ts
 * import { PROV_USED } from "@beep/rdf/Vocab/Prov"
 *
 * console.log(PROV_USED.value) // "http://www.w3.org/ns/prov#used"
 * console.log(PROV_USED.termType) // "NamedNode"
 * ```
 *
 * @since 0.0.0
 * @category constants
 */
export const PROV_USED = makeNamedNode(`${PROV_NAMESPACE}used`);

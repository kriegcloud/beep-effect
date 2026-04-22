/**
 * Web Annotation vocabulary helpers.
 *
 * @packageDocumentation
 * @since 0.0.0
 * @module
 */

import { makeNamedNode } from "../rdf.ts";

/**
 * OA namespace IRI.
 *
 * @example
 * ```ts
 * import { OA_NAMESPACE } from "@beep/semantic-web/vocab/oa"
 *
 * void OA_NAMESPACE
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const OA_NAMESPACE = "http://www.w3.org/ns/oa#" as const;

/**
 * `oa:Annotation`
 *
 * @example
 * ```ts
 * import { OA_ANNOTATION } from "@beep/semantic-web/vocab/oa"
 *
 * void OA_ANNOTATION
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export const OA_ANNOTATION = makeNamedNode(`${OA_NAMESPACE}Annotation`);

/**
 * `oa:hasTarget`
 *
 * @example
 * ```ts
 * import { OA_HAS_TARGET } from "@beep/semantic-web/vocab/oa"
 *
 * void OA_HAS_TARGET
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export const OA_HAS_TARGET = makeNamedNode(`${OA_NAMESPACE}hasTarget`);

/**
 * `oa:hasSelector`
 *
 * @example
 * ```ts
 * import { OA_HAS_SELECTOR } from "@beep/semantic-web/vocab/oa"
 *
 * void OA_HAS_SELECTOR
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export const OA_HAS_SELECTOR = makeNamedNode(`${OA_NAMESPACE}hasSelector`);

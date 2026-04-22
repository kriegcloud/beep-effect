/**
 * XSD vocabulary helpers.
 *
 * @packageDocumentation
 * @since 0.0.0
 * @module
 */

import { makeNamedNode } from "../rdf.ts";

/**
 * XSD namespace IRI.
 *
 * @example
 * ```ts
 * import { XSD_NAMESPACE } from "@beep/semantic-web/vocab/xsd"
 *
 * void XSD_NAMESPACE
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const XSD_NAMESPACE = "http://www.w3.org/2001/XMLSchema#" as const;

/**
 * `xsd:string`
 *
 * @example
 * ```ts
 * import { XSD_STRING } from "@beep/semantic-web/vocab/xsd"
 *
 * void XSD_STRING
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export const XSD_STRING = makeNamedNode(`${XSD_NAMESPACE}string`);

/**
 * `xsd:boolean`
 *
 * @example
 * ```ts
 * import { XSD_BOOLEAN } from "@beep/semantic-web/vocab/xsd"
 *
 * void XSD_BOOLEAN
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export const XSD_BOOLEAN = makeNamedNode(`${XSD_NAMESPACE}boolean`);

/**
 * `xsd:integer`
 *
 * @example
 * ```ts
 * import { XSD_INTEGER } from "@beep/semantic-web/vocab/xsd"
 *
 * void XSD_INTEGER
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export const XSD_INTEGER = makeNamedNode(`${XSD_NAMESPACE}integer`);

/**
 * `xsd:double`
 *
 * @example
 * ```ts
 * import { XSD_DOUBLE } from "@beep/semantic-web/vocab/xsd"
 *
 * void XSD_DOUBLE
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export const XSD_DOUBLE = makeNamedNode(`${XSD_NAMESPACE}double`);

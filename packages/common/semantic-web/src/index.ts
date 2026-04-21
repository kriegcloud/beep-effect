/**
 * Semantic-web primitives including RFC 3987 IRI schemas, RFC 3986 URI schemas,
 * RDF/JS-aligned value families, JSON-LD constructs, and PROV provenance models.
 *
 * @since 0.0.0
 * @module
 */

/**
 * Package version constant.
 *
 * @example
 * ```typescript
 * import { VERSION } from "@beep/semantic-web"
 *
 * console.log(VERSION) // "0.0.0"
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const VERSION = "0.0.0" as const;

/**
 * @since 0.0.0
 * @category validation
 */
export * from "./iri.ts";

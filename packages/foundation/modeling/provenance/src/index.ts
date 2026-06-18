/**
 * Domain-agnostic provenance value models — the canonical "where did this come
 * from?" substrate that grounding, extraction, and evidence systems share.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

/**
 * Package version.
 *
 * @category configuration
 * @since 0.0.0
 */
export const VERSION = "0.0.0" as const;

/**
 * TextAnchor: char-offset anchor into a source document plus the quoted span.
 *
 * @category models
 * @since 0.0.0
 */
export * from "./TextAnchor.ts";

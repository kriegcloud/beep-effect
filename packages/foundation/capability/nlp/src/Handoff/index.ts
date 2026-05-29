/**
 * Handoff - the product-neutral generic graph IR emitted for downstream consumers.
 *
 * The versioned handoff contract (chunks, mentions, entities, relations with
 * spans + PROV-O provenance) that `@beep/nlp` produces and the
 * `ip-law-knowledge-graph` initiative (and other consumers) decode.
 *
 * @since 0.0.0
 * @packageDocumentation
 */

/**
 * The generic IR handoff contract schemas (Span/Provenance/TextChunk/Mention/
 * Entity/Relation/AnnotatedDocument + branded ids).
 *
 * @example
 * ```typescript
 * import { Contract } from "@beep/nlp/Handoff"
 *
 * console.log(Contract.AnnotatedDocument)
 * ```
 *
 * @since 0.0.0
 * @category handoff
 */
export * as Contract from "./Contract.ts";

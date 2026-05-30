/**
 * Type-level ontology of text-processing categories.
 *
 * @since 0.0.0
 * @packageDocumentation
 */

/**
 * The 11-stratum text-kind ontology, typed-text payloads, smart constructors,
 * and the containment poset.
 *
 * @example
 * ```typescript
 * import { Kind } from "@beep/nlp/Ontology"
 *
 * console.log(Kind.canContain("Document", "Sentence")) // true
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export * as Kind from "./Kind.ts";

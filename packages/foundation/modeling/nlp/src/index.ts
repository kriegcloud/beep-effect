/**
 * Natural language processing utilities for deterministic tokenization,
 * normalization, and variant generation across identifiers, paths, and queries.
 *
 * @since 0.0.0
 * @packageDocumentation
 */

/**
 * Algebraic structures (monoids) for NLP aggregation.
 *
 * @example
 * ```typescript
 * import { Algebra } from "@beep/nlp"
 *
 * console.log(Algebra.Monoid.fold(Algebra.Monoid.NumberSum)([1, 2, 3])) // 6
 * ```
 *
 * @since 0.0.0
 * @category combinators
 */
export * as Algebra from "./Algebra/index.ts";
/**
 * Core NLP models, tokenization, and pattern utilities.
 *
 * @example
 * ```typescript
 * import { Core } from "@beep/nlp"
 *
 * console.log(Core.DocumentId.make("doc-a"))
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export * as Core from "./Core/index.ts";
/**
 * Text-graph IR: node/edge schema classes (the handoff-contract basis).
 *
 * @example
 * ```typescript
 * import { Graph } from "@beep/nlp"
 *
 * console.log(Graph.Schema.TextNode)
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export * as Graph from "./Graph/index.ts";
/**
 * The product-neutral generic IR handoff contract emitted for downstream
 * consumers (chunks/mentions/entities/relations + spans + PROV-O provenance).
 *
 * @example
 * ```typescript
 * import { Handoff } from "@beep/nlp"
 *
 * console.log(Handoff.Contract.AnnotatedDocument)
 * ```
 *
 * @since 0.0.0
 * @category interop
 */
export * as Handoff from "./Handoff/index.ts";
/**
 * Deterministic identifier tokenization and variant helpers.
 *
 * @example
 * ```typescript
 * import { IdentifierText } from "@beep/nlp"
 *
 * const result = IdentifierText.tokens("myVariable")
 * console.log(result) // ["my", "variable"]
 * ```
 *
 * @since 0.0.0
 * @category parsing
 */
export * as IdentifierText from "./IdentifierText.ts";
/**
 * Type-level ontology of text strata (kinds) and the containment poset.
 *
 * @example
 * ```typescript
 * import { Ontology } from "@beep/nlp"
 *
 * console.log(Ontology.Kind.canContain("Document", "Sentence")) // true
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export * as Ontology from "./Ontology/index.ts";
/**
 * Deterministic path and module-specifier normalization helpers.
 *
 * @example
 * ```typescript
 * import { PathText } from "@beep/nlp"
 *
 * const normalized = PathText.normalizePathPhrase("src\\utils")
 * console.log(normalized) // "src/utils"
 * ```
 *
 * @since 0.0.0
 * @category normalization
 */
export * as PathText from "./PathText.ts";
/**
 * Deterministic query-text normalization helpers.
 *
 * @example
 * ```typescript
 * import { QueryText } from "@beep/nlp"
 *
 * const normalized = QueryText.normalizeQuestion("  hello   world  ")
 * console.log(normalized) // "hello world"
 * ```
 *
 * @since 0.0.0
 * @category normalization
 */
export * as QueryText from "./QueryText.ts";
/**
 * Ordered string-variant deduplication helpers.
 *
 * @example
 * ```typescript
 * import { VariantText } from "@beep/nlp"
 *
 * const deduped = VariantText.orderedDedupe(["foo", "bar", "foo"])
 * console.log(deduped) // ["foo", "bar"]
 * ```
 *
 * @since 0.0.0
 * @category normalization
 */
export * as VariantText from "./VariantText.ts";

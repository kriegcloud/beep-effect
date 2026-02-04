/**
 * Retrieval Utilities
 *
 * Pure utility functions for retrieval and ranking operations:
 * - Reciprocal Rank Fusion (RRF) for combining multiple ranked lists
 * - Score computation and result fusion
 *
 * @since 2.0.0
 * @module Utils/Retrieval
 */

/**
 * Compute Reciprocal Rank Fusion score
 *
 * RRF formula: score = sum(1 / (k + rank)) for each list containing the item
 * where rank is 1-indexed and k is a constant (typically 60).
 *
 * @param ranks - Array of 1-indexed ranks
 * @param k - Constant to smooth rank differences (default: 60)
 * @returns RRF score (higher is better)
 *
 * @since 2.0.0
 * @category Retrieval
 */
export const rrfScore = (ranks: ReadonlyArray<number>, k: number = 60): number =>
  ranks.reduce((sum, rank) => sum + 1 / (k + rank), 0)

/**
 * Combine multiple ranked lists using Reciprocal Rank Fusion
 *
 * Takes multiple ranked lists of items and produces a single fused list
 * sorted by RRF score. Items are identified by their `id` field.
 *
 * @param rankedLists - Array of ranked lists, each sorted by relevance
 * @param k - RRF smoothing constant (default: 60)
 * @returns Combined list sorted by descending RRF score
 *
 * @since 2.0.0
 * @category Retrieval
 */
export const rrfFusion = <T extends { id: string }>(
  rankedLists: ReadonlyArray<ReadonlyArray<T>>,
  k: number = 60
): ReadonlyArray<T & { rrfScore: number }> => {
  const itemMap = new Map<string, { item: T; ranks: Array<number> }>()

  for (const list of rankedLists) {
    for (let i = 0; i < list.length; i++) {
      const item = list[i]
      const rank = i + 1

      const existing = itemMap.get(item.id)
      if (existing) {
        existing.ranks.push(rank)
      } else {
        itemMap.set(item.id, { item, ranks: [rank] })
      }
    }
  }

  const results: Array<T & { rrfScore: number }> = []

  for (const { item, ranks } of itemMap.values()) {
    const score = rrfScore(ranks, k)
    results.push({ ...item, rrfScore: score })
  }

  results.sort((a, b) => b.rrfScore - a.rrfScore)

  return results
}

/**
 * Expanded term with weight
 *
 * @since 2.0.0
 * @category Retrieval
 */
export interface ExpandedTerm {
  readonly term: string
  readonly weight: number
  readonly source: "original" | "altLabel" | "broader" | "narrower" | "related"
}

/**
 * Query expansion options
 *
 * @since 2.0.0
 * @category Retrieval
 */
export interface QueryExpansionOptions {
  /** Include SKOS altLabels (synonyms) - default: true */
  readonly includeAltLabels?: boolean
  /** Include broader classes (generalizations) - default: false */
  readonly includeBroader?: boolean
  /** Include narrower classes (specializations) - default: false */
  readonly includeNarrower?: boolean
  /** Weight for original terms - default: 1.0 */
  readonly originalWeight?: number
  /** Weight for synonym terms - default: 0.8 */
  readonly synonymWeight?: number
  /** Weight for hierarchy terms - default: 0.5 */
  readonly hierarchyWeight?: number
}

const defaultExpansionOptions: Required<QueryExpansionOptions> = {
  includeAltLabels: true,
  includeBroader: false,
  includeNarrower: false,
  originalWeight: 1.0,
  synonymWeight: 0.8,
  hierarchyWeight: 0.5
}

/**
 * Simple class/property definition shape for expansion
 * (Minimal interface to avoid circular imports with Ontology model)
 */
interface OntologyElement {
  readonly label?: string
  readonly altLabels?: ReadonlyArray<string>
  readonly broader?: ReadonlyArray<string>
  readonly narrower?: ReadonlyArray<string>
}

/**
 * Simple ontology context shape for query expansion
 */
interface OntologyContext {
  readonly classes: Map<string, OntologyElement>
  readonly properties: Map<string, OntologyElement>
}

/**
 * Expand a query using ontology synonyms and relationships
 *
 * Finds matching classes/properties in the ontology and adds their
 * altLabels as expanded terms with reduced weight.
 *
 * @param query - Original query string
 * @param ontology - OntologyContext with classes and properties
 * @param options - Expansion options
 * @returns Array of expanded terms with weights
 *
 * @example
 * ```typescript
 * const expanded = expandQueryWithOntology("player", ontology, {
 *   includeAltLabels: true,
 *   synonymWeight: 0.7
 * })
 * // => [
 * //   { term: "player", weight: 1.0, source: "original" },
 * //   { term: "athlete", weight: 0.7, source: "altLabel" },
 * //   { term: "footballer", weight: 0.7, source: "altLabel" }
 * // ]
 * ```
 *
 * @since 2.0.0
 * @category Retrieval
 */
export const expandQueryWithOntology = (
  query: string,
  ontology: OntologyContext,
  options?: QueryExpansionOptions
): ReadonlyArray<ExpandedTerm> => {
  const opts = { ...defaultExpansionOptions, ...options }
  const results: Array<ExpandedTerm> = []
  const seenTerms = new Set<string>()

  // Normalize query for matching
  const queryLower = query.toLowerCase().trim()
  if (!queryLower) return []

  // Add original term
  results.push({ term: query, weight: opts.originalWeight, source: "original" })
  seenTerms.add(queryLower)

  // Helper to add unique terms
  const addTerm = (term: string, weight: number, source: ExpandedTerm["source"]) => {
    const termLower = term.toLowerCase().trim()
    if (termLower && !seenTerms.has(termLower)) {
      seenTerms.add(termLower)
      results.push({ term: termLower, weight, source })
    }
  }

  // Search classes for matches
  for (const cls of ontology.classes.values()) {
    const labelLower = cls.label?.toLowerCase() ?? ""

    // Check if query matches class label
    if (labelLower.includes(queryLower) || queryLower.includes(labelLower)) {
      // Add altLabels as synonyms
      if (opts.includeAltLabels && cls.altLabels) {
        for (const alt of cls.altLabels) {
          addTerm(alt, opts.synonymWeight, "altLabel")
        }
      }

      // Add broader classes
      if (opts.includeBroader && cls.broader) {
        for (const broader of cls.broader) {
          addTerm(broader, opts.hierarchyWeight, "broader")
        }
      }

      // Add narrower classes
      if (opts.includeNarrower && cls.narrower) {
        for (const narrower of cls.narrower) {
          addTerm(narrower, opts.hierarchyWeight, "narrower")
        }
      }
    }
  }

  // Search properties for matches
  for (const prop of ontology.properties.values()) {
    const labelLower = prop.label?.toLowerCase() ?? ""

    if (labelLower.includes(queryLower) || queryLower.includes(labelLower)) {
      if (opts.includeAltLabels && prop.altLabels) {
        for (const alt of prop.altLabels) {
          addTerm(alt, opts.synonymWeight, "altLabel")
        }
      }
    }
  }

  return results
}

/**
 * Build an expanded query string from expanded terms
 *
 * Combines expanded terms into a single query string, optionally
 * applying Lucene-style boosting syntax.
 *
 * @param terms - Array of expanded terms with weights
 * @param useBoosting - Include weight as Lucene boost (^0.8) - default: false
 * @returns Combined query string
 *
 * @example
 * ```typescript
 * buildExpandedQuery([
 *   { term: "player", weight: 1.0, source: "original" },
 *   { term: "athlete", weight: 0.8, source: "altLabel" }
 * ])
 * // => "player athlete"
 *
 * buildExpandedQuery(terms, true)
 * // => "player^1 athlete^0.8"
 * ```
 *
 * @since 2.0.0
 * @category Retrieval
 */
export const buildExpandedQuery = (
  terms: ReadonlyArray<ExpandedTerm>,
  useBoosting: boolean = false
): string => {
  if (useBoosting) {
    return terms.map((t) => `${t.term}^${t.weight}`).join(" ")
  }
  return terms.map((t) => t.term).join(" ")
}

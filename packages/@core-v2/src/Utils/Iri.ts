/**
 * IRI Utilities
 *
 * Provides case-insensitive IRI matching and normalization utilities.
 * Used to handle casing mismatches between ontology IRI local names (PascalCase)
 * and rdfs:label values (camelCase) that cause LLM extraction failures.
 *
 * @since 2.0.0
 * @module Utils/Iri
 */

import type { IRI, LocalName } from "../Domain/Rdf/Types.js"

/**
 * Build a case-insensitive lookup map from IRIs.
 *
 * Creates a Map where keys are lowercase IRIs and values are the original canonical IRIs.
 * This allows case-insensitive matching while preserving the canonical form.
 *
 * @param iris - Array of canonical IRIs
 * @returns Map from lowercase IRI to canonical IRI
 *
 * @example
 * ```typescript
 * const map = buildCaseInsensitiveIriMap([
 *   "http://ontology/TeamRanking",
 *   "http://ontology/PlayerName"
 * ] as IRI[])
 * // map.get("http://ontology/teamranking") => "http://ontology/TeamRanking"
 * ```
 *
 * @since 2.0.0
 */
export const buildCaseInsensitiveIriMap = (
  iris: ReadonlyArray<IRI>
): Map<string, IRI> => new Map(iris.map((iri) => [iri.toLowerCase(), iri]))

/**
 * Normalize an IRI to its canonical form using case-insensitive matching.
 *
 * If the input IRI matches a canonical IRI (case-insensitively), returns the canonical form.
 * Otherwise, returns the input unchanged (cast as IRI).
 *
 * @param input - IRI to normalize (potentially with wrong casing)
 * @param iriMap - Case-insensitive lookup map from buildCaseInsensitiveIriMap
 * @returns Canonical IRI if found, otherwise the input unchanged
 *
 * @example
 * ```typescript
 * const map = buildCaseInsensitiveIriMap(["http://ontology/TeamRanking" as IRI])
 * normalizeIri("http://ontology/teamranking", map) // => "http://ontology/TeamRanking"
 * normalizeIri("http://ontology/Unknown", map) // => "http://ontology/Unknown"
 * ```
 *
 * @since 2.0.0
 */
export const normalizeIri = (
  input: string,
  iriMap: Map<string, IRI>
): IRI => (iriMap.get(input.toLowerCase()) ?? input) as IRI

/**
 * Normalize an array of IRIs to their canonical forms.
 *
 * @param inputs - Array of IRIs to normalize
 * @param iriMap - Case-insensitive lookup map from buildCaseInsensitiveIriMap
 * @returns Array of normalized IRIs
 *
 * @since 2.0.0
 */
export const normalizeIris = (
  inputs: ReadonlyArray<string>,
  iriMap: Map<string, IRI>
): ReadonlyArray<IRI> => inputs.map((iri) => normalizeIri(iri, iriMap))

/**
 * Check if an IRI exists in the canonical set (case-insensitively).
 *
 * @param input - IRI to check
 * @param iriMap - Case-insensitive lookup map from buildCaseInsensitiveIriMap
 * @returns true if the IRI exists (case-insensitively)
 *
 * @since 2.0.0
 */
export const iriExistsCaseInsensitive = (
  input: string,
  iriMap: Map<string, IRI>
): boolean => iriMap.has(input.toLowerCase())

// =============================================================================
// Local Name Expansion Utilities
// =============================================================================

/**
 * Extract local name from an IRI (part after last / or #)
 *
 * @param iri - Full IRI string
 * @returns Local name portion
 *
 * @example
 * ```typescript
 * extractLocalNameFromIri("http://ontology/Player") // => "Player"
 * extractLocalNameFromIri("http://www.w3.org/2001/XMLSchema#string") // => "string"
 * ```
 *
 * @since 2.0.0
 */
export const extractLocalNameFromIri = (iri: string): LocalName => {
  const lastSlash = iri.lastIndexOf("/")
  const lastHash = iri.lastIndexOf("#")
  const splitIndex = Math.max(lastSlash, lastHash)
  return (splitIndex >= 0 ? iri.slice(splitIndex + 1) : iri) as LocalName
}

/**
 * Result of building a local name to IRI map, including collision info
 *
 * @since 2.0.0
 */
export interface LocalNameMapResult {
  /** The local name to IRI mapping (last IRI wins for collisions) */
  readonly map: Map<string, IRI>
  /** Map of local names that had collisions to all their IRIs */
  readonly collisions: Map<string, ReadonlyArray<IRI>>
  /** Whether any collisions were detected */
  readonly hasCollisions: boolean
}

/**
 * Build a case-insensitive local name to IRI map with collision detection.
 *
 * Creates a Map where keys are lowercase local names and values are the full canonical IRIs.
 * This allows case-insensitive local name matching while providing the full IRI.
 *
 * **IMPORTANT**: When multiple IRIs share the same local name (e.g., `org:member` and
 * `foaf:member`), this is a collision. The function tracks all collisions and returns
 * them in the result. The map will contain the LAST IRI for each colliding local name.
 *
 * @param iris - Array of canonical IRIs
 * @returns LocalNameMapResult with map, collisions, and hasCollisions flag
 *
 * @example
 * ```typescript
 * const result = buildLocalNameToIriMapSafe([
 *   "http://ontology/Player",
 *   "http://xmlns.com/foaf/0.1/member",
 *   "http://www.w3.org/ns/org#member"
 * ] as IRI[])
 * // result.map.get("member") => "http://www.w3.org/ns/org#member" (last wins)
 * // result.collisions.get("member") => ["http://xmlns.com/foaf/0.1/member", "http://www.w3.org/ns/org#member"]
 * // result.hasCollisions => true
 * ```
 *
 * @since 2.0.0
 */
export const buildLocalNameToIriMapSafe = (
  iris: ReadonlyArray<IRI>
): LocalNameMapResult => {
  const map = new Map<string, IRI>()
  const allByLocalName = new Map<string, Array<IRI>>()

  for (const iri of iris) {
    const localName = extractLocalNameFromIri(iri).toLowerCase()

    // Track all IRIs for this local name
    const existing = allByLocalName.get(localName) ?? []
    existing.push(iri)
    allByLocalName.set(localName, existing)

    // Map stores the last one (for backwards compatibility)
    map.set(localName, iri)
  }

  // Build collisions map (only entries with > 1 IRI)
  const collisions = new Map<string, ReadonlyArray<IRI>>()
  for (const [localName, iris] of allByLocalName) {
    if (iris.length > 1) {
      collisions.set(localName, iris)
    }
  }

  return {
    map,
    collisions,
    hasCollisions: collisions.size > 0
  }
}

/**
 * Build a case-insensitive local name to IRI map.
 *
 * **WARNING**: This function silently overwrites collisions (last IRI wins).
 * For production code, prefer `buildLocalNameToIriMapSafe` which tracks collisions.
 *
 * @param iris - Array of canonical IRIs
 * @returns Map from lowercase local name to full canonical IRI
 *
 * @deprecated Use buildLocalNameToIriMapSafe for collision awareness
 * @since 2.0.0
 */
export const buildLocalNameToIriMap = (
  iris: ReadonlyArray<IRI>
): Map<string, IRI> => buildLocalNameToIriMapSafe(iris).map

/**
 * Expand a local name to its full IRI using case-insensitive matching.
 *
 * @param localName - Local name (e.g., "Player")
 * @param localNameMap - Case-insensitive local name to IRI map from buildLocalNameToIriMap
 * @returns Full IRI if found, undefined otherwise
 *
 * @example
 * ```typescript
 * const map = buildLocalNameToIriMap(["http://ontology/Player" as IRI])
 * expandLocalNameToIri("player", map) // => "http://ontology/Player"
 * expandLocalNameToIri("Player", map) // => "http://ontology/Player"
 * expandLocalNameToIri("Unknown", map) // => undefined
 * ```
 *
 * @since 2.0.0
 */
export const expandLocalNameToIri = (
  localName: string,
  localNameMap: Map<string, IRI>
): IRI | undefined => localNameMap.get(localName.toLowerCase())

/**
 * Expand an array of local names to full IRIs.
 *
 * Filters out any local names that don't match known IRIs.
 *
 * @param localNames - Array of local names
 * @param localNameMap - Case-insensitive local name to IRI map
 * @returns Array of full IRIs (only valid expansions)
 *
 * @example
 * ```typescript
 * const map = buildLocalNameToIriMap([
 *   "http://ontology/Player",
 *   "http://ontology/Team"
 * ] as IRI[])
 * expandTypesToIris(["player", "Team", "Unknown"], map)
 * // => ["http://ontology/Player", "http://ontology/Team"]
 * ```
 *
 * @since 2.0.0
 */
export const expandTypesToIris = (
  localNames: ReadonlyArray<string>,
  localNameMap: Map<string, IRI>
): ReadonlyArray<IRI> =>
  localNames
    .map((name) => expandLocalNameToIri(name, localNameMap))
    .filter((iri): iri is IRI => iri !== undefined)

/**
 * Get all valid local names from a set of IRIs.
 *
 * @param iris - Array of canonical IRIs
 * @returns Set of lowercase local names
 *
 * @since 2.0.0
 */
export const getLocalNameSet = (
  iris: ReadonlyArray<IRI>
): Set<string> => new Set(iris.map((iri) => extractLocalNameFromIri(iri).toLowerCase()))

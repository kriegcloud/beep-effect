/**
 * Namespace Utilities
 *
 * Shared helpers for working with IRIs and RDF namespaces.
 *
 * @since 2.0.0
 * @module lib/namespace
 */

// =============================================================================
// Common External Namespaces
// =============================================================================

export const NAMESPACES = {
  foaf: "http://xmlns.com/foaf/0.1/",
  prov: "http://www.w3.org/ns/prov#",
  skos: "http://www.w3.org/2004/02/skos/core#",
  org: "http://www.w3.org/ns/org#",
  time: "http://www.w3.org/2006/time#",
  rdfs: "http://www.w3.org/2000/01/rdf-schema#",
  rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
  owl: "http://www.w3.org/2002/07/owl#",
  xsd: "http://www.w3.org/2001/XMLSchema#"
} as const

// =============================================================================
// IRI Parsing
// =============================================================================

/**
 * Extract the local name from an IRI (the part after # or last /)
 *
 * @example
 * localName("http://xmlns.com/foaf/0.1/Person") // "Person"
 * localName("http://www.w3.org/ns/prov#Activity") // "Activity"
 */
export function localName(iri: string): string {
  const match = iri.match(/[#/]([^#/]+)$/)
  return match ? match[1] : iri
}

/**
 * Convert an IRI local name to a human-readable label
 *
 * @example
 * toLabel("http://example.org/hasStartDate") // "has Start Date"
 * toLabel("http://example.org/PersonName") // "Person Name"
 */
export function toLabel(iri: string): string {
  return localName(iri)
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .trim()
}

/**
 * Encode an IRI for use in URL paths
 */
export function encodeIri(iri: string): string {
  return encodeURIComponent(iri)
}

/**
 * Decode an IRI from a URL path
 */
export function decodeIri(encoded: string): string {
  return decodeURIComponent(encoded)
}

// =============================================================================
// Namespace Detection
// =============================================================================

/**
 * Check if an IRI is from an external vocabulary (not domain-specific)
 */
export function isExternalIri(iri: string): boolean {
  return (
    iri.startsWith(NAMESPACES.foaf) ||
    iri.startsWith(NAMESPACES.prov) ||
    iri.startsWith(NAMESPACES.skos) ||
    iri.startsWith(NAMESPACES.org) ||
    iri.startsWith(NAMESPACES.time) ||
    iri.startsWith(NAMESPACES.rdfs) ||
    iri.startsWith(NAMESPACES.rdf) ||
    iri.startsWith(NAMESPACES.owl) ||
    iri.startsWith(NAMESPACES.xsd)
  )
}

/**
 * Get the prefix for an external IRI, or null if not recognized
 */
export function getPrefix(iri: string): string | null {
  for (const [prefix, namespace] of Object.entries(NAMESPACES)) {
    if (iri.startsWith(namespace)) {
      return prefix
    }
  }
  return null
}

/**
 * Format an IRI as a prefixed name if possible
 *
 * @example
 * toPrefixedName("http://xmlns.com/foaf/0.1/Person") // "foaf:Person"
 * toPrefixedName("http://example.org/MyClass") // "MyClass" (no prefix)
 */
export function toPrefixedName(iri: string): string {
  const prefix = getPrefix(iri)
  if (prefix) {
    return `${prefix}:${localName(iri)}`
  }
  return localName(iri)
}

/**
 * Get the spec URL for an external vocabulary IRI
 */
export function getSpecUrl(iri: string): string | null {
  if (iri.startsWith(NAMESPACES.foaf)) {
    return "http://xmlns.com/foaf/spec/"
  }
  if (iri.startsWith(NAMESPACES.prov)) {
    return "https://www.w3.org/TR/prov-o/"
  }
  if (iri.startsWith(NAMESPACES.skos)) {
    return "https://www.w3.org/TR/skos-reference/"
  }
  if (iri.startsWith(NAMESPACES.org)) {
    return "https://www.w3.org/TR/vocab-org/"
  }
  if (iri.startsWith(NAMESPACES.time)) {
    return "https://www.w3.org/TR/owl-time/"
  }
  return null
}

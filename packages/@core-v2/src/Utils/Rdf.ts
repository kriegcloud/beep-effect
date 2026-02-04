/**
 * RDF Utilities
 *
 * Pure utility functions for RDF operations:
 * - IRI validation and construction
 * - Datatype conversion (JS → RDF literals)
 * - N3 term builders with validation
 * - Entity/Relation transformations
 *
 * @since 2.0.0
 * @module Utils/Rdf
 */

import { Schema } from "effect"
import type * as N3 from "n3"
import type { Entity, Relation } from "../Domain/Model/Entity.js"
import { extractLocalNameFromIri } from "./Iri.js"

/**
 * IRI Schema - Validates IRI format
 *
 * Uses Schema.pattern with RFC 3987-compliant regex.
 * Ensures IRIs are well-formed before N3 operations.
 */
export const IriSchema = Schema.String.pipe(
  Schema.pattern(
    /^[a-z][a-z0-9+.-]*:[^\s]*$/i,
    {
      title: "IRI",
      description: "Internationalized Resource Identifier (RFC 3987)"
    }
  )
)

export type Iri = typeof IriSchema.Type

/**
 * Build IRI from base namespace and local name
 *
 * Validates the resulting IRI against IriSchema.
 *
 * @param baseNamespace - Base namespace (must end with / or #)
 * @param localName - Local part of the IRI
 * @returns Validated IRI string
 *
 * @example
 * ```typescript
 * buildIri("http://example.org/", "thing1")
 * // => "http://example.org/thing1"
 * ```
 */
export const buildIri = (baseNamespace: string, localName: string): Iri => {
  const iri = `${baseNamespace}${localName}`
  return Schema.decodeSync(IriSchema)(iri)
}

/**
 * Extract local name from IRI (part after last / or #)
 *
 * Pure function that extracts the local name portion of an IRI.
 * Handles both slash-separated and hash-separated IRIs.
 *
 * @param iri - Full IRI string
 * @returns Local name portion of the IRI
 *
 * @example
 * ```typescript
 * extractLocalName("http://example.org/Person")
 * // => "Person"
 *
 * extractLocalName("http://www.w3.org/2001/XMLSchema#string")
 * // => "string"
 * ```
 */
/**
 * @deprecated Use extractLocalNameFromIri from Utils/Iri.ts for typed results
 */
export const extractLocalName = (iri: string): string => extractLocalNameFromIri(iri)

/**
 * Sync transform helper: Array of IRIs to array of local names
 *
 * Pure function that transforms an array of full IRIs to local names.
 * Can be composed with other transforms or used in Schema.transform.
 *
 * @param iris - Array of full IRI strings
 * @returns Array of local name strings
 *
 * @example
 * ```typescript
 * transformIriArrayToLocalNames([
 *   "http://example.org/Person",
 *   "http://example.org/Organization"
 * ])
 * // => ["Person", "Organization"]
 * ```
 */
export const transformIriArrayToLocalNames = (iris: ReadonlyArray<string>): ReadonlyArray<string> =>
  iris.map(extractLocalName)

/**
 * Sync transform helper: Array of local names to array of IRIs
 *
 * Pure function that transforms an array of local names to full IRIs.
 * Reverse of transformIriArrayToLocalNames.
 *
 * @param localNames - Array of local name strings
 * @param baseNamespace - Base namespace to prepend
 * @returns Array of full IRI strings
 *
 * @example
 * ```typescript
 * transformLocalNamesToIriArray(["Person", "Organization"], "http://example.org/")
 * // => ["http://example.org/Person", "http://example.org/Organization"]
 * ```
 */
export const transformLocalNamesToIriArray = (
  localNames: ReadonlyArray<string>,
  baseNamespace: string
): ReadonlyArray<string> => localNames.map((name) => `${baseNamespace}${name}`)

/**
 * Schema transform: Array of IRIs to array of local names
 *
 * Transforms an array of full IRIs to an array of local names.
 * Can be composed with other Schema transforms using Schema.compose.
 *
 * @param baseNamespace - Optional base namespace for encoding (reverse transform)
 * @returns Schema that transforms Array<IRI> <-> Array<localName>
 *
 * @example
 * ```typescript
 * const LocalNamesFromIris = iriArrayToLocalNameArrayTransform()
 * Schema.decodeUnknownSync(LocalNamesFromIris)([
 *   "http://example.org/Person",
 *   "http://example.org/Organization"
 * ])
 * // => ["Person", "Organization"]
 * ```
 *
 * @example
 * ```typescript
 * // Compose with other transforms
 * const schema = Schema.compose(
 *   Schema.Array(Schema.String), // Input: array of IRIs
 *   iriArrayToLocalNameArrayTransform() // Output: array of local names
 * )
 * ```
 */
export const iriArrayToLocalNameArrayTransform = (baseNamespace?: string) =>
  Schema.transform(
    Schema.Array(Schema.String),
    Schema.Array(Schema.String),
    {
      strict: true,
      decode: transformIriArrayToLocalNames,
      encode: baseNamespace
        ? (localNames) => transformLocalNamesToIriArray(localNames, baseNamespace)
        : (localNames) => localNames
    }
  )

/**
 * Schema transform: IRI string to local name string
 *
 * Transforms a full IRI to its local name portion.
 * Can be composed with other Schema transforms using Schema.compose.
 *
 * @param baseNamespace - Optional base namespace for encoding (reverse transform)
 * @returns Schema that transforms IRI <-> local name
 *
 * @example
 * ```typescript
 * const LocalNameFromIri = iriToLocalNameTransform("http://example.org/")
 * Schema.decodeUnknownSync(LocalNameFromIri)("http://example.org/Person")
 * // => "Person"
 * ```
 *
 * @example
 * ```typescript
 * // Compose with other transforms
 * const schema = Schema.compose(
 *   Schema.String, // Input: IRI
 *   iriToLocalNameTransform() // Output: local name
 * )
 * ```
 */
export const iriToLocalNameTransform = (baseNamespace?: string) =>
  Schema.transform(
    Schema.String,
    Schema.String,
    {
      strict: true,
      decode: extractLocalName,
      encode: baseNamespace
        ? (localName) => `${baseNamespace}${localName}`
        : (localName) => localName
    }
  )

/**
 * Datatype for RDF literals
 */
export type RdfDatatype = "string" | "decimal" | "boolean" | "dateTime" | "integer"

/**
 * Get XSD datatype IRI for value type
 *
 * @param value - JavaScript value
 * @returns XSD datatype IRI
 *
 * @example
 * ```typescript
 * getXsdDatatype(42)        // => "http://www.w3.org/2001/XMLSchema#decimal"
 * getXsdDatatype("hello")   // => undefined (plain literal)
 * getXsdDatatype(true)      // => "http://www.w3.org/2001/XMLSchema#boolean"
 * ```
 */
export const getXsdDatatype = (
  value: string | number | boolean,
  xsdPrefix: string = "http://www.w3.org/2001/XMLSchema#"
): string | undefined => {
  if (typeof value === "number") {
    return Number.isInteger(value)
      ? `${xsdPrefix}integer`
      : `${xsdPrefix}decimal`
  }

  if (typeof value === "boolean") {
    return `${xsdPrefix}boolean`
  }

  // Strings are plain literals (no datatype)
  return undefined
}

/**
 * N3 Term Builders
 *
 * Wrappers around N3.DataFactory with validation.
 */
export interface N3TermBuilders {
  readonly namedNode: (iri: string) => N3.NamedNode
  readonly literal: (value: string, languageOrDatatype?: string | N3.NamedNode) => N3.Literal
  readonly quad: (
    subject: N3.Quad_Subject,
    predicate: N3.Quad_Predicate,
    object: N3.Quad_Object,
    graph?: N3.Quad_Graph
  ) => N3.Quad
}

/**
 * Create N3 term builders with IRI validation
 *
 * @param dataFactory - N3.DataFactory instance
 * @param validateIris - Whether to validate IRIs (default: true)
 * @returns Term builders with optional validation
 */
export const createN3Builders = (
  dataFactory: typeof N3.DataFactory,
  validateIris: boolean = true
): N3TermBuilders => {
  const { literal: rawLiteral, namedNode: rawNamedNode, quad: rawQuad } = dataFactory

  return {
    namedNode: (iri: string) => {
      if (validateIris) {
        // Validate IRI format
        Schema.decodeSync(IriSchema)(iri)
      }
      return rawNamedNode(iri)
    },

    literal: rawLiteral,

    quad: rawQuad
  }
}

/**
 * Convert JavaScript value to N3 literal with appropriate datatype
 *
 * @param value - JavaScript value (string, number, boolean)
 * @param prefixes - RDF prefixes for datatype IRIs
 * @param builders - N3 term builders
 * @returns N3 Literal term
 *
 * @example
 * ```typescript
 * valueToLiteral(42, { xsd: "..." }, builders)
 * // => Literal("42", NamedNode("xsd:decimal"))
 *
 * valueToLiteral("hello", prefixes, builders)
 * // => Literal("hello")
 * ```
 */
/**
 * Convert JavaScript value to N3 literal with appropriate datatype
 *
 * @param value - JavaScript value (string, number, boolean, or object with language)
 * @param prefixes - RDF prefixes for datatype IRIs
 * @param builders - N3 term builders
 * @returns N3 Literal term
 *
 * @example
 * ```typescript
 * valueToLiteral(42, { xsd: "..." }, builders)
 * // => Literal("42", NamedNode("xsd:decimal"))
 *
 * valueToLiteral("hello", prefixes, builders)
 * // => Literal("hello")
 *
 * valueToLiteral({ value: "Bonjour", language: "fr" }, prefixes, builders)
 * // => Literal("Bonjour", "fr")
 * ```
 */
export const valueToLiteral = (
  value: string | number | boolean | { value: string; language?: string },
  prefixes: Record<string, string>,
  builders: N3TermBuilders
): N3.Literal => {
  if (typeof value === "object" && value !== null && "value" in value) {
    // Handle language-tagged string
    const valStr = String(value.value)
    if (value.language) {
      return builders.literal(valStr, value.language)
    }
    return builders.literal(valStr)
  }

  const valueStr = String(value)

  if (typeof value === "string") {
    return builders.literal(valueStr)
  }

  // Handle numbers and booleans
  const datatypeIri = getXsdDatatype(value as number | boolean, prefixes.xsd)

  if (datatypeIri) {
    return builders.literal(valueStr, builders.namedNode(datatypeIri))
  }

  return builders.literal(valueStr)
}

/**
 * Build RDF type triple (rdf:type)
 *
 * @param subject - Subject IRI
 * @param typeIri - Class type IRI
 * @param prefixes - RDF prefixes
 * @param builders - N3 term builders
 * @returns N3 Quad
 */
export const buildTypeTriple = (
  subject: N3.NamedNode,
  typeIri: string,
  prefixes: Record<string, string>,
  builders: N3TermBuilders
): N3.Quad => {
  return builders.quad(
    subject,
    builders.namedNode(`${prefixes.rdf}type`),
    builders.namedNode(typeIri)
  )
}

/**
 * Build rdfs:label triple
 *
 * @param subject - Subject IRI
 * @param label - Label text
 * @param prefixes - RDF prefixes
 * @param builders - N3 term builders
 * @returns N3 Quad
 */
export const buildLabelTriple = (
  subject: N3.NamedNode,
  label: string,
  prefixes: Record<string, string>,
  builders: N3TermBuilders
): N3.Quad => {
  return builders.quad(
    subject,
    builders.namedNode(`${prefixes.rdfs}label`),
    builders.literal(label)
  )
}

/**
 * RDF Prefixes configuration
 *
 * Standard prefixes: rdf, rdfs, xsd, plus any additional custom prefixes
 */
export type RdfPrefixes = Record<string, string>

/**
 * Convert Entity to RDF quads
 *
 * Pure transformation: Entity domain model → N3 quads
 *
 * Generates:
 * - rdf:type triples for each type
 * - rdfs:label for mention
 * - Attribute triples with proper datatypes
 *
 * @param entity - Entity domain object
 * @param baseNamespace - Base IRI namespace
 * @param prefixes - RDF prefixes
 * @param builders - N3 term builders
 * @returns Array of N3 quads
 *
 * @example
 * ```typescript
 * const entity = new Entity({
 *   id: "alice",
 *   mention: "Alice",
 *   types: ["http://schema.org/Person"],
 *   attributes: { "http://schema.org/age": 30 }
 * })
 *
 * const quads = entityToQuads(entity, "http://ex.org/", prefixes, builders)
 * // => [
 * //   Quad(:alice, rdf:type, schema:Person),
 * //   Quad(:alice, rdfs:label, "Alice"),
 * //   Quad(:alice, schema:age, "30"^^xsd:integer)
 * // ]
 * ```
 */
export const entityToQuads = (
  entity: Entity,
  baseNamespace: string,
  prefixes: RdfPrefixes,
  builders: N3TermBuilders
): ReadonlyArray<N3.Quad> => {
  const quads: Array<N3.Quad> = []

  // Create subject IRI
  const subjectIri = buildIri(baseNamespace, entity.id)
  const subject = builders.namedNode(subjectIri)

  // Add rdf:type triples
  for (const typeIri of entity.types) {
    quads.push(buildTypeTriple(subject, typeIri, prefixes, builders))
  }

  // Add rdfs:label
  quads.push(buildLabelTriple(subject, entity.mention, prefixes, builders))

  // Add attribute triples
  for (const [predicate, value] of Object.entries(entity.attributes)) {
    // Check if predicate is already a valid IRI
    let predicateIri: string
    try {
      // Try to validate as IRI - if it passes, use as-is
      Schema.decodeSync(IriSchema)(predicate)
      predicateIri = predicate
    } catch {
      // Not a valid IRI - try to convert using schema.org prefix or base namespace
      // First try schema.org (common for attributes)
      if (prefixes.schema) {
        predicateIri = `${prefixes.schema}${predicate}`
      } else {
        // Fall back to base namespace
        predicateIri = buildIri(baseNamespace, predicate)
      }
    }

    const objectTerm = valueToLiteral(value, prefixes, builders)
    quads.push(builders.quad(subject, builders.namedNode(predicateIri), objectTerm))
  }

  return quads
}

/**
 * Convert Relation to RDF quad
 *
 * Pure transformation: Relation domain model → N3 quad
 *
 * Handles both:
 * - Entity references (subject → predicate → object entity)
 * - Literal values (subject → predicate → literal)
 *
 * @param relation - Relation domain object
 * @param baseNamespace - Base IRI namespace
 * @param prefixes - RDF prefixes
 * @param builders - N3 term builders
 * @returns N3 Quad
 *
 * @example
 * ```typescript
 * const relation = new Relation({
 *   subjectId: "alice",
 *   predicate: "http://schema.org/knows",
 *   object: "bob"  // Entity reference
 * })
 *
 * const quad = relationToQuad(relation, "http://ex.org/", prefixes, builders)
 * // => Quad(:alice, schema:knows, :bob)
 * ```
 */
export const relationToQuad = (
  relation: Relation,
  baseNamespace: string,
  prefixes: RdfPrefixes,
  builders: N3TermBuilders
): N3.Quad => {
  // Build subject
  const subjectIri = buildIri(baseNamespace, relation.subjectId)
  const subject = builders.namedNode(subjectIri)

  // Build predicate
  const predicate = builders.namedNode(relation.predicate)

  // Build object (entity reference or literal)
  let objectTerm: N3.Quad_Object

  if (relation.isEntityReference) {
    // Object is an entity reference
    const objectIri = buildIri(baseNamespace, relation.object as string)
    objectTerm = builders.namedNode(objectIri)
  } else {
    // Object is a literal value
    objectTerm = valueToLiteral(relation.object, prefixes, builders)
  }

  return builders.quad(subject, predicate, objectTerm)
}

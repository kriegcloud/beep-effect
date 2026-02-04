/**
 * Domain Model: RDF Types
 *
 * Branded types for RDF primitives (IRI, BlankNode, Literal, Triple).
 * Prevents "stringly typed" errors.
 *
 * @since 2.0.0
 * @module Domain/Rdf/Types
 */

import { Schema } from "effect"

/**
 * IRI - Internationalized Resource Identifier
 *
 * Branded string type for IRIs to prevent mixing with regular strings.
 *
 * @example
 * ```typescript
 * const personIri: IRI = Schema.decodeSync(IriSchema)("http://schema.org/Person")
 * ```
 *
 * @since 2.0.0
 * @category Domain
 */
export const IriSchema = Schema.String.pipe(
  Schema.brand("IRI"),
  Schema.annotations({
    title: "IRI",
    description: "Internationalized Resource Identifier (branded string)"
  })
)

export type IRI = typeof IriSchema.Type

/**
 * LocalName - The local part of an atomic IRI
 *
 * Branded string type for local names (e.g. "Person" from "http://schema.org/Person")
 *
 * @since 2.0.0
 * @category Domain
 */
export const LocalNameSchema = Schema.String.pipe(
  Schema.brand("LocalName"),
  Schema.annotations({
    title: "LocalName",
    description: "Local name part of an IRI (branded string)"
  })
)

export type LocalName = typeof LocalNameSchema.Type

/**
 * BlankNode - RDF Blank Node identifier
 *
 * Represents unnamed nodes in RDF graphs (starts with _:).
 *
 * @example "_:b0", "_:genid123"
 *
 * @since 2.0.0
 * @category Domain
 */
export const BlankNodeSchema = Schema.String.pipe(
  Schema.pattern(/^_:/),
  Schema.brand("BlankNode"),
  Schema.annotations({
    title: "Blank Node",
    description: "RDF blank node identifier (starts with '_:')"
  })
)

export type BlankNode = typeof BlankNodeSchema.Type

/**
 * Literal - RDF Literal value
 *
 * Represents a literal value with optional language tag or datatype.
 *
 * @since 2.0.0
 * @category Domain
 */
export class Literal extends Schema.Class<Literal>("Literal")({
  /**
   * Lexical value
   */
  value: Schema.String.annotations({
    title: "Value",
    description: "Lexical form of the literal"
  }),

  /**
   * Language tag (for language-tagged strings)
   *
   * @example "en", "fr", "pt"
   */
  language: Schema.optional(Schema.String).annotations({
    title: "Language",
    description: "Language tag (e.g., 'en', 'fr')"
  }),

  /**
   * Datatype IRI
   *
   * @example "http://www.w3.org/2001/XMLSchema#string"
   */
  datatype: Schema.optional(IriSchema).annotations({
    title: "Datatype",
    description: "Datatype IRI (defaults to xsd:string if not specified)"
  })
}) {
  toJSON() {
    return {
      _tag: "Literal" as const,
      value: this.value,
      language: this.language,
      datatype: this.datatype
    }
  }
}

/**
 * RdfTerm - Union of IRI, BlankNode, or Literal
 *
 * Represents any RDF term.
 *
 * @since 2.0.0
 * @category Domain
 */
export const RdfTermSchema = Schema.Union(
  IriSchema,
  BlankNodeSchema,
  Schema.instanceOf(Literal)
).annotations({
  title: "RDF Term",
  description: "Any RDF term (IRI, BlankNode, or Literal)"
})

export type RdfTerm = typeof RdfTermSchema.Type

/**
 * Triple - RDF Triple (subject, predicate, object)
 *
 * Represents a single RDF statement.
 *
 * @since 2.0.0
 * @category Domain
 */
export class Triple extends Schema.Class<Triple>("Triple")({
  /**
   * Subject (IRI or BlankNode)
   */
  subject: Schema.Union(IriSchema, BlankNodeSchema).annotations({
    title: "Subject",
    description: "Triple subject (IRI or BlankNode)"
  }),

  /**
   * Predicate (IRI)
   */
  predicate: IriSchema.annotations({
    title: "Predicate",
    description: "Triple predicate (IRI)"
  }),

  /**
   * Object (any RDF term)
   */
  object: RdfTermSchema.annotations({
    title: "Object",
    description: "Triple object (IRI, BlankNode, or Literal)"
  })
}) {
  toJSON() {
    return {
      _tag: "Triple" as const,
      subject: this.subject,
      predicate: this.predicate,
      object: this.object instanceof Literal ? this.object.toJSON() : this.object
    }
  }
}

/**
 * Quad - RDF Quad (triple + named graph)
 *
 * Extends Triple with a graph IRI for named graph support.
 *
 * @since 2.0.0
 * @category Domain
 */
export class Quad extends Schema.Class<Quad>("Quad")({
  /**
   * Subject (IRI or BlankNode)
   */
  subject: Schema.Union(IriSchema, BlankNodeSchema).annotations({
    title: "Subject",
    description: "Quad subject (IRI or BlankNode)"
  }),

  /**
   * Predicate (IRI)
   */
  predicate: IriSchema.annotations({
    title: "Predicate",
    description: "Quad predicate (IRI)"
  }),

  /**
   * Object (any RDF term)
   */
  object: RdfTermSchema.annotations({
    title: "Object",
    description: "Quad object (IRI, BlankNode, or Literal)"
  }),

  /**
   * Graph IRI (for named graphs)
   */
  graph: Schema.optional(IriSchema).annotations({
    title: "Graph",
    description: "Named graph IRI (omit for default graph)"
  })
}) {
  /**
   * Convert to Triple (discard graph)
   */
  toTriple(): Triple {
    return new Triple({
      subject: this.subject,
      predicate: this.predicate,
      object: this.object
    })
  }

  toJSON() {
    return {
      _tag: "Quad" as const,
      subject: this.subject,
      predicate: this.predicate,
      object: this.object instanceof Literal ? this.object.toJSON() : this.object,
      graph: this.graph
    }
  }
}

// Export RDF vocabulary constants
export * from "./Constants.js"

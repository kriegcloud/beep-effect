/**
 * Domain Model: Ontology Types
 *
 * Pure Schema.Class definitions for ontology metadata (classes and properties).
 *
 * @since 2.0.0
 * @module Domain/Model/Ontology
 */

import { PrimaryKey, Schema } from "effect"
import { extractLocalNameFromIri } from "../../Utils/Iri.js"
import { transformIriArrayToLocalNames } from "../../Utils/Rdf.js"
import { enhanceTextForSearch, splitCamelCase } from "../../Utils/Text.js"
import { ContentHash, Namespace, OntologyName } from "../Identity.js"
import { PathLayout } from "../PathLayout.js"
import { IriSchema } from "../Rdf/Types.js"

/**
 * OntologyRef - Reference to a specific version of an ontology
 *
 * Content-addressed reference using namespace, name, and hash.
 * Used for tracking which ontology was used for an extraction run.
 *
 * @since 2.0.0
 * @category Domain
 */
export class OntologyRef extends Schema.Class<OntologyRef>("OntologyRef")({
  namespace: Namespace,
  name: OntologyName,
  contentHash: ContentHash
}) {
  /**
   * Effect PrimaryKey for deduplication
   */
  [PrimaryKey.symbol]() {
    return `${this.namespace}:${this.name}@${this.contentHash}`
  }

  /**
   * Derived: storage path
   * @example "ontologies/football/premier-league/abc.../ontology.ttl"
   */
  get storagePath(): string {
    return PathLayout.ontology.encode(this.namespace, this.name, this.contentHash)
  }

  /**
   * Derived: short ID for display
   * @example "football/premier-league"
   */
  get shortId(): string {
    return `${this.namespace}/${this.name}`
  }

  /**
   * Factory: from storage path (bidirectional)
   */
  static fromPath(path: string): OntologyRef {
    const [namespace, name, contentHash] = PathLayout.ontology.decode(path)
    return new OntologyRef({ namespace, name, contentHash })
  }
}

/**
 * ClassDefinition - OWL/RDFS Class metadata
 *
 * Represents a class from the ontology with its metadata.
 *
 * @example
 * ```typescript
 * const personClass = new ClassDefinition({
 *   id: "http://schema.org/Person",
 *   label: "Person",
 *   comment: "A person (alive, dead, undead, or fictional).",
 *   properties: ["http://schema.org/name", "http://schema.org/birthDate"]
 * })
 * ```
 *
 * @since 2.0.0
 * @category Domain
 */
export class ClassDefinition extends Schema.Class<ClassDefinition>("ClassDefinition")({
  /**
   * Class URI
   *
   * @example "http://schema.org/Person"
   */
  id: IriSchema.annotations({
    title: "Class IRI",
    description: "Full IRI of the OWL/RDFS class"
  }),

  /**
   * Human-readable label
   *
   * @example "Person"
   */
  label: Schema.String.annotations({
    title: "Label",
    description: "rdfs:label - human-readable name"
  }),

  /**
   * Description/documentation
   *
   * @example "A person (alive, dead, undead, or fictional)."
   */
  comment: Schema.String.annotations({
    title: "Comment",
    description: "rdfs:comment - class description"
  }),

  /**
   * Property IRIs applicable to this class
   *
   * @example ["http://schema.org/name", "http://schema.org/birthDate"]
   */
  properties: Schema.Array(IriSchema).annotations({
    title: "Properties",
    description: "Property IRIs that can be used with this class"
  }),

  /**
   * SKOS preferred labels (skos:prefLabel)
   *
   * @example ["Person", "Human"]
   */
  prefLabels: Schema.Array(Schema.String).pipe(
    Schema.annotations({
      title: "Preferred Labels",
      description: "SKOS preferred labels - primary names for the concept"
    }),
    Schema.propertySignature,
    Schema.withConstructorDefault(() => [])
  ),

  /**
   * SKOS alternative labels (skos:altLabel) - synonyms
   *
   * @example ["Individual", "Human Being"]
   */
  altLabels: Schema.Array(Schema.String).pipe(
    Schema.annotations({
      title: "Alternative Labels",
      description: "SKOS alternative labels - synonyms and alternative names"
    }),
    Schema.propertySignature,
    Schema.withConstructorDefault(() => [])
  ),

  /**
   * SKOS hidden labels (skos:hiddenLabel)
   *
   * @example ["Ppl", "Pers"]
   */
  hiddenLabels: Schema.Array(Schema.String).pipe(
    Schema.annotations({
      title: "Hidden Labels",
      description: "SKOS hidden labels - misspellings, abbreviations, etc."
    }),
    Schema.propertySignature,
    Schema.withConstructorDefault(() => [])
  ),

  /**
   * SKOS definition (skos:definition)
   *
   * @example "A person (alive, dead, undead, or fictional)."
   */
  definition: Schema.optional(Schema.String).annotations({
    title: "Definition",
    description: "SKOS definition - formal definition of the concept"
  }),

  /**
   * SKOS scope note (skos:scopeNote)
   *
   * @example "Includes both living and deceased persons."
   */
  scopeNote: Schema.optional(Schema.String).annotations({
    title: "Scope Note",
    description: "SKOS scope note - clarification of concept scope"
  }),

  /**
   * SKOS example (skos:example)
   *
   * @example "John Doe, Jane Smith"
   */
  example: Schema.optional(Schema.String).annotations({
    title: "Example",
    description: "SKOS example - example usage of the concept"
  }),

  /**
   * SKOS broader concepts (skos:broader) - parent concepts
   *
   * @example ["http://schema.org/Thing"]
   */
  broader: Schema.Array(Schema.String).pipe(
    Schema.annotations({
      title: "Broader Concepts",
      description: "SKOS broader - parent concepts in hierarchy"
    }),
    Schema.propertySignature,
    Schema.withConstructorDefault(() => [])
  ),

  /**
   * SKOS narrower concepts (skos:narrower) - child concepts
   *
   * @example ["http://schema.org/Student", "http://schema.org/Employee"]
   */
  narrower: Schema.Array(Schema.String).pipe(
    Schema.annotations({
      title: "Narrower Concepts",
      description: "SKOS narrower - child concepts in hierarchy"
    }),
    Schema.propertySignature,
    Schema.withConstructorDefault(() => [])
  ),

  /**
   * SKOS related concepts (skos:related)
   *
   * @example ["http://schema.org/Organization"]
   */
  related: Schema.Array(Schema.String).pipe(
    Schema.annotations({
      title: "Related Concepts",
      description: "SKOS related - related concepts (non-hierarchical)"
    }),
    Schema.propertySignature,
    Schema.withConstructorDefault(() => [])
  ),

  /**
   * SKOS exact match (skos:exactMatch)
   *
   * @example ["http://www.wikidata.org/entity/Q215627"]
   */
  exactMatch: Schema.Array(Schema.String).pipe(
    Schema.annotations({
      title: "Exact Match",
      description: "SKOS exact match - equivalent concepts in other vocabularies"
    }),
    Schema.propertySignature,
    Schema.withConstructorDefault(() => [])
  ),

  /**
   * SKOS close match (skos:closeMatch)
   *
   * @example ["http://dbpedia.org/ontology/Person"]
   */
  closeMatch: Schema.Array(Schema.String).pipe(
    Schema.annotations({
      title: "Close Match",
      description: "SKOS close match - closely related concepts in other vocabularies"
    }),
    Schema.propertySignature,
    Schema.withConstructorDefault(() => [])
  ),

  /**
   * Equivalent classes (owl:equivalentClass)
   */
  equivalentClass: Schema.Array(Schema.String).pipe(
    Schema.annotations({
      title: "Equivalent Classes",
      description: "List of equivalent class IRIs"
    }),
    Schema.propertySignature,
    Schema.withConstructorDefault(() => [])
  )
}) {
  toJSON() {
    return {
      _tag: "ClassDefinition" as const,
      id: this.id,
      label: this.label,
      comment: this.comment,
      properties: this.properties,
      prefLabels: this.prefLabels,
      altLabels: this.altLabels,
      hiddenLabels: this.hiddenLabels,
      definition: this.definition,
      scopeNote: this.scopeNote,
      example: this.example,
      broader: this.broader,
      narrower: this.narrower,
      related: this.related,
      exactMatch: this.exactMatch,
      closeMatch: this.closeMatch,
      equivalentClass: this.equivalentClass
    }
  }

  /**
   * Convert class definition to semantic document for embedding
   *
   * Creates a rich document with class name, description, and property information.
   * Includes camelCase-split labels and property names for better searchability.
   * Includes SKOS labels (prefLabel, altLabel, hiddenLabel) for enhanced search.
   * Uses sync transform helper to convert IRIs to local names.
   *
   * @returns Formatted text document optimized for BM25 search
   */
  toDocument(): string {
    const parts: Array<string> = []

    // Add label - prefer prefLabel if available, otherwise use rdfs:label
    const primaryLabel = this.prefLabels.length > 0 ? this.prefLabels[0] : this.label
    const labelEnhanced = enhanceTextForSearch(primaryLabel)
    parts.push(labelEnhanced)

    // Add all prefLabels (if multiple)
    if (this.prefLabels.length > 1) {
      const additionalPrefLabels = this.prefLabels.slice(1).map(enhanceTextForSearch)
      for (const label of additionalPrefLabels) {
        parts.push(label)
      }
    }

    // Add altLabels as synonyms (critical for search)
    // Add each synonym as a separate line to give individual weight
    if (this.altLabels.length > 0) {
      const altLabelsEnhanced = this.altLabels.map(enhanceTextForSearch)
      for (const label of altLabelsEnhanced) {
        parts.push(label)
      }
    }

    // Add hiddenLabels (for misspelling/abbreviation matching)
    if (this.hiddenLabels.length > 0) {
      const hiddenLabelsEnhanced = this.hiddenLabels.map(enhanceTextForSearch)
      for (const label of hiddenLabelsEnhanced) {
        parts.push(label)
      }
    }

    // Add definition - prefer skos:definition if available, otherwise use rdfs:comment
    const description = this.definition || this.comment
    if (description) {
      parts.push(description)
    }

    // Add scopeNote if present
    if (this.scopeNote) {
      parts.push(this.scopeNote)
    }

    // Add example if present
    if (this.example) {
      parts.push(`Example: ${this.example}`)
    }

    // Add properties with enhanced searchability
    if (this.properties.length > 0) {
      const propertyNames = transformIriArrayToLocalNames(this.properties)
      // Split camelCase in property names and add to document
      const propertyNamesEnhanced = propertyNames.map((name) => {
        const split = splitCamelCase(name)
        return split !== name.toLowerCase() ? `${name} ${split}` : name
      })
      parts.push(`Properties: ${propertyNamesEnhanced.join(", ")}`)
    }

    // Add related concepts (broader, narrower, related)
    const relatedConcepts: Array<string> = []
    if (this.broader.length > 0) {
      const broaderNames = transformIriArrayToLocalNames(this.broader)
      relatedConcepts.push(`Broader: ${broaderNames.join(", ")}`)
    }
    if (this.narrower.length > 0) {
      const narrowerNames = transformIriArrayToLocalNames(this.narrower)
      relatedConcepts.push(`Narrower: ${narrowerNames.join(", ")}`)
    }
    if (this.related.length > 0) {
      const relatedNames = transformIriArrayToLocalNames(this.related)
      relatedConcepts.push(`Related: ${relatedNames.join(", ")}`)
    }
    if (relatedConcepts.length > 0) {
      parts.push(relatedConcepts.join(" | "))
    }

    return parts.join("\n")
  }
}

/**
 * PropertyDefinition - OWL/RDFS Property metadata
 *
 * Represents a property from the ontology with domain/range constraints.
 *
 * @example
 * ```typescript
 * const memberOfProperty = new PropertyDefinition({
 *   id: "http://schema.org/memberOf",
 *   label: "member of",
 *   comment: "An Organization to which this person belongs.",
 *   domain: ["http://schema.org/Person"],
 *   range: ["http://schema.org/Organization"],
 *   rangeType: "object"
 * })
 * ```
 *
 * @since 2.0.0
 * @category Domain
 */
export class PropertyDefinition extends Schema.Class<PropertyDefinition>("PropertyDefinition")({
  /**
   * Property URI
   *
   * @example "http://schema.org/memberOf"
   */
  id: Schema.String.annotations({
    title: "Property IRI",
    description: "Full IRI of the OWL/RDFS property"
  }),

  /**
   * Human-readable label
   *
   * @example "member of"
   */
  label: Schema.String.annotations({
    title: "Label",
    description: "rdfs:label - human-readable name"
  }),

  /**
   * Description/documentation
   *
   * @example "An Organization to which this person belongs."
   */
  comment: Schema.String.annotations({
    title: "Comment",
    description: "rdfs:comment - property description"
  }),

  /**
   * Domain class IRIs (valid subject types)
   *
   * @example ["http://schema.org/Person"]
   */
  domain: Schema.Array(Schema.String).annotations({
    title: "Domain",
    description: "Class IRIs that can use this property (rdfs:domain)"
  }),

  /**
   * Range class IRIs or datatype (valid object types)
   *
   * @example ["http://schema.org/Organization"] for object properties
   * @example ["http://www.w3.org/2001/XMLSchema#string"] for datatype properties
   */
  range: Schema.Array(Schema.String).annotations({
    title: "Range",
    description: "Class IRIs or datatypes for property values (rdfs:range)"
  }),

  /**
   * Property type: object (links entities) or datatype (literal values)
   *
   * - "object": ObjectProperty - range is entity class
   * - "datatype": DatatypeProperty - range is XSD datatype
   */
  rangeType: Schema.Literal("object", "datatype").annotations({
    title: "Range Type",
    description: "Whether property links entities (object) or has literal values (datatype)"
  }),

  /**
   * Inverse property IRIs (owl:inverseOf)
   */
  inverseOf: Schema.Array(Schema.String).pipe(
    Schema.annotations({
      title: "Inverse Properties",
      description: "List of inverse property IRIs"
    }),
    Schema.propertySignature,
    Schema.withConstructorDefault(() => [])
  ),

  /**
   * Whether property is functional (has at most one value)
   *
   * Functional properties (owl:FunctionalProperty) enforce cardinality of 0..1.
   * Used for schema generation to enforce maxItems: 1 or return single object.
   *
   * @example true for properties like "hostedBy", "managedBy"
   */
  isFunctional: Schema.Boolean.pipe(
    Schema.annotations({
      title: "Is Functional",
      description: "Whether property is functional (owl:FunctionalProperty) - has at most one value"
    }),
    Schema.propertySignature,
    Schema.withConstructorDefault(() => false)
  ),

  /**
   * SKOS preferred labels (skos:prefLabel)
   *
   * @example ["member of", "belongs to"]
   */
  prefLabels: Schema.Array(Schema.String).pipe(
    Schema.annotations({
      title: "Preferred Labels",
      description: "SKOS preferred labels - primary names for the property"
    }),
    Schema.propertySignature,
    Schema.withConstructorDefault(() => [])
  ),

  /**
   * SKOS alternative labels (skos:altLabel) - synonyms
   *
   * @example ["part of", "member"]
   */
  altLabels: Schema.Array(Schema.String).pipe(
    Schema.annotations({
      title: "Alternative Labels",
      description: "SKOS alternative labels - synonyms and alternative names"
    }),
    Schema.propertySignature,
    Schema.withConstructorDefault(() => [])
  ),

  /**
   * SKOS hidden labels (skos:hiddenLabel)
   *
   * @example ["mbr", "mem"]
   */
  hiddenLabels: Schema.Array(Schema.String).pipe(
    Schema.annotations({
      title: "Hidden Labels",
      description: "SKOS hidden labels - misspellings, abbreviations, etc."
    }),
    Schema.propertySignature,
    Schema.withConstructorDefault(() => [])
  ),

  /**
   * SKOS definition (skos:definition)
   *
   * @example "An Organization to which this person belongs."
   */
  definition: Schema.optional(Schema.String).annotations({
    title: "Definition",
    description: "SKOS definition - formal definition of the property"
  }),

  /**
   * SKOS scope note (skos:scopeNote)
   *
   * @example "Includes both current and former memberships."
   */
  scopeNote: Schema.optional(Schema.String).annotations({
    title: "Scope Note",
    description: "SKOS scope note - clarification of property scope"
  }),

  /**
   * SKOS example (skos:example)
   *
   * @example "John is a member of Acme Corp"
   */
  example: Schema.optional(Schema.String).annotations({
    title: "Example",
    description: "SKOS example - example usage of the property"
  }),

  /**
   * SKOS broader concepts (skos:broader) - parent properties
   *
   * @example ["http://schema.org/affiliation"]
   */
  broader: Schema.Array(Schema.String).pipe(
    Schema.annotations({
      title: "Broader Concepts",
      description: "SKOS broader - parent properties in hierarchy"
    }),
    Schema.propertySignature,
    Schema.withConstructorDefault(() => [])
  ),

  /**
   * SKOS narrower concepts (skos:narrower) - child properties
   *
   * @example ["http://schema.org/alumniOf"]
   */
  narrower: Schema.Array(Schema.String).pipe(
    Schema.annotations({
      title: "Narrower Concepts",
      description: "SKOS narrower - child properties in hierarchy"
    }),
    Schema.propertySignature,
    Schema.withConstructorDefault(() => [])
  ),

  /**
   * SKOS related concepts (skos:related)
   *
   * @example ["http://schema.org/worksFor"]
   */
  related: Schema.Array(Schema.String).pipe(
    Schema.annotations({
      title: "Related Concepts",
      description: "SKOS related - related properties (non-hierarchical)"
    }),
    Schema.propertySignature,
    Schema.withConstructorDefault(() => [])
  ),

  /**
   * SKOS exact match (skos:exactMatch)
   *
   * @example ["http://www.wikidata.org/prop/direct/P463"]
   */
  exactMatch: Schema.Array(Schema.String).pipe(
    Schema.annotations({
      title: "Exact Match",
      description: "SKOS exact match - equivalent properties in other vocabularies"
    }),
    Schema.propertySignature,
    Schema.withConstructorDefault(() => [])
  ),

  /**
   * SKOS close match (skos:closeMatch)
   *
   * @example ["http://dbpedia.org/ontology/affiliation"]
   */
  closeMatch: Schema.Array(Schema.String).pipe(
    Schema.annotations({
      title: "Close Match",
      description: "SKOS close match - closely related properties in other vocabularies"
    }),
    Schema.propertySignature,
    Schema.withConstructorDefault(() => [])
  )
}) {
  /**
   * Check if property is an ObjectProperty (links entities)
   */
  get isObjectProperty(): boolean {
    return this.rangeType === "object"
  }

  /**
   * Check if property is a DatatypeProperty (literal values)
   */
  get isDatatypeProperty(): boolean {
    return this.rangeType === "datatype"
  }

  toJSON() {
    return {
      _tag: "PropertyDefinition" as const,
      id: this.id,
      label: this.label,
      comment: this.comment,
      domain: this.domain,
      range: this.range,
      rangeType: this.rangeType,
      isFunctional: this.isFunctional,
      isObjectProperty: this.isObjectProperty,
      isDatatypeProperty: this.isDatatypeProperty,
      prefLabels: this.prefLabels,
      altLabels: this.altLabels,
      hiddenLabels: this.hiddenLabels,
      definition: this.definition,
      scopeNote: this.scopeNote,
      example: this.example,
      broader: this.broader,
      narrower: this.narrower,
      related: this.related,
      exactMatch: this.exactMatch,
      closeMatch: this.closeMatch
    }
  }

  /**
   * Convert property definition to semantic document for embedding
   *
   * Creates a rich document with property name, description, domain, range, and constraints.
   * Includes camelCase-split labels and domain/range names for better searchability.
   * Includes SKOS labels (prefLabel, altLabel, hiddenLabel) for enhanced search.
   * Uses sync transform helpers to convert IRIs to local names.
   *
   * @returns Formatted text document optimized for BM25 search
   */
  toDocument(): string {
    const parts: Array<string> = []

    // Add label - prefer prefLabel if available, otherwise use rdfs:label
    const primaryLabel = this.prefLabels.length > 0 ? this.prefLabels[0] : this.label
    const labelEnhanced = enhanceTextForSearch(primaryLabel)
    parts.push(labelEnhanced)

    // Add all prefLabels (if multiple)
    if (this.prefLabels.length > 1) {
      const additionalPrefLabels = this.prefLabels.slice(1).map(enhanceTextForSearch)
      for (const label of additionalPrefLabels) {
        parts.push(label)
      }
    }

    // Add altLabels as synonyms (critical for search)
    // Add each synonym as a separate line to give individual weight
    if (this.altLabels.length > 0) {
      const altLabelsEnhanced = this.altLabels.map(enhanceTextForSearch)
      for (const label of altLabelsEnhanced) {
        parts.push(label)
      }
    }

    // Add hiddenLabels (for misspelling/abbreviation matching)
    if (this.hiddenLabels.length > 0) {
      const hiddenLabelsEnhanced = this.hiddenLabels.map(enhanceTextForSearch)
      for (const label of hiddenLabelsEnhanced) {
        parts.push(label)
      }
    }

    // Add definition - prefer skos:definition if available, otherwise use rdfs:comment
    const description = this.definition || this.comment
    if (description) {
      parts.push(description)
    }

    // Add scopeNote if present
    if (this.scopeNote) {
      parts.push(this.scopeNote)
    }

    // Add example if present
    if (this.example) {
      parts.push(`Example: ${this.example}`)
    }

    // Add domain classes with enhanced searchability
    if (this.domain.length > 0) {
      const domainNames = transformIriArrayToLocalNames(this.domain)
      // Split camelCase in domain names and add to document
      const domainNamesEnhanced = domainNames.map((name) => {
        const split = splitCamelCase(name)
        return split !== name.toLowerCase() ? `${name} ${split}` : name
      })
      parts.push(`Domain: ${domainNamesEnhanced.join(", ")}`)
    }

    // Add range classes/datatypes with enhanced searchability
    if (this.range.length > 0) {
      const rangeNames = transformIriArrayToLocalNames(this.range)
      // Split camelCase in range names and add to document
      const rangeNamesEnhanced = rangeNames.map((name) => {
        const split = splitCamelCase(name)
        return split !== name.toLowerCase() ? `${name} ${split}` : name
      })
      parts.push(`Range: ${rangeNamesEnhanced.join(", ")}`)
    }

    // Add type constraints
    const constraints: Array<string> = []
    if (this.rangeType === "object") {
      constraints.push("object")
    } else {
      constraints.push("datatype")
    }
    if (this.isFunctional) {
      constraints.push("functional")
    }

    if (constraints.length > 0) {
      parts.push(`Type: ${constraints.join(", ")}`)
    }

    // Add related properties (broader, narrower, related)
    const relatedProperties: Array<string> = []
    if (this.broader.length > 0) {
      const broaderNames = transformIriArrayToLocalNames(this.broader)
      relatedProperties.push(`Broader: ${broaderNames.join(", ")}`)
    }
    if (this.narrower.length > 0) {
      const narrowerNames = transformIriArrayToLocalNames(this.narrower)
      relatedProperties.push(`Narrower: ${narrowerNames.join(", ")}`)
    }
    if (this.related.length > 0) {
      const relatedNames = transformIriArrayToLocalNames(this.related)
      relatedProperties.push(`Related: ${relatedNames.join(", ")}`)
    }
    if (relatedProperties.length > 0) {
      parts.push(relatedProperties.join(" | "))
    }

    return parts.join("\n")
  }
}

/**
 * OntologyContext - Complete ontology snapshot
 *
 * Contains all classes and properties from loaded ontology.
 * Used for focused extraction and validation.
 *
 * @since 2.0.0
 * @category Domain
 */
export class OntologyContext extends Schema.Class<OntologyContext>("OntologyContext")({
  /**
   * All class definitions
   */
  classes: Schema.Array(ClassDefinition).annotations({
    title: "Classes",
    description: "All OWL/RDFS classes in the ontology"
  }),

  /**
   * All property definitions
   */
  properties: Schema.Array(PropertyDefinition).annotations({
    title: "Properties",
    description: "All OWL/RDFS properties in the ontology"
  }),

  /**
   * Ontology metadata (optional)
   */
  metadata: Schema.optional(Schema.Record({ key: Schema.String, value: Schema.String })).annotations({
    title: "Metadata",
    description: "Ontology-level metadata (title, version, etc.)"
  }),

  /**
   * Class hierarchy (child IRI -> parent IRIs)
   */
  hierarchy: Schema.Record({ key: Schema.String, value: Schema.Array(Schema.String) }).pipe(
    Schema.annotations({
      title: "Class Hierarchy",
      description: "Map of class IRI to list of parent class IRIs (rdfs:subClassOf)"
    }),
    Schema.propertySignature,
    Schema.withConstructorDefault(() => ({}))
  ),

  /**
   * Property hierarchy (child IRI -> parent IRIs)
   */
  propertyHierarchy: Schema.Record({ key: Schema.String, value: Schema.Array(Schema.String) }).pipe(
    Schema.annotations({
      title: "Property Hierarchy",
      description: "Map of property IRI to list of parent property IRIs (rdfs:subPropertyOf)"
    }),
    Schema.propertySignature,
    Schema.withConstructorDefault(() => ({}))
  )
}) {
  /**
   * Get class by IRI
   */
  getClass(iri: string): ClassDefinition | undefined {
    return this.classes.find((c) => c.id === iri)
  }

  /**
   * Get property by IRI
   */
  getProperty(iri: string): PropertyDefinition | undefined {
    return this.properties.find((p) => p.id === iri)
  }

  /**
   * Get all properties for a class (including inherited)
   *
   * Accepts either full IRI or local name. Extracts local name for comparison.
   * Property domains are stored as full IRIs, so we extract local names from both
   * the class IRI and domain IRIs for case-insensitive comparison.
   * Traverses up the class hierarchy to find properties defined on superclasses.
   */
  getPropertiesForClass(classIri: string): Array<PropertyDefinition> {
    const localName = extractLocalNameFromIri(classIri).toLowerCase()

    // Get all superclasses to check for inherited properties
    const superClasses = this.getAllSuperClasses(classIri)
    const validDomains = new Set<string>([
      localName,
      ...superClasses.map((c) => extractLocalNameFromIri(c).toLowerCase())
    ])

    // Extract local name from domain IRIs for comparison (domain stored as full IRIs)
    return this.properties.filter((p) =>
      p.domain.some((d) => validDomains.has(extractLocalNameFromIri(d).toLowerCase()))
    )
  }

  /**
   * Get all superclasses for a class (transitive closure)
   *
   * Traverses the hierarchy recursively to find all parent classes.
   * Returns a deduplicated list of all ancestor class IRIs.
   */
  getAllSuperClasses(classIri: string): ReadonlyArray<string> {
    const visited = new Set<string>()
    const queue = [...this.getSuperClasses(classIri)]
    const result = new Set<string>()

    while (queue.length > 0) {
      const current = queue.shift()!
      if (visited.has(current)) continue
      visited.add(current)
      result.add(current)

      // Add parents of current class
      const parents = this.getSuperClasses(current)
      for (const parent of parents) {
        if (!visited.has(parent)) {
          queue.push(parent)
        }
      }
    }

    return Array.from(result)
  }

  /**
   * Get direct superclasses for a class
   */
  getSuperClasses(classIri: string): ReadonlyArray<string> {
    return this.hierarchy[classIri] || []
  }

  /**
   * Get direct subclasses for a class
   *
   * Note: This is an expensive O(N) operation as map is keyed by child.
   */
  getSubClasses(parentIri: string): ReadonlyArray<string> {
    const subs: Array<string> = []
    for (const [child, parents] of Object.entries(this.hierarchy)) {
      if (parents.includes(parentIri)) {
        subs.push(child)
      }
    }
    return subs
  }

  /**
   * Check if a class is a subclass of another (transitive check possible if implemented, here direct/recursive)
   */
  isSubClassOf(childIri: string, parentIri: string): boolean {
    if (childIri === parentIri) return true

    const parents = this.getSuperClasses(childIri)
    if (parents.includes(parentIri)) return true

    // Recursive check
    for (const parent of parents) {
      if (this.isSubClassOf(parent, parentIri)) return true
    }

    return false
  }

  /**
   * Get direct superproperties for a property
   */
  getSuperProperties(propertyIri: string): ReadonlyArray<string> {
    return this.propertyHierarchy[propertyIri] || []
  }

  /**
   * Get direct subproperties for a property
   *
   * Note: This is an expensive O(N) operation as map is keyed by child.
   */
  getSubProperties(parentIri: string): ReadonlyArray<string> {
    const subs: Array<string> = []
    for (const [child, parents] of Object.entries(this.propertyHierarchy)) {
      if (parents.includes(parentIri)) {
        subs.push(child)
      }
    }
    return subs
  }

  /**
   * Check if a property is a subproperty of another (transitive check possible if implemented, here direct/recursive)
   */
  isSubPropertyOf(childIri: string, parentIri: string): boolean {
    if (childIri === parentIri) return true

    const parents = this.getSuperProperties(childIri)
    if (parents.includes(parentIri)) return true

    // Recursive check
    for (const parent of parents) {
      if (this.isSubPropertyOf(parent, parentIri)) return true
    }

    return false
  }

  /**
   * Convert all classes and properties to semantic documents for embedding
   *
   * Creates an array of tuples [id, document], one for each class and property,
   * optimized for semantic search and embedding. The ID can be used to retrieve
   * the actual ClassDefinition or PropertyDefinition from this OntologyContext.
   *
   * @returns Array of tuples [IRI, document] where IRI can be used to look up the domain model
   *
   * @example
   * ```typescript
   * const documents = ontology.toDocuments()
   * // => [["http://schema.org/Person", "Person\n..."], ...]
   *
   * // After semantic search, retrieve the actual class:
   * const [iri, _doc] = documents[0]
   * const classDef = ontology.getClass(iri)
   * ```
   */
  toDocuments(): ReadonlyArray<[string, string]> {
    return [
      ...this.classes.map((c) => [c.id, c.toDocument()] as [string, string]),
      ...this.properties.map((p) => [p.id, p.toDocument()] as [string, string])
    ]
  }

  toJSON() {
    return {
      _tag: "OntologyContext" as const,
      classes: this.classes.map((c) => c.toJSON()),
      properties: this.properties.map((p) => p.toJSON()),
      metadata: this.metadata
    }
  }
}

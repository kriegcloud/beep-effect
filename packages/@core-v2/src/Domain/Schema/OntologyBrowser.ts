/**
 * Schema: Ontology Browser API
 *
 * Types for the ontology browser API endpoints.
 * Enables browsing available ontologies and their definitions.
 *
 * @since 2.0.0
 * @module Domain/Schema/OntologyBrowser
 */

import { Schema } from "effect"

/**
 * W3C standard vocabulary reference
 *
 * @since 2.0.0
 * @category Schemas
 */
export class VocabularyRef extends Schema.Class<VocabularyRef>("VocabularyRef")({
  /** Vocabulary IRI */
  iri: Schema.String,
  /** Short prefix (e.g., "foaf", "org") */
  prefix: Schema.String,
  /** Vocabulary name */
  name: Schema.String,
  /** W3C/standards organization */
  publisher: Schema.optional(Schema.String),
  /** Spec URL */
  specUrl: Schema.optional(Schema.String)
}) {}

/**
 * Summary of an ontology for listing
 *
 * @since 2.0.0
 * @category Schemas
 */
export class OntologySummary extends Schema.Class<OntologySummary>("OntologySummary")({
  /** Short identifier */
  id: Schema.String,
  /** Canonical IRI */
  iri: Schema.String,
  /** Human-readable title */
  title: Schema.String,
  /** Description */
  description: Schema.optional(Schema.String),
  /** Version */
  version: Schema.String,
  /** Number of domain classes */
  classCount: Schema.Number,
  /** Number of properties */
  propertyCount: Schema.Number,
  /** Number of imported vocabularies */
  importCount: Schema.Number
}) {}

/**
 * Response for listing ontologies
 *
 * @since 2.0.0
 * @category Schemas
 */
export class OntologyListResponse extends Schema.Class<OntologyListResponse>("OntologyListResponse")({
  ontologies: Schema.Array(OntologySummary)
}) {}

/**
 * Class definition for ontology detail
 *
 * @since 2.0.0
 * @category Schemas
 */
export class ClassSummary extends Schema.Class<ClassSummary>("ClassSummary")({
  /** Class IRI */
  iri: Schema.String,
  /** Local name */
  localName: Schema.String,
  /** rdfs:label */
  label: Schema.optional(Schema.String),
  /** rdfs:comment */
  comment: Schema.optional(Schema.String),
  /** Superclass IRI (if subclass) */
  superClass: Schema.optional(Schema.String)
}) {}

/**
 * Property definition for ontology detail
 *
 * @since 2.0.0
 * @category Schemas
 */
export class PropertySummary extends Schema.Class<PropertySummary>("PropertySummary")({
  /** Property IRI */
  iri: Schema.String,
  /** Local name */
  localName: Schema.String,
  /** rdfs:label */
  label: Schema.optional(Schema.String),
  /** rdfs:comment */
  comment: Schema.optional(Schema.String),
  /** Domain class IRI */
  domain: Schema.optional(Schema.String),
  /** Range class/datatype IRI */
  range: Schema.optional(Schema.String),
  /** Whether this is an object property (links to entities) */
  isObjectProperty: Schema.Boolean
}) {}

/**
 * Response for listing ontology classes
 *
 * @since 2.0.0
 * @category Schemas
 */
export class OntologyClassesResponse extends Schema.Class<OntologyClassesResponse>("OntologyClassesResponse")({
  /** Ontology identifier */
  ontologyId: Schema.String,
  /** Total number of classes */
  total: Schema.Number,
  /** List of classes */
  classes: Schema.Array(ClassSummary)
}) {}

/**
 * Response for listing ontology properties
 *
 * @since 2.0.0
 * @category Schemas
 */
export class OntologyPropertiesResponse extends Schema.Class<OntologyPropertiesResponse>("OntologyPropertiesResponse")({
  /** Ontology identifier */
  ontologyId: Schema.String,
  /** Total number of properties */
  total: Schema.Number,
  /** List of properties */
  properties: Schema.Array(PropertySummary)
}) {}

/**
 * Detailed ontology response
 *
 * @since 2.0.0
 * @category Schemas
 */
export class OntologyDetailResponse extends Schema.Class<OntologyDetailResponse>("OntologyDetailResponse")({
  /** Short identifier */
  id: Schema.String,
  /** Canonical IRI */
  iri: Schema.String,
  /** Human-readable title */
  title: Schema.String,
  /** Description */
  description: Schema.optional(Schema.String),
  /** Version */
  version: Schema.String,
  /** Creator/author */
  creator: Schema.optional(Schema.String),
  /** Creation date */
  created: Schema.optional(Schema.String),
  /** Target namespace for entities */
  targetNamespace: Schema.String,
  /** Imported W3C vocabularies */
  imports: Schema.Array(VocabularyRef),
  /** Domain-specific classes */
  classes: Schema.Array(ClassSummary),
  /** Domain-specific properties */
  properties: Schema.Array(PropertySummary),
  /** See also references */
  seeAlso: Schema.Array(Schema.String)
}) {}

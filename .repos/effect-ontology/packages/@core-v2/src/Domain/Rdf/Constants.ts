/**
 * Domain Model: RDF Constants
 *
 * Standard RDF/OWL IRI constants using domain types.
 * These are backend-agnostic and can be used with any RDF engine.
 *
 * @since 2.0.0
 * @module Domain/Rdf/Constants
 */

import { type IRI } from "./Types.js"

/**
 * Create an IRI from a string (type assertion for trusted constants)
 *
 * Using type assertion instead of Schema.decodeSync to avoid module
 * initialization order issues. All IRIs in this file are hardcoded
 * W3C standard vocabulary strings that don't need runtime validation.
 */
const iri = (value: string): IRI => value as IRI

/**
 * RDF Vocabulary IRIs
 * http://www.w3.org/1999/02/22-rdf-syntax-ns#
 */
export const RDF = {
  type: iri("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"),
  Property: iri("http://www.w3.org/1999/02/22-rdf-syntax-ns#Property"),
  Statement: iri("http://www.w3.org/1999/02/22-rdf-syntax-ns#Statement"),
  subject: iri("http://www.w3.org/1999/02/22-rdf-syntax-ns#subject"),
  predicate: iri("http://www.w3.org/1999/02/22-rdf-syntax-ns#predicate"),
  object: iri("http://www.w3.org/1999/02/22-rdf-syntax-ns#object"),
  first: iri("http://www.w3.org/1999/02/22-rdf-syntax-ns#first"),
  rest: iri("http://www.w3.org/1999/02/22-rdf-syntax-ns#rest"),
  nil: iri("http://www.w3.org/1999/02/22-rdf-syntax-ns#nil"),
  List: iri("http://www.w3.org/1999/02/22-rdf-syntax-ns#List")
} as const

/**
 * RDFS Vocabulary IRIs
 * http://www.w3.org/2000/01/rdf-schema#
 */
export const RDFS = {
  Class: iri("http://www.w3.org/2000/01/rdf-schema#Class"),
  Resource: iri("http://www.w3.org/2000/01/rdf-schema#Resource"),
  Literal: iri("http://www.w3.org/2000/01/rdf-schema#Literal"),
  Datatype: iri("http://www.w3.org/2000/01/rdf-schema#Datatype"),
  label: iri("http://www.w3.org/2000/01/rdf-schema#label"),
  comment: iri("http://www.w3.org/2000/01/rdf-schema#comment"),
  domain: iri("http://www.w3.org/2000/01/rdf-schema#domain"),
  range: iri("http://www.w3.org/2000/01/rdf-schema#range"),
  subClassOf: iri("http://www.w3.org/2000/01/rdf-schema#subClassOf"),
  subPropertyOf: iri("http://www.w3.org/2000/01/rdf-schema#subPropertyOf"),
  seeAlso: iri("http://www.w3.org/2000/01/rdf-schema#seeAlso"),
  isDefinedBy: iri("http://www.w3.org/2000/01/rdf-schema#isDefinedBy")
} as const

/**
 * OWL Vocabulary IRIs
 * http://www.w3.org/2002/07/owl#
 */
export const OWL = {
  Class: iri("http://www.w3.org/2002/07/owl#Class"),
  Thing: iri("http://www.w3.org/2002/07/owl#Thing"),
  Nothing: iri("http://www.w3.org/2002/07/owl#Nothing"),
  ObjectProperty: iri("http://www.w3.org/2002/07/owl#ObjectProperty"),
  DatatypeProperty: iri("http://www.w3.org/2002/07/owl#DatatypeProperty"),
  FunctionalProperty: iri("http://www.w3.org/2002/07/owl#FunctionalProperty"),
  InverseFunctionalProperty: iri("http://www.w3.org/2002/07/owl#InverseFunctionalProperty"),
  TransitiveProperty: iri("http://www.w3.org/2002/07/owl#TransitiveProperty"),
  SymmetricProperty: iri("http://www.w3.org/2002/07/owl#SymmetricProperty"),
  AsymmetricProperty: iri("http://www.w3.org/2002/07/owl#AsymmetricProperty"),
  ReflexiveProperty: iri("http://www.w3.org/2002/07/owl#ReflexiveProperty"),
  IrreflexiveProperty: iri("http://www.w3.org/2002/07/owl#IrreflexiveProperty"),
  inverseOf: iri("http://www.w3.org/2002/07/owl#inverseOf"),
  equivalentClass: iri("http://www.w3.org/2002/07/owl#equivalentClass"),
  equivalentProperty: iri("http://www.w3.org/2002/07/owl#equivalentProperty"),
  disjointWith: iri("http://www.w3.org/2002/07/owl#disjointWith"),
  sameAs: iri("http://www.w3.org/2002/07/owl#sameAs"),
  differentFrom: iri("http://www.w3.org/2002/07/owl#differentFrom"),
  unionOf: iri("http://www.w3.org/2002/07/owl#unionOf"),
  intersectionOf: iri("http://www.w3.org/2002/07/owl#intersectionOf"),
  complementOf: iri("http://www.w3.org/2002/07/owl#complementOf"),
  oneOf: iri("http://www.w3.org/2002/07/owl#oneOf"),
  Restriction: iri("http://www.w3.org/2002/07/owl#Restriction"),
  onProperty: iri("http://www.w3.org/2002/07/owl#onProperty"),
  allValuesFrom: iri("http://www.w3.org/2002/07/owl#allValuesFrom"),
  someValuesFrom: iri("http://www.w3.org/2002/07/owl#someValuesFrom"),
  hasValue: iri("http://www.w3.org/2002/07/owl#hasValue"),
  minCardinality: iri("http://www.w3.org/2002/07/owl#minCardinality"),
  maxCardinality: iri("http://www.w3.org/2002/07/owl#maxCardinality"),
  cardinality: iri("http://www.w3.org/2002/07/owl#cardinality")
} as const

/**
 * PROV-O Vocabulary IRIs (Provenance Ontology)
 * http://www.w3.org/ns/prov#
 */
export const PROV = {
  Entity: iri("http://www.w3.org/ns/prov#Entity"),
  Activity: iri("http://www.w3.org/ns/prov#Activity"),
  Agent: iri("http://www.w3.org/ns/prov#Agent"),
  wasGeneratedBy: iri("http://www.w3.org/ns/prov#wasGeneratedBy"),
  wasDerivedFrom: iri("http://www.w3.org/ns/prov#wasDerivedFrom"),
  wasAttributedTo: iri("http://www.w3.org/ns/prov#wasAttributedTo"),
  startedAtTime: iri("http://www.w3.org/ns/prov#startedAtTime"),
  endedAtTime: iri("http://www.w3.org/ns/prov#endedAtTime"),
  generatedAtTime: iri("http://www.w3.org/ns/prov#generatedAtTime"),
  used: iri("http://www.w3.org/ns/prov#used"),
  wasAssociatedWith: iri("http://www.w3.org/ns/prov#wasAssociatedWith")
} as const

/**
 * Dublin Core Terms Vocabulary IRIs
 * http://purl.org/dc/terms/
 */
export const DCTERMS = {
  title: iri("http://purl.org/dc/terms/title"),
  description: iri("http://purl.org/dc/terms/description"),
  creator: iri("http://purl.org/dc/terms/creator"),
  created: iri("http://purl.org/dc/terms/created"),
  modified: iri("http://purl.org/dc/terms/modified"),
  source: iri("http://purl.org/dc/terms/source"),
  identifier: iri("http://purl.org/dc/terms/identifier"),
  format: iri("http://purl.org/dc/terms/format"),
  type: iri("http://purl.org/dc/terms/type"),
  subject: iri("http://purl.org/dc/terms/subject"),
  publisher: iri("http://purl.org/dc/terms/publisher"),
  contributor: iri("http://purl.org/dc/terms/contributor"),
  rights: iri("http://purl.org/dc/terms/rights"),
  license: iri("http://purl.org/dc/terms/license")
} as const

/**
 * XSD Vocabulary IRIs (XML Schema Datatypes)
 * http://www.w3.org/2001/XMLSchema#
 */
export const XSD = {
  string: iri("http://www.w3.org/2001/XMLSchema#string"),
  integer: iri("http://www.w3.org/2001/XMLSchema#integer"),
  decimal: iri("http://www.w3.org/2001/XMLSchema#decimal"),
  float: iri("http://www.w3.org/2001/XMLSchema#float"),
  double: iri("http://www.w3.org/2001/XMLSchema#double"),
  boolean: iri("http://www.w3.org/2001/XMLSchema#boolean"),
  date: iri("http://www.w3.org/2001/XMLSchema#date"),
  time: iri("http://www.w3.org/2001/XMLSchema#time"),
  dateTime: iri("http://www.w3.org/2001/XMLSchema#dateTime"),
  anyURI: iri("http://www.w3.org/2001/XMLSchema#anyURI")
} as const

/**
 * SKOS Vocabulary IRIs
 * http://www.w3.org/2004/02/skos/core#
 */
export const SKOS = {
  Concept: iri("http://www.w3.org/2004/02/skos/core#Concept"),
  ConceptScheme: iri("http://www.w3.org/2004/02/skos/core#ConceptScheme"),
  Collection: iri("http://www.w3.org/2004/02/skos/core#Collection"),
  OrderedCollection: iri("http://www.w3.org/2004/02/skos/core#OrderedCollection"),
  prefLabel: iri("http://www.w3.org/2004/02/skos/core#prefLabel"),
  altLabel: iri("http://www.w3.org/2004/02/skos/core#altLabel"),
  hiddenLabel: iri("http://www.w3.org/2004/02/skos/core#hiddenLabel"),
  definition: iri("http://www.w3.org/2004/02/skos/core#definition"),
  scopeNote: iri("http://www.w3.org/2004/02/skos/core#scopeNote"),
  example: iri("http://www.w3.org/2004/02/skos/core#example"),
  note: iri("http://www.w3.org/2004/02/skos/core#note"),
  broader: iri("http://www.w3.org/2004/02/skos/core#broader"),
  narrower: iri("http://www.w3.org/2004/02/skos/core#narrower"),
  related: iri("http://www.w3.org/2004/02/skos/core#related"),
  exactMatch: iri("http://www.w3.org/2004/02/skos/core#exactMatch"),
  closeMatch: iri("http://www.w3.org/2004/02/skos/core#closeMatch"),
  broadMatch: iri("http://www.w3.org/2004/02/skos/core#broadMatch"),
  narrowMatch: iri("http://www.w3.org/2004/02/skos/core#narrowMatch"),
  relatedMatch: iri("http://www.w3.org/2004/02/skos/core#relatedMatch"),
  inScheme: iri("http://www.w3.org/2004/02/skos/core#inScheme"),
  hasTopConcept: iri("http://www.w3.org/2004/02/skos/core#hasTopConcept"),
  topConceptOf: iri("http://www.w3.org/2004/02/skos/core#topConceptOf")
} as const

/**
 * Extraction Vocabulary IRIs (Effect Ontology extraction-specific predicates)
 * These are used for extraction metadata and confidence scoring.
 *
 * Uses a custom namespace to avoid conflicts with standard vocabularies.
 * The namespace should be configured per-deployment but defaults to example.org.
 *
 * @since 2.0.0
 */
export const EXTR = {
  /** Confidence score for an extracted triple (0-1, xsd:double) */
  confidence: iri("http://example.org/kg/confidence"),
  /** Model used for extraction (xsd:string) */
  usedModel: iri("http://example.org/kg/usedModel"),
  /** Ontology version used for extraction (xsd:string) */
  ontologyVersion: iri("http://example.org/kg/ontologyVersion"),
  /** Source chunk index (xsd:integer) */
  sourceChunk: iri("http://example.org/kg/sourceChunk"),
  /** Extraction method used (xsd:string) */
  extractionMethod: iri("http://example.org/kg/extractionMethod")
} as const

/**
 * Claims Vocabulary IRIs (Effect Ontology claims namespace)
 * http://effect-ontology.dev/claims#
 *
 * Wikidata-style claim ranks and reified statement properties.
 *
 * @since 2.0.0
 */
export const CLAIMS = {
  // Namespace
  namespace: "http://effect-ontology.dev/claims#",

  // Classes
  Claim: iri("http://effect-ontology.dev/claims#Claim"),
  ClaimRank: iri("http://effect-ontology.dev/claims#ClaimRank"),
  Evidence: iri("http://effect-ontology.dev/claims#Evidence"),
  ArticleClaimSet: iri("http://effect-ontology.dev/claims#ArticleClaimSet"),
  ClaimSetStatus: iri("http://effect-ontology.dev/claims#ClaimSetStatus"),

  // Rank Individuals
  Preferred: iri("http://effect-ontology.dev/claims#Preferred"),
  Normal: iri("http://effect-ontology.dev/claims#Normal"),
  Deprecated: iri("http://effect-ontology.dev/claims#Deprecated"),

  // Status Individuals
  Pending: iri("http://effect-ontology.dev/claims#Pending"),
  Accepted: iri("http://effect-ontology.dev/claims#Accepted"),
  Retracted: iri("http://effect-ontology.dev/claims#Retracted"),

  // Reification Properties (aligned with claims.ttl vocabulary)
  claimSubject: iri("http://effect-ontology.dev/claims#claimSubject"),
  claimPredicate: iri("http://effect-ontology.dev/claims#claimPredicate"),
  claimObject: iri("http://effect-ontology.dev/claims#claimObject"),
  claimLiteral: iri("http://effect-ontology.dev/claims#claimLiteral"),

  // Metadata Properties
  rank: iri("http://effect-ontology.dev/claims#rank"),
  confidence: iri("http://effect-ontology.dev/claims#confidence"),
  validFrom: iri("http://effect-ontology.dev/claims#validFrom"),
  validUntil: iri("http://effect-ontology.dev/claims#validUntil"),
  eventTime: iri("http://effect-ontology.dev/claims#eventTime"),
  statedIn: iri("http://effect-ontology.dev/claims#statedIn"),
  extractedAt: iri("http://effect-ontology.dev/claims#extractedAt"),
  extractedBy: iri("http://effect-ontology.dev/claims#extractedBy"),
  deprecatedAt: iri("http://effect-ontology.dev/claims#deprecatedAt"),
  deprecationReason: iri("http://effect-ontology.dev/claims#deprecationReason"),
  supersedes: iri("http://effect-ontology.dev/claims#supersedes"),
  supersededBy: iri("http://effect-ontology.dev/claims#supersededBy"),
  hasEvidence: iri("http://effect-ontology.dev/claims#hasEvidence"),
  evidenceText: iri("http://effect-ontology.dev/claims#evidenceText"),
  startOffset: iri("http://effect-ontology.dev/claims#startOffset"),
  endOffset: iri("http://effect-ontology.dev/claims#endOffset"),
  claimStatus: iri("http://effect-ontology.dev/claims#claimStatus"),
  containsClaim: iri("http://effect-ontology.dev/claims#containsClaim"),
  sourceArticle: iri("http://effect-ontology.dev/claims#sourceArticle")
} as const

/**
 * Corrections Vocabulary IRIs (Effect Ontology corrections namespace)
 * http://effect-ontology.dev/corrections#
 *
 * PROV-O based vocabulary for tracking corrections, retractions, and updates.
 *
 * @since 2.0.0
 */
export const CORRECTIONS = {
  // Namespace
  namespace: "http://effect-ontology.dev/corrections#",

  // Classes
  Correction: iri("http://effect-ontology.dev/corrections#Correction"),
  CorrectionType: iri("http://effect-ontology.dev/corrections#CorrectionType"),
  CorrectionChain: iri("http://effect-ontology.dev/corrections#CorrectionChain"),
  Conflict: iri("http://effect-ontology.dev/corrections#Conflict"),
  ConflictType: iri("http://effect-ontology.dev/corrections#ConflictType"),
  ResolutionStrategy: iri("http://effect-ontology.dev/corrections#ResolutionStrategy"),

  // Correction Type Individuals
  Retraction: iri("http://effect-ontology.dev/corrections#Retraction"),
  Clarification: iri("http://effect-ontology.dev/corrections#Clarification"),
  Update: iri("http://effect-ontology.dev/corrections#Update"),
  Amendment: iri("http://effect-ontology.dev/corrections#Amendment"),

  // Conflict Type Individuals
  PositionConflict: iri("http://effect-ontology.dev/corrections#PositionConflict"),
  TemporalConflict: iri("http://effect-ontology.dev/corrections#TemporalConflict"),
  ContradictoryConflict: iri("http://effect-ontology.dev/corrections#ContradictoryConflict"),

  // Resolution Strategy Individuals
  TemporalPrecedence: iri("http://effect-ontology.dev/corrections#TemporalPrecedence"),
  SourceAuthority: iri("http://effect-ontology.dev/corrections#SourceAuthority"),
  ManualReview: iri("http://effect-ontology.dev/corrections#ManualReview"),

  // Properties
  correctionType: iri("http://effect-ontology.dev/corrections#correctionType"),
  correctionDate: iri("http://effect-ontology.dev/corrections#correctionDate"),
  correctionReason: iri("http://effect-ontology.dev/corrections#correctionReason"),
  sourceDocument: iri("http://effect-ontology.dev/corrections#sourceDocument"),
  invalidates: iri("http://effect-ontology.dev/corrections#invalidates"),
  invalidatedBy: iri("http://effect-ontology.dev/corrections#invalidatedBy"),
  refines: iri("http://effect-ontology.dev/corrections#refines"),
  introduces: iri("http://effect-ontology.dev/corrections#introduces"),
  conflictType: iri("http://effect-ontology.dev/corrections#conflictType"),
  involvesClaim: iri("http://effect-ontology.dev/corrections#involvesClaim"),
  detectedAt: iri("http://effect-ontology.dev/corrections#detectedAt"),
  resolvedBy: iri("http://effect-ontology.dev/corrections#resolvedBy"),
  resolutionStrategy: iri("http://effect-ontology.dev/corrections#resolutionStrategy"),

  // Curation extensions (used for few-shot learning and curation actions)
  CurationActivity: iri("http://effect-ontology.dev/corrections#CurationActivity"),
  curatedBy: iri("http://effect-ontology.dev/corrections#curatedBy"),
  curationConfidence: iri("http://effect-ontology.dev/corrections#curationConfidence"),
  usedAsExample: iri("http://effect-ontology.dev/corrections#usedAsExample"),
  curationNote: iri("http://effect-ontology.dev/corrections#curationNote")
} as const

/**
 * Effect Core Ontology IRIs (effect-ontology.dev/core#)
 *
 * Core vocabulary for knowledge extraction: TrackedEntity, TrackedEvent, Mention.
 * Aligned with DOLCE+DnS Ultralite (DUL) foundational ontology.
 *
 * @since 2.0.0
 */
export const CORE = {
  // Namespace
  namespace: "http://effect-ontology.dev/core#",

  // Classes (DUL-aligned)
  TrackedEntity: iri("http://effect-ontology.dev/core#TrackedEntity"),
  TrackedEvent: iri("http://effect-ontology.dev/core#TrackedEvent"),
  Mention: iri("http://effect-ontology.dev/core#Mention"),

  // Object Properties - Evidence Linking
  hasEvidentialMention: iri("http://effect-ontology.dev/core#hasEvidentialMention"),
  mentions: iri("http://effect-ontology.dev/core#mentions"),

  // Object Properties - Event Participation
  hasParticipant: iri("http://effect-ontology.dev/core#hasParticipant"),
  isParticipantIn: iri("http://effect-ontology.dev/core#isParticipantIn"),

  // Object Properties - Entity Resolution
  sameEntityAs: iri("http://effect-ontology.dev/core#sameEntityAs"),
  mergedFrom: iri("http://effect-ontology.dev/core#mergedFrom"),

  // Object Properties - Spatial
  hasLocation: iri("http://effect-ontology.dev/core#hasLocation"),

  // Datatype Properties
  name: iri("http://effect-ontology.dev/core#name"),
  description: iri("http://effect-ontology.dev/core#description"),
  occurrenceTime: iri("http://effect-ontology.dev/core#occurrenceTime"),
  groundingConfidence: iri("http://effect-ontology.dev/core#groundingConfidence"),
  resolutionConfidence: iri("http://effect-ontology.dev/core#resolutionConfidence")
} as const

/**
 * Schema.org Vocabulary IRIs
 * http://schema.org/
 *
 * Commonly used schema.org properties for entity metadata.
 *
 * @since 2.0.0
 */
export const SCHEMA = {
  // Namespace
  namespace: "http://schema.org/",

  // Common properties
  name: iri("http://schema.org/name"),
  alternateName: iri("http://schema.org/alternateName"),
  description: iri("http://schema.org/description"),
  identifier: iri("http://schema.org/identifier"),
  url: iri("http://schema.org/url"),
  sameAs: iri("http://schema.org/sameAs"),

  // Date/time properties
  dateCreated: iri("http://schema.org/dateCreated"),
  dateModified: iri("http://schema.org/dateModified"),
  datePublished: iri("http://schema.org/datePublished"),

  // Types
  Thing: iri("http://schema.org/Thing"),
  Person: iri("http://schema.org/Person"),
  Organization: iri("http://schema.org/Organization"),
  Place: iri("http://schema.org/Place"),
  Event: iri("http://schema.org/Event")
} as const

// Legacy named exports for backward compatibility
// @deprecated Use RDF.type instead
export const RDF_TYPE = RDF.type

// @deprecated Use OWL.Class instead
export const OWL_CLASS = OWL.Class
// @deprecated Use OWL.ObjectProperty instead
export const OWL_OBJECT_PROPERTY = OWL.ObjectProperty
// @deprecated Use OWL.DatatypeProperty instead
export const OWL_DATATYPE_PROPERTY = OWL.DatatypeProperty
// @deprecated Use OWL.FunctionalProperty instead
export const OWL_FUNCTIONAL_PROPERTY = OWL.FunctionalProperty
// @deprecated Use OWL.inverseOf instead
export const OWL_INVERSEOF = OWL.inverseOf
// @deprecated Use OWL.equivalentClass instead
export const OWL_EQUIVALENT_CLASS = OWL.equivalentClass

// @deprecated Use RDFS.label instead
export const RDFS_LABEL = RDFS.label
// @deprecated Use RDFS.comment instead
export const RDFS_COMMENT = RDFS.comment
// @deprecated Use RDFS.domain instead
export const RDFS_DOMAIN = RDFS.domain
// @deprecated Use RDFS.range instead
export const RDFS_RANGE = RDFS.range
// @deprecated Use RDFS.subClassOf instead
export const RDFS_SUBCLASSOF = RDFS.subClassOf
// @deprecated Use RDFS.subPropertyOf instead
export const RDFS_SUBPROPERTYOF = RDFS.subPropertyOf

// @deprecated Use SKOS.prefLabel instead
export const SKOS_PREFLABEL = SKOS.prefLabel
// @deprecated Use SKOS.altLabel instead
export const SKOS_ALTLABEL = SKOS.altLabel
// @deprecated Use SKOS.hiddenLabel instead
export const SKOS_HIDDENLABEL = SKOS.hiddenLabel
// @deprecated Use SKOS.definition instead
export const SKOS_DEFINITION = SKOS.definition
// @deprecated Use SKOS.scopeNote instead
export const SKOS_SCOPENOTE = SKOS.scopeNote
// @deprecated Use SKOS.example instead
export const SKOS_EXAMPLE = SKOS.example
// @deprecated Use SKOS.note instead
export const SKOS_NOTE = SKOS.note
// @deprecated Use SKOS.broader instead
export const SKOS_BROADER = SKOS.broader
// @deprecated Use SKOS.narrower instead
export const SKOS_NARROWER = SKOS.narrower
// @deprecated Use SKOS.related instead
export const SKOS_RELATED = SKOS.related
// @deprecated Use SKOS.exactMatch instead
export const SKOS_EXACTMATCH = SKOS.exactMatch
// @deprecated Use SKOS.closeMatch instead
export const SKOS_CLOSEMATCH = SKOS.closeMatch

/**
 * Known vocabulary metadata for enriching import IRIs with human-readable info.
 * This provides metadata for well-known external vocabularies that ontologies may import.
 *
 * @since 2.0.0
 */
export const KNOWN_VOCABULARIES: Record<string, { prefix: string; name: string; publisher: string; specUrl: string }> =
  {
    "http://xmlns.com/foaf/0.1/": {
      prefix: "foaf",
      name: "FOAF",
      publisher: "FOAF Project",
      specUrl: "http://xmlns.com/foaf/spec/"
    },
    "http://www.w3.org/ns/org#": {
      prefix: "org",
      name: "W3C Organization Ontology",
      publisher: "W3C",
      specUrl: "https://www.w3.org/TR/vocab-org/"
    },
    "http://www.w3.org/2006/time#": {
      prefix: "time",
      name: "OWL-Time",
      publisher: "W3C",
      specUrl: "https://www.w3.org/TR/owl-time/"
    },
    "http://www.w3.org/ns/prov#": {
      prefix: "prov",
      name: "PROV-O",
      publisher: "W3C",
      specUrl: "https://www.w3.org/TR/prov-o/"
    },
    "http://www.w3.org/ns/oa#": {
      prefix: "oa",
      name: "Web Annotation",
      publisher: "W3C",
      specUrl: "https://www.w3.org/TR/annotation-model/"
    },
    "http://www.w3.org/2004/02/skos/core#": {
      prefix: "skos",
      name: "SKOS",
      publisher: "W3C",
      specUrl: "https://www.w3.org/TR/skos-reference/"
    }
  }

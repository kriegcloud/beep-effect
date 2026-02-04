/**
 * Schema: Ontology Registry
 *
 * Defines the schema for the ontology registry manifest (registry.json).
 * The registry provides metadata for all available ontologies, enabling
 * multi-ontology deployments where each request can specify its own ontology.
 *
 * Following OBO Foundry / W3C patterns for ontology management.
 *
 * @since 2.0.0
 * @module Domain/Schema/OntologyRegistry
 */

import { Schema } from "effect"

/**
 * Entry for a single ontology in the registry
 *
 * @since 2.0.0
 * @category Schemas
 */
export class OntologyEntry extends Schema.Class<OntologyEntry>("OntologyEntry")({
  /** Short identifier (e.g., "seattle", "claims") */
  id: Schema.String.pipe(Schema.minLength(1)),

  /** Canonical ontology IRI (e.g., "http://effect-ontology.dev/seattle") */
  iri: Schema.String.pipe(Schema.startsWith("http")),

  /** Semantic version (e.g., "1.0.0") */
  version: Schema.String,

  /** Human-readable title */
  title: Schema.String,

  /** Description of the ontology's purpose */
  description: Schema.optional(Schema.String),

  /** Path to main ontology file in storage (relative to bucket) */
  storagePath: Schema.String,

  /** Path to SHACL shapes file (optional) */
  shapesPath: Schema.optionalWith(Schema.String, { nullable: true }),

  /** Declared owl:imports IRIs */
  imports: Schema.Array(Schema.String),

  /** Path to merged external vocabularies */
  externalVocabsPath: Schema.optionalWith(Schema.String, { nullable: true }),

  /** Path to pre-computed embeddings (optional) */
  embeddingsPath: Schema.optionalWith(Schema.String, { nullable: true }),

  /** Target namespace for extracted entities */
  targetNamespace: Schema.String
}) {}

/**
 * Shared resources available to all ontologies
 *
 * @since 2.0.0
 * @category Schemas
 */
export class SharedResources extends Schema.Class<SharedResources>("SharedResources")({
  /** Path to merged external vocabularies (PROV-O, ORG, etc.) */
  externalVocabs: Schema.optionalWith(Schema.String, { nullable: true })
}) {}

/**
 * Complete ontology registry manifest
 *
 * @since 2.0.0
 * @category Schemas
 */
export class OntologyRegistry extends Schema.Class<OntologyRegistry>("OntologyRegistry")({
  /** Registry format version */
  version: Schema.String,

  /** When the registry was generated */
  generatedAt: Schema.String,

  /** List of available ontologies */
  ontologies: Schema.Array(OntologyEntry),

  /** Shared resources (optional) */
  sharedResources: Schema.optional(SharedResources)
}) {}

/**
 * JSON codec for OntologyRegistry (for parsing registry.json)
 *
 * @since 2.0.0
 * @category Codecs
 */
export const OntologyRegistryJson = Schema.parseJson(OntologyRegistry)

/**
 * JSON codec for OntologyEntry
 *
 * @since 2.0.0
 * @category Codecs
 */
export const OntologyEntryJson = Schema.parseJson(OntologyEntry)

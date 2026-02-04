/**
 * Domain Errors: Ontology Errors
 *
 * Errors specific to ontology operations.
 *
 * @since 2.0.0
 * @module Domain/Error/Ontology
 */

import { Schema } from "effect"

/**
 * OntologyError - Ontology operation errors
 *
 * @since 2.0.0
 * @category Error
 */
export class OntologyError extends Schema.TaggedError<OntologyError>()(
  "OntologyError",
  {
    message: Schema.String,
    cause: Schema.optional(Schema.Unknown)
  }
) {}

/**
 * ClassNotFound - Class IRI not found in ontology
 *
 * @since 2.0.0
 * @category Error
 */
export class ClassNotFound extends Schema.TaggedError<ClassNotFound>()(
  "ClassNotFound",
  {
    message: Schema.String,
    cause: Schema.optional(Schema.Unknown),

    /**
     * Class IRI that was not found
     */
    classIri: Schema.String.annotations({
      title: "Class IRI",
      description: "IRI of the class that was not found"
    })
  }
) {}

/**
 * PropertyNotFound - Property IRI not found in ontology
 *
 * @since 2.0.0
 * @category Error
 */
export class PropertyNotFound extends Schema.TaggedError<PropertyNotFound>()(
  "PropertyNotFound",
  {
    message: Schema.String,
    cause: Schema.optional(Schema.Unknown),

    /**
     * Property IRI that was not found
     */
    propertyIri: Schema.String.annotations({
      title: "Property IRI",
      description: "IRI of the property that was not found"
    })
  }
) {}

/**
 * OntologyFileNotFound - Ontology file not found
 *
 * @since 2.0.0
 * @category Error
 */
export class OntologyFileNotFound extends Schema.TaggedError<OntologyFileNotFound>()(
  "OntologyFileNotFound",
  {
    message: Schema.String,
    cause: Schema.optional(Schema.Unknown),

    /**
     * File path that was not found
     */
    path: Schema.String.annotations({
      title: "File Path",
      description: "Path to the ontology file that was not found"
    })
  }
) {}

/**
 * OntologyParsingFailed - Failed to parse ontology file
 *
 * @since 2.0.0
 * @category Error
 */
export class OntologyParsingFailed extends Schema.TaggedError<OntologyParsingFailed>()(
  "OntologyParsingFailed",
  {
    message: Schema.String,
    cause: Schema.optional(Schema.Unknown),

    /**
     * File path that failed to parse
     */
    path: Schema.String.annotations({
      title: "File Path",
      description: "Path to the ontology file that failed to parse"
    })
  }
) {}

/**
 * EmbeddingsNotFound - Pre-computed embeddings blob not found
 *
 * @since 2.0.0
 * @category Error
 */
export class EmbeddingsNotFound extends Schema.TaggedError<EmbeddingsNotFound>()(
  "EmbeddingsNotFound",
  {
    message: Schema.String,
    cause: Schema.optional(Schema.Unknown),

    /**
     * URI of the ontology for which embeddings were not found
     */
    ontologyUri: Schema.String.annotations({
      title: "Ontology URI",
      description: "URI of the ontology for which embeddings were not found"
    }),

    /**
     * Expected path where embeddings should be stored
     */
    embeddingsPath: Schema.String.annotations({
      title: "Embeddings Path",
      description: "Expected path to the embeddings blob"
    })
  }
) {}

/**
 * EmbeddingsVersionMismatch - Embeddings version doesn't match ontology content
 *
 * @since 2.0.0
 * @category Error
 */
export class EmbeddingsVersionMismatch extends Schema.TaggedError<EmbeddingsVersionMismatch>()(
  "EmbeddingsVersionMismatch",
  {
    message: Schema.String,
    cause: Schema.optional(Schema.Unknown),

    /**
     * URI of the ontology
     */
    ontologyUri: Schema.String.annotations({
      title: "Ontology URI",
      description: "URI of the ontology"
    }),

    /**
     * Expected version (computed from current ontology content)
     */
    expectedVersion: Schema.String.annotations({
      title: "Expected Version",
      description: "Version hash computed from current ontology content"
    }),

    /**
     * Actual version found in embeddings blob
     */
    actualVersion: Schema.String.annotations({
      title: "Actual Version",
      description: "Version hash found in the embeddings blob"
    })
  }
) {}

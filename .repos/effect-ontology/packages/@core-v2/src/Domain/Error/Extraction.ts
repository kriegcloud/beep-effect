/**
 * Domain Errors: Extraction Errors
 *
 * Errors specific to entity and relation extraction.
 *
 * @since 2.0.0
 * @module Domain/Error/Extraction
 */

import { Schema } from "effect"

/**
 * ExtractionError - Errors during extraction process
 *
 * @since 2.0.0
 * @category Error
 */
export class ExtractionError extends Schema.TaggedError<ExtractionError>()(
  "ExtractionError",
  {
    message: Schema.String,
    cause: Schema.optional(Schema.Unknown),

    /**
     * Text that failed to extract
     */
    text: Schema.optional(Schema.String).annotations({
      title: "Text",
      description: "Source text that caused the error"
    })
  }
) {}

/**
 * MentionExtractionFailed - Mention extraction failure
 *
 * @since 2.0.0
 * @category Error
 */
export class MentionExtractionFailed extends Schema.TaggedError<MentionExtractionFailed>()(
  "MentionExtractionFailed",
  {
    message: Schema.String,
    cause: Schema.optional(Schema.Unknown),
    text: Schema.optional(Schema.String)
  }
) {}

/**
 * EntityExtractionFailed - Entity extraction failure
 *
 * @since 2.0.0
 * @category Error
 */
export class EntityExtractionFailed extends Schema.TaggedError<EntityExtractionFailed>()(
  "EntityExtractionFailed",
  {
    message: Schema.String,
    cause: Schema.optional(Schema.Unknown),
    text: Schema.optional(Schema.String)
  }
) {}

/**
 * RelationExtractionFailed - Relation extraction failure
 *
 * @since 2.0.0
 * @category Error
 */
export class RelationExtractionFailed extends Schema.TaggedError<RelationExtractionFailed>()(
  "RelationExtractionFailed",
  {
    message: Schema.String,
    cause: Schema.optional(Schema.Unknown),
    text: Schema.optional(Schema.String),

    /**
     * Entities that were successfully extracted (for debugging)
     */
    entities: Schema.optional(Schema.Array(Schema.Unknown))
  }
) {}

/**
 * SchemaGenerationFailed - JSON schema generation failure
 *
 * @since 2.0.0
 * @category Error
 */
export class SchemaGenerationFailed extends Schema.TaggedError<SchemaGenerationFailed>()(
  "SchemaGenerationFailed",
  {
    message: Schema.String,
    cause: Schema.optional(Schema.Unknown)
  }
) {}

/**
 * ValidationFailed - Schema validation failure
 *
 * @since 2.0.0
 * @category Error
 */
export class ValidationFailed extends Schema.TaggedError<ValidationFailed>()(
  "ValidationFailed",
  {
    message: Schema.String,
    cause: Schema.optional(Schema.Unknown),

    /**
     * Invalid data that failed validation
     */
    data: Schema.optional(Schema.Unknown)
  }
) {}

/**
 * EntityValidationFailed - Entity validation failure during extraction
 *
 * Used for per-row validation failures that don't kill the entire chunk.
 * These errors are logged but don't stop processing.
 *
 * @since 2.0.0
 * @category Error
 */
export class EntityValidationFailed extends Schema.TaggedError<EntityValidationFailed>()(
  "EntityValidationFailed",
  {
    /**
     * Reason for validation failure
     */
    reason: Schema.String,

    /**
     * Raw entity data that failed validation
     */
    entityData: Schema.Unknown,

    /**
     * Optional chunk index for context
     */
    chunkIndex: Schema.optional(Schema.Number)
  }
) {}

/**
 * RelationValidationFailed - Relation validation failure during extraction
 *
 * Used for per-row validation failures that don't kill the entire chunk.
 * These errors are logged but don't stop processing.
 *
 * @since 2.0.0
 * @category Error
 */
export class RelationValidationFailed extends Schema.TaggedError<RelationValidationFailed>()(
  "RelationValidationFailed",
  {
    /**
     * Reason for validation failure
     */
    reason: Schema.String,

    /**
     * Raw relation data that failed validation
     */
    relationData: Schema.Unknown,

    /**
     * Optional chunk index for context
     */
    chunkIndex: Schema.optional(Schema.Number)
  }
) {}

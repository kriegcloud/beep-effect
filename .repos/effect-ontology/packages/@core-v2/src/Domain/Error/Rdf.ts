/**
 * Domain Errors: RDF Errors
 *
 * Errors specific to RDF processing and serialization.
 *
 * @since 2.0.0
 * @module Domain/Error/Rdf
 */

import { Schema } from "effect"

/**
 * RdfError - RDF processing errors
 *
 * @since 2.0.0
 * @category Error
 */
export class RdfError extends Schema.TaggedError<RdfError>()(
  "RdfError",
  {
    message: Schema.String,
    cause: Schema.optional(Schema.Unknown)
  }
) {}

/**
 * SerializationFailed - RDF serialization failure
 *
 * @since 2.0.0
 * @category Error
 */
export class SerializationFailed extends Schema.TaggedError<SerializationFailed>()(
  "SerializationFailed",
  {
    message: Schema.String,
    cause: Schema.optional(Schema.Unknown),

    /**
     * Target format that failed
     */
    format: Schema.optional(Schema.String).annotations({
      title: "Format",
      description: "Serialization format (e.g., 'Turtle', 'N-Triples')"
    })
  }
) {}

/**
 * ParsingFailed - RDF parsing failure
 *
 * @since 2.0.0
 * @category Error
 */
export class ParsingFailed extends Schema.TaggedError<ParsingFailed>()(
  "ParsingFailed",
  {
    message: Schema.String,
    cause: Schema.optional(Schema.Unknown),

    /**
     * Source format that failed to parse
     */
    format: Schema.optional(Schema.String)
  }
) {}

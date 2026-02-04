/**
 * Domain Errors: SPARQL Errors
 *
 * Errors specific to SPARQL query parsing and execution.
 *
 * @since 2.0.0
 * @module Domain/Error/Sparql
 */

import { Schema } from "effect"

/**
 * SparqlExecutionError - SPARQL query execution failure
 *
 * @since 2.0.0
 * @category Error
 */
export class SparqlExecutionError extends Schema.TaggedError<SparqlExecutionError>()(
  "SparqlExecutionError",
  {
    message: Schema.String,
    cause: Schema.optional(Schema.Unknown),

    /**
     * The SPARQL query that failed
     */
    query: Schema.optional(Schema.String)
  }
) {}

/**
 * SparqlLoadError - Failed to load RDF data into SPARQL engine
 *
 * @since 2.0.0
 * @category Error
 */
export class SparqlLoadError extends Schema.TaggedError<SparqlLoadError>()(
  "SparqlLoadError",
  {
    message: Schema.String,
    cause: Schema.optional(Schema.Unknown),

    /**
     * The format of the data that failed to load
     */
    format: Schema.optional(Schema.String)
  }
) {}

/**
 * Union of all SPARQL errors
 */
export type SparqlError = SparqlExecutionError | SparqlLoadError

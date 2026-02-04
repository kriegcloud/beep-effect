/**
 * SPARQL errors for Knowledge slice
 *
 * Typed errors for SPARQL query operations (syntax, execution, timeout).
 *
 * @module knowledge-domain/errors/sparql
 * @since 0.1.0
 */
import { $KnowledgeDomainId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("errors/sparql");

/**
 * SPARQL query syntax error
 *
 * @since 0.1.0
 * @category errors
 */
export class SparqlSyntaxError extends S.TaggedError<SparqlSyntaxError>($I`SparqlSyntaxError`)(
  "SparqlSyntaxError",
  {
    query: S.String,
    message: S.String,
    line: S.optional(S.Number),
    column: S.optional(S.Number),
  },
  $I.annotations("SparqlSyntaxError", {
    description: "SPARQL query has invalid syntax",
  })
) {}

/**
 * SPARQL query timeout error
 *
 * @since 0.1.0
 * @category errors
 */
export class SparqlTimeoutError extends S.TaggedError<SparqlTimeoutError>($I`SparqlTimeoutError`)(
  "SparqlTimeoutError",
  {
    query: S.String,
    message: S.String,
    timeoutMs: S.Number,
  },
  $I.annotations("SparqlTimeoutError", {
    description: "SPARQL query execution exceeded timeout",
  })
) {}

/**
 * SPARQL query execution error
 *
 * @since 0.1.0
 * @category errors
 */
export class SparqlExecutionError extends S.TaggedError<SparqlExecutionError>($I`SparqlExecutionError`)(
  "SparqlExecutionError",
  {
    query: S.String,
    message: S.String,
    cause: S.optional(S.String),
  },
  $I.annotations("SparqlExecutionError", {
    description: "SPARQL query execution failed",
  })
) {}

/**
 * Union of all SPARQL error types
 *
 * @since 0.1.0
 * @category errors
 */
export class SparqlError extends S.Union(SparqlSyntaxError, SparqlTimeoutError, SparqlExecutionError).annotations(
  $I.annotations("SparqlError", {
    description: "Union of all SPARQL error types",
  })
) {}

export declare namespace SparqlError {
  export type Type = typeof SparqlError.Type;
  export type Encoded = typeof SparqlError.Encoded;
}
